import Phaser from "phaser";
import { LOSE_KEY, TABLE_KEY, WIN_KEY } from "../assets.ts";
import { Button } from "../objects/Button.ts";
import { GAME_OVER_SCENE, GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// GameOverScene - the final score, the longest run, and any new records

export interface GameOverData {
  reason: string;          // why the game ended, e.g. "Out of lives!"
  score: number;
  bestInARow: number;
  cardsPlayed: number;
  newBestScore: boolean;
  newBestStreak: boolean;
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
    const anyRecord = this.result.newBestScore || this.result.newBestStreak;
    this.sound.play(anyRecord ? WIN_KEY : LOSE_KEY);

    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff", align: "center" };
    this.add.text(400, 80, this.result.reason, { ...style, fontSize: "30px", color: "#a8dadc" }).setOrigin(0.5);
    this.add.text(400, 160, `${this.result.score} points`, {
      ...style,
      fontSize: "72px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);
    this.add.text(400, 245, `Longest run: ${this.result.bestInARow}     Cards played: ${this.result.cardsPlayed}`, style)
      .setOrigin(0.5);

    // new records, if any, with a little bounce to celebrate
    const records: string[] = [];
    if (this.result.newBestScore) {
      records.push("NEW BEST SCORE!");
    }
    if (this.result.newBestStreak) {
      records.push("NEW LONGEST RUN!");
    }
    if (records.length > 0) {
      const recordText = this.add.text(400, 320, records.join("\n"), {
        ...style,
        fontStyle: "bold",
        color: "#e63946",
        stroke: "#ffffff",
        strokeThickness: 4,
      }).setOrigin(0.5);
      this.tweens.add({ targets: recordText, scale: 1.15, duration: 400, yoyo: true, repeat: -1 });
    }

    new Button(this, 260, 450, "PLAY AGAIN", () => {
      this.scene.start(GAME_SCENE);
    });
    new Button(this, 540, 450, "MENU", () => {
      this.scene.start(TITLE_SCENE);
    });
  }
}
