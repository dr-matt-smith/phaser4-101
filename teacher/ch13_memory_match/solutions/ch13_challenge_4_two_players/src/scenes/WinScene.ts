import Phaser from "phaser";
import { CLICK_KEY, WIN_KEY } from "../assets.ts";   // CHALLENGE 4: no stars, so no STAR_KEY or starsFor
import { GAME_SCENE, START_SCENE, WIN_SCENE } from "./keys.ts";

// WinScene - the result: who won (CHALLENGE 4), the moves and the time

export interface WinData {
  moves: number;
  seconds: number;
  pairs: number;
  scores: number[];   // CHALLENGE 4: pairs found by player 1 and player 2
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

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "30px", color: "#ffffff" };
    // CHALLENGE 4: no stars in a two-player game - the result is who won
    const [p1, p2] = this.result.scores;
    let heading = "A draw!";
    if (p1 > p2) {
      heading = "Player 1 wins!";
    } else if (p2 > p1) {
      heading = "Player 2 wins!";
    }

    this.add.text(centreX, 110, heading, { ...style, fontSize: "56px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(centreX, 230, `Player 1: ${p1} pairs     Player 2: ${p2} pairs`, { ...style, fontSize: "34px" })
      .setOrigin(0.5);

    this.add.text(centreX, 340, `Moves: ${this.result.moves}`, style).setOrigin(0.5);
    this.add.text(centreX, 385, `Time: ${this.result.seconds.toFixed(1)} seconds`, style).setOrigin(0.5);

    this.add.text(centreX, 490, "Click to play again, ESC for the title screen", { ...style, fontSize: "24px", color: "#a8dadc" })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.sound.play(CLICK_KEY);
      this.scene.start(GAME_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(START_SCENE);
    });
  }
}
