import Phaser from "phaser";
import { BUTTON_KEY, BUTTON_OVER_KEY, CLICK_SOUND, HERO_KEY, LIVES, MUSIC, SKY_KEY } from "../assets.ts";
import { LEVELS, START_LIVES } from "../config/levels.ts";
import { MEDAL_COLOUR } from "../config/medals.ts";
import { Progress } from "../Progress.ts";
import type { GameData } from "./GameScene.ts";
import { GAME_SCENE, MENU_SCENE } from "./keys.ts";

// MenuScene - the level select: a button for each level; levels not yet reached are locked.
// Click a level, or press its number.

const MUSIC_VOLUME = 0.35;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(MENU_SCENE);
  }

  create(): void {
    // the music belongs to the game, not the scene: start it only if it is not already playing
    // (Chapter 5). If the browser has not allowed sound yet, Phaser waits for the first click
    // or key press
    if (this.sound.get(MUSIC) === null) {
      this.sound.play(MUSIC, { loop: true, volume: MUSIC_VOLUME });
    }

    const centreX = this.scale.width / 2;
    this.add.image(0, 0, SKY_KEY).setOrigin(0);
    this.add.text(centreX, 90, "PLATFORMER", {
      fontFamily: "Arial",
      fontSize: "72px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5).setStroke("#1d3557", 8);
    this.add.text(centreX, 160, "Choose a level", { fontFamily: "Arial", fontSize: "28px", color: "#1b1f2a" })
      .setOrigin(0.5);

    const unlocked = Progress.unlockedCount(LEVELS.length);
    LEVELS.forEach((level, index) => {
      const open = index < unlocked;
      const label = open ? `${index + 1}   ${level.name}` : `${index + 1}   locked`;
      this.makeButton(centreX, 250 + index * 90, label, open, () => this.startLevel(index));

      // CHALLENGE 5: the best medal so far, as a coloured disc beside the button
      const medal = Progress.bestMedal(index);
      if (medal !== "none") {
        const colour = Phaser.Display.Color.HexStringToColor(MEDAL_COLOUR[medal]).color;
        this.add.circle(centreX + 200, 250 + index * 90, 18, colour).setStrokeStyle(3, 0x1d3557);
        this.add.text(centreX + 200, 250 + index * 90, medal[0].toUpperCase(), {
          fontFamily: "Arial",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#1d3557",
        }).setOrigin(0.5);
      }

    });

    // the number keys too: event.key is the character typed, "1", "2", ...
    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < unlocked) {
        this.startLevel(index);
      }
    });

    this.add.sprite(730, 470, HERO_KEY).setScale(2).play("hero-idle");
    this.add.text(centreX, 560, "ARROWS run and climb    UP or SPACE jump    ESC back to this menu", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#1b1f2a",
    }).setOrigin(0.5);
  }

  // a picture with a label on it, which lights up under the pointer (Chapter 12)
  private makeButton(x: number, y: number, label: string, enabled: boolean, onClick: () => void): void {
    const button = this.add.image(x, y, BUTTON_KEY).setDisplaySize(320, 64);
    this.add.text(x, y, label, { fontFamily: "Arial", fontSize: "26px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);

    if (!enabled) {
      button.setAlpha(0.45);
      return;
    }
    button.setInteractive({ useHandCursor: true });
    button.on("pointerover", () => button.setTexture(BUTTON_OVER_KEY));
    button.on("pointerout", () => button.setTexture(BUTTON_KEY));
    button.on("pointerdown", onClick);
  }

  private startLevel(index: number): void {
    this.sound.play(CLICK_SOUND);
    this.registry.set(LIVES, START_LIVES); // a new game: full lives
    const data: GameData = { level: index };
    this.scene.start(GAME_SCENE, data);
  }
}
