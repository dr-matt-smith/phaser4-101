// assets.ts - the key and file of every picture and sound the sound board uses

// the sounds on the pads, in order: pad 1 plays the first, pad 2 the second, ...
export interface PadSound {
  key: string;
  file: string;
}

export const PAD_SOUNDS: PadSound[] = [
  { key: "pop", file: "assets/audio/pop.wav" },
  { key: "coin", file: "assets/audio/coin.wav" },
  { key: "jump", file: "assets/audio/jump.wav" },
  { key: "shoot", file: "assets/audio/shoot.wav" },
  { key: "explosion", file: "assets/audio/explosion.wav" },
  { key: "powerup", file: "assets/audio/powerup.wav" },
  { key: "hurt", file: "assets/audio/hurt.wav" },
  { key: "win", file: "assets/audio/win.wav" },
];

// CHALLENGE 6: a playlist instead of one track - played in this order, then round again.
// (PadSound is just "a key and a file", so it does for music too.)
export const MUSIC_TRACKS: PadSound[] = [
  { key: "music_menu", file: "assets/audio/music_menu.wav" },
  { key: "music_game", file: "assets/audio/music_game.wav" },
  { key: "music_action", file: "assets/audio/music_action.wav" },
];

// the pad's two pictures: normal, and with the pointer over it (tinted yellow while playing)
export const BUTTON_KEY = "button";
export const BUTTON_FILE = "assets/images/button.png";
export const BUTTON_OVER_KEY = "button_over";
export const BUTTON_OVER_FILE = "assets/images/button_over.png";
