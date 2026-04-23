import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StarRating from './common/StarRating';
import '../styles/Reviews.css';
import '../styles/Common.css';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:5000/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      return alert('You must be logged in to add a review!');
    }

    if (!newReview.trim()) return;

    setLoading(true);
    try {
      const images = imageUrls
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      // Enhanced endpoint: accepts optional rating + images
      const res = await axios.post('http://localhost:5000/api/v1/reviews', {
        username: user.username,
        review: newReview,
        rating: rating || null,
        images,
      });
      const saved = res.data?.data || res.data;
      setReviews([saved, ...reviews]);
      setNewReview('');
      setRating(0);
      setImageUrls('');
    } catch (err) {
      console.error('Error adding review:', err);
      // Graceful fallback: retry against legacy endpoint if enhanced fails
      try {
        const res = await axios.post('http://localhost:5000/reviews', {
          username: user.username,
          review: newReview,
        });
        setReviews([res.data, ...reviews]);
        setNewReview('');
      } catch (e2) {
        alert('Failed to add review');
      }
    }
    setLoading(false);
  };

  return (
    <div className="reviews-page">
      <h2>Travel Reviews</h2>

      <div className="reviews-list">
        {reviews.length === 0 && <p>No reviews yet. Be the first!</p>}
        {reviews.map((r) => (
          <div
            key={r._id || r.id}
            className="review-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{r.username}</strong>
              {r.rating ? <StarRating value={r.rating} readOnly size={14} /> : null}
            </div>
            <p>{r.review}</p>
            {Array.isArray(r.images) && r.images.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {r.images.map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="reviews-form-container">
        {user ? (
          <>
            <h3>Add Your Review</h3>
            <form
              onSubmit={handleSubmit}
              className="reviews-form"
            >
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginRight: 8 }}>Rating:</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Image URLs (comma-separated, optional)"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                style={{ marginTop: 8, padding: 10, width: '100%', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: 6 }}
              />
              <button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Add Review'}
              </button>
            </form>
          </>
        ) : (
          <p>Please login to leave a review.</p>
        )}
      </div>
    </div>
  );
}
