import React, { useState } from 'react';
import locationData from './locationData';
import '../styles/App.css';

const ItineraryForm = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [travelStyle, setTravelStyle] = useState('standard');
  const [itinerary, setItinerary] = useState(null);

  const styleLabel = {
    backpacking: '🎒 Backpacking',
    standard: '🧳 Standard',
    luxury: '✨ Luxury',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation || !startDate || !endDate) return;

    const data = locationData[selectedLocation];
    if (!data || !data.attractions) return;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    const days = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1, 1);

    const attractions = data.attractions.map((a) => a.name);
    const schedule = [];

    // Distribute attractions as evenly as possible
    let remaining = [...attractions];
    const base = Math.floor(attractions.length / days);
    let extra = attractions.length % days;

    for (let i = 0; i < days; i++) {
      const count = base + (extra > 0 ? 1 : 0);
      schedule.push({
        day: i + 1,
        attractions: remaining.splice(0, count),
      });
      if (extra > 0) extra--;
    }

    setItinerary({
      location: selectedLocation,
      startDate,
      endDate,
      budget,
      travelStyle,
      schedule,
    });
  };

  const exportItinerary = () => {
    window.print();
  };

  const copyShareLink = () => {
    const payload = encodeURIComponent(JSON.stringify({
      location: itinerary.location,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      budget: itinerary.budget,
      travelStyle: itinerary.travelStyle,
    }));
    const url = `${window.location.origin}/itineraries?shared=${payload}`;
    navigator.clipboard.writeText(url).then(
      () => alert('Share link copied to clipboard!'),
      () => alert(url)
    );
  };

  return (
    <div className="container">
      {!itinerary ? (
        <form
          onSubmit={handleSubmit}
          className="form"
        >
          <h2>Itinerary Generator</h2>

          <label>Choose Location:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">--Select--</option>
            {Object.keys(locationData).map((loc) => (
              <option
                key={loc}
                value={loc}
              >
                {loc}
              </option>
            ))}
          </select>

          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <label>Budget (₹, optional):</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <label>Travel Style:</label>
          <select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
            <option value="backpacking">🎒 Backpacking</option>
            <option value="standard">🧳 Standard</option>
            <option value="luxury">✨ Luxury</option>
          </select>

          <button type="submit">Generate Itinerary</button>
        </form>
      ) : (
        <div className="itinerary">
          <h2>{itinerary.location} Itinerary</h2>
          <p>
            <strong>From:</strong> {itinerary.startDate} <strong>To:</strong>{' '}
            {itinerary.endDate}
          </p>
          <p>
            <strong>Style:</strong> {styleLabel[itinerary.travelStyle] || itinerary.travelStyle}
            {itinerary.budget && <> · <strong>Budget:</strong> ₹{Number(itinerary.budget).toLocaleString('en-IN')}</>}
          </p>

          {itinerary.schedule.map((day) => (
            <div
              key={day.day}
              className="day-card"
            >
              <h4>Day {day.day}</h4>
              <ul>
                {day.attractions.map((attr, index) => (
                  <li key={index}>{attr}</li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <button onClick={() => setItinerary(null)}>Start Over</button>
            <button type="button" onClick={exportItinerary}>🖨 Export / PDF</button>
            <button type="button" onClick={copyShareLink}>🔗 Share Link</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryForm;
