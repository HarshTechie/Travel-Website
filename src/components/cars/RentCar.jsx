import React, { useEffect, useState } from 'react';
import { listCars } from '../../api/cars';
import '../../styles/RentCar.css';

const CAR_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Luxury'];

const RentCar = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    city: '',
    carType: '',
    minPrice: '',
    maxPrice: '',
  });

  // Initial load — show all cars
  useEffect(() => {
    fetchCars({});
  }, []);

  const fetchCars = (filters) => {
    setLoading(true);
    setError(null);
    const params = {
      city: filters.city || undefined,
      type: filters.carType || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
    };
    listCars(params)
      .then((data) => {
        console.log('[RentCar] cars received:', data?.length, data);
        setCars(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[RentCar] fetch failed:', err);
        setError('Could not load cars. Please check the server.');
      })
      .finally(() => setLoading(false));
  };

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onSearch = (e) => {
    e.preventDefault();
    fetchCars(form);
  };
  const onReset = () => {
    const reset = { city: '', carType: '', minPrice: '', maxPrice: '' };
    setForm(reset);
    fetchCars({});
  };

  return (
    <div className="rentcar-page">
      <header className="rentcar-header">
        <h1>Rent a Car</h1>
        <p>Dealer-verified cars across cities. Transparent per-day pricing.</p>
      </header>

      <form className="rentcar-form" onSubmit={onSearch}>
        <div className="rentcar-field">
          <label>City</label>
          <input
            type="text"
            placeholder="e.g. Jaipur"
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
          />
        </div>

        <div className="rentcar-field">
          <label>Car type</label>
          <select
            value={form.carType}
            onChange={(e) => onChange('carType', e.target.value)}
          >
            <option value="">All types</option>
            {CAR_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="rentcar-field">
          <label>Min ₹/day</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={form.minPrice}
            onChange={(e) => onChange('minPrice', e.target.value)}
          />
        </div>

        <div className="rentcar-field">
          <label>Max ₹/day</label>
          <input
            type="number"
            min="0"
            placeholder="10000"
            value={form.maxPrice}
            onChange={(e) => onChange('maxPrice', e.target.value)}
          />
        </div>

        <div className="rentcar-actions">
          <button type="submit" className="rentcar-btn rentcar-btn-primary">Search</button>
          <button type="button" className="rentcar-btn rentcar-btn-ghost" onClick={onReset}>Reset</button>
        </div>
      </form>

      <div className="rentcar-results">
        {loading && (
          <div className="rentcar-skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rentcar-skeleton-card" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rentcar-msg rentcar-msg-error">{error}</div>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="rentcar-msg">
            No cars match your filters. Try different options or reset.
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
          <>
            <div className="rentcar-count">
              {cars.length} car{cars.length !== 1 ? 's' : ''} available
            </div>
            <div className="rentcar-grid">
              {cars.map((car) => {
                return (
                  <article key={car.id} className="rentcar-card">
                    <div className="rentcar-body">
                      <div className="rentcar-type-badge">{car.carType}</div>
                      <h3 className="rentcar-name">{car.carName}</h3>
                      <div className="rentcar-city">📍 {car.city}</div>

                      <div className="rentcar-price">
                        ₹{car.pricePerDay.toLocaleString('en-IN')}<span>/day</span>
                      </div>

                      <div className="rentcar-dealer">
                        <div className="rentcar-dealer-name">🏢 {car.dealerName}</div>
                        <div className="rentcar-contact">
                          📞 <a href={`tel:${String(car.contactNumber).replace(/\s|-/g, '')}`}>
                            {car.contactNumber}
                          </a>
                        </div>
                      </div>

                      <div className="rentcar-terms" title={car.termsAndConditions}>
                        <b>T&amp;C:</b> {car.termsAndConditions}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RentCar;
