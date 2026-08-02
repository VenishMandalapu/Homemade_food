import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Star, MessageSquarePlus, User, Calendar } from 'lucide-react';

export default function ReviewSection({ productId, showToast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Please enter your name.', 'error');
    if (rating < 1 || rating > 5) return showToast('Rating must be between 1 and 5.', 'error');

    try {
      setSubmitting(true);
      await api.addReview(productId, {
        customer_name: name,
        rating,
        comment
      });
      showToast('Thank you! Review posted successfully.', 'success');
      setName('');
      setComment('');
      setRating(5);
      fetchReviews(); // Refresh review list
    } catch (err) {
      showToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
      <h4 style={{ fontSize: '1.4rem', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
        Customer Reviews ({reviews.length})
      </h4>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent)' }}>
          <MessageSquarePlus size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Write a Review</span>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Rahul S." 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rating</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '48px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Star 
                    size={22} 
                    fill={star <= rating ? 'var(--accent)' : 'transparent'} 
                    color={star <= rating ? 'var(--accent)' : 'var(--text-muted)'} 
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Review Comment</label>
          <textarea 
            className="form-input" 
            rows="3" 
            placeholder="Tell us what you liked about this homemade delicacy..." 
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ resize: 'vertical', minHeight: '80px' }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '12px' }}
          disabled={submitting}
        >
          {submitting ? 'Posting...' : 'Submit Review'}
        </button>
      </form>

      {/* Review List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          No reviews yet. Be the first to write a review!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => (
            <div key={rev.id} style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="flex-center" style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%',
                    color: 'var(--primary)'
                  }}>
                    <User size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{rev.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      fill={i < rev.rating ? 'var(--accent)' : 'transparent'} 
                      color={i < rev.rating ? 'var(--accent)' : 'rgba(255,255,255,0.1)'} 
                    />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '40px', lineHeight: 1.5 }}>
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
