import pool from '../config/db.js';

export async function getAllProducts(req, res) {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM products';
  const params = [];

  const conditions = [];
  if (category && category !== 'all') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY id DESC';

  try {
    const [products] = await pool.query(sql, params);
    return res.json(products);
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ message: 'Server error fetching products.' });
  }
}

export async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(products[0]);
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ message: 'Server error fetching product.' });
  }
}

export async function createProduct(req, res) {
  const { name, description, price, category, spice_level, shelf_life, stock } = req.body;
  let image_url = req.body.image_url || '';

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required.' });
  }

  // If a file was uploaded, construct its URL
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, category, spice_level, shelf_life, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', price, category, spice_level || 0, shelf_life || '', stock || 0, image_url]
    );

    const newProduct = {
      id: result.insertId,
      name,
      description,
      price,
      category,
      spice_level,
      shelf_life,
      stock,
      image_url
    };

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ message: 'Server error creating product.' });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, category, spice_level, shelf_life, stock } = req.body;
  let image_url = req.body.image_url;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required.' });
  }

  // If a new file was uploaded
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    const [existing] = await pool.query('SELECT image_url FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Keep old image if no new image was uploaded/sent
    if (image_url === undefined) {
      image_url = existing[0].image_url;
    }

    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, spice_level = ?, shelf_life = ?, stock = ?, image_url = ? WHERE id = ?',
      [name, description, price, category, spice_level, shelf_life, stock, image_url, id]
    );

    return res.json({
      id: parseInt(id),
      name,
      description,
      price,
      category,
      spice_level,
      shelf_life,
      stock,
      image_url
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ message: 'Server error updating product.' });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ message: 'Server error deleting product.' });
  }
}
