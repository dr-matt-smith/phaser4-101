import Phaser from "phaser";
import {
  BAT_FILE,
  BAT_FLAP,
  BAT_SHEET,
  COIN_FILE,
  COIN_SHEET,
  COIN_SPIN,
  EXPLODE,
  EXPLOSION_FILE,
  EXPLOSION_SHEET,
  EXPLOSION_SIZE,
  GHOST_BOB,
  GHOST_FILE,
  GHOST_SHEET,
  HERO_FALL,
  HERO_FILE,
  HERO_HEIGHT,
  HERO_HURT,
  HERO_IDLE,
  HERO_JUMP,
  HERO_RUN,
  HERO_SHEET,
  HERO_WIDTH,
  SLIME_FILE,
  SLIME_SHEET,
  SLIME_SQUASH,
  SMALL_SIZE,
} from "../assets.ts";
import { LAB_SCENE, PRELOAD_SCENE } from "./keys.ts";

// PreloadScene - loads every sprite sheet, then makes every animation, then starts the lab
//
// Animations belong to the GAME, not to a scene: this.anims is the game's one animation manager.
// So they are made here, ONCE, and every scene can play them from then on. (Make them in a scene
// that starts more than once and Phaser warns that the key already exists.)

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    // a sprite sheet is one picture cut into equal frames, numbered from 0, left to right
    this.load.spritesheet(HERO_SHEET, HERO_FILE, { frameWidth: HERO_WIDTH, frameHeight: HERO_HEIGHT });
    this.load.spritesheet(COIN_SHEET, COIN_FILE, { frameWidth: SMALL_SIZE, frameHeight: SMALL_SIZE });
    this.load.spritesheet(SLIME_SHEET, SLIME_FILE, { frameWidth: SMALL_SIZE, frameHeight: SMALL_SIZE });
    this.load.spritesheet(BAT_SHEET, BAT_FILE, { frameWidth: SMALL_SIZE, frameHeight: SMALL_SIZE });
    this.load.spritesheet(GHOST_SHEET, GHOST_FILE, { frameWidth: SMALL_SIZE, frameHeight: SMALL_SIZE });
    this.load.spritesheet(EXPLOSION_SHEET, EXPLOSION_FILE, { frameWidth: EXPLOSION_SIZE, frameHeight: EXPLOSION_SIZE });
  }

  create(): void {
    // the hero: frames 0-1 idle, 2-7 run, 8 jump, 9 fall, 10 hurt
    this.anims.create({
      key: HERO_IDLE,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,                      // -1: repeat for ever
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
    this.anims.create({
      key: HERO_HURT,
      frames: this.anims.generateFrameNumbers(HERO_SHEET, { frames: [10, 9, 10, 9, 10] }),
      frameRate: 8,                    // five frames at 8 a second: about 0.6 seconds, then it ends
    });

    // the others, all looping
    this.anims.create({
      key: COIN_SPIN,
      frames: this.anims.generateFrameNumbers(COIN_SHEET, { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: SLIME_SQUASH,
      frames: this.anims.generateFrameNumbers(SLIME_SHEET, { start: 0, end: 3 }),
      frameRate: 6,
      yoyo: true,                      // 0 1 2 3 2 1 0 ... - there and back again
      repeat: -1,
    });
    this.anims.create({
      key: BAT_FLAP,
      frames: this.anims.generateFrameNumbers(BAT_SHEET, { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: GHOST_BOB,
      frames: this.anims.generateFrameNumbers(GHOST_SHEET, { start: 0, end: 3 }),
      frameRate: 5,
      yoyo: true,
      repeat: -1,
    });
    this.anims.create({
      key: EXPLODE,
      frames: this.anims.generateFrameNumbers(EXPLOSION_SHEET, { start: 0, end: 7 }),
      frameRate: 16,
      repeat: -1,
      repeatDelay: 800,                // wait 0.8 seconds between explosions
    });

    this.scene.start(LAB_SCENE);
  }
}
