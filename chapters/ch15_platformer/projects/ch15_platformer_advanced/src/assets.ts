// assets.ts - the key and file of every picture, sprite sheet and sound the game uses
//
// PreloadScene loads them all, once, for the whole game. The maps are listed in
// config/levels.ts, with the rest of what makes each level different.

export const SKY_KEY = "sky";
export const SKY_FILE = "assets/images/sky.png";
export const CLOUD_KEY = "cloud";
export const CLOUD_FILE = "assets/images/cloud.png";
export const PLATFORM_KEY = "platform";
export const PLATFORM_FILE = "assets/images/platform.png";
export const HEART_KEY = "heart";
export const HEART_FILE = "assets/images/heart.png";
export const BUTTON_KEY = "button";
export const BUTTON_FILE = "assets/images/button.png";
export const BUTTON_OVER_KEY = "buttonOver";
export const BUTTON_OVER_FILE = "assets/images/button_over.png";
export const PANEL_KEY = "panel";
export const PANEL_FILE = "assets/images/panel.png";

// sprite sheets: one picture cut into equal frames (see assets/README.md for the layouts)
export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";
export const HERO_FRAME = { frameWidth: 32, frameHeight: 48 };
export const SLIME_KEY = "slime";
export const SLIME_FILE = "assets/spritesheets/slime.png";
export const BAT_KEY = "bat";
export const BAT_FILE = "assets/spritesheets/bat.png";
export const COIN_KEY = "coin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";
export const SMALL_FRAME = { frameWidth: 32, frameHeight: 32 };

// the tileset, loaded as a sprite sheet so single tiles can be used as sprites too
export const TILES_KEY = "tiles";
export const TILES_FILE = "assets/tilesets/platform_tiles.png";
export const TILESET_NAME = "platform_tiles"; // its name inside the maps
export const FLAG_FRAME = 13;
export const SIGN_FRAME = 15;

export const JUMP_SOUND = "jump";
export const JUMP_SOUND_FILE = "assets/audio/jump.wav";
export const COIN_SOUND = "coinSound";
export const COIN_SOUND_FILE = "assets/audio/coin.wav";
export const STOMP_SOUND = "stomp";
export const STOMP_SOUND_FILE = "assets/audio/hit.wav";
export const HURT_SOUND = "hurt";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
export const CHECKPOINT_SOUND = "checkpoint";
export const CHECKPOINT_SOUND_FILE = "assets/audio/powerup.wav";
export const WIN_SOUND = "win";
export const WIN_SOUND_FILE = "assets/audio/win.wav";
export const LOSE_SOUND = "lose";
export const LOSE_SOUND_FILE = "assets/audio/lose.wav";
export const CLICK_SOUND = "click";
export const CLICK_SOUND_FILE = "assets/audio/click.wav";
export const MUSIC = "music";
export const MUSIC_FILE = "assets/audio/music_game.wav";

// the names values are kept under in the game's registry - the HUD shows them
export const LIVES = "lives";
export const COINS = "coins";
export const TOTAL_COINS = "totalCoins";
export const LEVEL_NAME = "levelName";
