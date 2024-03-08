const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const { Pool } = require('pg');
const os = require('os');
const cors = require('cors');

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
const PORT = process.env.PORT || 3002;

// Adjust the CORS options to include the correct origin
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3005'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // For HTTPS, set secure: true
}));

const hashPassword = async (password) => await bcrypt.hash(password, 10);

function isAuthenticated(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Validate client_id, scope, and redirect_uri
const VALID_CLIENT_IDS = ['yourClientID1', 'yourClientID2'];
const VALID_REDIRECT_URIS = ['http://localhost:3000/callback', 'http://localhost:3001/callback'];
const VALID_SCOPES = ['openid', 'profile', 'email'];

app.get('/authorize', (req, res) => {
  const { client_id, scope, redirect_uri } = req.query;

  if (!VALID_CLIENT_IDS.includes(client_id)) {
    return res.status(400).send('Invalid client_id');
  }

  if (!VALID_REDIRECT_URIS.includes(redirect_uri)) {
    return res.status(400).send('Invalid redirect_uri');
  }

  const requestedScopes = scope.split(' ');
  if (!requestedScopes.every(s => VALID_SCOPES.includes(s))) {
    return res.status(400).send('Invalid scope');
  }

  // Display the login form with OIDC parameters included as hidden fields
  res.sendFile(path.join(__dirname, 'www', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'register.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Removed client_id and redirect_uri for simplicity
  
  try {
      const result = await pool.query('SELECT id, password FROM users WHERE username = $1', [username]);
      if (result.rows.length > 0) {
          const user = result.rows[0];
          const match = await bcrypt.compare(password, user.password);
          if (match) {
              // Setting user information in session upon successful login
              req.session.username = username;
              req.session.userId = user.id; 
              res.redirect('http://localhost:3000'); // Adjust the path as needed
          } else {
              res.status(401).send('Invalid username or password');
          }
      } else {
          res.status(401).send('Invalid username or password');
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
    // The RETURNING clause now includes id along with username
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4) RETURNING id, username',
      [first_name, last_name, username, hashedPassword]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // You might want to use the user id for session or other purposes here
      console.log(`User created with ID: ${user.id}`); // For demonstration
      res.send('User registered successfully. <a href="/login">Login</a>');
    } else {
      res.send('Registration failed');
    }
  } catch (err) {
    console.log(err);
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