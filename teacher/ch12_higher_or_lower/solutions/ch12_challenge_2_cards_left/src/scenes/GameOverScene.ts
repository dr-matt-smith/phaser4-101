import Phaser from "phaser";
import { LOSE_KEY, TABLE_KEY, WIN_KEY } from "../assets.ts";
import { Button } from "../objects/Button.ts";
import { GAME_OVER_SCENE, GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// GameOverScene - the end of a game, won or lost, with buttons to play again or go back to the title
//
// One scene for both endings: they show the same things (a heading, what happened, two buttons),
// so the data passed in says which ending it is (Chapter 2).

export interface GameOverData {
  won: boolean;
  inARow: number;
  lastCard: string;
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
    this.add.image(400, 300, TABLE_KEY);
    this.sound.play(this.result.won ? WIN_KEY : LOSE_KEY);

    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff", align: "center" };
    const heading = this.result.won ? "You win!" : "Out!";
    const detail = this.result.won
      ? "Five right in a row."
      : `The ${this.result.lastCard} caught you out,\nafter ${this.result.inARow} right in a row.`;

    this.add.text(400, 150, heading, { ...style, fontSize: "72px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(400, 270, detail, style).setOrigin(0.5);

    new Button(this, 260, 430, "PLAY AGAIN", () => {
      this.scene.start(GAME_SCENE);
    });
    new Button(this, 540, 430, "MENU", () => {
      this.scene.start(TITLE_SCENE);
    });
  }
}
