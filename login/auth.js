const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const { Pool } = require('pg');
const os = require('os');
const cors = require('cors');

// // PostgreSQL pool setup
// const pool = new Pool({
//   user: 'postgres', // default user, change if you have set a different one
//   host: process.env.DB_HOST || 'localhost', // use 'localhost' if the server is on the same host outside Docker, or the Docker internal IP/hostname if both are in Docker
//   database: 'postgres', // default database, change if you have set a different one
//   password: process.env.DB_PASSWORD || 'toto', // adjust the password
//   port: process.env.DB_PORT || 5432, // default PostgreSQL port
// });
// PostgreSQL pool setup
const pool = new Pool({
  user: 'postgres',
  host: 'postgres-db', // Use the container name as the host
  database: 'postgres',
  password: 'toto',
  port: 5432,
});

// Create the Express app
const app = express();
const PORT = process.env.PORT || 3002; // Define the port to run on localhost

// Adjust the CORS options to include the correct origin
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3005'], // Add 'http://localhost:3005' to the list
  credentials: true, // to support cookies
};

app.use(cors(corsOptions));
// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Note: Set secure: true if you're using HTTPS
}));

// Hash password
const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Define routes

// Login page route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'login.html'));
});

// Register page route
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'register.html'));
});

// Login logic
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.username = username;
        res.redirect('http://localhost:3000'); 
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
app.post('/register', async (req, res) => {
  const { first_name, last_name, username, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users(first_name, last_name, username, password) VALUES($1, $2, $3, $4) RETURNING username',
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
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/', isAuthenticated, (req, res) => {
  // Protected route example
  res.send('Welcome, you are authenticated!');
});

app.get('/api/user', isAuthenticated, async (req, res) => {
  // Send back the username from the session
  res.json({ username: req.session.username });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/port', (req, res) => {
  const hostname = os.hostname();
  res.send(`Auth APP working on ${hostname} port ${port}`);
});