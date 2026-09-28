import Phaser from "phaser";
import * as A from "../assets.ts";
import { LEVELS } from "../config/levels.ts";
import { Bat } from "../objects/Bat.ts";
import { Ghost } from "../objects/Ghost.ts"; // CHALLENGE 6
import { Hero } from "../objects/Hero.ts";
import { Slime } from "../objects/Slime.ts";
import { MENU_SCENE, PRELOAD_SCENE } from "./keys.ts";

// PreloadScene - loads everything (with a progress bar, as in Chapter 3), makes every animation
// once, and moves on to the menu. It runs once, at the very start.

export const COIN_SPIN = "coin-spin";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    const bar = this.add.rectangle(200, 300, 0, 24, 0xa8dadc).setOrigin(0, 0.5);
    this.add.rectangle(400, 300, 404, 28).setStrokeStyle(2, 0xf1faee);
    this.load.on("progress", (value: number) => {
      bar.width = 400 * value;
    });

    this.load.image(A.SKY_KEY, A.SKY_FILE);
    this.load.image(A.CLOUD_KEY, A.CLOUD_FILE);
    this.load.image(A.PLATFORM_KEY, A.PLATFORM_FILE);
    this.load.image(A.HEART_KEY, A.HEART_FILE);
    this.load.image(A.BUTTON_KEY, A.BUTTON_FILE);
    this.load.image(A.BUTTON_OVER_KEY, A.BUTTON_OVER_FILE);
    this.load.image(A.PANEL_KEY, A.PANEL_FILE);
    this.load.spritesheet(A.HERO_KEY, A.HERO_FILE, A.HERO_FRAME);
    this.load.spritesheet(A.SLIME_KEY, A.SLIME_FILE, A.SMALL_FRAME);
    this.load.spritesheet(A.BAT_KEY, A.BAT_FILE, A.SMALL_FRAME);
    this.load.spritesheet(A.COIN_KEY, A.COIN_FILE, A.SMALL_FRAME);
    this.load.spritesheet(A.GHOST_KEY, A.GHOST_FILE, A.SMALL_FRAME); // CHALLENGE 6
    this.load.spritesheet(A.TILES_KEY, A.TILES_FILE, A.SMALL_FRAME);
    for (const level of LEVELS) {
      this.load.tilemapTiledJSON(level.key, level.file);
    }
    this.load.audio(A.JUMP_SOUND, A.JUMP_SOUND_FILE);
    this.load.audio(A.COIN_SOUND, A.COIN_SOUND_FILE);
    this.load.audio(A.STOMP_SOUND, A.STOMP_SOUND_FILE);
    this.load.audio(A.HURT_SOUND, A.HURT_SOUND_FILE);
    this.load.audio(A.CHECKPOINT_SOUND, A.CHECKPOINT_SOUND_FILE);
    this.load.audio(A.WIN_SOUND, A.WIN_SOUND_FILE);
    this.load.audio(A.LOSE_SOUND, A.LOSE_SOUND_FILE);
    this.load.audio(A.CLICK_SOUND, A.CLICK_SOUND_FILE);
    this.load.audio(A.MUSIC, A.MUSIC_FILE);
  }

  create(): void {
    Hero.createAnimations(this);
    Slime.createAnimations(this);
    Bat.createAnimations(this);
    Ghost.createAnimations(this); // CHALLENGE 6
    this.anims.create({
      key: COIN_SPIN,
      frames: this.anims.generateFrameNumbers(A.COIN_KEY, { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.start(MENU_SCENE);
  }
}
