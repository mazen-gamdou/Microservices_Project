$(document).ready(function() {
    // Fetch the random word length from the server and set the maxlength attribute
    $.get('/word', function(data) {
      const randomWordLength = data.length;
      $("#word-input").attr("maxlength", randomWordLength-1);
    });
  
    $("#guess-form").submit(function(event) {
      event.preventDefault();
  
      // Get the guessed word from the input
      const guessedWord = $("#word-input").val().toLowerCase();
  
      // Make a GET request to the server to get the random word
      $.get('/word', function(data) {
        const randomWord = data.toLowerCase();
  
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
  
        // Display the result
        $("#result").html(resultHtml);
      });
    });
  });
  