import Phaser from "phaser";
import { STAR_KEY, THEME_SETTING } from "../assets.ts";
import { BestResults } from "../BestResults.ts";
import { LEVELS } from "../levels.ts";
import { Button } from "../objects/Button.ts";
import { type ThemeName, THEMES } from "../themes/themes.ts";
import type { GameData } from "./GameScene.ts";
import { GAME_SCENE, MENU_SCENE } from "./keys.ts";

// MenuScene - choose the tiles (pictures or cards) and a level; see your best result for each
//
// Every level can be played from the start - this is a practice menu, not a locked campaign.

const FIRST_LEVEL_Y = 250;
const LEVEL_SPACING = 80;
const BUTTON_X = 250;
const BEST_X = 400;             // where the best-result column starts
const SMALL_STAR = 0.8;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(MENU_SCENE);
  }

  create(): void {
    const centreX = this.scale.width / 2;
    // the registry remembers the choice while the game runs; "pictures" until one is made
    const themeName: ThemeName = this.registry.get(THEME_SETTING) ?? "pictures";
    const best = new BestResults();

    this.add.text(centreX, 60, "Memory Match Deluxe", {
      fontFamily: "Arial",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    // pressing the theme button switches theme and restarts the menu, to show that theme's bests
    new Button(this, centreX, 150, `Tiles: ${THEMES[themeName].label}`, () => {
      const other: ThemeName = themeName === "pictures" ? "cards" : "pictures";
      this.registry.set(THEME_SETTING, other);
      this.scene.restart();
    });

    LEVELS.forEach((level, index) => {
      const y = FIRST_LEVEL_Y + index * LEVEL_SPACING;
      new Button(this, BUTTON_X, y, `${index + 1}. ${level.name}`, () => {
        const data: GameData = { level: index, theme: themeName };
        this.scene.start(GAME_SCENE, data);
      });
      this.showBest(best, themeName, index, y);
    });

    this.add.text(centreX, 570, "In a level: P to peek (once), ESC to come back here", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#a8dadc",
    }).setOrigin(0.5);
  }

  // three small stars (dim for the ones not earned) and the moves and time - or "not played yet"
  private showBest(best: BestResults, theme: ThemeName, level: number, y: number): void {
    const style = { fontFamily: "Arial", fontSize: "20px", color: "#ffffff" };
    const result = best.get(theme, level);
    const size = `${LEVELS[level].cols} x ${LEVELS[level].rows}`;

    if (result === undefined) {
      this.add.text(BEST_X, y, `${size}   not played yet`, { ...style, color: "#8d99ae" }).setOrigin(0, 0.5);
      return;
    }

    this.add.text(BEST_X, y, size, style).setOrigin(0, 0.5);
    for (let i = 0; i < 3; i++) {
      const star = this.add.image(BEST_X + 80 + i * 30, y, STAR_KEY).setScale(SMALL_STAR);
      if (i >= result.stars) {
        star.setTint(0x555555).setAlpha(0.4);
      }
    }
    this.add.text(BEST_X + 175, y, `${result.moves} moves, ${result.seconds.toFixed(1)} s`, style)
      .setOrigin(0, 0.5);
  }
}
