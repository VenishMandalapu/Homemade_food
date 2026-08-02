import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_DATABASE || 'homemade_foods';

// Helper to add columns dynamically if tables already exist
async function addColumnIfNotExists(connection, dbName, tableName, columnName, columnDefinition) {
  const [columns] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, tableName, columnName]
  );
  if (columns.length === 0) {
    console.log(`Adding missing column '${columnName}' to table '${tableName}'...`);
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`);
  }
}

export default async function initDB() {
  let connection;
  try {
    // 1. Connect without database name to ensure database exists
    console.log(`Connecting to MySQL Server at ${host} as ${user}...`);
    connection = await mysql.createConnection({ host, user, password });

    console.log(`Creating database '${database}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.end();

    // 2. Connect directly to the database to create tables
    connection = await mysql.createConnection({ host, user, password, database });
    console.log('Connected to database. Setting up tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table (with ingredients)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        ingredients TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        spice_level INT DEFAULT 0,
        shelf_life VARCHAR(50),
        stock INT DEFAULT 0,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'COD',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Order Items table (with custom_spice preference)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Run table column updates (migration checks for already existing setups)
    await addColumnIfNotExists(connection, database, 'products', 'ingredients', 'TEXT NULL');
    await addColumnIfNotExists(connection, database, 'order_items', 'custom_spice', "VARCHAR(50) DEFAULT 'Medium'");
    await addColumnIfNotExists(connection, database, 'users', 'phone', 'VARCHAR(20) NULL');
    await addColumnIfNotExists(connection, database, 'users', 'address', 'TEXT NULL');

    console.log('Tables verified/created successfully.');

    // 3. Seed Users
    // Clean up old temporary admin seed
    await connection.query('DELETE FROM users WHERE email = "admin@homemade.com"');

    // Check if new admin exists
    const [adminExists] = await connection.query('SELECT id FROM users WHERE email = ?', ['praneeth@gmail.com']);
    if (adminExists.length === 0) {
      console.log('Seeding admin praneeth@gmail.com...');
      const adminPasswordHash = bcrypt.hashSync('Praneeth@369', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['praneeth', 'praneeth@gmail.com', adminPasswordHash, 'admin']
      );
    }
    
    // Check if customer exists
    const [customerExists] = await connection.query('SELECT id FROM users WHERE email = ?', ['customer@gmail.com']);
    if (customerExists.length === 0) {
      console.log('Seeding customer customer@gmail.com...');
      const customerPasswordHash = bcrypt.hashSync('customer123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['John Doe', 'customer@gmail.com', customerPasswordHash, 'customer']
      );
    }

    // 4. Seed Products
    const [existingProducts] = await connection.query('SELECT id FROM products LIMIT 1');
    if (existingProducts.length === 0) {
      console.log('Seeding default products with ingredients lists...');
      const defaultProducts = [
        {
          name: 'Spicy Mango Pickle (Avakaya)',
          description: 'A fiery, traditional Andhra style mango pickle loaded with aromatic mustard powder, red chili, and cold pressed sesame oil. Made with freshly cut raw mangoes.',
          ingredients: 'Fresh Raw Mango Pieces, Pure Cold-Pressed Sesame Oil, Premium Red Chili Powder, Mustard Seed Powder, Fenugreek Seeds, Whole Garlic Cloves, Sea Salt, Turmeric.',
          price: 150.00,
          category: 'pickle',
          spice_level: 3,
          shelf_life: '12 Months',
          stock: 45,
          image_url: '/images/spicy_mango_pickle.jpg'
        },
        {
          name: 'Tangy Lemon Pickle',
          description: 'A sweet, sour, and mildly spiced lemon pickle that gets better with age. No oil added. Perfect digestion booster.',
          ingredients: 'Fresh Juicy Lemons, Rock Salt, Kashmiri Chili Powder, Turmeric Powder, Roasted Fenugreek Seed Powder, Asafoetida (Hing), Fresh Ginger Slices, Minimal Sugarcane Jaggery.',
          price: 130.00,
          category: 'pickle',
          spice_level: 1,
          shelf_life: '24 Months',
          stock: 30,
          image_url: '/images/tangy_lemon_pickle.jpg'
        },
        {
          name: 'Garlic & Chili Pickle',
          description: 'Peeled garlic cloves infused with rich spices, mustard seeds, and freshly crushed chilies. A warm and aromatic pickle.',
          ingredients: 'Peeled Indian Garlic Cloves, Fresh Spicy Green Chilies, Cold-Pressed Mustard Oil, Yellow Mustard Seeds, Fenugreek Powder, Turmeric, Vinegar, Sea Salt.',
          price: 160.00,
          category: 'pickle',
          spice_level: 3,
          shelf_life: '9 Months',
          stock: 25,
          image_url: '/images/garlic_chili_pickle.jpg'
        },
        {
          name: 'Crunchy Rice Murukku',
          description: 'Traditional South Indian crunchy snack made from rice flour, black gram, cumin, and butter. Extremely light and crispy.',
          ingredients: 'Fine Rice Flour, Roasted Black Gram Flour (Urad Dal), Fresh Cream Butter, Cumin Seeds, Sesame Seeds, Asafoetida (Hing), Salt, Cold-Pressed Groundnut Oil (for frying).',
          price: 120.00,
          category: 'snack',
          spice_level: 1,
          shelf_life: '3 Months',
          stock: 50,
          image_url: '/images/rice_murukku.jpg'
        },
        {
          name: 'Kerala Banana Chips',
          description: 'Thin, crispy plantain chips fried in pure organic cold-pressed coconut oil. Mildly salted and 100% natural.',
          ingredients: 'Raw Organic Nendran Plantains, Pure Organic Cold-Pressed Coconut Oil, Sea Salt, Turmeric Powder.',
          price: 100.00,
          category: 'snack',
          spice_level: 0,
          shelf_life: '2 Months',
          stock: 60,
          image_url: '/images/banana_chips.jpg'
        },
        {
          name: 'Premium Besan Laddu',
          description: 'Mouth-melting sweet balls roasted with pure cow ghee, gram flour, sugar, cardamom, and topped with dry fruits.',
          ingredients: 'Coarsely Ground Gram Flour (Besan), Pure Cow Desi Ghee, Organic Powdered Sugar, Green Cardamom Seed Powder, Chopped Almonds, Chopped Pistachios.',
          price: 180.00,
          category: 'snack',
          spice_level: 0,
          shelf_life: '1 Month',
          stock: 20,
          image_url: '/images/besan_laddu.jpg'
        }
      ];

      for (const p of defaultProducts) {
        await connection.query(
          'INSERT INTO products (name, description, ingredients, price, category, spice_level, shelf_life, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.description, p.ingredients, p.price, p.category, p.spice_level, p.shelf_life, p.stock, p.image_url]
        );
      }
      console.log('Default products seeded with ingredients.');
    }

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Fatal Database Initialization Error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
