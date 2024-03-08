$(document).ready(function() {
  let remainingTries = 6;
  const maxAttempts = 6;
  let randomWord;
  let playerId = null; // Initialize playerId as null

  // Function to fetch the current user's username
  function fetchUsername() {
    $.ajax({
      url: "http://localhost:3002/api/user",
      xhrFields: {
        withCredentials: true // Necessary for cookies, authorization headers, etc.
      },
      success: function(data) {
        if (data && data.username) {
          playerId = data.username; // Update playerId with the fetched username
          $('#welcome-message').text(`Welcome, ${playerId}!`);
        }
      },
      error: function() {
        $('#welcome-message').text('Welcome, Guest!');
      }
    });
  }

  // Function to update the user's score
  function updateScore(wordsFoundIncrement, newAverageTries) {
    if (!playerId) {
      console.error("No playerId available. Cannot update score.");
      return;
    }

    const scoreServerUrl = 'http://localhost:3005/setscore';
    const dataToSend = {
      playerId: playerId,
      wordsFound: wordsFoundIncrement,
      averageTries: newAverageTries
    };

    $.ajax({
      url: scoreServerUrl,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(dataToSend),
      success: function(response) {
        console.log('Score updated successfully:', response);
        // Optionally, refresh the displayed score
      },
      error: function(xhr, status, error) {
        console.error('Error updating score:', status, error);
      }
    });
  }

  // Fetch the username on page load
  fetchUsername();

  // Game initialization and word guessing logic
  function initializeGame() {
    $.get('/word', function(data) {
      randomWord = data.toLowerCase();
      const wordLength = randomWord.length;
      $("#word-input").attr("maxlength", wordLength);
      $("#result").html(`Word Length: ${wordLength} letters`);

      $("#guess-form").submit(function(event) {
        event.preventDefault();
        const guessedWord = $("#word-input").val().toLowerCase();

        if (guessedWord.length !== wordLength) {
          alert("Please enter a word with the correct number of letters.");
          return;
        }

        remainingTries--;

        let resultHtml = "";
        guessedWord.split('').forEach((char, index) => {
          if (char === randomWord[index]) {
            resultHtml += `<span class="correct">${char}</span>`;
          } else if (randomWord.includes(char)) {
            resultHtml += `<span class="present">${char}</span>`;
          } else {
            resultHtml += `<span class="absent">${char}</span>`;
          }
        });

        $("#result").html(resultHtml);
        $("#remaining-tries").text(`Remaining Tries: ${remainingTries}`);

        if (guessedWord === randomWord) {
          alert("Congratulations! You've guessed the word correctly.");
          updateScore(1, calculateNewAverageTries()); // Assuming this function exists and returns a number
          resetGame();
        } else if (remainingTries <= 0) {
          alert(`Out of tries! The correct word was ${randomWord}.`);
          resetGame();
        }
      });
    });
  }

  function resetGame() {
    remainingTries = maxAttempts;
    $("#word-input").val("");
    $("#result").text("");
    initializeGame(); // Fetch a new word and reset the game
  }

  initializeGame(); // Start the game on page load
});