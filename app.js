const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { router: authRoutes } = require('./login/auth');

const gameRoutes = require('./motus/server');

app.use(authRoutes); // Use the authentication routes
app.use(gameRoutes); // Use the game-related routes

app.get('/', (req, res) => {
    res.redirect('/login'); // Redirect users to the login page
  });

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

