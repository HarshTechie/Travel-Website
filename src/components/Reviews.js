import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Reviews.css';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
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
      const res = await axios.post('http://localhost:5000/reviews', {
        username: user.username,
        review: newReview,
      });
      setReviews([res.data, ...reviews]);
      setNewReview('');
    } catch (err) {
      console.error('Error adding review:', err);
      alert('Failed to add review');
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
            key={r.id}
            className="review-card"
          >
            <strong>{r.username}</strong>
            <p>{r.review}</p>
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
              <textarea
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                required
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
