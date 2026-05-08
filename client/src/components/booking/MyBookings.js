import React, { useEffect, useState } from 'react';
import { myBookings, cancelBooking } from '../../api/bookings';
import { myRentals, cancelRental } from '../../api/rentals';
import { SkeletonCard } from '../common/Skeleton';
import { useToast } from '../common/Toast';
import '../../styles/Common.css';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtMoney = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const MyBookings = ({ user }) => {
  const [trips, setTrips] = useState(null);
  const [rentals, setRentals] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!user?.username) return;
    myBookings(user.username).then(setTrips).catch(() => setTrips([]));
    myRentals(user.username).then(setRentals).catch(() => setRentals([]));
  }, [user]);

  const onCancelTrip = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setTrips((t) => t.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      toast('Booking cancelled', 'info');
    } catch (e) {
      toast('Cancel failed: ' + e.message, 'error');
    }
  };

  const onCancelRental = async (id) => {
    if (!window.confirm('Cancel this rental?')) return;
    try {
      await cancelRental(id);
      setRentals((t) => t.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      toast('Rental cancelled', 'info');
    } catch (e) {
      toast('Cancel failed: ' + e.message, 'error');
    }
  };

  if (!user) {
    return <div className="my-bookings"><h2>Please log in to view your bookings.</h2></div>;
  }

  return (
    <div className="my-bookings">
      <header className="my-bookings-header">
        <h1>My Bookings</h1>
        <p>All your trips and car rentals in one place.</p>
      </header>

      <section className="bookings-section">
        <h2 className="bookings-section-title">Trips</h2>
        <div className="bookings-list">
          {trips === null && <><SkeletonCard /><SkeletonCard /></>}
          {trips && trips.length === 0 && <p className="bookings-empty">No trip bookings yet.</p>}
          {trips && trips.map((b) => (
            <div key={b._id} className="booking-item">
              {b.destinationImage
                ? <img src={b.destinationImage} alt={b.destinationName} />
                : <div className="booking-thumb-placeholder" />}
              <div className="booking-meta">
                <div className="bid">{b.bookingId}</div>
                <h3>
                  {b.destinationName}
                  <span className={`status-pill status-${b.status}`}>{b.status.replace('_', ' ')}</span>
                </h3>
                <div className="booking-sub">
                  {fmtDate(b.travelDetails?.startDate)} → {fmtDate(b.travelDetails?.endDate)} · {b.travelers?.length || 1} traveler(s)
                </div>
                <div className="booking-price"><strong>{fmtMoney(b.priceBreakdown?.total)}</strong></div>
              </div>
              <div className="booking-actions">
                {['confirmed', 'pending_payment'].includes(b.status) && (
                  <button className="btn btn-danger" onClick={() => onCancelTrip(b._id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bookings-section">
        <h2 className="bookings-section-title">Car Rentals</h2>
        <div className="bookings-list">
          {rentals === null && <><SkeletonCard /><SkeletonCard /></>}
          {rentals && rentals.length === 0 && <p className="bookings-empty">No car rentals yet.</p>}
          {rentals && rentals.map((b) => (
            <div key={b._id} className="booking-item">
              {b.car?.images?.[0]
                ? <img src={b.car.images[0]} alt={b.car.model} />
                : <div className="booking-thumb-placeholder" />}
              <div className="booking-meta">
                <div className="bid">{b.bookingId}</div>
                <h3>
                  {b.car ? `${b.car.make} ${b.car.model}` : 'Car'}
                  <span className={`status-pill status-${b.status}`}>{b.status}</span>
                </h3>
                <div className="booking-sub">{fmtDate(b.startDate)} → {fmtDate(b.endDate)}</div>
                <div className="booking-sub">Pickup: {b.pickupLocation || '—'}</div>
                <div className="booking-price"><strong>{fmtMoney(b.computedPrice?.total)}</strong></div>
              </div>
              <div className="booking-actions">
                {['confirmed', 'pending'].includes(b.status) && (
                  <button className="btn btn-danger" onClick={() => onCancelRental(b._id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MyBookings;
