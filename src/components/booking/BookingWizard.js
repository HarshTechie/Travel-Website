import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Stepper from '../common/Stepper';
import { useBooking, BookingWizardProvider } from '../../context/BookingWizardContext';
import {
  TravelerDetailsStep,
  TravelDetailsStep,
  ContactStep,
  AddonsStep,
  PriceBreakdownStep,
  PaymentSimulationStep,
} from './steps/Steps';
import { saveDraft, confirmBooking } from '../../api/bookings';
import { validateTravelers, validateTravel, validateContact } from '../../utils/validators';
import { useToast } from '../common/Toast';

const STEP_LABELS = ['Travelers', 'Travel', 'Contact', 'Add-ons', 'Price', 'Payment'];

const WizardInner = ({ user, onClose, onDone }) => {
  const { state, dispatch } = useBooking();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Lock body scroll while modal is open; restore on close.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const validateStep = () => {
    if (step === 0) {
      const e = validateTravelers(state.travelers);
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 1) {
      const e = validateTravel(state.travelDetails);
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 2) {
      const e = validateContact(state.contact);
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };

  const persistDraft = async () => {
    try {
      const payload = {
        id: state.draftId,
        username: user?.username,
        destinationName: state.destinationName,
        destinationImage: state.destinationImage,
        travelers: state.travelers,
        travelDetails: state.travelDetails,
        contact: state.contact,
        addons: state.addons,
      };
      const saved = await saveDraft(payload);
      if (saved?._id && !state.draftId) {
        dispatch({ type: 'SET_FIELD', key: 'draftId', value: saved._id });
      }
    } catch (e) {
      // silent — local state still works
    }
  };

  const next = async () => {
    if (!validateStep()) return;
    await persistDraft();
    setErrors({});
    setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handlePayResult = async (txn) => {
    if (txn.status !== 'success') return;
    setSubmitting(true);
    try {
      // ensure draft exists server-side
      let draftId = state.draftId;
      if (!draftId) {
        const saved = await saveDraft({
          username: user?.username,
          destinationName: state.destinationName,
          destinationImage: state.destinationImage,
          travelers: state.travelers,
          travelDetails: state.travelDetails,
          contact: state.contact,
          addons: state.addons,
        });
        draftId = saved._id;
      }
      const confirmed = await confirmBooking(draftId, {
        txnId: txn.txnId,
        paymentStatus: 'success',
      });
      toast('Booking confirmed! ID: ' + confirmed.bookingId, 'success', 5000);
      onDone && onDone(confirmed);
    } catch (e) {
      toast('Could not confirm booking: ' + e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return ReactDOM.createPortal(
      <div className="wizard-overlay wizard-open" onClick={onClose}>
        <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
          <button className="wizard-close" onClick={onClose}>×</button>
          <h2 className="wizard-title">Login required</h2>
          <p>Please log in to book a trip.</p>
          <button className="btn btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>,
      document.body
    );
  }

  return ReactDOM.createPortal(
    <div className="wizard-overlay wizard-open" onClick={onClose}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wizard-close" onClick={onClose}>×</button>
        <h2 className="wizard-title">Book {state.destinationName}</h2>
        <p className="wizard-subtitle">Step {step + 1} of {STEP_LABELS.length}</p>
        <Stepper steps={STEP_LABELS} current={step} />
        <div className="wizard-body">
          {step === 0 && <TravelerDetailsStep errors={errors} />}
          {step === 1 && <TravelDetailsStep errors={errors} />}
          {step === 2 && <ContactStep errors={errors} />}
          {step === 3 && <AddonsStep />}
          {step === 4 && <PriceBreakdownStep />}
          {step === 5 && <PaymentSimulationStep onResult={handlePayResult} />}
        </div>
        <div className="wizard-actions">
          <button className="btn btn-ghost" onClick={back} disabled={step === 0 || submitting}>
            Back
          </button>
          {step < STEP_LABELS.length - 1 ? (
            <button className="btn btn-primary" onClick={next}>
              Continue
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const BookingWizard = ({ destination, user, onClose, onDone }) => {
  return (
    <BookingWizardProvider
      initialData={{
        destinationName: destination?.name || '',
        destinationImage: destination?.image || '',
      }}
    >
      <WizardInner user={user} onClose={onClose} onDone={onDone} />
    </BookingWizardProvider>
  );
};

export default BookingWizard;
