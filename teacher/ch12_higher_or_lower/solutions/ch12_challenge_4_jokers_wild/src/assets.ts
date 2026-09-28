// assets.ts - the key and file of every picture and sound the game uses
//
// PreloadScene loads them all; the other scenes use the keys.

export const CARDS_KEY = "cards";
export const CARDS_FILE = "assets/spritesheets/cards.png";
export const CARD_WIDTH = 80;   // one frame of cards.png
export const CARD_HEIGHT = 112;

// CHALLENGE 4: not loaded from a file - PreloadScene draws it
export const JOKER_KEY = "joker";

export const TABLE_KEY = "table";
export const TABLE_FILE = "assets/images/table.png";
export const BUTTON_KEY = "button";
export const BUTTON_FILE = "assets/images/button.png";
export const BUTTON_OVER_KEY = "buttonOver";
export const BUTTON_OVER_FILE = "assets/images/button_over.png";
export const BUTTON_DOWN_KEY = "buttonDown";
export const BUTTON_DOWN_FILE = "assets/images/button_down.png";

export const FLIP_KEY = "flip";
export const FLIP_FILE = "assets/audio/flip.wav";
export const PLACE_KEY = "place";
export const PLACE_FILE = "assets/audio/card_place.wav";
export const CORRECT_KEY = "correct";
export const CORRECT_FILE = "assets/audio/correct.wav";
export const WRONG_KEY = "wrong";
export const WRONG_FILE = "assets/audio/wrong.wav";
export const WIN_KEY = "win";
export const WIN_FILE = "assets/audio/win.wav";
export const LOSE_KEY = "lose";
export const LOSE_FILE = "assets/audio/lose.wav";
export const CLICK_KEY = "click";
export const CLICK_FILE = "assets/audio/click.wav";
