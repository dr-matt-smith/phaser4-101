import Phaser from "phaser";
import { SKY_KEY, WIN_SOUND } from "../assets.ts";
import type { GameData } from "./GameScene.ts";
import { END_SCENE, GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// EndScene - the flag was reached: how did it go?

export interface EndData {
  coins: number;
  totalCoins: number;
  seconds: number;
  attempts: number;
}

export class EndScene extends Phaser.Scene {
  private result!: EndData;

  constructor() {
    super(END_SCENE);
  }

  init(data: EndData): void {
    this.result = data;
  }

  create(): void {
    this.sound.play(WIN_SOUND);
    this.add.image(0, 0, SKY_KEY).setOrigin(0);

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "30px", color: "#1b1f2a" };
    const r = this.result;

    this.add.text(centreX, 130, "You reached the flag!", { ...style, fontSize: "56px", fontStyle: "bold", color: "#ffffff" })
      .setOrigin(0.5)
      .setStroke("#1d3557", 8);
    this.add.text(centreX, 240, `Coins: ${r.coins} / ${r.totalCoins}`, style).setOrigin(0.5);
    this.add.text(centreX, 290, `Time: ${r.seconds.toFixed(1)} seconds`, style).setOrigin(0.5);
    const tries = r.attempts === 1 ? "On your first try!" : `After ${r.attempts} tries`;
    this.add.text(centreX, 340, tries, style).setOrigin(0.5);

    if (r.coins === r.totalCoins) {
      this.add.text(centreX, 400, "EVERY COIN!", { ...style, fontStyle: "bold", color: "#e63946" }).setOrigin(0.5);
    }

    this.add.text(centreX, 490, "SPACE to play again, ESC for the title screen", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      const data: GameData = { attempt: 1 };
      this.scene.start(GAME_SCENE, data);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(TITLE_SCENE);
    });
  }
}
