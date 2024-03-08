const express = require('express');
const fs = require('fs');
const path = require('path');
const seedrandom = require('seedrandom');
const os = require('os');
let fetch;
import('node-fetch').then(mod => {
    fetch = mod.default;
});

const jwt = require('jsonwebtoken'); // For parsing JWT
const session = require('express-session'); // For session management

const app = express();
const port = process.env.PORT || 4000;

// Session configuration
app.use(session({
  secret: 'yourSecretKey', // Use a real secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' } // Set secure to true if you're using HTTPS
}));

// Environment variables for OpenID Connect configuration
const AUTHENT_ENABLED = process.env.AUTHENT_OPENID_ENABLED === 'true';
const AUTHENT_SERVER_URL = process.env.AUTHENT_OPENID_URL || 'http://localhost:5000/authorize';
const CLIENT_ID = process.env.AUTHENT_OPENID_CLIENTID || 'your-client-id';
const SCOPE = process.env.AUTHENT_OPENID_SCOPE || 'openid profile email';
const REDIRECT_URI = process.env.AUTHENT_OPENID_REDIRECT_URI || `http://localhost:${port}/callback`;

app.use(express.static("www"));

// Middleware to check for authentication (Placeholder)
app.use((req, res, next) => {
    // Implement your authentication check logic here
    next();
});

app.get('/Word', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'liste_francais_utf8.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    // Split the text into words
    const words = data.split('\n');


    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Concatenate the current date with a constant seed
    const seed = `${currentDate}-yourSecretSeedHere`;

    // Use seedrandom to generate a pseudo-random number based on the seed
    const rng = seedrandom(seed);
    const randomNum = rng();

    const arrayLength = words.length;
    const randomNum_normalized = Math.round(randomNum * arrayLength);
    

    res.send(words[randomNum_normalized])
  });
});

// Route to handle redirect_uri callback and token exchange
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send("Authorization code is missing.");
    }

    try {
        const tokenResponse = await fetch(`${AUTHENT_SERVER_URL.replace('/authorize', '/token')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}`
        });
        if (!tokenResponse.ok) {
            throw new Error('Token exchange failed');
        }
        const tokenData = await tokenResponse.json();
        
        // Assuming tokenData.id_token is the JWT you need to parse
        const decoded = jwt.verify(tokenData.id_token, 'yourSecretSigningKey'); // Use the appropriate signing key
        req.session.user = {
            id: decoded.sub, // Subject (typically user id)
            name: decoded.name, // Example: add name, adjust according to your token claims
            // Add other session variables as needed based on token claims
        };

        // Redirect to a secure page or indicate success
        res.redirect('/secure-page'); // Adjust as needed
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to exchange code for token.");
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


app.get('/port', (req, res) => {
  const hostname = os.hostname();
  res.send(`MOTUS APP working on ${hostname} port ${port}`);
});