// assets.ts - the key and file of every sound the game uses
//
// The ball's picture is in Ball.ts, beside the class that uses it. The sounds are used by more than
// one scene, so they live here.

export const POP_KEY = "pop";
export const POP_FILE = "assets/audio/pop.wav";
export const CLICK_KEY = "click";
export const CLICK_FILE = "assets/audio/click.wav";
export const WIN_KEY = "win";
export const WIN_FILE = "assets/audio/win.wav";

// CHALLENGE 6: the name the best FIVE times are kept under in the game's REGISTRY (see WinScene)
// - an array of numbers, smallest (best) first
export const BEST_TIMES = "bestTimes";
export const TABLE_SIZE = 5;
