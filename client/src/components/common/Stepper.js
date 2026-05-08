import React from 'react';
import '../../styles/Common.css';

const Stepper = ({ steps, current }) => {
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const state =
          i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <div key={label} className={`step ${state}`}>
            <div className="step-dot">{i < current ? '✓' : i + 1}</div>
            <div className="step-label">{label}</div>
            {i < steps.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
