// assets.ts - the key and file of everything the game loads, one of each kind
//
// Keys only have to be different from other keys of the SAME kind: a picture called "pop" and a
// sound called "pop" could live side by side. Different names are still kinder to the reader.

// pictures
export const CRATE_KEY = "crate";
export const CRATE_FILE = "assets/images/crate.png";
export const BUTTON_KEY = "button";
export const BUTTON_FILE = "assets/images/button.png";
export const GEM_KEY = "gem";
export const GEM_FILE = "assets/images/gem.png";
export const PLAYER_KEY = "player";
export const PLAYER_FILE = "assets/images/player.png";

// this file does not exist - on purpose, to show what happens when a file fails to load
export const MISSING_KEY = "missing";
export const MISSING_FILE = "assets/images/missing.png";

// sprite sheets
export const HERO_KEY = "hero";
export const HERO_FILE = "assets/spritesheets/hero.png";
export const COIN_SPIN_KEY = "coin_spin";
export const COIN_SPIN_FILE = "assets/spritesheets/coin_spin.png";

// sounds
export const POP_KEY = "pop";
export const POP_FILE = "assets/audio/pop.wav";
export const WIN_KEY = "win";
export const WIN_FILE = "assets/audio/win.wav";

// data
export const LEVEL_KEY = "level";
export const LEVEL_FILE = "assets/data/level.json";
export const NOTES_KEY = "notes";
export const NOTES_FILE = "assets/data/notes.txt";

// the asset pack, and the keys of the files it lists (they must match the keys in pack.json)
export const PACK_KEY = "pack";
export const PACK_FILE = "assets/pack.json";
export const PACK_SECTION = "pickups";
export const HEART_KEY = "heart";
export const COIN_KEY = "coin";
export const STAR_KEY = "star";
export const ITEMS_KEY = "items";
