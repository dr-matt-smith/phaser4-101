import Phaser from "phaser";
import { COIN_KEY, COINS, HEART_KEY, LEVEL_NAME, LIVES, TOTAL_COINS } from "../assets.ts";
import { START_LIVES } from "../config/levels.ts";
import { HUD_SCENE } from "./keys.ts";

// HudScene - lives, coins and the level's name, drawn in a scene of its own ON TOP of the game
// (launched by GameScene - Chapter 4). It has its own camera, which never moves, so nothing here
// needs setScrollFactor(0).
//
// It never talks to GameScene. GameScene puts the numbers in the registry; the registry emits a
// "changedata" event whenever one changes (Chapter 6), and the HUD redraws.

export class HudScene extends Phaser.Scene {
  private hearts: Phaser.GameObjects.Image[] = [];
  private coinText!: Phaser.GameObjects.Text;

  constructor() {
    super(HUD_SCENE);
  }

  create(): void {
    this.hearts = [];
    for (let i = 0; i < START_LIVES; i++) {
      this.hearts.push(this.add.image(28 + i * 36, 28, HEART_KEY));
    }
    this.add.image(170, 28, COIN_KEY, 0);
    const style = { fontFamily: "Arial", fontSize: "24px", fontStyle: "bold", color: "#ffffff" };
    this.coinText = this.add.text(192, 14, "", style).setStroke("#1b1f2a", 5);
    this.add.text(784, 14, this.registry.get(LEVEL_NAME), style).setOrigin(1, 0).setStroke("#1b1f2a", 5);

    this.refresh();
    this.registry.events.on("changedata", this.refresh, this);

    // the registry outlives this scene: stop listening when the scene stops, or the old
    // listener would try to update texts that no longer exist (Chapter 4)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off("changedata", this.refresh, this);
    });
  }

  private refresh(): void {
    const lives: number = this.registry.get(LIVES);
    this.hearts.forEach((heart, i) => heart.setAlpha(i < lives ? 1 : 0.25));
    this.coinText.setText(`${this.registry.get(COINS)} / ${this.registry.get(TOTAL_COINS)}`);
  }
}
