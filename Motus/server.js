const express = require('express');
const fs = require('fs');
const path = require('path');
const seedrandom = require('seedrandom');
const cors = require('cors'); // Remember to install cors package if you haven't already

const app = express();
const port = process.env.PORT || 4000;

// Middleware to serve static files from the 'www' directory
app.use(express.static("www"));

// Optional: Use CORS if your client-side application is served from a different port or domain
app.use(cors());

// Endpoint to get a random word
app.get('/word', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'liste_francais_utf8.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    const words = data.split('\n');
    const currentDate = new Date().toISOString().split('T')[0];
    const seed = `${currentDate}-yourSecretSeedHere`; // Customize the seed as needed
    const rng = seedrandom(seed);
    const randomWord = words[Math.round(rng() * (words.length - 1))];

    res.type('text').send(randomWord); // Send the random word as a plain text response
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

// Optional: Endpoint to check which port the application is running on
app.get('/port', (req, res) => {
  const hostname = os.hostname();
  res.send(`MOTUS APP working on ${hostname} port ${port}`);
});