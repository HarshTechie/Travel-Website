import React from 'react';
import '../../styles/Common.css';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {stars.map((n) => (
        <span
          key={n}
          className={`star ${n <= value ? 'filled' : ''} ${readOnly ? 'readonly' : ''}`}
          onClick={() => !readOnly && onChange && onChange(n)}
          role={readOnly ? 'img' : 'button'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
