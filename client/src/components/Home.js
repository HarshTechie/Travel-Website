import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';

// Example POST request from React
const handleContactSubmit = async (name, email, message) => {
  const response = await fetch('http://localhost:5000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  });
  const data = await response.json();
  console.log(data);
};

const Hero = () => {
  const navigate = useNavigate();

  const handlePlanTrip = () => {
    navigate('/signup'); // redirect to signup page
  };

  return (
    <>
      <section className="hero-container">
        <div className="hero-left">
          <h1>Plan Your Perfect Trip</h1>
          <p>
            TrailBliss,Your ultimate travel companion. Plan personalized
            itineraries, explore countless destinations, and discover
            unforgettable experiences—all in one place.
          </p>
          <button
            className="primary-btn"
            onClick={handlePlanTrip}
          >
            Plan My Trip Now
          </button>

          <div className="stats">
            <div>
              <h2>9M+</h2>
              <span>Happy Travelers</span>
            </div>
            <div>
              <h2>12K+</h2>
              <span>Destinations Covered</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img
            src="/home2.jpg"
            alt="Hero"
          />
        </div>
      </section>

      <section className="popular-destinations">
        <h2>Popular Destinations</h2>
        <div className="destinations-grid">
          <div
            className="destination-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/destinations')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/destinations')}
          >
            <img
              src="/venice.jpg"
              alt="Venice"
            />
            <div className="destination-info">
              <h3>Venice</h3>
              <p>Explore the canals and iconic architecture.</p>
              <span>17,657.67</span>
            </div>
          </div>
          <div
            className="destination-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/destinations')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/destinations')}
          >
            <img
              src="/sao.jpg"
              alt="Sao Paulo"
            />
            <div className="destination-info">
              <h3>Sao Paulo</h3>
              <p>Enjoy the vibrant city life and beaches.</p>
              <span>₹21,890</span>
            </div>
          </div>
          <div
            className="destination-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/destinations')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/destinations')}
          >
            <img
              src="/bardos.jpg"
              alt="Barbados"
            />
            <div className="destination-info">
              <h3>Barbados</h3>
              <p>Relax on pristine beaches and luxury resorts.</p>
              <span>₹26,342</span>
            </div>
          </div>
          <div
            className="destination-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/destinations')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/destinations')}
          >
            <img
              src="/cyprus.jpg"
              alt="Cyprus"
            />
            <div className="destination-info">
              <h3>Cyprus</h3>
              <p>Discover historic sites and coastal beauty.</p>
              <span> ₹20,631</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-us">
        <h1>About Us</h1>
        <p>
          Here, we believe every trip should feel legendary. With just your
          destination and dates, we whip up custom adventures so you can skip
          the planning stress and dive straight into the vibes. Let’s turn
          travel into your next big flex!
        </p>
      </section>
    </>
  );
};

export default Hero;
