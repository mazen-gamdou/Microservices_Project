// const playerId = 'Mazen'; // Use the key from Redis

// function fetchAndDisplayScores() {
//     fetch(`/getscore?playerId=${playerId}`)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Remove 'playerScore:' prefix from playerId when displaying
//             const displayName = playerId.replace('playerScore:', '');
//             document.getElementById('usernameScore').textContent = `${displayName}'s Score`;
//             document.getElementById('wordCount').textContent = data.wordsFound;
//             document.getElementById('averageTry').textContent = data.averageTries;
//         })
//         .catch(error => {
//             console.error('Error fetching scores:', error);
//             document.getElementById('usernameScore').textContent = 'Error';
//             document.getElementById('wordCount').textContent = 'Error';
//             document.getElementById('averageTry').textContent = 'Error';
//         });
// }

// window.onload = fetchAndDisplayScores;

function fetchUsernameAndDisplayScores() {
    // Fetch the currently logged-in user's username
    fetch('http://localhost:3002/api/user', {
        credentials: 'include' // Needed to include cookies
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch username');
        }
        return response.json();
    })
    .then(data => {
        const playerId = data.username; // Use the username as playerId
        fetchAndDisplayScores(playerId);
    })
    .catch(error => {
        console.error('Error fetching username:', error);
        // Handle the error (e.g., display a message or log out the user)
    });
}

function fetchAndDisplayScores(playerId) {
    fetch(`/getscore?playerId=${playerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Assume 'playerId' is already in a displayable format
            document.getElementById('usernameScore').textContent = `${playerId}'s Score`;
            document.getElementById('wordCount').textContent = data.wordsFound;
            document.getElementById('averageTry').textContent = data.averageTries;
        })
        .catch(error => {
            console.error('Error fetching scores:', error);
            document.getElementById('usernameScore').textContent = 'Error';
            document.getElementById('wordCount').textContent = 'Error';
            document.getElementById('averageTry').textContent = 'Error';
        });
}

window.onload = fetchUsernameAndDisplayScores;