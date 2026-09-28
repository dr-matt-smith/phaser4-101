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
// CHALLENGE 4: how far the music ducks under the power-up sound, and how fast
const DUCK_LEVEL = 0.2;            // a fifth of its usual volume
const DUCK_TIME = 150;             // milliseconds to duck down, and to come back up

export class GameScene extends Phaser.Scene {
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super(GAME_SCENE);
  }

  // the scene object is reused every time the game starts: reset the score (see Chapter 2)
  init(): void {
    this.score = 0;
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

    for (let i = 0; i < STAR_COUNT; i++) {
      this.makeStar();
    }

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(MENU_SCENE);
    });

    new MuteButton(this, 760, 40);
    new MusicMonitor(this);
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
      this.playPowerup();
    }

    this.moveStar(star);
  }

  // CHALLENGE 4: the power-up, with the music ducked underneath it. this.sound.play() would not
  // tell us when the sound ends, so add() it and listen for "complete".
  private playPowerup(): void {
    const powerup = this.sound.add(POWERUP_KEY);
    powerup.once(Phaser.Sound.Events.COMPLETE, () => {
      powerup.destroy();
      // The sound belongs to the game, so it can finish after the player has pressed ESC and
      // this scene has shut down. Only bring the music back up if the game is still running -
      // otherwise the menu is already fading this music out, with its own tweens.
      if (this.scene.isActive()) {
        Music.fadeTo(this, MUSIC_GAME_KEY, 1, DUCK_TIME);
      }
    });

    Music.fadeTo(this, MUSIC_GAME_KEY, DUCK_LEVEL, DUCK_TIME);
    powerup.play();
  }

  private showScore(): void {
    this.scoreText.setText(`Stars: ${this.score}`);
  }
}
