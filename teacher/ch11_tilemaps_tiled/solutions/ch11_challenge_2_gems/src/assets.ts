// assets.ts - the key and file of everything the game loads
//
// The map and its tileset come first: they are what this chapter is about.

// the level, exported from Tiled as JSON (the Tiled source is tiled/level1.tmx)
export const MAP_KEY = "level1";
export const MAP_FILE = "assets/maps/level1.tmj";

// the tileset's picture. TILESET_NAME is the name the tileset has INSIDE the map - the name shown in
// Tiled's Tilesets panel. Phaser needs both: the name to find the tileset in the map, and the key to
// find the picture it loaded.
export const TILES_KEY = "platform_tiles";
export const TILES_FILE = "assets/tilesets/platform_tiles.png";
export const TILESET_NAME = "platform_tiles";

// the names of the layers, exactly as they are spelled in Tiled's Layers panel
export const BACKGROUND_LAYER = "Background";
export const GROUND_LAYER = "Ground";
export const OBJECTS_LAYER = "Objects";

export const SKY_KEY = "sky";
export const SKY_FILE = "assets/images/sky.png";

export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";

export const COIN_KEY = "coin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";

// CHALLENGE 2 - a coin worth more than 1 is shown as a gem
export const GEM_KEY = "gem";
export const GEM_FILE = "assets/images/gem.png";

export const SLIME_KEY = "slime";
export const SLIME_FILE = "assets/spritesheets/slime.png";

export const COIN_SOUND = "coin_sound";
export const COIN_SOUND_FILE = "assets/audio/coin.wav";
export const JUMP_SOUND = "jump_sound";
export const JUMP_SOUND_FILE = "assets/audio/jump.wav";
export const HURT_SOUND = "hurt_sound";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
export const WIN_SOUND = "win_sound";
export const WIN_SOUND_FILE = "assets/audio/win.wav";
