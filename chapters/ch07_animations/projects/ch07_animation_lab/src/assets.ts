// assets.ts - the key and file of every sprite sheet, and the key of every animation
//
// A sprite sheet is loaded under one key; the animations made from it each have a key of their
// own. Both are names used in more than one file, so they are constants.

// sprite sheets: [key, file, frame width, frame height]
export const HERO_SHEET = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";
export const HERO_WIDTH = 32;
export const HERO_HEIGHT = 48;

export const COIN_SHEET = "coin_spin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";
export const SLIME_SHEET = "slime";
export const SLIME_FILE = "assets/spritesheets/slime.png";
export const BAT_SHEET = "bat";
export const BAT_FILE = "assets/spritesheets/bat.png";
export const GHOST_SHEET = "ghost";
export const GHOST_FILE = "assets/spritesheets/ghost.png";
export const SMALL_SIZE = 32;             // coin, slime, bat and ghost frames are 32 x 32

export const EXPLOSION_SHEET = "explosion";
export const EXPLOSION_FILE = "assets/spritesheets/explosion.png";
export const EXPLOSION_SIZE = 64;

// animations - made once, in PreloadScene, and usable by every sprite in every scene
export const HERO_IDLE = "hero-idle";
export const HERO_RUN = "hero-run";
export const HERO_JUMP = "hero-jump";
export const HERO_FALL = "hero-fall";
export const HERO_HURT = "hero-hurt";
export const COIN_SPIN = "coin-spin";
export const SLIME_SQUASH = "slime-squash";
export const BAT_FLAP = "bat-flap";
export const GHOST_BOB = "ghost-bob";
export const EXPLODE = "explode";
