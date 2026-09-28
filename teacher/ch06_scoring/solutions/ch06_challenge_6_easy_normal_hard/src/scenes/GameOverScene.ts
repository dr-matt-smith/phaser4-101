import Phaser from "phaser";
import { DIFFICULTIES, type Difficulty } from "../Difficulty.ts";   // CHALLENGE 6
import { HighScoreTable } from "../HighScoreTable.ts";
import type { GameData } from "./GameScene.ts";   // CHALLENGE 6
import { GAME_OVER_SCENE, GAME_SCENE, TITLE_SCENE } from "./keys.ts";
import type { TitleData } from "./TitleScene.ts";   // CHALLENGE 6

// GameOverScene - the final score, when it was NOT good enough for the high score table
//
// (A score that makes the table goes to NameEntryScene instead - GameScene decides which.)

export interface GameOverData {
  score: number;
  level: number;
  bestCombo: number;
  difficulty: Difficulty;   // CHALLENGE 6
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
    const table = HighScoreTable.load(this.result.difficulty);   // CHALLENGE 6

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" };

    this.add.text(centreX, 120, "GAME OVER", { ...style, fontSize: "64px", fontStyle: "bold", color: "#e63946" })
      .setOrigin(0.5);
    this.add.text(centreX, 230, `Score: ${this.result.score}`, { ...style, fontSize: "44px" }).setOrigin(0.5);
    this.add.text(centreX, 295, `Level ${this.result.level}      Best combo ${this.result.bestCombo}`, style)
      .setOrigin(0.5);
    const difficultyName = DIFFICULTIES[this.result.difficulty].name;   // CHALLENGE 6
    this.add.text(centreX, 370, `Top score (${difficultyName}): ${table.getTopScore()}`, { ...style, color: "#a8dadc" }).setOrigin(0.5);

    this.add.text(centreX, 480, "SPACE to play again, ESC for the high scores", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    // CHALLENGE 6 - both ways out keep the same difficulty
    this.input.keyboard!.once("keydown-SPACE", () => {
      const data: GameData = { difficulty: this.result.difficulty };
      this.scene.start(GAME_SCENE, data);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      const data: TitleData = { difficulty: this.result.difficulty };
      this.scene.start(TITLE_SCENE, data);
    });
  }
}
