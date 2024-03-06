const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const app = express();
const port = process.env.PORT || 3005;

app.use(express.static("www"));
app.use(bodyParser.json());

// Create a Redis client
const client = redis.createClient({
    url: 'redis://localhost:6379'
});

// Handle Redis client errors
client.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
client.connect().then(() => {
    console.log('Connected to Redis');
});

// Endpoint to set the score for a player
app.post('/setscore', async (req, res) => {
    const { playerId, wordsFound, averageTries } = req.body;
    if (!playerId) {
        return res.status(400).send('Player ID is required');
    }

    try {
        // Store the words found and average tries in Redis using the playerId as the key
        await client.hSet(`playerScore:${playerId}`, {
            wordsFound: wordsFound.toString(),
            averageTries: averageTries.toString()
        });
        res.status(200).send('Score updated successfully');
    } catch (error) {
        console.error('Error setting score:', error);
        res.status(500).send('Error setting score');
    }
});

// Endpoint to get the score for a player
app.get('/getscore', async (req, res) => {
    const { playerId } = req.query;
    if (!playerId) {
        return res.status(400).send('Player ID is required');
    }

    try {
        const scoreData = await client.hGetAll(playerId); // Use the playerId directly
        if (scoreData.wordsFound && scoreData.averageTries) {
            res.json({
                playerId: playerId,
                wordsFound: parseInt(scoreData.wordsFound, 10),
                averageTries: parseFloat(scoreData.averageTries)
            });
        } else {
            res.status(404).send('Score not found');
        }
    } catch (error) {
        console.error('Error getting score:', error);
        res.status(500).send('Error getting score');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});