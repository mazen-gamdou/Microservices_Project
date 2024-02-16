const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const app = express();
const path = require('path');
const port = process.env.PORT || 3005;
const os = require('os');

app.use(express.static("www"));

app.use(bodyParser.json());

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

// Écoutez l'événement 'error' pour gérer les erreurs de connexion.
client.on('error', (err) => console.log('Redis Client Error', err));

// Connectez-vous au client Redis.
client.connect();

// Utilisez client seulement après qu'il soit connecté.
client.on('connect', () => {
  console.log('Connected to Redis');
  // Votre logique Redis ici
});

app.get('/port', (req, res) => {
    const hostname = os.hostname();
    res.send(`MOTUS APP working on ${hostname} port ${port}`);
    });


// increment
client.incr('visits', (err, reply) => {
    console.log('Visits:', reply);
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
