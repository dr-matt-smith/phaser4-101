import Phaser from "phaser";
import {
  CLOUD_FILE,
  CLOUD_KEY,
  COIN_FILE, // CHALLENGE 2
  COIN_SHEET, // CHALLENGE 2
  COIN_SIZE, // CHALLENGE 2
  COIN_SPIN, // CHALLENGE 2
  GROUND_FILE,
  GROUND_KEY,
  HERO_FALL,
  HERO_FILE,
  HERO_HEIGHT,
  HERO_HURT,
  HERO_IDLE,
  HERO_JUMP,
  HERO_RUN,
  HERO_SHEET,
  HERO_WIDTH,
  SKY_FILE,
  SKY_KEY,
} from "../assets.ts";
import { GAME_SCENE, PRELOAD_SCENE } from "./keys.ts";

// PreloadScene - loads the pictures, makes the hero's animations, and starts the game
//
// Animations belong to the whole GAME (this.anims is the game's animation manager, shared by
// every scene), so they are made here, once - not in GameScene, which may start many times.

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    this.load.image(SKY_KEY, SKY_FILE);
    this.load.image(GROUND_KEY, GROUND_FILE);
    this.load.image(CLOUD_KEY, CLOUD_FILE);
    this.load.spritesheet(HERO_SHEET, HERO_FILE, { frameWidth: HERO_WIDTH, frameHeight: HERO_HEIGHT });
    this.load.spritesheet(COIN_SHEET, COIN_FILE, { frameWidth: COIN_SIZE, frameHeight: COIN_SIZE }); // CHALLENGE 2
  }

  create(): void {
    this.anims.create({
      key: HERO_IDLE,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: HERO_RUN,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { start: 2, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: HERO_JUMP,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { frames: [8] }),
    });
    this.anims.create({
      key: HERO_FALL,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { frames: [9] }),
    });
    // hurt plays once (no repeat), so it COMPLETES - and the hero listens for that
    this.anims.create({
      key: HERO_HURT,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { frames: [10, 9, 10, 9, 10] }),
      frameRate: 8,
    });

    // CHALLENGE 2: the coins spin for ever
    this.anims.create({
      key: COIN_SPIN,
      frames: this.anims.generateFrameNumbers(COIN_SHEET, { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.start(GAME_SCENE);
  }
}
