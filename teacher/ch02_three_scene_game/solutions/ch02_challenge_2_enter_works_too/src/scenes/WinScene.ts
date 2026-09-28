import Phaser from "phaser";
import { PLAY_SCENE, WIN_SCENE } from "./keys.ts";

// WinScene - shows how long the player took, and offers another go
//
// PlayScene hands it the time. The shape of what is handed over is an INTERFACE, so both scenes
// agree on it - and TypeScript checks that they do.

export interface WinData {
  seconds: number;
}

export class WinScene extends Phaser.Scene {
  private seconds = 0;

  constructor() {
    super(WIN_SCENE);
  }

  // init() runs first, before create(), and receives whatever was passed to scene.start(...)
  init(data: WinData): void {
    this.seconds = data.seconds;
  }

  create(): void {
    const centreX = this.scale.width / 2;

    this.add.text(centreX, 200, "You got it!", {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.add.text(centreX, 300, `in ${this.seconds.toFixed(2)} seconds`, {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(centreX, 420, "Press SPACE or ENTER to play again", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // CHALLENGE 2: SPACE or ENTER - both call the same method
    // - both listeners are removed when this scene shuts down, so once the game has moved on,
    //   pressing the other key does nothing
    this.input.keyboard!.once("keydown-SPACE", () => {
      this.next();
    });
    this.input.keyboard!.once("keydown-ENTER", () => {
      this.next();
    });
  }

  // CHALLENGE 2: what SPACE and ENTER do
  private next(): void {
    this.scene.start(PLAY_SCENE);
  }
}
