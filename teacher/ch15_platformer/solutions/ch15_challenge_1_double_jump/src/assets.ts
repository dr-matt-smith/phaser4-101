// assets.ts - the key and file of every picture and sound the game uses
//
// GameScene loads them all; Hero plays the jump sound. Keeping the names here means a typo is a
// build error, not a silent missing sound.

export const SKY_KEY = "sky";
export const SKY_FILE = "assets/images/sky.png";
export const GROUND_KEY = "ground";
export const GROUND_FILE = "assets/images/ground.png";
export const PLATFORM_KEY = "platform";
export const PLATFORM_FILE = "assets/images/platform.png";

// sprite sheets: one picture cut into equal frames (see assets/README.md for the layouts)
export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";
export const HERO_FRAME = { frameWidth: 32, frameHeight: 48 };
export const COIN_KEY = "coin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";
export const COIN_FRAME = { frameWidth: 32, frameHeight: 32 };

export const JUMP_SOUND = "jump";
export const JUMP_SOUND_FILE = "assets/audio/jump.wav";
export const COIN_SOUND = "coinSound";
export const COIN_SOUND_FILE = "assets/audio/coin.wav";
export const WIN_SOUND = "win";
export const WIN_SOUND_FILE = "assets/audio/win.wav";
