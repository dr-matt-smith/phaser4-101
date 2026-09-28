import Phaser from "phaser";
import {
  CLOUD_FILE,
  CLOUD_KEY,
  COIN_FILE,
  COIN_KEY,
  COIN_SOUND,
  COIN_SOUND_FILE,
  HERO_FILE,
  HERO_FRAME,
  HERO_KEY,
  HURT_SOUND,
  HURT_SOUND_FILE,
  JUMP_SOUND,
  JUMP_SOUND_FILE,
  MAP_FILE,
  MAP_KEY,
  SKY_FILE,
  SKY_KEY,
  SLIME_FILE,
  SLIME_KEY,
  SMALL_FRAME,
  STOMP_SOUND,
  STOMP_SOUND_FILE,
  TILES_FILE,
  TILES_KEY,
  WIN_SOUND,
  WIN_SOUND_FILE,
} from "../assets.ts";
import { Hero } from "../objects/Hero.ts";
import { Slime } from "../objects/Slime.ts";
import type { GameData } from "./GameScene.ts";
import { GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// TitleScene - loads everything, makes the animations, and waits for SPACE

export const COIN_SPIN = "coin-spin";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(TITLE_SCENE);
  }

  preload(): void {
    this.load.image(SKY_KEY, SKY_FILE);
    this.load.image(CLOUD_KEY, CLOUD_FILE);
    this.load.spritesheet(HERO_KEY, HERO_FILE, HERO_FRAME);
    this.load.spritesheet(SLIME_KEY, SLIME_FILE, SMALL_FRAME);
    this.load.spritesheet(COIN_KEY, COIN_FILE, SMALL_FRAME);
    this.load.spritesheet(TILES_KEY, TILES_FILE, SMALL_FRAME);
    this.load.tilemapTiledJSON(MAP_KEY, MAP_FILE);
    this.load.audio(JUMP_SOUND, JUMP_SOUND_FILE);
    this.load.audio(COIN_SOUND, COIN_SOUND_FILE);
    this.load.audio(STOMP_SOUND, STOMP_SOUND_FILE);
    this.load.audio(HURT_SOUND, HURT_SOUND_FILE);
    this.load.audio(WIN_SOUND, WIN_SOUND_FILE);
  }

  create(): void {
    Hero.createAnimations(this);
    Slime.createAnimations(this);
    if (!this.anims.exists(COIN_SPIN)) {
      this.anims.create({
        key: COIN_SPIN,
        frames: this.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    const centreX = this.scale.width / 2;
    this.add.image(0, 0, SKY_KEY).setOrigin(0);

    const style = { fontFamily: "Arial", fontSize: "24px", color: "#1b1f2a", align: "center" };
    this.add.text(centreX, 130, "PLATFORMER", { ...style, fontSize: "72px", fontStyle: "bold", color: "#ffffff" })
      .setOrigin(0.5)
      .setStroke("#1d3557", 8);
    this.add.text(
      centreX,
      270,
      "Run to the flag. Collect the coins.\nJump on slimes to squash them - but do not walk into them.\nMind the spikes, the lava and the gaps.",
      style,
    ).setOrigin(0.5).setLineSpacing(8);
    this.add.text(centreX, 380, "ARROWS to run    UP or SPACE to jump (hold for higher)", { ...style, fontSize: "20px" })
      .setOrigin(0.5);

    this.add.sprite(centreX - 60, 470, HERO_KEY).setScale(2).play("hero-run");
    this.add.sprite(centreX + 60, 480, SLIME_KEY).setScale(2).play("slime-wobble");

    this.add.text(centreX, 550, "Press SPACE to start", { ...style, fontSize: "32px", fontStyle: "bold", color: "#ffffff" })
      .setOrigin(0.5)
      .setStroke("#1d3557", 6);

    this.input.keyboard!.once("keydown-SPACE", () => {
      const data: GameData = { attempt: 1 };
      this.scene.start(GAME_SCENE, data);
    });
  }
}
