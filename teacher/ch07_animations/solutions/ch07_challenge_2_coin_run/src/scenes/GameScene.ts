import Phaser from "phaser";
import { CLOUD_KEY, COIN_SHEET, COIN_SPIN, GROUND_KEY, SKY_KEY } from "../assets.ts"; // CHALLENGE 2
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

// CHALLENGE 2: the coins - a row across the screen, some low enough to run into, some to jump for
const COIN_XS = [100, 200, 300, 500, 600, 700];
const COIN_LOW_Y = 500;
const COIN_HIGH_Y = 420;
const COIN_SCALE = 1.5;
const PICKUP_DISTANCE = 45;          // closer than this (centre to centre) counts as touching

export class GameScene extends Phaser.Scene {
  private hero!: Hero;
  private info!: Phaser.GameObjects.Text;
  private coins: Phaser.GameObjects.Sprite[] = [];     // CHALLENGE 2: the coins not yet collected
  private collected = 0;                               // CHALLENGE 2
  private coinText!: Phaser.GameObjects.Text;          // CHALLENGE 2

  constructor() {
    super(GAME_SCENE);
  }

  // CHALLENGE 2: the scene could be restarted, so start the coins afresh every time
  init(): void {
    this.coins = [];
    this.collected = 0;
  }

  create(): void {
    this.add.image(400, 300, SKY_KEY);
    this.addCloud(250, 110);
    this.addCloud(650, 180);
    this.add.image(400, 600, GROUND_KEY).setOrigin(0.5, 1);

    const cursors = this.input.keyboard!.createCursorKeys();
    this.hero = new Hero(this, 400, GROUND_Y, cursors);

    // CHALLENGE 2: a row of spinning coins, alternately low and high
    COIN_XS.forEach((x, i) => {
      const y = i % 2 === 0 ? COIN_LOW_Y : COIN_HIGH_Y;
      const coin = this.add.sprite(x, y, COIN_SHEET).setScale(COIN_SCALE);
      coin.play(COIN_SPIN);
      this.coins.push(coin);
    });

    this.input.keyboard!.on("keydown-H", () => {
      this.hero.hurt();
    });

    this.info = this.add.text(16, 14, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#1b1f2a",
    });
    // CHALLENGE 2
    this.coinText = this.add.text(16, 80, `Coins: 0 / ${COIN_XS.length}`, {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#1d3557",
      fontStyle: "bold",
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

    this.checkCoins(); // CHALLENGE 2
  }

  // CHALLENGE 2: has the hero touched a coin? The hero's (x, y) is its feet, so measure from the
  // middle of its body instead
  private checkCoins(): void {
    const heroMiddleY = this.hero.y - this.hero.displayHeight / 2;
    for (const coin of [...this.coins]) {          // a copy: collect() removes coins from the list
      const distance = Phaser.Math.Distance.Between(this.hero.x, heroMiddleY, coin.x, coin.y);
      if (distance < PICKUP_DISTANCE) {
        this.collect(coin);
      }
    }
  }

  // CHALLENGE 2: out of the list at once (so it cannot be collected twice), then float up, grow,
  // fade, and only then be destroyed
  private collect(coin: Phaser.GameObjects.Sprite): void {
    this.coins = this.coins.filter((c) => c !== coin);
    this.collected = this.collected + 1;
    this.coinText.setText(`Coins: ${this.collected} / ${COIN_XS.length}`);

    this.tweens.add({
      targets: coin,
      y: coin.y - 80,
      alpha: 0,
      scale: COIN_SCALE * 1.5,
      duration: 500,
      ease: "Quad.easeOut",
      onComplete: () => {
        coin.destroy();
      },
    });
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
