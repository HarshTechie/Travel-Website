import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listCars } from '../../api/rentals';
import { SkeletonCard } from '../common/Skeleton';
import '../../styles/Common.css';

const RentalHome = () => {
  const [cars, setCars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ city: '', type: '', minPrice: '', maxPrice: '', from: '', to: '' });

  const load = (f = filters) => {
    setLoading(true);
    setError(null);
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
    listCars(params)
      .then((data) => setCars(data || []))
      .catch(() => setError('Could not reach server. Please try again.'))
      .finally(() => setLoading(false));
  };

  // Load full list on mount — no strict filters required
  useEffect(() => {
    load({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSub = (e) => { e.preventDefault(); load(); };
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="rentals-page">
      <h1>Rent a Car</h1>
      <p style={{ color: '#666' }}>Multi-vendor marketplace · verified dealers · transparent pricing</p>
      <form className="rentals-filters" onSubmit={onSub}>
        <input placeholder="City" value={filters.city} onChange={(e) => set('city', e.target.value)} />
        <select value={filters.type} onChange={(e) => set('type', e.target.value)}>
          <option value="">All types</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Luxury">Luxury</option>
        </select>
        <input placeholder="Min ₹/day" type="number" value={filters.minPrice} onChange={(e) => set('minPrice', e.target.value)} />
        <input placeholder="Max ₹/day" type="number" value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} />
        <input type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
        <input type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {loading && (
        <div className="car-grid">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {!loading && error && (
        <div className="rentals-error">{error}</div>
      )}
      {!loading && !error && cars && cars.length === 0 && (
        <div className="rentals-no-match">
          No cars match your filters. Try widening the range.
        </div>
      )}

      <div className="car-grid">
        {cars && cars.map((car) => {
          const priceLabel = car.pricing?.mode === 'per_km'
            ? `₹${car.pricing.perKmRate}/km`
            : `₹${car.pricing?.perDayRate}/day`;
          const cardInner = (
            <div className="car-card">
              <img
                src={car.images?.[0] || 'https://via.placeholder.com/300x180?text=Car'}
                alt={`${car.make} ${car.model}`}
                loading="lazy"
              />
              <div className="car-card-body">
                <div className="car-badges">
                  <span className="badge">{car.type}</span>
                  {car.transmission && <span className="badge">{car.transmission}</span>}
                  {car.seats && <span className="badge">{car.seats} seats</span>}
                </div>
                <h3>
                  {car.make} {car.model}{' '}
                  <small className="car-year">({car.year})</small>
                </h3>
                <div className="car-dealer">🏢 {car.vendorName || 'Dealer'}</div>
                <div className="car-meta">📍 {car.location?.city || '—'}</div>
                {car.vendorPhone && (
                  <div className="car-contact">
                    📞 <a href={`tel:${car.vendorPhone.replace(/\s/g, '')}`}>{car.vendorPhone}</a>
                  </div>
                )}
                {car.vendorTerms && (
                  <div className="car-terms" title={car.vendorTerms}>
                    T&amp;C: {car.vendorTerms}
                  </div>
                )}
                <div className="car-price-row">
                  <span className="car-price">{priceLabel}</span>
                  <span className="car-cta">View details →</span>
                </div>
              </div>
            </div>
          );
          return (
            <Link
              key={car._id}
              to={`/rentals/${car._id}`}
              className="car-card-link"
            >
              {cardInner}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RentalHome;
