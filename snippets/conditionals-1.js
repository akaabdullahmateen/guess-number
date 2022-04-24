function checkGuess() {
  const userGuess = Number(guessField.value);
  if (guessCount === 1) {
    guesses.textContent = "Previous guesses: ";
  }

  guesses.textContent += userGuess + " ";

  if (userGuess === randomNumber) {
    lastResult.textContent = "Congratulations! You got it right!";
    lowOrHigh.textContent = "";
    setGameOver();
  } else if (guessCount === 10) {
    lastResult.textContent = "!!!Game Over!!!";
    lowOrHigh.textContent = "";
    setGameOver();
  } else {
    lastResult.textContent = "Wrong!";
    if (userGuess < randomNumber) {
      lowOrHigh.textContent = "Last guess was too low!";
    } else if (userGuess > randomNumber) {
      lowOrHigh.textContent = "Last guess was too high!";
    }
  }

  guessCount++;
  guessField.value = "";
  guessField.focus();
}
