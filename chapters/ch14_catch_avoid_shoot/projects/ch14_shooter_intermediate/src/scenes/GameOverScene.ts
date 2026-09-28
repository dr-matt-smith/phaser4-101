import Phaser from "phaser";
import { SPACE_KEY, STARS_FAR_KEY, STARS_NEAR_KEY } from "../assets.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import { GAME_OVER_SCENE, GAME_SCENE, START_SCENE } from "./keys.ts";

// GameOverScene - the score, and how far the player got

export interface GameOverData {
  score: number;
  wave: number;
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
    this.add.image(400, 300, SPACE_KEY);
    new StarLayer(this, STARS_FAR_KEY, 30);
    new StarLayer(this, STARS_NEAR_KEY, 90);

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "30px", color: "#ffffff" };

    this.add.text(centreX, 170, "GAME OVER", { ...style, fontSize: "72px", fontStyle: "bold", color: "#e63946" })
      .setOrigin(0.5);
    this.add.text(centreX, 280, `Score: ${this.result.score}`, { ...style, fontSize: "40px" }).setOrigin(0.5);
    this.add.text(centreX, 335, `You reached wave ${this.result.wave}`, style).setOrigin(0.5);
    this.add.text(centreX, 450, "SPACE to play again, ESC for the title screen", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(START_SCENE);
    });
  }
}
