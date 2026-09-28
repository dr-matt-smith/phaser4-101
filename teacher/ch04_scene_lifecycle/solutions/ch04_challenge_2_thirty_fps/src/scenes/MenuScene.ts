import Phaser from "phaser";
import {
  COIN_FILE,
  COIN_KEY,
  COIN_SOUND_FILE,
  COIN_SOUND_KEY,
  COIN_SPIN_ANIM,
  ENEMY_FILE,
  ENEMY_KEY,
  HEART_FILE,
  HEART_KEY,
  HURT_SOUND_FILE,
  HURT_SOUND_KEY,
  PANEL_FILE,
  PANEL_KEY,
  PLAYER_FILE,
  PLAYER_KEY,
} from "../assets.ts";
import { GAME_SCENE, MENU_SCENE } from "./keys.ts";

// MenuScene - the title screen. It is the first scene, so it loads everything the game needs.
//
// It runs again every time the player quits to the menu. Loading again costs nothing (files
// already loaded are skipped), but anything else done here that belongs to the whole GAME, such
// as making an animation, must only be done the first time.

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(MENU_SCENE);
  }

  preload(): void {
    this.load.image(PLAYER_KEY, PLAYER_FILE);
    this.load.image(ENEMY_KEY, ENEMY_FILE);
    this.load.image(HEART_KEY, HEART_FILE);
    this.load.image(PANEL_KEY, PANEL_FILE);
    this.load.spritesheet(COIN_KEY, COIN_FILE, { frameWidth: 32, frameHeight: 32 });
    this.load.audio(COIN_SOUND_KEY, COIN_SOUND_FILE);
    this.load.audio(HURT_SOUND_KEY, HURT_SOUND_FILE);
  }

  create(): void {
    // Animations belong to the game, like loaded files. (Chapter 7 is all about them.)
    if (!this.anims.exists(COIN_SPIN_ANIM)) {
      this.anims.create({
        key: COIN_SPIN_ANIM,
        frames: this.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1,
      });
    }

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff", align: "center" };

    this.add.text(centreX, 120, "COIN RUSH", { ...style, fontSize: "72px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);

    this.add.image(centreX - 120, 250, PLAYER_KEY);
    this.add.sprite(centreX, 250, COIN_KEY).play(COIN_SPIN_ANIM).setScale(1.5);
    this.add.image(centreX + 120, 250, ENEMY_KEY);

    this.add.text(centreX, 350, "Arrow keys to move. Collect the coins before they fade,\n" +
      "and keep away from the triangles. You have 45 seconds.", style).setOrigin(0.5);
    this.add.text(centreX, 420, "P or ESC pauses the game", { ...style, color: "#a8dadc" }).setOrigin(0.5);
    this.add.text(centreX, 500, "Press SPACE to play", { ...style, fontSize: "34px", color: "#ffd166" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
  }
}
