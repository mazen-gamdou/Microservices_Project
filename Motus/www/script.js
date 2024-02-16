$(document).ready(function() {
    let remainingTries = 6;
    const maxAttempts = 6;
    let randomWord;
  
    // Fetch the random word from the server and initialize the game
    $.get('/word', function(data) {
      randomWord = data.toLowerCase();
      initializeGame();
    });
  
    function initializeGame() {
      // Display the number of letters in the random word
      const wordLength = randomWord.length - 1;
      $("#word-input").attr("maxlength", wordLength);
      $("#result").html(`Word Length: ${wordLength} letters`);
  
      // Handle form submission
      $("#guess-form").submit(function(event) {
        event.preventDefault();
  
        // Get the guessed word from the input
        const guessedWord = $("#word-input").val().toLowerCase();
  
        // Check if the guessed word has the same number of letters as the random word
        if (guessedWord.length !== wordLength) {
          alert("Please enter a word with the correct number of letters.");
          return;
        }
  
        // Decrement remaining tries
        remainingTries--;
  
        // Check the guessed word against the random word
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
  
        // Display the result and update the remaining tries
        $("#result").html(`Result: ${resultHtml} | Remaining Tries: ${remainingTries}`);
  
        // Check if the game is won or lost
        if (guessedWord === randomWord) {
          alert("Congratulations! You guessed the word.");
          resetGame();
        } else if (remainingTries === 0) {
          alert(`Sorry, you're out of tries. The correct word was: ${randomWord}`);
          resetGame();
        }
      });
    

      // Disable submit button if the entered word has fewer letters than expected
      $("#word-input").on("input", function() {
        const enteredWordLength = $(this).val().length;
        $("#guess-form button").prop("disabled", enteredWordLength < wordLength);
      });
    }

  
    function resetGame() {
      // Reset the form and remaining tries
      $("#word-input").val("");
      remainingTries = maxAttempts;
  
      // Fetch a new random word and reinitialize the game
      $.get('/word', function(data) {
        randomWord = data.toLowerCase();
        initializeGame();
      });
    }
  });
  