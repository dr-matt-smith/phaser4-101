import Phaser from "phaser";
import {
  BULLET_FILE, BULLET_KEY, CLICK_SOUND, CLICK_SOUND_FILE, ENEMY_BULLET_FILE, ENEMY_BULLET_KEY, ENEMY_FILE,
  ENEMY_KEY, EXPLODE_ANIM, EXPLOSION_FILE, EXPLOSION_FRAME_SIZE, EXPLOSION_KEY, EXPLOSION_SOUND,
  EXPLOSION_SOUND_FILE, GAME_MUSIC, GAME_MUSIC_FILE, GEM_FILE, GEM_KEY, HEART_FILE, HEART_KEY, HIT_SOUND,
  HIT_SOUND_FILE, HURT_SOUND, HURT_SOUND_FILE, LOSE_SOUND, LOSE_SOUND_FILE, MENU_MUSIC, MENU_MUSIC_FILE,
  PARTICLE_FILE, PARTICLE_KEY, POWERUP_SOUND, POWERUP_SOUND_FILE, SHIELD_BUBBLE_KEY, SHIELD_KEY, SHIP_FILE, SHIP_KEY,
  SHOOT_SOUND,
  SHOOT_SOUND_FILE, SPACE_FILE, SPACE_KEY, STAR_FILE, STAR_KEY, STARS_FAR_KEY, STARS_NEAR_KEY, WIN_SOUND,
  WIN_SOUND_FILE,
} from "../assets.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import { MENU_SCENE, PRELOAD_SCENE } from "./keys.ts";

// PreloadScene - loads everything, with a progress bar (Chapter 3), makes the things that are
// made in code rather than loaded, and then hands over to the menu. It only ever runs once.

const BAR_WIDTH = 400;
const BAR_HEIGHT = 24;
const SHIELD_ICON_SIZE = 32;      // CHALLENGE 4
const SHIELD_BUBBLE_SIZE = 84;    // CHALLENGE 4

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(PRELOAD_SCENE);
  }

  preload(): void {
    const centreX = this.scale.width / 2;
    const centreY = this.scale.height / 2;
    this.add.rectangle(centreX, centreY, BAR_WIDTH + 8, BAR_HEIGHT + 8, 0x457b9d);
    const bar = this.add.rectangle(centreX - BAR_WIDTH / 2, centreY, BAR_WIDTH, BAR_HEIGHT, 0xffd166)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.load.on("progress", (progress: number) => {
      bar.setScale(progress, 1);
    });

    this.load.image(SPACE_KEY, SPACE_FILE);
    this.load.image(SHIP_KEY, SHIP_FILE);
    this.load.image(ENEMY_KEY, ENEMY_FILE);
    this.load.image(BULLET_KEY, BULLET_FILE);
    this.load.image(ENEMY_BULLET_KEY, ENEMY_BULLET_FILE);
    this.load.image(PARTICLE_KEY, PARTICLE_FILE);
    this.load.image(HEART_KEY, HEART_FILE);
    this.load.image(GEM_KEY, GEM_FILE);
    this.load.image(STAR_KEY, STAR_FILE);
    this.load.spritesheet(EXPLOSION_KEY, EXPLOSION_FILE, {
      frameWidth: EXPLOSION_FRAME_SIZE,
      frameHeight: EXPLOSION_FRAME_SIZE,
    });
    this.load.audio(SHOOT_SOUND, SHOOT_SOUND_FILE);
    this.load.audio(EXPLOSION_SOUND, EXPLOSION_SOUND_FILE);
    this.load.audio(HURT_SOUND, HURT_SOUND_FILE);
    this.load.audio(HIT_SOUND, HIT_SOUND_FILE);
    this.load.audio(POWERUP_SOUND, POWERUP_SOUND_FILE);
    this.load.audio(LOSE_SOUND, LOSE_SOUND_FILE);
    this.load.audio(WIN_SOUND, WIN_SOUND_FILE);
    this.load.audio(CLICK_SOUND, CLICK_SOUND_FILE);
    this.load.audio(MENU_MUSIC, MENU_MUSIC_FILE);
    this.load.audio(GAME_MUSIC, GAME_MUSIC_FILE);
  }

  create(): void {
    this.anims.create({
      key: EXPLODE_ANIM,
      frames: this.anims.generateFrameNumbers(EXPLOSION_KEY, { start: 0, end: 7 }),
      frameRate: 20,
    });
    StarLayer.makeTexture(this, STARS_FAR_KEY, 60, 1, 0.5);
    StarLayer.makeTexture(this, STARS_NEAR_KEY, 14, 2, 0.9);
    this.makeShieldTextures();    // CHALLENGE 4

    this.scene.start(MENU_SCENE);
  }

  // CHALLENGE 4: two pictures drawn with Graphics - a blue orb for the power-up, and a see-through
  // bubble with a bright edge to show round the ship
  private makeShieldTextures(): void {
    const graphics = this.make.graphics({}, false);
    const iconRadius = SHIELD_ICON_SIZE / 2;
    graphics.fillStyle(0x4cc9f0, 1);
    graphics.fillCircle(iconRadius, iconRadius, iconRadius - 2);
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(iconRadius, iconRadius, iconRadius - 3);
    graphics.generateTexture(SHIELD_KEY, SHIELD_ICON_SIZE, SHIELD_ICON_SIZE);

    graphics.clear();
    const bubbleRadius = SHIELD_BUBBLE_SIZE / 2;
    graphics.fillStyle(0x4cc9f0, 0.25);
    graphics.fillCircle(bubbleRadius, bubbleRadius, bubbleRadius - 2);
    graphics.lineStyle(3, 0x4cc9f0, 0.9);
    graphics.strokeCircle(bubbleRadius, bubbleRadius, bubbleRadius - 2);
    graphics.generateTexture(SHIELD_BUBBLE_KEY, SHIELD_BUBBLE_SIZE, SHIELD_BUBBLE_SIZE);
    graphics.destroy();
  }
}
