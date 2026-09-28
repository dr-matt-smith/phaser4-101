// assets.ts - the key and file of every picture, sprite sheet, map and sound the game uses
//
// TitleScene loads them all, once, for the whole game.

export const SKY_KEY = "sky";
export const SKY_FILE = "assets/images/sky.png";
export const CLOUD_KEY = "cloud";
export const CLOUD_FILE = "assets/images/cloud.png";

// sprite sheets: one picture cut into equal frames (see assets/README.md for the layouts)
export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";
export const HERO_FRAME = { frameWidth: 32, frameHeight: 48 };
export const SLIME_KEY = "slime";
export const SLIME_FILE = "assets/spritesheets/slime.png";
export const COIN_KEY = "coin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";
export const SMALL_FRAME = { frameWidth: 32, frameHeight: 32 };

// the tileset is loaded as a sprite sheet: the tilemap uses the whole picture, and the flag is
// a sprite showing one frame of it
export const TILES_KEY = "tiles";
export const TILES_FILE = "assets/tilesets/platform_tiles.png";
export const FLAG_FRAME = 13;

// the level, made in Tiled (see tiled/level.tmj) - and the name of the tileset INSIDE the map
export const MAP_KEY = "level";
export const MAP_FILE = "assets/maps/level.tmj";
export const TILESET_NAME = "platform_tiles";

export const JUMP_SOUND = "jump";
export const JUMP_SOUND_FILE = "assets/audio/jump.wav";
export const COIN_SOUND = "coinSound";
export const COIN_SOUND_FILE = "assets/audio/coin.wav";
export const STOMP_SOUND = "stomp";
export const STOMP_SOUND_FILE = "assets/audio/hit.wav";
export const HURT_SOUND = "hurt";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
export const WIN_SOUND = "win";
export const WIN_SOUND_FILE = "assets/audio/win.wav";
