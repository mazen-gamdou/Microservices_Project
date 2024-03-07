const express = require('express');
const path = require('path');
const fs = require('fs');
const seedrandom = require('seedrandom');
const { Pool } = require('pg');

const router = express.Router();

// Define the pool here if not importing
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'tokyodata',
  port: 5432,
});

// Serve static files from 'www' directory
router.use('/www', express.static(path.join(__dirname, 'www')));

// Assuming isAuthenticated is exported from auth.js
const { isAuthenticated } = require('../login/auth'); 

// get user's first name
router.get('/getUserName', isAuthenticated, async (req, res) => {
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

// Protected route example: Serve a random word from a list
router.get('/Word', isAuthenticated, (req, res) => {
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


module.exports = router;


