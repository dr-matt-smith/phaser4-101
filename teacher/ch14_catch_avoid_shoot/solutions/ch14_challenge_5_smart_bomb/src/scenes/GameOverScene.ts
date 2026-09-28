import Phaser from "phaser";
import { LOSE_SOUND, SPACE_KEY, STARS_FAR_KEY, STARS_NEAR_KEY, WIN_SOUND } from "../assets.ts";
import { HighScores } from "../HighScores.ts";
import { stopMusic } from "../music.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import { GAME_OVER_SCENE, GAME_SCENE, MENU_SCENE } from "./keys.ts";

// GameOverScene - won or lost, the score, and the high-score table with this game's score in it

export interface GameOverData {
  won: boolean;
  score: number;
  level: number;
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

    stopMusic(this);
    this.sound.play(this.result.won ? WIN_SOUND : LOSE_SOUND);

    // -1 means "not in the table"; a score of nothing is not worth a place
    const place = this.result.score > 0 ? HighScores.add({ score: this.result.score, level: this.result.level }) : -1;

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff" };

    const heading = this.result.won ? "YOU WIN!" : "GAME OVER";
    this.add.text(centreX, 80, heading, {
      ...style, fontSize: "64px", fontStyle: "bold", color: this.result.won ? "#ffd166" : "#e63946",
    }).setOrigin(0.5);
    this.add.text(centreX, 150, `Score: ${this.result.score}`, { ...style, fontSize: "36px" }).setOrigin(0.5);
    const message = place >= 0 ? `A new high score - number ${place + 1}!` : "Not a high score this time";
    this.add.text(centreX, 195, message, { ...style, color: "#a8dadc" }).setOrigin(0.5);

    HighScores.load().forEach((entry, index) => {
      const line = `${index + 1}.   ${String(entry.score).padStart(6, " ")}    level ${entry.level}`;
      this.add.text(centreX, 260 + index * 34, line, {
        ...style,
        fontFamily: "Courier New, monospace",
        color: index === place ? "#ffd166" : "#ffffff",   // this game's score stands out
      }).setOrigin(0.5);
    });

    this.add.text(centreX, 490, "SPACE to play again, ESC for the menu", style).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(MENU_SCENE);
    });
  }
}
