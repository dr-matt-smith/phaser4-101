import Phaser from "phaser";
import {
  CLOUD_FILE,
  CLOUD_KEY,
  EXPLODE, // CHALLENGE 6
  EXPLOSION_FILE, // CHALLENGE 6
  EXPLOSION_SHEET, // CHALLENGE 6
  EXPLOSION_SIZE, // CHALLENGE 6
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
  PARTICLE_FILE, // CHALLENGE 6
  PARTICLE_KEY, // CHALLENGE 6
  SKY_FILE,
  SKY_KEY,
  SLIME_FILE, // CHALLENGE 6
  SLIME_SHEET, // CHALLENGE 6
  SLIME_SIZE, // CHALLENGE 6
  SLIME_WALK, // CHALLENGE 6
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
    // CHALLENGE 6
    this.load.spritesheet(SLIME_SHEET, SLIME_FILE, { frameWidth: SLIME_SIZE, frameHeight: SLIME_SIZE });
    this.load.spritesheet(EXPLOSION_SHEET, EXPLOSION_FILE, { frameWidth: EXPLOSION_SIZE, frameHeight: EXPLOSION_SIZE });
    this.load.image(PARTICLE_KEY, PARTICLE_FILE);
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

    // CHALLENGE 6: the slime squashes and stretches as it goes; the explosion plays once
    this.anims.create({
      key: SLIME_WALK,
      frames: this.anims.generateFrameNumbers(SLIME_SHEET, { start: 0, end: 3 }),
      frameRate: 8,
      yoyo: true,
      repeat: -1,
    });
    this.anims.create({
      key: EXPLODE,
      frames: this.anims.generateFrameNumbers(EXPLOSION_SHEET, { start: 0, end: 7 }),
      frameRate: 20,
    });

    this.scene.start(GAME_SCENE);
  }
}
