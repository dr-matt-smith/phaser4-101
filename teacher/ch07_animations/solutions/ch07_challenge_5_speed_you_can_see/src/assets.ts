// assets.ts - the key and file of every picture, and the key of every animation
//
// A sprite sheet is loaded under one key; each animation made from it has a key of its own.

export const SKY_KEY = "sky";
export const SKY_FILE = "assets/images/sky.png";
export const GROUND_KEY = "ground";
export const GROUND_FILE = "assets/images/ground.png";
export const CLOUD_KEY = "cloud";
export const CLOUD_FILE = "assets/images/cloud.png";

// hero.png: 32 x 48 frames - 0-1 idle, 2-7 run, 8 jump, 9 fall, 10 hurt (facing right)
export const HERO_SHEET = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";
export const HERO_WIDTH = 32;
export const HERO_HEIGHT = 48;

// animations - made once, in PreloadScene
export const HERO_IDLE = "hero-idle";
export const HERO_RUN = "hero-run";
export const HERO_JUMP = "hero-jump";
export const HERO_FALL = "hero-fall";
export const HERO_HURT = "hero-hurt";
