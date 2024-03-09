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
        fetchAndDisplayScore(playerId); // Call here after playerId is set
    },
    error: function() {
        $('#welcome-message').text('Welcome, Guest!');
        playerId = 'Guest'; // Default playerId to 'Guest' if API call fails
        initializeGame(); // Initialize the game even if username fetch fails
        fetchAndDisplayScore(playerId); // Call here even if defaulting to 'Guest'
    }
  });

  function initializeGame() {
      // Fetch the random word from the server
      $.get('/word', function(data) {
          randomWord = data.toLowerCase();
          const wordLength = randomWord.length - 1;
          $("#word-input").attr("maxlength", wordLength);
          $("#result").html(`Word Length: ${wordLength} letters`);

          // Handle form submission
          $("#guess-form").submit(function(event) {
              event.preventDefault();
              const guessedWord = $("#word-input").val().toLowerCase();
              if (guessedWord.length !== wordLength) {
                  alert("Please enter a word with the correct number of letters.");
                  return;
              }

              remainingTries--;
              let resultHtml = "";
              for (let i = 0; i < guessedWord.length; i++) {
                  if (guessedWord[i] === randomWord[i]) {
                      resultHtml += `<span class="green">${guessedWord[i]}</span>`;
                  } else if (randomWord.includes(guessedWord[i])) {
                      resultHtml += `<span class="orange">${guessedWord[i]}</span>`;
                  } else {
                      resultHtml += `<span>${guessedWord[i]}</span>`;
                  }
              }

              $("#result").html(`Result: ${resultHtml} | Remaining Tries: ${remainingTries}`);
              if (guessedWord === randomWord) {
                  alert("Congratulations! You guessed the word.");
                  updateScore(playerId, 1, calculateNewAverageTries());
                  resetGame();
              } else if (remainingTries === 0) {
                  alert(`Sorry, you're out of tries. The correct word was: ${randomWord}`);
                  resetGame();
              }
          });

          $("#word-input").on("input", function() {
              const enteredWordLength = $(this).val().length;
              $("#guess-form button").prop("disabled", enteredWordLength < wordLength);
          });
      });
  }

  function updateScore(playerId, wordsFoundIncrement, newAverageTries) {
    console.log('updateScore called', { playerId, wordsFoundIncrement, newAverageTries }); // Log function call

    const scoreServerUrl = 'http://localhost:3005/setscore';
    const dataToSend = {
        playerId: playerId,
        wordsFound: wordsFoundIncrement,
        averageTries: newAverageTries
    };

    console.log('Sending score update', dataToSend); // Log data being sent

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
    console.log('fetchAndDisplayScore called', { playerId }); // Log function call

    const scoreServerUrl = 'http://localhost:3005/getscore';

    console.log('Fetching score for playerId:', playerId); // Log fetching action

    $.get(`${scoreServerUrl}?playerId=${playerId}`, function(data) {
        console.log('Score fetched successfully:', data); // Log successful fetch
        $("#wordsFound").text(data.wordsFound);
        $("#averageTries").text(data.averageTries);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch score for player:", playerId, textStatus, errorThrown, jqXHR.responseText); // Log failure details
    });
  }
  

  function calculateNewAverageTries() {
      // Implement your logic for calculating the new average tries here
      return remainingTries; // Placeholder, replace with your actual logic
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