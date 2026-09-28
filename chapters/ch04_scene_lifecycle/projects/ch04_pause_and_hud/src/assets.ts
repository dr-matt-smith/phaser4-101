// assets.ts - the key and file of every picture and sound, in one place
//
// MenuScene loads them all; every other scene uses them by key.

export const PLAYER_KEY = "player";
export const PLAYER_FILE = "assets/images/player.png";

export const ENEMY_KEY = "enemy";
export const ENEMY_FILE = "assets/images/enemy.png";

export const HEART_KEY = "heart";
export const HEART_FILE = "assets/images/heart.png";

export const PANEL_KEY = "panel";
export const PANEL_FILE = "assets/images/panel.png";

// a sprite sheet: six 32 x 32 frames of a coin turning round
export const COIN_KEY = "coin";
export const COIN_FILE = "assets/spritesheets/coin_spin.png";
export const COIN_SPIN_ANIM = "coin-spin";

export const COIN_SOUND_KEY = "coinSound";
export const COIN_SOUND_FILE = "assets/audio/coin.wav";

export const HURT_SOUND_KEY = "hurtSound";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
