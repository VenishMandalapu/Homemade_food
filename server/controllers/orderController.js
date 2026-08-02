import pool from '../config/db.js';

export async function createOrder(req, res) {
  const { customer_name, customer_email, customer_phone, delivery_address, payment_method, items } = req.body;
  const user_id = req.user ? req.user.id : null;

  if (!customer_name || !customer_email || !customer_phone || !delivery_address || !items || items.length === 0) {
    return res.status(400).json({ message: 'All fields and at least one item are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const [products] = await connection.query('SELECT price, stock, name FROM products WHERE id = ?', [item.product_id]);
      if (products.length === 0) {
        throw new Error(`Product ID ${item.product_id} not found.`);
      }

      const product = products[0];
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      const price = parseFloat(product.price);
      totalAmount += price * item.quantity;

      itemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: price,
        custom_spice: item.custom_spice || 'Medium' // Capture custom spice level
      });
    }

    // Insert order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, customer_name, customer_email, customer_phone, delivery_address, totalAmount, payment_method || 'COD', 'pending']
    );

    const orderId = orderResult.insertId;

    // Insert order items with their custom spice preference
    for (const entry of itemsToInsert) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, custom_spice) VALUES (?, ?, ?, ?, ?)',
        [orderId, entry.product_id, entry.quantity, entry.price_at_purchase, entry.custom_spice]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [entry.quantity, entry.product_id]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('CreateOrder error:', error);
    return res.status(400).json({ message: error.message || 'Server error creating order.' });
  } finally {
    connection.release();
  }
}

export async function getAllOrders(req, res) {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY id DESC');

    const detailedOrders = [];
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.quantity, oi.price_at_purchase, oi.custom_spice, p.name as product_name, p.image_url, p.category
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      detailedOrders.push({ ...order, items });
    }

    return res.json(detailedOrders);
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({ message: 'Server error fetching orders.' });
  }
}

export async function getMyOrders(req, res) {
  const userId = req.user.id;
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);

    const detailedOrders = [];
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.quantity, oi.price_at_purchase, oi.custom_spice, p.name as product_name, p.image_url, p.category
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      detailedOrders.push({ ...order, items });
    }

    return res.json(detailedOrders);
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({ message: 'Server error fetching your orders.' });
  }
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    return res.json({ message: 'Order status updated successfully.', status });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ message: 'Server error updating order status.' });
  }
}
