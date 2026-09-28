import Phaser from "phaser";
import {
  BUTTON_FILE,
  BUTTON_KEY,
  BUTTON_OVER_FILE,
  BUTTON_OVER_KEY,
  MUSIC_FILE,
  MUSIC_KEY,
  PAD_SOUNDS,
} from "../assets.ts";
import type { GameSound } from "../GameSound.ts";
import { SoundPad } from "../objects/SoundPad.ts";

// SoundBoardScene - eight pads that play sound effects, keys that change how they sound, and a
// music track to play, pause, stop, loop and skip through
//
// The settings (volume, rate, detune, ...) are fields of the scene. Every time a pad is played,
// they are turned into a SoundConfig object - so the same sound can be played a different way
// every time. The music is ONE sound object, kept in a field, and changed while it plays.

// the settings, and how far each key press moves them
const VOLUME_STEP = 0.1;
const RATE_STEP = 0.1;
const MIN_RATE = 0.5;              // half speed (and an octave lower)
const MAX_RATE = 2;                // double speed (and an octave higher)
const DETUNE_STEP = 100;           // cents: 100 cents is one semitone
const MAX_DETUNE = 1200;           // 1200 cents is an octave

const RANDOM_DETUNE = 200;         // "random pitch" moves each sound up to 2 semitones up or down
const MAX_PAN = 0.8;               // pads at the far left/right play almost fully left/right
const ECHO_DELAY = 0.25;           // seconds (SoundConfig delays are in seconds, not milliseconds)
const ECHO_VOLUME = 0.4;           // the echo is 40% as loud as the sound
const MUSIC_VOLUME = 0.5;          // the music, at half the effects' volume
const MUSIC_SKIP = 2;              // seconds skipped forward by J

// where things go
const PAD_COLUMNS = 4;
const PAD_LEFT = 115;
const PAD_TOP = 130;
const PAD_SPACING_X = 190;
const PAD_SPACING_Y = 70;
const BAR_X = 100;
const BAR_Y = 470;
const BAR_WIDTH = 600;
const BAR_HEIGHT = 16;

// the number keys, by name, as Phaser's keyboard events call them ("keydown-ONE", ...)
const NUMBER_KEYS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

export class SoundBoardScene extends Phaser.Scene {
  // the settings every pad is played with
  private volume = 1;
  private rate = 1;
  private detune = 0;
  private randomPitch = false;
  private panByPosition = false;
  private echo = false;

