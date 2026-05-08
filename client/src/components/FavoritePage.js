import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api/client';
import '../styles/Destination.css';

const FavoritePage = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const [popup, setPopup] = useState('');

  // Fetch favorites from backend
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/favorites/${user.username}`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error(err);
        setPopup('Error fetching favorites!');
        setTimeout(() => setPopup(''), 2000);
      }
    };

    fetchFavorites();
  }, [user]);

  // Remove from favorites
  const handleRemove = async (destination_name) => {
    try {
      await fetch(
        `${API_BASE}/api/favorites/${user.username}/${destination_name}`,
        {
          method: 'DELETE',
        }
      );
      setFavorites(
        favorites.filter((fav) => fav.destination_name !== destination_name)
      );
      setPopup('Removed from favorites!');
      setTimeout(() => setPopup(''), 2000);
    } catch (err) {
      setPopup('Error removing destination!');
      setTimeout(() => setPopup(''), 2000);
    }
  };

  // If user not logged in
  if (!user) {
    return (
      <div className="favorites-page">
        <h2>Please login to see your favorite destinations ❤️</h2>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h2>Your Favorite Destinations</h2>

      {favorites.length === 0 ? (
        <p className="empty-text">You haven’t added any favorites yet!</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div
              key={fav.destination_name}
              className="card"
            >
              <img
                src={fav.image_url}
                alt={fav.destination_name}
              />
              <div className="card-info">
                <h3>{fav.destination_name}</h3>
                <p>Type: {fav.type || 'N/A'}</p>
                <p>Budget: {fav.budget || '—'}</p>

                <div className="card-actions">
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(fav.destination_name)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {popup && <div className="popup">{popup}</div>}
    </div>
  );
};

export default FavoritePage;
