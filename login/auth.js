const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'tokyodata',
  port: 5432,
});

// Middleware for parsing request bodies
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Session setup
router.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Hash password (for demonstration, ideally do this during user registration)
const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Login page route
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'login.html'));
});

// Register page route
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'register.html'));
});

// Login logic
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.username = username;
        res.redirect('/www/index.html'); // Redirect to the game main page
      } else {
        res.send('Invalid username or password');
      }
    } else {
      res.send('Invalid username or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Registration logic
router.post('/register', async (req, res) => {
  const { first_name, last_name, username, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users(first_name, last_name, username, password) VALUES($1, $2, $3, $4) RETURNING id',
      [first_name, last_name, username, hashedPassword]
    );
    if (result.rows.length > 0) {
      res.send('User registered successfully. <a href="/login">Login</a>');
    } else {
      res.send('Registration failed');
    }
  } catch (err) {
    if (err.code === '23505') { // Unique violation error code
      res.send('User already exists');
    } else {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }
});


// Logout logic
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});
module.exports = { isAuthenticated, router };