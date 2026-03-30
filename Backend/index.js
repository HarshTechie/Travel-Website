// const express = require('express');
// const cors = require('cors');
// const { Pool } = require('pg');
// const bcrypt = require('bcrypt');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // PostgreSQL connection
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'Travel',
//   password: '15062006',
//   port: 5432,
// });

// //MONGO DB

// // --------- Signup route ---------
// app.post('/signup', async (req, res) => {
//   const { username, email, password } = req.body;

//   if (!username || !email || !password)
//     return res.status(400).json({ error: 'Please fill all fields' });

//   try {
//     const existing = await pool.query(
//       'SELECT * FROM users WHERE username=$1 OR email=$2',
//       [username, email]
//     );

//     if (existing.rows.length > 0) {
//       return res
//         .status(400)
//         .json({ error: 'Username or Email already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const result = await pool.query(
//       'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
//       [username, email, hashedPassword]
//     );

//     res.json({ message: 'Signup successful', user: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // --------- Login route ---------
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password)
//     return res
//       .status(400)
//       .json({ error: 'Please enter username and password' });

//   try {
//     const userRes = await pool.query('SELECT * FROM users WHERE username=$1', [
//       username,
//     ]);
//     const user = userRes.rows[0];

//     if (!user) return res.status(400).json({ error: 'Invalid credentials' });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ error: 'Invalid credentials' });

//     res.json({
//       message: 'Login successful',
//       user: { username: user.username, email: user.email },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // --------- Favorites routes ---------

// // Add a favorite (avoid duplicates)
// app.post('/api/favorites', async (req, res) => {
//   const { username, destination_name, image_url } = req.body;
//   try {
//     const exists = await pool.query(
//       'SELECT * FROM favorites WHERE username=$1 AND destination_name=$2',
//       [username, destination_name]
//     );

//     if (exists.rows.length > 0) {
//       return res.status(400).json({ error: 'Already in favorites' });
//     }

//     const result = await pool.query(
//       'INSERT INTO favorites (username, destination_name, image_url) VALUES ($1, $2, $3) RETURNING *',
//       [username, destination_name, image_url]
//     );
//     res.json({ favorite: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// // Get favorites for a user
// app.get('/api/favorites/:username', async (req, res) => {
//   const { username } = req.params;
//   try {
//     const result = await pool.query(
//       'SELECT * FROM favorites WHERE username = $1 ORDER BY created_at DESC',
//       [username]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// // Remove a favorite
// app.delete('/api/favorites/:username/:destination_name', async (req, res) => {
//   const { username, destination_name } = req.params;
//   try {
//     await pool.query(
//       'DELETE FROM favorites WHERE username=$1 AND destination_name=$2',
//       [username, destination_name]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database error' });
//   }
// });
// // Reviews table should exist in PostgreSQL: id (SERIAL), username (TEXT), review (TEXT), created_at (TIMESTAMP DEFAULT NOW())

// // Get all reviews
// // Get all reviews

// // Add a review
// // Get all reviews
// // Get all reviews
// app.get('/reviews', async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM reviews ORDER BY created_at DESC'
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database error fetching reviews' });
//   }
// });

// // Add new review
// app.post('/reviews', async (req, res) => {
//   const { username, review } = req.body;

//   if (!username || !review) {
//     return res.status(400).json({ error: 'Username and review are required' });
//   }

//   try {
//     const result = await pool.query(
//       'INSERT INTO reviews (username, review) VALUES ($1, $2) RETURNING *',
//       [username, review]
//     );
//     console.log('Added review:', result.rows[0]); // ✅ Logs the added review
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database error adding review' });
//   }
// });

// // Start server
// app.listen(5000, () => console.log('Server running on http://localhost:5000'));
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());
app.use(express.json());

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

/* ------------ Server ------------ */

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
