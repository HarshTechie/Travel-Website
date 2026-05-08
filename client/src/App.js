import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import DestinationPage from './components/Destination';
import FavoritesPage from './components/FavoritePage';
import Login from './components/Login';
import Signup from './components/Signup';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import Reviews from './components/Reviews';
import FavoritePage from './components/FavoritePage';

// New modules (additive)
import MyBookings from './components/booking/MyBookings';
import RentalHome from './components/rentals/RentalHome';
import CarDetail from './components/rentals/CarDetail';
import RentCar from './components/cars/RentCar';
import { ToastProvider } from './components/common/Toast';

// inside <Routes> ...

function App() {
  const [user, setUser] = useState(null);

  return (
    <ToastProvider>
    <Router>
      {/* Navbar visible on all pages */}
      <Navbar
        user={user}
        setUser={setUser}
      />

      {/* Main page content */}
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />
        <Route
          path="/signup"
          element={<Signup setUser={setUser} />}
        />
        <Route
          path="/destinations"
          element={<DestinationPage user={user} />}
        />
        <Route
          path="/favorites"
          element={<FavoritePage user={user} />}
        />
        {/* Itineraries routes */}
        <Route
          path="/itineraries"
          element={
            user ? <ItineraryForm user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/itineraries/display"
          element={
            user ? <ItineraryDisplay user={user} /> : <Navigate to="/login" />
          }
        />

        {/* Favorites route */}
        <Route
          path="/favorites"
          element={
            user ? (
              <FavoritesPage username={user.username} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Reviews route */}
        <Route
          path="/reviews"
          element={<Reviews user={user} />} // pass user for login checks
        />

        {/* ---- New additive routes ---- */}
        <Route
          path="/my-bookings"
          element={user ? <MyBookings user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/rentals" element={<RentalHome />} />
        <Route path="/rentals/:id" element={<CarDetail user={user} />} />
        <Route path="/cars" element={<RentCar />} />

        {/* Fallback for unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>

      {/* Footer visible on all pages */}
      <Footer />
    </Router>
    </ToastProvider>
  );
}

export default App;
