import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCar, quoteCar, bookCar, listVendorReviews, addVendorReview } from '../../api/rentals';
import StarRating from '../common/StarRating';
import { useToast } from '../common/Toast';
import '../../styles/Common.css';

const fmtMoney = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const CarDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ from: '', to: '', pickupLocation: '', dropLocation: '', estimatedKm: 0 });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rv, setRv] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    getCar(id).then(setData).catch(() => setData(false));
  }, [id]);

  useEffect(() => {
    if (!data?.vendor?._id) return;
    listVendorReviews(data.vendor._id).then(setReviews).catch(() => setReviews([]));
  }, [data]);

  const requestQuote = async () => {
    if (!form.from || !form.to) { toast('Pick dates first', 'error'); return; }
    setLoading(true);
    try {
      const q = await quoteCar(id, form);
      setQuote(q);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const confirmBook = async () => {
    if (!user) { toast('Please log in to book', 'error'); return; }
    if (!quote) { await requestQuote(); return; }
    setLoading(true);
    try {
      const b = await bookCar({ username: user.username, carId: id, ...form });
      toast('Rental confirmed! ID: ' + b.bookingId, 'success', 5000);
      navigate('/my-bookings');
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const submitReview = async () => {
    if (!user) { toast('Please log in to review', 'error'); return; }
    if (!rv.comment.trim()) { toast('Add a comment', 'error'); return; }
    try {
      await addVendorReview(data.vendor._id, { username: user.username, ...rv });
      setReviews(await listVendorReviews(data.vendor._id));
      setRv({ rating: 5, comment: '' });
      toast('Review posted', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };

  if (data === null) return <div className="rentals-page">Loading…</div>;
  if (data === false) return <div className="rentals-page">Car not found.</div>;
  const { car, vendor } = data;

  return (
    <div className="rentals-page">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div>
          <img src={car.images?.[0] || 'https://via.placeholder.com/600x400?text=Car'} alt={car.model} style={{ width: '100%', borderRadius: 10 }} />
          <h1>{car.make} {car.model} <small style={{ color: '#888', fontWeight: 400 }}>({car.year})</small></h1>
          <div className="car-badges">
            <span className="badge">{car.type}</span>
            <span className="badge">{car.transmission}</span>
            <span className="badge">{car.seats} seats</span>
            <span className="badge">{car.fuel}</span>
          </div>
          <p style={{ color: '#666' }}>Location: {car.location?.city}</p>

          {vendor && (
            <div className="summary-card" style={{ marginTop: 16 }}>
              <strong>{vendor.businessName}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <StarRating value={Math.round(vendor.rating || 0)} readOnly size={14} />
                <span style={{ fontSize: 12, color: '#666' }}>{vendor.rating || 0} · {vendor.ratingCount || 0} reviews</span>
              </div>
              {vendor.terms && <p style={{ fontSize: 13, marginTop: 8, color: '#555' }}>{vendor.terms}</p>}
            </div>
          )}
        </div>

        <div>
          <div className="summary-card">
            <h3 style={{ marginTop: 0 }}>Book this car</h3>
            <div className="form-row">
              <div className="form-field">
                <label>From</label>
                <input type="date" value={form.from} onChange={(e) => { setForm({ ...form, from: e.target.value }); setQuote(null); }} />
              </div>
              <div className="form-field">
                <label>To</label>
                <input type="date" value={form.to} onChange={(e) => { setForm({ ...form, to: e.target.value }); setQuote(null); }} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Pickup location</label>
                <input value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Drop location</label>
                <input value={form.dropLocation} onChange={(e) => setForm({ ...form, dropLocation: e.target.value })} />
              </div>
            </div>
            {car.pricing?.mode === 'per_km' && (
              <div className="form-row full">
                <div className="form-field">
                  <label>Estimated km</label>
                  <input type="number" value={form.estimatedKm} onChange={(e) => { setForm({ ...form, estimatedKm: Number(e.target.value) }); setQuote(null); }} />
                </div>
              </div>
            )}
            <button className="btn btn-ghost" onClick={requestQuote} disabled={loading}>Get Quote</button>
            {quote && (
              <div style={{ marginTop: 16 }}>
                <div className="price-row"><span>Base ({quote.days} days)</span><span>{fmtMoney(quote.base)}</span></div>
                <div className="price-row"><span>Insurance</span><span>{fmtMoney(quote.insurance)}</span></div>
                <div className="price-row"><span>GST</span><span>{fmtMoney(quote.gst)}</span></div>
                <div className="price-row"><span>Refundable deposit</span><span>{fmtMoney(quote.deposit)}</span></div>
                <div className="price-row total"><span>Total</span><span>{fmtMoney(quote.total)}</span></div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={confirmBook} disabled={loading}>Confirm Booking</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Dealer Reviews</h2>
        {user && (
          <div className="summary-card">
            <StarRating value={rv.rating} onChange={(v) => setRv({ ...rv, rating: v })} />
            <textarea
              className="form-field"
              style={{ width: '100%', marginTop: 8, minHeight: 80, padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
              placeholder="Share your experience…"
              value={rv.comment}
              onChange={(e) => setRv({ ...rv, comment: e.target.value })}
            />
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={submitReview}>Post review</button>
          </div>
        )}
        {reviews.length === 0 && <p style={{ color: '#888' }}>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="summary-card" style={{ background: '#fff', borderColor: '#eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{r.username}</strong>
              <StarRating value={r.rating} readOnly size={14} />
            </div>
            <p style={{ margin: '6px 0 0' }}>{r.comment}</p>
            {r.vendorReply && (
              <div style={{ marginTop: 8, padding: 8, background: '#f9fafb', borderLeft: '3px solid #ff6b35', fontSize: 13 }}>
                <strong>Vendor reply:</strong> {r.vendorReply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarDetail;
