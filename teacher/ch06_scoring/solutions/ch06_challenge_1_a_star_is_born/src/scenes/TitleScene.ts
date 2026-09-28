import Phaser from "phaser";
import {
  BEST_SCORE,
  COIN_FILE,
  COIN_KEY,
  COIN_SOUND_FILE,
  COIN_SOUND_KEY,
  GEM_FILE,
  GEM_KEY,
  HEART_FILE,
  HEART_KEY,
  HURT_SOUND_FILE,
  HURT_SOUND_KEY,
  LEVEL_SOUND_FILE,
  LEVEL_SOUND_KEY,
  LOSE_SOUND_FILE,
  LOSE_SOUND_KEY,
  STAR_FILE,   // CHALLENGE 1
  STAR_KEY,    // CHALLENGE 1
} from "../assets.ts";
import { GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// TitleScene - the title screen: how to play, the best score so far, and SPACE to start
//
// It is the first scene to run, so it loads everything the game needs (Chapter 3 gives loading a
// scene of its own).

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(TITLE_SCENE);
  }

  preload(): void {
    this.load.image(COIN_KEY, COIN_FILE);
    this.load.image(GEM_KEY, GEM_FILE);
    this.load.image(HEART_KEY, HEART_FILE);
    this.load.image(STAR_KEY, STAR_FILE);   // CHALLENGE 1
    this.load.audio(COIN_SOUND_KEY, COIN_SOUND_FILE);
    this.load.audio(HURT_SOUND_KEY, HURT_SOUND_FILE);
    this.load.audio(LEVEL_SOUND_KEY, LEVEL_SOUND_FILE);
    this.load.audio(LOSE_SOUND_KEY, LOSE_SOUND_FILE);
  }

  create(): void {
    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff", align: "center" };

    this.add.text(centreX, 110, "COIN COLLECTOR", { ...style, fontSize: "64px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);

    // CHALLENGE 1 - three pickups now, so the row is spread wider
    this.add.image(centreX - 220, 215, COIN_KEY).setScale(1.75);
    this.add.text(centreX - 190, 215, "10 points", style).setOrigin(0, 0.5);
    this.add.image(centreX - 50, 215, GEM_KEY).setScale(1.5);
    this.add.text(centreX - 20, 215, "50 points", style).setOrigin(0, 0.5);
    this.add.image(centreX + 120, 215, STAR_KEY).setScale(1.6);
    this.add.text(centreX + 150, 215, "100 points", style).setOrigin(0, 0.5);

    this.add.text(
      centreX,
      320,
      "Click them before they vanish.\nEvery 5 in a row raises your multiplier.\nLet 3 get away and the game is over.",
      style,
    ).setOrigin(0.5);

    // the best score is kept in the registry, which lasts until the page is closed
    const best: number = this.registry.get(BEST_SCORE) ?? 0;
    this.add.text(centreX, 425, `Best score: ${best}`, { ...style, color: "#a8dadc" }).setOrigin(0.5);

    this.add.text(centreX, 510, "Press SPACE to start", { ...style, fontSize: "34px", color: "#ffd166" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
  }
}
