import React, { useState } from 'react';
import locationData from './locationData';
import '../styles/App.css';

const ItineraryForm = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itinerary, setItinerary] = useState(null);

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
      schedule,
    });
  };

  return (
    <div className="container">
      {!itinerary ? (
        <form
          onSubmit={handleSubmit}
          className="form"
        >
          <h2>AI Itinerary Generator</h2>

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

          <button type="submit">Generate Itinerary</button>
        </form>
      ) : (
        <div className="itinerary">
          <h2>{itinerary.location} Itinerary</h2>
          <p>
            <strong>From:</strong> {itinerary.startDate} <strong>To:</strong>{' '}
            {itinerary.endDate}
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

          <button onClick={() => setItinerary(null)}>Start Over</button>
        </div>
      )}
    </div>
  );
};

export default ItineraryForm;
