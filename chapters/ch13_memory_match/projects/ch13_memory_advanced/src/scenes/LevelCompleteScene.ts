import Phaser from "phaser";
import { STAR_KEY, WIN_KEY } from "../assets.ts";
import { LEVELS } from "../levels.ts";
import { Button } from "../objects/Button.ts";
import type { ThemeName } from "../themes/themes.ts";
import type { GameData } from "./GameScene.ts";
import { GAME_SCENE, LEVEL_COMPLETE_SCENE, MENU_SCENE } from "./keys.ts";

// LevelCompleteScene - stars, moves and time for the level just finished, and where to go next

export interface LevelCompleteData {
  level: number;
  theme: ThemeName;
  moves: number;
  seconds: number;
  stars: number;
  peeked: boolean;
  isNewBest: boolean;
}

const STAR_SCALE = 2.5;
const STAR_SPACING = 110;

export class LevelCompleteScene extends Phaser.Scene {
  private result!: LevelCompleteData;

  constructor() {
    super(LEVEL_COMPLETE_SCENE);
  }

  init(data: LevelCompleteData): void {
    this.result = data;
  }

  create(): void {
    this.sound.play(WIN_KEY);

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" };
    const isLastLevel = this.result.level === LEVELS.length - 1;
    this.add.text(centreX, 80, `Level ${this.result.level + 1} complete!`, { ...style, fontSize: "52px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(centreX + (i - 1) * STAR_SPACING, 190, STAR_KEY);
      if (i < this.result.stars) {
        star.setScale(0);
        this.tweens.add({ targets: star, scale: STAR_SCALE, duration: 400, delay: 300 + i * 250, ease: "Back.easeOut" });
      } else {
        star.setScale(STAR_SCALE).setTint(0x555555).setAlpha(0.4);
      }
    }

    this.add.text(centreX, 285, `Moves: ${this.result.moves}     Time: ${this.result.seconds.toFixed(1)} s`, style)
      .setOrigin(0.5);

    if (this.result.isNewBest) {
      this.add.text(centreX, 330, "New best for this level!", { ...style, color: "#f4a261" }).setOrigin(0.5);
    }
    if (this.result.peeked) {
      this.add.text(centreX, 370, "(you peeked - three stars need a level without a peek)", { ...style, fontSize: "20px" })
        .setOrigin(0.5);
    }

    // three ways on; "Next level" only if there is one
    let y = 440;
    if (!isLastLevel) {
      new Button(this, centreX, y, "Next level", () => {
        this.startLevel(this.result.level + 1);
      });
      y = y + 75;
    }
    new Button(this, centreX - 120, y, "Play again", () => {
      this.startLevel(this.result.level);
    });
    new Button(this, centreX + 120, y, "Menu", () => {
      this.scene.start(MENU_SCENE);
    });
  }

  private startLevel(level: number): void {
    const data: GameData = { level: level, theme: this.result.theme };
    this.scene.start(GAME_SCENE, data);
  }
}
