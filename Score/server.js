const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const app = express();
const port = process.env.PORT || 3005;
const redis_url = process.env.REDIS_URL || 'redis://redis:6379';
const cors = require('cors');
app.use(express.static("www"));
app.use(bodyParser.json());

// Create a Redis client
const client = redis.createClient({
    url: redis_url
});
// If the Motus game runs on a different port, add it to the allowed origins
const corsOptions = {
    origin: ['http://localhost:3000', 'http://my-haproxy-instance:3000', 'http://localhost:4000'], // Replace with the actual origin of your Motus game
    credentials: true,
  };
  
app.use(cors(corsOptions));

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

app.get('/getscore', async (req, res) => {
    const { playerId } = req.query;
    if (!playerId) {
        return res.status(400).send('Player ID is required');
    }

    try {
        // Retrieve the player's score information from Redis
        const scoreData = await client.hGetAll(`playerScore:${playerId}`);

        // If the user's score data is not found, initialize it
        if (!scoreData || (!scoreData.wordsFound && !scoreData.averageTries)) {
            // Initialize the score for the player
            await client.hSet(`playerScore:${playerId}`, {
                wordsFound: "0",
                averageTries: "0"
            });

            // Respond with the initialized score data
            res.json({
                playerId: playerId,
                wordsFound: 0,
                averageTries: 0
            });
        } else {
            // Respond with the existing score data
            res.json({
                playerId: playerId,
                wordsFound: parseInt(scoreData.wordsFound, 10),
                averageTries: parseFloat(scoreData.averageTries)
            });
        }
    } catch (error) {
        console.error('Error getting/initializing score:', error);
        res.status(500).send('Error getting/initializing score');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});