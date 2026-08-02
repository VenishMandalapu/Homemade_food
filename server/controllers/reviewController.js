import pool from '../config/db.js';

export async function getProductReviews(req, res) {
  const { productId } = req.params;
  try {
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC', [productId]);
    return res.json(reviews);
  } catch (error) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ message: 'Server error fetching reviews.' });
  }
}

export async function createReview(req, res) {
  const { productId } = req.params;
  const { customer_name, rating, comment } = req.body;

  if (!customer_name || !rating) {
    return res.status(400).json({ message: 'Customer name and rating are required.' });
  }

  const ratingInt = parseInt(rating);
  if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    // Check if product exists
    const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, customer_name, ratingInt, comment || '']
    );

    const newReview = {
      id: result.insertId,
      product_id: parseInt(productId),
      customer_name,
      rating: ratingInt,
      comment,
      created_at: new Date()
    };

    return res.status(201).json(newReview);
  } catch (error) {
    console.error('createReview error:', error);
    return res.status(500).json({ message: 'Server error creating review.' });
  }
}
