import { AMHARIC_LETTERS } from "../constants/amharicLetters.js";

const getRandomLetter = () => {
  return AMHARIC_LETTERS[Math.floor(Math.random() * AMHARIC_LETTERS.length)];
};

export const getRandomLetters = (count = 4) => {
  let last = "";
  let randomLetters = [];
  for (let i = 0; i < count; i++) {
    let letter;
    do {
      letter = getRandomLetter();
    } while (letter === last);

    last = letter;
    randomLetters.push(letter);
  }

  return randomLetters;
};
