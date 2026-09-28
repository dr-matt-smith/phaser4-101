import Phaser from "phaser";
import { BEST_SCORE } from "../assets.ts";
import { GAME_OVER_SCENE, GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// GameOverScene - the final score, and whether it beat the best score so far
//
// The best score only lasts as long as the page is open: it is kept in the registry. The next
// project, ch06_high_score_table, keeps a whole table of scores in the browser's storage instead.

export interface GameOverData {
  score: number;
  level: number;
  bestCombo: number;
}

export class GameOverScene extends Phaser.Scene {
  private result!: GameOverData;

  constructor() {
    super(GAME_OVER_SCENE);
  }

  init(data: GameOverData): void {
    this.result = data;
  }

  create(): void {
    const best: number = this.registry.get(BEST_SCORE) ?? 0;
    const isNewBest = this.result.score > best;
    if (isNewBest) {
      this.registry.set(BEST_SCORE, this.result.score);
    }

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" };

    this.add.text(centreX, 120, "GAME OVER", { ...style, fontSize: "64px", fontStyle: "bold", color: "#e63946" })
      .setOrigin(0.5);
    this.add.text(centreX, 230, `Score: ${this.result.score}`, { ...style, fontSize: "44px" }).setOrigin(0.5);
    this.add.text(centreX, 295, `Level ${this.result.level}      Best combo ${this.result.bestCombo}`, style)
      .setOrigin(0.5);

    const bestMessage = isNewBest ? "NEW BEST SCORE!" : `Best score: ${best}`;
    this.add.text(centreX, 370, bestMessage, { ...style, color: isNewBest ? "#ffd166" : "#a8dadc" }).setOrigin(0.5);

    this.add.text(centreX, 480, "SPACE to play again, ESC for the title screen", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(TITLE_SCENE);
    });
  }
}
