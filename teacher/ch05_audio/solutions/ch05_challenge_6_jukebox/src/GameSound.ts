// GameSound.ts - the type of a sound made with this.sound.add(...)
//
// When the game starts, Phaser picks ONE of three sound managers: Web Audio (nearly every
// browser), HTML5 Audio (very old browsers), or "no audio" (no sound hardware, or turned off in
// the config). Each makes its own kind of sound object, so a sound's type is "one of these three" -
// a union type. They all have the same methods (play, stop, setVolume, ...), so code written
// for a GameSound works whichever one Phaser picked.

import Phaser from "phaser";

export type GameSound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound;
