import React, { createContext, useContext, useReducer } from 'react';

const BookingContext = createContext(null);

const initial = {
  destinationName: '',
  destinationImage: '',
  travelers: [{ name: '', age: '', gender: 'male', idType: 'aadhaar', idNumber: '' }],
  travelDetails: {
    startDate: '',
    endDate: '',
    packageType: 'standard',
    count: 1,
  },
  contact: { email: '', phone: '' },
  addons: { hotel: '3star', meals: 'breakfast', guide: false, transport: 'none' },
  priceBreakdown: null,
  draftId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...initial, ...action.payload };
    case 'SET_FIELD':
      return { ...state, [action.key]: action.value };
    case 'SET_NESTED':
      return {
        ...state,
        [action.key]: { ...state[action.key], ...action.value },
      };
    case 'SET_TRAVELERS':
      return {
        ...state,
        travelers: action.value,
        travelDetails: { ...state.travelDetails, count: action.value.length },
      };
    case 'SET_PRICE':
      return { ...state, priceBreakdown: action.value };
    case 'RESET':
      return { ...initial };
    default:
      return state;
  }
}

export const BookingWizardProvider = ({ children, initialData = {} }) => {
  const [state, dispatch] = useReducer(reducer, { ...initial, ...initialData });
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingWizardProvider');
  return ctx;
};
