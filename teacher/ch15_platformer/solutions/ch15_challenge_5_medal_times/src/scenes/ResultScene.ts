import Phaser from "phaser";
import { LOSE_SOUND, PANEL_KEY, SKY_KEY, WIN_SOUND } from "../assets.ts";
import { LEVELS } from "../config/levels.ts";
import { MEDAL_COLOUR, medalFor } from "../config/medals.ts";
import { Progress } from "../Progress.ts";
import type { GameData } from "./GameScene.ts";
import { GAME_SCENE, MENU_SCENE, RESULT_SCENE } from "./keys.ts";

// ResultScene - the end of a level, one way or the other

export interface ResultData {
  outcome: "complete" | "gameOver";
  level: number;
  coins: number;
  totalCoins: number;
  seconds: number;
}

export class ResultScene extends Phaser.Scene {
  private result!: ResultData;

  constructor() {
    super(RESULT_SCENE);
  }

  init(data: ResultData): void {
    this.result = data;
  }

  create(): void {
    const r = this.result;
    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "26px", color: "#ffffff", align: "center" };
    this.add.image(0, 0, SKY_KEY).setOrigin(0).setTint(LEVELS[r.level].skyTint);
    this.add.image(centreX, 300, PANEL_KEY).setScale(1.5, 1.3);

    const isLastLevel = r.level === LEVELS.length - 1;
    let heading: string;
    let next: string;
    if (r.outcome === "gameOver") {
      this.sound.play(LOSE_SOUND);
      heading = "Game over";
      next = "SPACE for the menu";
    } else {
      this.sound.play(WIN_SOUND);
      Progress.unlockAfter(r.level, LEVELS.length);
      heading = isLastLevel ? "You finished the game!" : "Level complete!";
      next = isLastLevel ? "SPACE for the menu" : `SPACE for level ${r.level + 2}: ${LEVELS[r.level + 1].name}`;
    }

    this.add.text(centreX, 150, heading, { ...style, fontSize: "48px", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(centreX, 230, LEVELS[r.level].name, { ...style, color: "#a8dadc" }).setOrigin(0.5);
    this.add.text(centreX, 300, `Coins: ${r.coins} / ${r.totalCoins}`, style).setOrigin(0.5);
    this.add.text(centreX, 345, `Time: ${r.seconds.toFixed(1)} seconds`, style).setOrigin(0.5);

    // CHALLENGE 5: the medal, and the times to aim for
    if (r.outcome === "complete") {
      const times = LEVELS[r.level].medals;
      const medal = medalFor(r.seconds, times);
      const best = Progress.saveMedal(r.level, medal) ? " - a new best!" : "";
      const words = medal === "none" ? "No medal this time" : `${medal.toUpperCase()} medal${best}`;
      this.add.text(centreX, 385, words, { ...style, color: MEDAL_COLOUR[medal], fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(centreX, 420, `gold ${times.gold} s   silver ${times.silver} s   bronze ${times.bronze} s`, {
        ...style,
        fontSize: "18px",
      }).setOrigin(0.5);
    }
    // CHALLENGE 5: moved down (from 440) to make room for the medal
    this.add.text(centreX, 470, next, { ...style, fontSize: "22px", color: "#ffd166" }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      if (r.outcome === "complete" && !isLastLevel) {
        const data: GameData = { level: r.level + 1 };
        this.scene.start(GAME_SCENE, data); // lives carry on into the next level
      } else {
        this.scene.start(MENU_SCENE);
      }
    });
  }
}
