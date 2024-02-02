const e = require('express');
const express = require('express');
const fs = require('fs');
const path = require('path');
const seedrandom = require('seedrandom');

const app = express();
const port = 3000;

app.use(express.static("www"));

app.get('/Word', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'liste_francais.txt');

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

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
