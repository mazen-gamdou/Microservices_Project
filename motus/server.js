const express = require('express');
const path = require('path');
const fs = require('fs');
const seedrandom = require('seedrandom');
const { Pool } = require('pg');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = 3000; 

// Initialize PostgreSQL pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'tokyodata',
  port: 5432,
});

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true } // Note: Set secure to true if you're using HTTPS
}));

// Serve static files from 'www' directory
app.use(express.static(path.join(__dirname, 'www')));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Example authenticated route: Get user's first name
app.get('/getUserName', isAuthenticated, async (req, res) => {
  const username = req.session.username;
  try {
    const result = await pool.query('SELECT first_name FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      res.json({ username: result.rows[0].first_name });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Database query error', error);
    res.status(500).send('Internal Server Error');
  }
});

// Example protected route: Serve a random word from a list
app.get('/Word', isAuthenticated, (req, res) => {
  const filePath = path.join(__dirname, 'data', 'liste_francais_utf8.txt');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    const words = data.split('\n');
    const currentDate = new Date().toISOString().split('T')[0];
    const seed = `${currentDate}-uniqueSeed`;
    const rng = seedrandom(seed);
    const randomIndex = Math.floor(rng() * words.length);
    res.send(words[randomIndex]);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
