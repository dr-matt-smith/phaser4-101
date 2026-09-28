// assets.ts - the key and file of every picture and sound the game uses
//
// TitleScene loads them all; once loaded, they belong to the whole game, so every scene can use them.

export const COIN_KEY = "coin";
export const COIN_FILE = "assets/images/coin.png";
export const GEM_KEY = "gem";
export const GEM_FILE = "assets/images/gem.png";
// CHALLENGE 1 - the star picture (copied from the asset library into public/assets/images/)
export const STAR_KEY = "star";
export const STAR_FILE = "assets/images/star.png";
export const HEART_KEY = "heart";
export const HEART_FILE = "assets/images/heart.png";

export const COIN_SOUND_KEY = "coinSound";
export const COIN_SOUND_FILE = "assets/audio/coin.wav";
export const HURT_SOUND_KEY = "hurtSound";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
export const LEVEL_SOUND_KEY = "levelSound";
export const LEVEL_SOUND_FILE = "assets/audio/powerup.wav";
export const LOSE_SOUND_KEY = "loseSound";
export const LOSE_SOUND_FILE = "assets/audio/lose.wav";

// the name the best score is kept under in the game's registry (see GameOverScene)
export const BEST_SCORE = "bestScore";
