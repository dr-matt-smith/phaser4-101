import Phaser from "phaser";
import { BEST_TIME, WIN_KEY } from "../assets.ts";
import { PLAY_SCENE, START_SCENE, WIN_SCENE } from "./keys.ts";

// WinScene - the result: time, misses, penalty, total - and whether it is a new best
//
// The best time has to outlive this scene (the start scene shows it), so it goes in the game's
// REGISTRY: a store of named values shared by every scene in the game.

export interface WinData {
  seconds: number;
  misses: number;
  penalty: number;
}

export class WinScene extends Phaser.Scene {
  private result!: WinData;

  constructor() {
    super(WIN_SCENE);
  }

  init(data: WinData): void {
    this.result = data;
  }

  create(): void {
    this.sound.play(WIN_KEY);

    const total = this.result.seconds + this.result.penalty;

    // a new best? (no best yet counts as a new best)
    const best: number | undefined = this.registry.get(BEST_TIME);
    const isNewBest = best === undefined || total < best;
    if (isNewBest) {
      this.registry.set(BEST_TIME, total);
    }

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" };

    this.add.text(centreX, 130, "You did it!", { ...style, fontSize: "64px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(centreX, 230, `Time: ${this.result.seconds.toFixed(2)} s`, style).setOrigin(0.5);
    this.add.text(centreX, 275, `Misses: ${this.result.misses}  (+${this.result.penalty} s)`, style).setOrigin(0.5);
    this.add.text(centreX, 330, `Total: ${total.toFixed(2)} s`, { ...style, fontSize: "36px" }).setOrigin(0.5);

    if (isNewBest) {
      this.add.text(centreX, 390, "NEW BEST TIME!", { ...style, color: "#e63946", fontStyle: "bold" }).setOrigin(0.5);
    }

    this.add.text(centreX, 470, "SPACE to play again, ESC for the title screen", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(PLAY_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(START_SCENE);
    });
  }
}
