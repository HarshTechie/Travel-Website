import React, { useEffect, useState } from 'react';
import { fetchImage } from './fetchimages';
import BookNowButton from './booking/BookNowButton';
import { API_BASE } from '../api/client';
import '../styles/Destination.css';

const DestinationCard = ({ destination, username, user }) => {
  const [fav, setFav] = useState(false);
  const [img, setImg] = useState(destination.image || '');
  const [popup, setPopup] = useState('');

  useEffect(() => {
    const loadImg = async () => {
      if (!destination.image) {
        const url = await fetchImage(destination.name);
        setImg(url);
      }
    };
    loadImg();
  }, [destination]);

  useEffect(() => {
    if (!username) return;
    fetch(`${API_BASE}/api/favorites/${username}`)
      .then((res) => res.json())
      .then((data) => {
        const exists = data.some(
          (d) => d.destination_name === destination.name
        );
        setFav(exists);
      })
      .catch(() => {});
  }, [username, destination.name]);

  const toggleFav = async () => {
    if (!username) {
      setPopup('Please login to save favorites!');
      setTimeout(() => setPopup(''), 2000);
      return;
    }

    try {
      if (!fav) {
        await fetch(`${API_BASE}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            destination_name: destination.name,
            image_url: img,
          }),
        });
        setFav(true);
        setPopup('Added to your favorites!');
      } else {
        await fetch(
          `${API_BASE}/api/favorites/${username}/${destination.name}`,
          {
            method: 'DELETE',
          }
        );
        setFav(false);
        setPopup('Removed from favorites!');
      }
      setTimeout(() => setPopup(''), 2000);
    } catch (err) {
      setPopup('Network error!');
      setTimeout(() => setPopup(''), 2000);
    }
  };

  return (
    <div className="card">
      <img
        src={img}
        alt={destination.name}
      />
      <div className="card-info">
        <h3>
          {destination.name}
          {destination.trending && <span className="trending-tag">🔥 TRENDING</span>}
        </h3>
        <p>{destination.desc}</p>
        <p className="budget">
          Budget: <span>{destination.budget}</span>
        </p>
        <div className="card-actions">
          <BookNowButton
            destination={{ ...destination, image: img }}
            user={user || (username ? { username } : null)}
          />
          <button
            className={`fav ${fav ? 'active' : ''}`}
            onClick={toggleFav}
          >
            ♥
          </button>
        </div>
      </div>

      {popup && <div className="popup">{popup}</div>}
    </div>
  );
};

export default DestinationCard;
