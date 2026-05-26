const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Initialize SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ message: err.message });
      if (row) return res.status(409).json({ message: 'Email already registered' });

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert user
      db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, password_hash],
        function (err) {
          if (err) return res.status(500).json({ message: err.message });
          res.status(201).json({
            message: 'User created successfully',
            user: { id: this.lastID, email, created_at: new Date().toISOString() }
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

      // Generate token
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: { id: user.id, email: user.email, created_at: user.created_at }
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify token
app.get('/api/user', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT * FROM users WHERE id = ?', [decoded.user_id], (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({ id: user.id, email: user.email, created_at: user.created_at });
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
