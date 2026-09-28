import Phaser from "phaser";
import {
  BALL_FILE,
  BALL_KEY,
  BUTTON_DOWN_FILE,
  BUTTON_DOWN_KEY,
  BUTTON_FILE,
  BUTTON_KEY,
  BUTTON_OVER_FILE,
  BUTTON_OVER_KEY,
  CRATE_FILE,
  CRATE_KEY,
  EXPLODE,
  EXPLOSION_FILE,
  EXPLOSION_SHEET,
  EXPLOSION_SIZE,
  PARTICLE_FILE,
  PARTICLE_KEY,
  STAR_FILE,
  STAR_KEY,
} from "../assets.ts";
import { PLAYGROUND_SCENE, PRELOAD_SCENE } from "./keys.ts";

// PreloadScene - loads every picture, makes the explosion animation (once, for the whole game),
// and starts the playground

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    this.load.image(CRATE_KEY, CRATE_FILE);
    this.load.image(STAR_KEY, STAR_FILE);
    this.load.image(BALL_KEY, BALL_FILE);
    this.load.image(PARTICLE_KEY, PARTICLE_FILE);
    this.load.image(BUTTON_KEY, BUTTON_FILE);
    this.load.image(BUTTON_OVER_KEY, BUTTON_OVER_FILE);
    this.load.image(BUTTON_DOWN_KEY, BUTTON_DOWN_FILE);
    this.load.spritesheet(EXPLOSION_SHEET, EXPLOSION_FILE, { frameWidth: EXPLOSION_SIZE, frameHeight: EXPLOSION_SIZE });
  }

  create(): void {
    // plays once (no repeat), so every explosion sprite hears ANIMATION_COMPLETE - and removes itself
    this.anims.create({
      key: EXPLODE,
      frames: this.anims.generateFrameNumbers(EXPLOSION_SHEET, { start: 0, end: 7 }),
      frameRate: 20,
    });

    this.scene.start(PLAYGROUND_SCENE);
  }
}
