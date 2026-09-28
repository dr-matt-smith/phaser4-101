import Phaser from "phaser";
import { PLAY_SCENE, WIN_SCENE } from "./keys.ts";

// WinScene - shows how long the player took, and offers another go
//
// PlayScene hands it the time. The shape of what is handed over is an INTERFACE, so both scenes
// agree on it - and TypeScript checks that they do.

export interface WinData {
  // CHALLENGE 4: did the player click the ball in time?
  won: boolean;
  seconds: number;
}

export class WinScene extends Phaser.Scene {
  private seconds = 0;
  private won = true;

  constructor() {
    super(WIN_SCENE);
  }

  // init() runs first, before create(), and receives whatever was passed to scene.start(...)
  init(data: WinData): void {
    this.seconds = data.seconds;
    this.won = data.won;
  }

  create(): void {
    const centreX = this.scale.width / 2;

    // CHALLENGE 4: the heading and the time line depend on whether the player won
    const heading = this.won ? "You got it!" : "Too slow!";
    const detail = this.won ? `in ${this.seconds.toFixed(2)} seconds` : `You had ${this.seconds} seconds`;

    this.add.text(centreX, 200, heading, {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.add.text(centreX, 300, detail, {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(centreX, 420, "Press SPACE to play again", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(PLAY_SCENE);
    });
  }
}