  // Fields set in create() are declared with "!": it tells TypeScript "this will have a value
  // before it is used", because the compiler cannot see that create() always runs first.
  private pads: SoundPad[] = [];
  private music!: GameSound;
  private settingsText!: Phaser.GameObjects.Text;
  private playingText!: Phaser.GameObjects.Text;
  private musicText!: Phaser.GameObjects.Text;
  private musicBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super("SoundBoardScene");
  }

  preload(): void {
    for (const pad of PAD_SOUNDS) {
      this.load.audio(pad.key, pad.file);
    }
    this.load.audio(MUSIC_KEY, MUSIC_FILE);
    this.load.image(BUTTON_KEY, BUTTON_FILE);
    this.load.image(BUTTON_OVER_KEY, BUTTON_OVER_FILE);
  }

  create(): void {
    this.add.text(400, 40, "Sound Board", {
      fontFamily: "Arial",
      fontSize: "40px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.makePads();

    this.settingsText = this.add.text(60, 240, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      lineSpacing: 6,
    });

    this.playingText = this.add.text(60, 330, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#a8dadc",
    });

    // The music is made ONCE, with add(), and kept: it is the same sound object every time it is
    // played, paused or changed. Adding it does not start it.
    this.music = this.sound.add(MUSIC_KEY, { loop: true, volume: MUSIC_VOLUME });

    this.add.text(60, 410, "Music", {
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#a8dadc",
    });
    this.musicText = this.add.text(160, 413, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
    });
    this.musicBar = this.add.graphics();

    this.add.text(400, 540, "1-8 or click: play    UP/DOWN volume    LEFT/RIGHT rate    W/S detune\n" +
      "R random pitch    P pan    E echo    Z reset    M play/pause music    N stop    L loop    J skip", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#9aa4bd",
      align: "center",
      lineSpacing: 6,
    }).setOrigin(0.5);

    this.addKeys();
    this.showSettings();
  }

  // Every frame: show how many sounds are playing, and where the music has got to.
  override update(): void {
    this.playingText.setText(`Sounds playing right now: ${this.sound.getAllPlaying().length}`);

    let state = "stopped";
    if (this.music.isPlaying) {
      state = "playing";
    } else if (this.music.isPaused) {
      state = "paused";
    }
    // seek is how far through the sound it is, in seconds; duration is its length
    const loop = this.music.loop ? "on" : "off";
    this.musicText.setText(
      `${state}   ${this.music.seek.toFixed(1)} / ${this.music.duration.toFixed(1)} s   loop ${loop}`,
    );

    const fraction = this.music.duration > 0 ? this.music.seek / this.music.duration : 0;
    this.musicBar.clear();
    this.musicBar.fillStyle(0x3a4258);
    this.musicBar.fillRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);
    this.musicBar.fillStyle(0x2a9d8f);
    this.musicBar.fillRect(BAR_X, BAR_Y, BAR_WIDTH * fraction, BAR_HEIGHT);
  }

  // Lays the pads out in rows of PAD_COLUMNS, and makes each one clickable.
  private makePads(): void {
    PAD_SOUNDS.forEach((padSound, index) => {
      const column = index % PAD_COLUMNS;
      const row = Math.floor(index / PAD_COLUMNS);
      const pad = new SoundPad(this, PAD_LEFT + column * PAD_SPACING_X, PAD_TOP + row * PAD_SPACING_Y,
        padSound.key, index + 1);
      pad.on("pointerdown", () => {
        this.playPad(pad);
      });
      this.pads.push(pad);
    });
  }

  // Turns the scene's settings into a SoundConfig - a plain object literal - and plays the pad
  // with it. Anything left out of a SoundConfig keeps its default (volume 1, rate 1, ...).
  private playPad(pad: SoundPad): void {
    let detune = this.detune;
    if (this.randomPitch) {
      detune = detune + Phaser.Math.Between(-RANDOM_DETUNE, RANDOM_DETUNE);
    }

    const config: Phaser.Types.Sound.SoundConfig = {
      volume: this.volume,
      rate: this.rate,
      detune: detune,
      pan: this.panByPosition ? this.panFor(pad.x) : 0,
    };
    pad.play(config);

    // the echo: the same sound again, quieter and a little later. this.sound.play() is
    // "fire and forget" - Phaser makes the sound, plays it, and throws it away when it ends
    if (this.echo) {
      this.sound.play(pad.soundKey, { ...config, volume: this.volume * ECHO_VOLUME, delay: ECHO_DELAY });
    }
  }

  // -1 is fully left, 0 the middle, 1 fully right: a pad's pan follows its x position.
  private panFor(x: number): number {
    const centreX = this.scale.width / 2;
    return (x - centreX) / centreX * MAX_PAN;
  }

  private addKeys(): void {
    const keyboard = this.input.keyboard!;

    // 1-8 play the pads
    this.pads.forEach((pad, index) => {
      keyboard.on(`keydown-${NUMBER_KEYS[index]}`, () => {
        this.playPad(pad);
      });
    });

    keyboard.on("keydown-UP", () => this.changeVolume(VOLUME_STEP));
    keyboard.on("keydown-DOWN", () => this.changeVolume(-VOLUME_STEP));
    keyboard.on("keydown-RIGHT", () => this.changeRate(RATE_STEP));
    keyboard.on("keydown-LEFT", () => this.changeRate(-RATE_STEP));
    keyboard.on("keydown-W", () => this.changeDetune(DETUNE_STEP));
    keyboard.on("keydown-S", () => this.changeDetune(-DETUNE_STEP));

    keyboard.on("keydown-R", () => {
      this.randomPitch = !this.randomPitch;
      this.showSettings();
    });
    keyboard.on("keydown-P", () => {
      this.panByPosition = !this.panByPosition;
      this.showSettings();
    });
    keyboard.on("keydown-E", () => {
      this.echo = !this.echo;
      this.showSettings();
    });
    keyboard.on("keydown-Z", () => this.resetSettings());

    keyboard.on("keydown-M", () => this.playOrPauseMusic());
    keyboard.on("keydown-N", () => {
      this.music.stop();
    });
    keyboard.on("keydown-L", () => {
      this.music.setLoop(!this.music.loop);
    });
    keyboard.on("keydown-J", () => this.skipMusic());
  }

  // Volume, rate and detune apply to the next effect played - and to the music straight away.
  // Phaser.Math.Clamp keeps a value between a minimum and a maximum.
  private changeVolume(step: number): void {
    this.volume = Phaser.Math.Clamp(this.volume + step, 0, 1);
    this.music.setVolume(this.volume * MUSIC_VOLUME);
    this.showSettings();
  }

  private changeRate(step: number): void {
    this.rate = Phaser.Math.Clamp(this.rate + step, MIN_RATE, MAX_RATE);
    this.music.setRate(this.rate);
    this.showSettings();
  }

  private changeDetune(step: number): void {
    this.detune = Phaser.Math.Clamp(this.detune + step, -MAX_DETUNE, MAX_DETUNE);
    this.music.setDetune(this.detune);
    this.showSettings();
  }

  private resetSettings(): void {
    this.volume = 1;
    this.rate = 1;
    this.detune = 0;
    this.randomPitch = false;
    this.panByPosition = false;
    this.echo = false;
    // the set... methods return the sound itself, so calls can be chained
    this.music.setVolume(MUSIC_VOLUME).setRate(1).setDetune(0);
    this.showSettings();
  }

  // One key, three jobs: pause if it is playing, carry on if it is paused, start if it is stopped.
  private playOrPauseMusic(): void {
    if (this.music.isPlaying) {
      this.music.pause();
    } else if (this.music.isPaused) {
      this.music.resume();
    } else {
      this.music.play();
    }
  }

  // Jumps the music forward. Seeking only works while it is playing.
  private skipMusic(): void {
    if (this.music.isPlaying) {
      const seek = (this.music.seek + MUSIC_SKIP) % this.music.duration;
      this.music.setSeek(seek);
    }
  }

  private showSettings(): void {
    const onOff = (value: boolean): string => value ? "ON" : "off";
    this.settingsText.setText([
      `Volume ${this.volume.toFixed(1)}      Rate ${this.rate.toFixed(1)}      Detune ${this.detune} cents`,
      `Random pitch ${onOff(this.randomPitch)}      Pan by position ${onOff(this.panByPosition)}      ` +
      `Echo ${onOff(this.echo)}`,
    ]);
  }
}
