const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs');
const seedrandom = require('seedrandom');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'), // Securely generate a random session secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true when using HTTPS
}));

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from 'www' for the game and 'login/www' for login and registration pages
app.use('/www', express.static(path.join(__dirname, 'www')));
app.use(express.static(path.join(__dirname, 'login', 'www')));

// In-memory user store
const users = {};

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

// Redirect to login or game main page
app.get('/', (req, res) => {
  if (req.session.username) {
    res.redirect('/www/index.html'); // Redirect to the game main page
  } else {
    res.redirect('/login'); // Redirect to login if not logged in
  }
});

// Login page route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'www', 'login.html'));
});

// Register page route
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'www', 'register.html'));
});

// Login logic
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.username = username;
    res.redirect('/www/index.html'); // Redirect to the game main page
  } else {
    res.send('Invalid username or password');
  }
});

// Registration logic
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.send('User already exists');
  }
  users[username] = {
    password: await hashPassword(password)
  };
  res.send('User registered successfully. <a href="/login">Login</a>');
});

// Logout logic
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Protected route example: Serve a random word from a list
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
