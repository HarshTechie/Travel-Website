
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

app.use(
  cors({
    origin: [
      'https://travel-website-topaz-delta.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

/* ------------ MongoDB Connection ------------ */

mongoose
  .connect('mongodb://localhost:27017/travelDB')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

/* ------------ Schemas ------------ */

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  // additive optional fields (backward-compatible)
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer',
  },
  phone: String,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const favoriteSchema = new mongoose.Schema({
  username: String,
  destination_name: String,
  image_url: String,
  created_at: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  username: String,
  review: String,
  created_at: { type: Date, default: Date.now },
  // additive optional
  destination_name: { type: String, default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
  images: { type: [String], default: [] },
});

const User = mongoose.model('User', userSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
const Review = mongoose.model('Review', reviewSchema);

/* ------------ Signup ------------ */

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Signup request:', req.body); // helpful for debugging

  if (!username || !email || !password)
    return res.status(400).json({ error: 'Please fill all fields' });

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser)
      return res
        .status(400)
        .json({ error: 'Username or Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({
      message: 'Signup successful',
      user: { username, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ------------ Login ------------ */

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ------------ Favorites ------------ */

app.post('/api/favorites', async (req, res) => {
  const { username, destination_name, image_url } = req.body;

  try {
    const exists = await Favorite.findOne({ username, destination_name });

    if (exists) return res.status(400).json({ error: 'Already in favorites' });

    const favorite = new Favorite({
      username,
      destination_name,
      image_url,
    });

    await favorite.save();

    res.json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/favorites/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const favorites = await Favorite.find({ username }).sort({
      created_at: -1,
    });

    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/favorites/:username/:destination_name', async (req, res) => {
  const { username, destination_name } = req.params;

  try {
    await Favorite.deleteOne({ username, destination_name });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/* ------------ Reviews ------------ */

app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ created_at: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching reviews' });
  }
});

app.post('/reviews', async (req, res) => {
  const { username, review } = req.body;

  if (!username || !review)
    return res.status(400).json({ error: 'Username and review required' });

  try {
    const newReview = new Review({
      username,
      review,
    });

    await newReview.save();

    res.json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error adding review' });
  }
});

/* ------------ New modular routers (mounted AFTER legacy models register) ------------ */
const bookingsRouter = require('./modules/bookings');
const rentalsRouter = require('./modules/rentals');
const destinationsRouter = require('./modules/destinations');
const reviewsRouter = require('./modules/reviews');
const carsRouter = require('./modules/cars');

app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/rentals', rentalsRouter);
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/cars', carsRouter);

app.get('/api/v1/health', (_req, res) =>
  res.json({ ok: true, data: { status: 'up', ts: Date.now() } })
);

/* ------------ Server ------------ */

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
