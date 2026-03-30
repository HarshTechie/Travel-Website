import React, { useState, useEffect, useRef } from 'react';
import '../styles/Destination.css';
import DestinationCard from './DestinationCard';
import destinationsData from './DestinationData';
import { fetchImage } from './fetchimages';

const Section = ({ title, destinations, user }) => {
  const containerRef = useRef(null);

  const scroll = (dir) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: dir === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  if (destinations.length === 0) return null;

  return (
    <div className="destination-section">
      <h2>{title}</h2>
      <div className="scroll-wrapper">
        <button
          className="scroll-btn"
          onClick={() => scroll('left')}
          style={{ opacity: 0.5 }}
        >
          ←
        </button>
        <div
          className="card-grid"
          ref={containerRef}
        >
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              username={user?.username}
            />
          ))}
        </div>
        <button
          className="scroll-btn"
          onClick={() => scroll('right')}
          style={{ opacity: 0.5 }}
        >
          →
        </button>
      </div>
    </div>
  );
};

const DestinationPage = ({ user }) => {
  const [destinations, setDestinations] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [filterBudget, setFilterBudget] = useState('All');

  useEffect(() => {
    const loadImages = async () => {
      const updatedDestinations = await Promise.all(
        destinationsData.map(async (dest) => {
          const img = await fetchImage(dest.name);
          return { ...dest, image: img };
        })
      );
      setDestinations(updatedDestinations);
    };
    loadImages();
  }, []);

  // Filtering logic
  const filtered = destinations.filter((d) => {
    const typeMatch = filterType === 'All' || d.type === filterType;

    const budgetNumber = parseInt(d.budget.replace(/[₹,]/g, '').split('-')[0]);
    const budgetMatch =
      filterBudget === 'All' ||
      (filterBudget === 'Low' && budgetNumber < 30000) ||
      (filterBudget === 'Mid' &&
        budgetNumber >= 30000 &&
        budgetNumber <= 50000) ||
      (filterBudget === 'High' && budgetNumber > 50000);

    return typeMatch && budgetMatch;
  });

  const grouped = {
    Popular: filtered.filter((d) => d.type === 'Popular'),
    Culture: filtered.filter((d) => d.type === 'Culture'),
    Beach: filtered.filter((d) => d.type === 'Beach'),
    Adventure: filtered.filter((d) => d.type === 'Adventure'),
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Popular">Popular</option>
          <option value="Culture">Culture</option>
          <option value="Beach">Beach</option>
          <option value="Adventure">Adventure</option>
        </select>

        <select
          value={filterBudget}
          onChange={(e) => setFilterBudget(e.target.value)}
        >
          <option value="All">All Budgets</option>
          <option value="Low">Below ₹30,000</option>
          <option value="Mid">₹30,000 - ₹50,000</option>
          <option value="High">Above ₹50,000</option>
        </select>
      </div>

      {/* Render only filtered sections */}
      {filterType === 'All' ? (
        <>
          <Section
            title="Popular Destinations"
            destinations={grouped.Popular}
            user={user}
          />
          <Section
            title="Culture-Oriented"
            destinations={grouped.Culture}
            user={user}
          />
          <Section
            title="Beach Escapes"
            destinations={grouped.Beach}
            user={user}
          />
          <Section
            title="Adventure Trips"
            destinations={grouped.Adventure}
            user={user}
          />
        </>
      ) : (
        <Section
          title={`${filterType} Destinations`}
          destinations={filtered}
          user={user}
        />
      )}
    </>
  );
};

export default DestinationPage;
