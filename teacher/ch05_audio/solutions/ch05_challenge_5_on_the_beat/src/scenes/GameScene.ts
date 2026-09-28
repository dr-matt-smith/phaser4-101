import Phaser from "phaser";
import { COIN_KEY, MUSIC_GAME_KEY, POWERUP_KEY, STAR_KEY } from "../assets.ts";
import { Music } from "../Music.ts";
import { MusicMonitor } from "../objects/MusicMonitor.ts";
import { MuteButton } from "../objects/MuteButton.ts";
import { GAME_SCENE, MENU_SCENE } from "./keys.ts";

// GameScene - a tiny game, so there is something to do while the game music plays: click the
// stars. Every star plays a coin sound - never quite the same one twice - from the side of the
// screen it was on. Every tenth star plays a power-up sound.

const STAR_COUNT = 3;
const BONUS_EVERY = 10;
const RANDOM_DETUNE = 300;         // cents: each coin sound up to 3 semitones higher or lower
const MAX_PAN = 0.8;               // a star at the far left sounds almost fully left
const MARGIN = 60;                 // keep stars this far from the edges (and off the mute button)
// CHALLENGE 5: the beat. 128 beats in 60,000 milliseconds: one every 468.75 ms
const BEATS_PER_MINUTE = 128;
const BEAT_LENGTH = 60000 / BEATS_PER_MINUTE;
const PULSE_SCALE = 1.4;           // how big the circle grows on a beat
const PULSE_TIME = 90;             // milliseconds to grow (and the same again to shrink back)

export class GameScene extends Phaser.Scene {
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  // CHALLENGE 5: the circle that pulses, and the beat it last pulsed on
  private beatCircle!: Phaser.GameObjects.Arc;
  private lastBeat = -1;
  private pulses = 0;              // how many times it has pulsed (handy for testing)

  constructor() {
    super(GAME_SCENE);
  }

  // the scene object is reused every time the game starts: reset the score (see Chapter 2)
  init(): void {
    this.score = 0;
    // CHALLENGE 5: the scene is reused - start each visit without a "last beat"
    this.lastBeat = -1;
    this.pulses = 0;
  }

  create(): void {
    // the menu music fades out, and the game music fades in
    Music.play(this, MUSIC_GAME_KEY);

    this.scoreText = this.add.text(20, 20, "", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    });
    this.showScore();

    this.add.text(400, 540, "Click the stars    ESC: back to the menu    M: sound on / off", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    // CHALLENGE 5: a circle in the top middle, drawn behind the stars
    this.beatCircle = this.add.circle(400, 45, 18, 0xe63946);

    for (let i = 0; i < STAR_COUNT; i++) {
      this.makeStar();
    }

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(MENU_SCENE);
    });

    new MuteButton(this, 760, 40);
    new MusicMonitor(this);
  }

  // CHALLENGE 5: every frame, work out which beat the music is on from how far through it is.
  // A timer would drift, and would know nothing about pauses; the music's own position cannot
  // be out of step with the music.
  override update(): void {
    const music: Phaser.Sound.BaseSound | null = this.sound.get(MUSIC_GAME_KEY);
    if (music === null || !music.isPlaying) {
      return;
    }

    // BaseSound's type has no seek, although every sound has one - as in MusicMonitor
    const seek = (music as Phaser.Sound.WebAudioSound).seek;       // seconds
    const beat = Math.floor(seek * 1000 / BEAT_LENGTH);

    // a new beat (including going from the last beat back to beat 0 when the music loops)
    if (beat !== this.lastBeat) {
      this.lastBeat = beat;
      this.pulse();
    }
  }

  // CHALLENGE 5: grow, then shrink back (yoyo), quickly
  private pulse(): void {
    this.pulses = this.pulses + 1;
    this.beatCircle.setScale(1);
    this.tweens.add({
      targets: this.beatCircle,
      scale: PULSE_SCALE,
      duration: PULSE_TIME,
      yoyo: true,
    });
  }

  private makeStar(): void {
    const star = this.add.image(0, 0, STAR_KEY).setScale(1.5);
    this.moveStar(star);
    star.setInteractive({ useHandCursor: true });
    star.on("pointerdown", () => {
      this.collect(star);
    });
  }

  private moveStar(star: Phaser.GameObjects.Image): void {
    star.x = Phaser.Math.Between(MARGIN, this.scale.width - MARGIN);
    star.y = Phaser.Math.Between(MARGIN + 40, this.scale.height - MARGIN - 40);
  }

  private collect(star: Phaser.GameObjects.Image): void {
    this.score = this.score + 1;
    this.showScore();

    // The same sound over and over again soon sounds mechanical. A small random change of pitch
    // makes each one a little different. And pan puts the sound where the star was:
    // -1 is fully left, 1 fully right.
    const centreX = this.scale.width / 2;
    this.sound.play(COIN_KEY, {
      detune: Phaser.Math.Between(-RANDOM_DETUNE, RANDOM_DETUNE),
      pan: (star.x - centreX) / centreX * MAX_PAN,
    });

    if (this.score % BONUS_EVERY === 0) {
      this.sound.play(POWERUP_KEY);
    }

    this.moveStar(star);
  }

  private showScore(): void {
    this.scoreText.setText(`Stars: ${this.score}`);
  }
}
