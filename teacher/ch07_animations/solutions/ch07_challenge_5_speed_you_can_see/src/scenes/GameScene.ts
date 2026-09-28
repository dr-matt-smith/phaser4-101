import Phaser from "phaser";
import { CLOUD_KEY, GROUND_KEY, SKY_KEY } from "../assets.ts";
import { Hero } from "../objects/Hero.ts";
import { GAME_SCENE } from "./keys.ts";

// GameScene - the hero on a strip of ground, under a sky with drifting clouds
//
// The scene builds the world and hands the arrow keys to the hero; the hero does the rest (see
// Hero.ts). The text at the top shows the hero's state and animation as they change.

const GROUND_Y = 544;                // where the hero's feet rest - in the grass on ground.png
const CLOUD_DRIFT_TIME = 40000;      // milliseconds for a cloud to cross the screen
const CLOUD_START_X = 900;           // just off the right edge...
const CLOUD_END_X = -100;            // ...to just off the left

export class GameScene extends Phaser.Scene {
  private hero!: Hero;
  private info!: Phaser.GameObjects.Text;

  constructor() {
    super(GAME_SCENE);
  }

  create(): void {
    this.add.image(400, 300, SKY_KEY);
    this.addCloud(250, 110);
    this.addCloud(650, 180);
    this.add.image(400, 600, GROUND_KEY).setOrigin(0.5, 1);

    const cursors = this.input.keyboard!.createCursorKeys();
    this.hero = new Hero(this, 400, GROUND_Y, cursors);

    this.input.keyboard!.on("keydown-H", () => {
      this.hero.hurt();
    });

    this.info = this.add.text(16, 14, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#1b1f2a",
    });
    this.add.text(784, 14, "LEFT / RIGHT run    UP jump    H hurt", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#1d3557",
    }).setOrigin(1, 0);
  }

  override update(): void {
    const animation = this.hero.anims.currentAnim ? this.hero.anims.currentAnim.key : "";
    this.info.setText(`state: ${this.hero.getHeroState()}\nanimation: ${animation}`);
  }

  // a cloud that drifts from off the right edge to off the left, for ever. A TWEEN changes a value
  // smoothly over time - here, x - and is explained later in the chapter.
  private addCloud(x: number, y: number): void {
    const cloud = this.add.image(x, y, CLOUD_KEY);
    const tween = this.tweens.add({
      targets: cloud,
      x: { from: CLOUD_START_X, to: CLOUD_END_X },
      duration: CLOUD_DRIFT_TIME,
      repeat: -1,
    });
    // skip the tween forward to where x is now, so the cloud starts at x rather than off screen
    tween.seek(((CLOUD_START_X - x) / (CLOUD_START_X - CLOUD_END_X)) * CLOUD_DRIFT_TIME);
  }
}
