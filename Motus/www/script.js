$(document).ready(function() {
  let remainingTries = 6;
  const maxAttempts = 6;
  let randomWord;
  let playerId; // Variable to store the fetched username

  console.log("script.js is loaded");

  // Fetch the username and initialize the game
  $.ajax({
      url: "http://localhost:3002/api/user",
      xhrFields: {
          withCredentials: true
      },
      success: function(data) {
          playerId = data.username; // Set the playerId to the fetched username
          $('#welcome-message').text(`Welcome, ${playerId}!`); // Welcome message with username
          initializeGame(); // Initialize the game after fetching the username
          fetchAndDisplayScore(playerId); // Fetch and display the score after getting the username
      },
      error: function() {
          $('#welcome-message').text('Welcome, Guest!');
          playerId = 'Guest'; // Default playerId to 'Guest' if API call fails
          initializeGame(); // Initialize the game even if username fetch fails
          fetchAndDisplayScore(playerId); // Attempt to fetch and display score even for guest
      }
  });

  function initializeGame() {
      // Fetch the random word from the server
      $.get('/word', function(data) {
          randomWord = data.toLowerCase();
          const wordLength = randomWord.length - 1;
          $("#word-input").attr("maxlength", wordLength);
          $("#result").html(`Word Length: ${wordLength} letters`);

          // Handle form submission for guesses
          $("#guess-form").submit(function(event) {
              event.preventDefault();
              const guessedWord = $("#word-input").val().toLowerCase();

              // Ensure the guess is the correct length
              if (guessedWord.length !== wordLength) {
                  alert("Please enter a word with the correct number of letters.");
                  return;
              }

              // Process the guessed word
              let resultHtml = "";
              let correctGuess = true; // Assume correct guess until proven otherwise
              for (let i = 0; i < guessedWord.length; i++) {
                  if (guessedWord[i] === randomWord[i]) {
                      resultHtml += `<span class="green">${guessedWord[i]}</span>`; // Correct letter and position
                  } else if (randomWord.includes(guessedWord[i])) {
                      resultHtml += `<span class="orange">${guessedWord[i]}</span>`; // Correct letter, wrong position
                      correctGuess = false; // Part of the guess is incorrect
                  } else {
                      resultHtml += `<span>${guessedWord[i]}</span>`; // Incorrect letter
                      correctGuess = false; // Part of the guess is incorrect
                  }
              }

              $("#result").html(`Result: ${resultHtml}`);
              remainingTries--; // Decrement the remaining tries

              // Check if the whole guess was correct
              if (correctGuess) {
                  alert("Congratulations! You guessed the word.");
                  updateScore(playerId); // Update score with correct guess
                  resetGame(); // Reset the game for a new word
              } else if (remainingTries === 0) {
                  alert(`Sorry, you're out of tries. The correct word was: ${randomWord}`);
                  resetGame(); // Reset the game after running out of tries
              } else {
                  // Update the display for remaining tries if the game continues
                  $("#result").append(` | Remaining Tries: ${remainingTries}`);
              }
          });

          // Enable or disable the submit button based on the input length
          $("#word-input").on("input", function() {
              const enteredWordLength = $(this).val().length;
              $("#guess-form button").prop("disabled", enteredWordLength < wordLength);
          });
      });
  }

  function updateScore(playerId) {
      // Fetch the current score first
      fetchCurrentScore(playerId, function(currentScore) {
          // Increment wordsFound by 1 based on the previous value
          let newWordsFound = parseInt(currentScore.wordsFound) + 1;

          // Calculate new average tries; implement your logic in calculateNewAverageTries
          let newAverageTries = calculateNewAverageTries(currentScore.averageTries, currentScore.wordsFound, remainingTries);

          // Now, update the score with the new values
          sendUpdatedScore(playerId, newWordsFound, newAverageTries);
      });
  }

  function fetchCurrentScore(playerId, callback) {
      const scoreServerUrl = 'http://localhost:3005/getscore';

      $.get(`${scoreServerUrl}?playerId=${playerId}`, function(data) {
         
        console.log('Current score fetched successfully:', data);

        if (typeof callback === 'function') {
            callback(data);  // The current score data is passed to the callback function
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch current score for player:", playerId, textStatus, errorThrown, jqXHR.responseText);
    });
}

function sendUpdatedScore(playerId, newWordsFound, newAverageTries) {
    const scoreServerUrl = 'http://localhost:3005/setscore';
    const dataToSend = {
        playerId: playerId,
        wordsFound: newWordsFound,
        averageTries: newAverageTries
    };

    console.log('Sending updated score', dataToSend);

    $.ajax({
        url: scoreServerUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function(response) {
            console.log('Score updated successfully:', response);
            fetchAndDisplayScore(playerId); // Refresh the displayed score
        },
        error: function(xhr, status, error) {
            console.error('Error updating score:', status, error, xhr.responseText);
        }
    });
}

function fetchAndDisplayScore(playerId) {
    const scoreServerUrl = 'http://localhost:3005/getscore';

    $.get(`${scoreServerUrl}?playerId=${playerId}`, function(data) {
        console.log('Score fetched successfully:', data);
        $("#wordsFound").text(data.wordsFound);
        $("#averageTries").text(data.averageTries);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch score for player:", playerId, textStatus, errorThrown, jqXHR.responseText);
    });
}

function calculateNewAverageTries(previousAverageTries, previousWordsFound, currentTries) {
  // Convert previous average tries and words found to numeric values to ensure accurate calculations
  let numericPreviousAverageTries = parseFloat(previousAverageTries);
  let numericPreviousWordsFound = parseInt(previousWordsFound);

  // Calculate the new average tries using the formula: (6 - currentTries) / (previousWordsFound + 1)
  let newAverageTries = (7 - currentTries) / (numericPreviousWordsFound + 1);

  return newAverageTries;
}

function resetGame() {
    $("#word-input").val("");
    remainingTries = maxAttempts;

    $.get('/word', function(data) {
        randomWord = data.toLowerCase();
        initializeGame();
    });
}
});
