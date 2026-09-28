// assets.ts - the key of every picture and sound the game uses
//
// The ball is a picture from the asset library. The paddle and the bricks are drawn by the game
// itself when it starts (see BreakoutScene.makeTextures), so they have keys but no files.

export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball_small.png";
export const PADDLE_KEY = "paddle";
export const BRICK_KEY = "brick";

export const PADDLE_SOUND = "pop";
export const PADDLE_SOUND_FILE = "assets/audio/pop.wav";
export const BRICK_SOUND = "hit";
export const BRICK_SOUND_FILE = "assets/audio/hit.wav";
export const LOSE_SOUND = "lose";
export const LOSE_SOUND_FILE = "assets/audio/lose.wav";
export const WIN_SOUND = "win";
export const WIN_SOUND_FILE = "assets/audio/win.wav";
