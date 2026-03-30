import React from 'react';
import '../styles/App.css';

const ItineraryDisplay = ({ itinerary }) => {
  if (!itinerary) return null;

  return (
    <div className="itinerary-display">
      <h2>Trip to {itinerary.location}</h2>
      <p>
        {itinerary.start_date} to {itinerary.end_date} ({itinerary.totalDays}{' '}
        days)
      </p>

      {itinerary.dailySchedule.map((day) => (
        <div
          key={day.day_number}
          className="day-card"
        >
          <h3>
            Day {day.day_number} - {day.date}
          </h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Activity</th>
                <th>Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {day.activities.map((act, idx) => (
                <tr key={idx}>
                  <td>{act.time}</td>
                  <td>{act.type}</td>
                  <td>{act.place}</td>
                  <td>₹{act.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4 style={{ textAlign: 'right' }}>Daily Cost: ₹{day.dailyCost}</h4>
        </div>
      ))}
      <h3 style={{ textAlign: 'right', marginTop: '10px' }}>
        Total Trip Budget: ₹{itinerary.totalBudget}
      </h3>
    </div>
  );
};

export default ItineraryDisplay;
