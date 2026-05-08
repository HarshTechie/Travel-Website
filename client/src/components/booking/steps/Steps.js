import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../context/BookingWizardContext';
import { quotePrice, mockCharge } from '../../../api/bookings';

/* ---------------- Step 1: Travelers ---------------- */
export const TravelerDetailsStep = ({ errors = {} }) => {
  const { state, dispatch } = useBooking();
  const travelers = state.travelers;

  const update = (i, key, val) => {
    const copy = travelers.map((t, idx) => (idx === i ? { ...t, [key]: val } : t));
    dispatch({ type: 'SET_TRAVELERS', value: copy });
  };
  const add = () =>
    dispatch({
      type: 'SET_TRAVELERS',
      value: [
        ...travelers,
        { name: '', age: '', gender: 'male', idType: 'aadhaar', idNumber: '' },
      ],
    });
  const remove = (i) =>
    dispatch({ type: 'SET_TRAVELERS', value: travelers.filter((_, idx) => idx !== i) });

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Traveler Details</h3>
      {travelers.map((t, i) => {
        const e = errors[i] || {};
        return (
          <div key={i} className="traveler-block">
            <div className="traveler-header">
              <strong>Traveler #{i + 1}</strong>
              {travelers.length > 1 && (
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => remove(i)}>
                  Remove
                </button>
              )}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Full name</label>
                <input value={t.name} onChange={(ev) => update(i, 'name', ev.target.value)} />
                {e.name && <div className="error-text">{e.name}</div>}
              </div>
              <div className="form-field">
                <label>Age</label>
                <input type="number" value={t.age} onChange={(ev) => update(i, 'age', ev.target.value)} />
                {e.age && <div className="error-text">{e.age}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Gender</label>
                <select value={t.gender} onChange={(ev) => update(i, 'gender', ev.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>ID type</label>
                <select value={t.idType} onChange={(ev) => update(i, 'idType', ev.target.value)}>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="pan">PAN</option>
                  <option value="dl">Driver's License</option>
                </select>
              </div>
            </div>
            <div className="form-row full">
              <div className="form-field">
                <label>ID number</label>
                <input value={t.idNumber} onChange={(ev) => update(i, 'idNumber', ev.target.value)} />
                {e.idNumber && <div className="error-text">{e.idNumber}</div>}
              </div>
            </div>
          </div>
        );
      })}
      <button className="btn btn-ghost" onClick={add}>
        + Add traveler
      </button>
    </div>
  );
};

/* ---------------- Step 2: Travel Details ---------------- */
export const TravelDetailsStep = ({ errors = {} }) => {
  const { state, dispatch } = useBooking();
  const td = state.travelDetails;
  const set = (key, value) => dispatch({ type: 'SET_NESTED', key: 'travelDetails', value: { [key]: value } });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Travel Details</h3>
      <div className="form-row">
        <div className="form-field">
          <label>Start date</label>
          <input type="date" min={today} value={td.startDate} onChange={(e) => set('startDate', e.target.value)} />
          {errors.startDate && <div className="error-text">{errors.startDate}</div>}
        </div>
        <div className="form-field">
          <label>End date</label>
          <input type="date" min={td.startDate || today} value={td.endDate} onChange={(e) => set('endDate', e.target.value)} />
          {errors.endDate && <div className="error-text">{errors.endDate}</div>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Number of travelers</label>
          <input type="number" min="1" value={td.count} onChange={(e) => set('count', Math.max(1, parseInt(e.target.value) || 1))} />
          {errors.count && <div className="error-text">{errors.count}</div>}
        </div>
        <div className="form-field">
          <label>Package type</label>
          <select value={td.packageType} onChange={(e) => set('packageType', e.target.value)}>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Step 3: Contact ---------------- */
export const ContactStep = ({ errors = {} }) => {
  const { state, dispatch } = useBooking();
  const c = state.contact;
  const set = (key, value) => dispatch({ type: 'SET_NESTED', key: 'contact', value: { [key]: value } });
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Contact Details</h3>
      <div className="form-row">
        <div className="form-field">
          <label>Email</label>
          <input type="email" value={c.email} onChange={(e) => set('email', e.target.value)} />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>
        <div className="form-field">
          <label>Phone</label>
          <input type="tel" value={c.phone} onChange={(e) => set('phone', e.target.value)} />
          {errors.phone && <div className="error-text">{errors.phone}</div>}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Step 4: Add-ons ---------------- */
export const AddonsStep = () => {
  const { state, dispatch } = useBooking();
  const a = state.addons;
  const set = (key, value) => dispatch({ type: 'SET_NESTED', key: 'addons', value: { [key]: value } });
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Add-ons</h3>
      <div className="form-row">
        <div className="form-field">
          <label>Hotel tier</label>
          <select value={a.hotel} onChange={(e) => set('hotel', e.target.value)}>
            <option value="budget">Budget</option>
            <option value="3star">3-Star</option>
            <option value="4star">4-Star</option>
            <option value="5star">5-Star</option>
          </select>
        </div>
        <div className="form-field">
          <label>Meals</label>
          <select value={a.meals} onChange={(e) => set('meals', e.target.value)}>
            <option value="none">None</option>
            <option value="breakfast">Breakfast only</option>
            <option value="full-board">Full board</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Transport</label>
          <select value={a.transport} onChange={(e) => set('transport', e.target.value)}>
            <option value="none">None</option>
            <option value="car">Private car</option>
            <option value="luxury">Luxury car</option>
          </select>
        </div>
        <div className="form-field">
          <label>Tour guide</label>
          <select value={a.guide ? 'yes' : 'no'} onChange={(e) => set('guide', e.target.value === 'yes')}>
            <option value="no">No</option>
            <option value="yes">Yes (+₹2,000/day)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Step 5: Price Breakdown ---------------- */
export const PriceBreakdownStep = () => {
  const { state, dispatch } = useBooking();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    quotePrice({
      destinationName: state.destinationName,
      travelers: state.travelers.length,
      startDate: state.travelDetails.startDate,
      endDate: state.travelDetails.endDate,
      addons: state.addons,
    })
      .then((price) => {
        if (!live) return;
        dispatch({ type: 'SET_PRICE', value: price });
        setLoading(false);
      })
      .catch((e) => {
        if (!live) return;
        setErr(e.message);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [dispatch, state.addons, state.destinationName, state.travelDetails.endDate, state.travelDetails.startDate, state.travelers.length]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Calculating price…</div>;
  if (err) return <div className="error-text">{err}</div>;
  const p = state.priceBreakdown;
  if (!p) return null;

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Price Breakdown</h3>
      <div className="summary-card">
        <div><strong>{state.destinationName}</strong> · {p.days} days · {state.travelers.length} traveler(s)</div>
      </div>
      <div className="price-row"><span>Base ({state.travelers.length} × {p.days} days)</span><span>{fmt(p.base)}</span></div>
      <div className="price-row"><span>Hotel upgrade</span><span>{fmt(p.hotelCharge)}</span></div>
      <div className="price-row"><span>Meals</span><span>{fmt(p.meals)}</span></div>
      <div className="price-row"><span>Guide</span><span>{fmt(p.guide)}</span></div>
      <div className="price-row"><span>Transport</span><span>{fmt(p.transport)}</span></div>
      <div className="price-row"><span>Subtotal</span><span>{fmt(p.subtotal)}</span></div>
      <div className="price-row"><span>GST (5%)</span><span>{fmt(p.gst)}</span></div>
      {p.discount > 0 && <div className="price-row discount"><span>Discount (7% over ₹50k)</span><span>-{fmt(p.discount)}</span></div>}
      <div className="price-row total"><span>Total</span><span>{fmt(p.total)}</span></div>
    </div>
  );
};

/* ---------------- Step 6: Payment ---------------- */
export const PaymentSimulationStep = ({ onResult }) => {
  const { state } = useBooking();
  const [status, setStatus] = useState('idle'); // idle | processing | success | failed
  const [txn, setTxn] = useState(null);
  const total = state.priceBreakdown?.total || 0;

  const pay = async () => {
    setStatus('processing');
    try {
      const res = await mockCharge(total);
      setTxn(res);
      setStatus(res.status === 'success' ? 'success' : 'failed');
      onResult && onResult(res);
    } catch (e) {
      setStatus('failed');
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Payment (Mock Gateway)</h3>
      <div className="summary-card">
        <div>Amount due: <strong>₹{Number(total).toLocaleString('en-IN')}</strong></div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
          Mock gateway — 90% success rate for demo purposes. No real card required.
        </div>
      </div>
      {status === 'idle' && (
        <button className="btn btn-primary" onClick={pay}>
          Pay ₹{Number(total).toLocaleString('en-IN')}
        </button>
      )}
      {status === 'processing' && <div style={{ padding: 24 }}>Processing payment…</div>}
      {status === 'success' && (
        <div className="summary-card" style={{ background: '#dcfce7', borderColor: '#86efac' }}>
          <strong>Payment successful ✓</strong>
          <div style={{ fontSize: 12, marginTop: 4 }}>Txn ID: {txn?.txnId}</div>
        </div>
      )}
      {status === 'failed' && (
        <div className="summary-card" style={{ background: '#fee2e2', borderColor: '#fca5a5' }}>
          <strong>Payment failed</strong> — please retry.
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={pay}>Retry</button>
          </div>
        </div>
      )}
    </div>
  );
};
