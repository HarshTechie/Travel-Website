import React, { useState } from 'react';
import BookingWizard from './BookingWizard';

const BookNowButton = ({ destination, user, className = 'book', label = 'Book Now' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <BookingWizard
          destination={destination}
          user={user}
          onClose={() => setOpen(false)}
          onDone={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default BookNowButton;
