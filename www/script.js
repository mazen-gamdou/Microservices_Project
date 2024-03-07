$(document).ready(function() {
  let remainingTries = 6;
  const maxAttempts = 6;
  let randomWord;
  let attempts = [];

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

    // Unbind previous form submission handler
    $("#guess-form").off().submit(function(event) {
      event.preventDefault();
      handleFormSubmission();
    });

    // Disable submit button if the entered word has fewer letters than expected
    $("#word-input").on("input", function() {
      const enteredWordLength = $(this).val().length;
      $("#guess-form button").prop("disabled", enteredWordLength < wordLength);
    });
  }

  function handleFormSubmission() {
    // Get the guessed word from the input
    const guessedWord = $("#word-input").val().toLowerCase();

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

    // Store the attempt in the attempts array
    attempts.push({
      attempt: guessedWord,
      result: resultHtml,
      remainingTries: remainingTries
    });

    // Display all attempts
    displayAttempts();

    // Check if the game is won or lost
    if (randomWord.trim() === guessedWord.trim()) {
      alert("Congratulations! You guessed the word.");
      resetGame();
    }
    if (remainingTries === 0) {
      alert(`Sorry, you're out of tries. The correct word was: ${randomWord}`);
      resetGame();
    }

  }

  function displayAttempts() {
    // Display all attempts in the result div
    let attemptsHtml = "";
    for (const attempt of attempts) {
      attemptsHtml += `<p>Attempt: ${attempt.attempt} | Result: ${attempt.result} | Remaining Tries: ${attempt.remainingTries}</p>`;
    }
    $("#result").html(attemptsHtml);
  }

  function resetGame() {
    // Reset the form, remaining tries, and fetch a new random word
    $("#word-input").val("");
    remainingTries = maxAttempts;
    attempts = [];

    // Fetch a new random word and reinitialize the game
    $.get('/word', function(data) {
      randomWord = data.toLowerCase();
      initializeGame();
    });
  }
});

