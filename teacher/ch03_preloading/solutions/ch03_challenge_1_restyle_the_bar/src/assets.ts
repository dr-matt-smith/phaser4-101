// assets.ts - the key of every file the game loads
//
// A KEY is the name a loaded file is kept under. The loader is told "load this file, and call it
// this"; after that, the rest of the game only ever uses the name. Keeping the keys here means a
// typo is a build error, not a missing picture.

// loaded by BootScene - the loading screen needs it
export const LOGO_KEY = "logo";
export const LOGO_FILE = "assets/images/logo.png";

// loaded by PreloadScene - everything else
export const SKY_KEY = "sky";
export const SPACE_KEY = "space";
export const TABLE_KEY = "table";
export const ARENA_KEY = "arena";
export const STAR_KEY = "star";
export const COIN_KEY = "coin";
export const GEM_KEY = "gem";
export const HEART_KEY = "heart";
export const PLAYER_KEY = "player";
export const ENEMY_KEY = "enemy";
export const CRATE_KEY = "crate";
export const ROCK_KEY = "rock";

export const HERO_KEY = "hero";
export const COIN_SPIN_KEY = "coin_spin";
export const EXPLOSION_KEY = "explosion";

export const COIN_SOUND_KEY = "coin_sound";
export const CLICK_SOUND_KEY = "click_sound";
export const MENU_MUSIC_KEY = "music_menu";
export const GAME_MUSIC_KEY = "music_game";
export const ACTION_MUSIC_KEY = "music_action";
