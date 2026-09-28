import Phaser from "phaser";
import { GEM_KEY, HEART_KEY, MENU_MUSIC, SPACE_KEY, STAR_KEY, STARS_FAR_KEY, STARS_NEAR_KEY } from "../assets.ts";
import { HighScores } from "../HighScores.ts";
import { playMusic } from "../music.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import { GAME_SCENE, MENU_SCENE } from "./keys.ts";

// MenuScene - the title screen: what to do, what the power-ups are, and the high scores

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(MENU_SCENE);
  }

  create(): void {
    this.add.image(400, 300, SPACE_KEY);
    new StarLayer(this, STARS_FAR_KEY, 30);
    new StarLayer(this, STARS_NEAR_KEY, 90);

    // Browsers block sound until the player clicks or presses a key (Chapter 5). If that has not
    // happened yet, Phaser waits and starts the music on the first key press.
    playMusic(this, MENU_MUSIC);

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "20px", color: "#ffffff" };

    this.add.text(centreX, 70, "SPACE SHOOTER DELUXE", {
      ...style, fontSize: "52px", fontStyle: "bold", color: "#ffd166",
    }).setOrigin(0.5);
    this.add.text(centreX, 130, "Three levels. Every level ends with a boss.", style).setOrigin(0.5);

    // the power-ups, with their pictures
    const legend: [string, string][] = [
      [GEM_KEY, "spread shot"],
      [STAR_KEY, "rapid fire"],
      [HEART_KEY, "extra life"],
    ];
    legend.forEach(([key, words], index) => {
      const x = 170 + index * 190;
      this.add.image(x, 185, key);
      this.add.text(x + 22, 185, words, { ...style, color: "#a8dadc" }).setOrigin(0, 0.5);
    });

    // the high-score table
    this.add.text(centreX, 250, "HIGH SCORES", { ...style, fontSize: "26px", fontStyle: "bold" }).setOrigin(0.5);
    const scores = HighScores.load();
    if (scores.length === 0) {
      this.add.text(centreX, 295, "none yet - be the first!", style).setOrigin(0.5);
    }
    scores.forEach((entry, index) => {
      const line = `${index + 1}.   ${String(entry.score).padStart(6, " ")}    level ${entry.level}`;
      this.add.text(centreX, 290 + index * 30, line, { ...style, fontFamily: "Courier New, monospace" })
        .setOrigin(0.5);
    });

    // CHALLENGE 5: B for a bomb
    this.add.text(centreX, 470, "LEFT / RIGHT move    SPACE fire    B bomb    M mute    ESC quit", {
      ...style, color: "#a8dadc",
    }).setOrigin(0.5);
    this.add.text(centreX, 530, "Press SPACE to start", { ...style, fontSize: "32px", color: "#ffd166" })
      .setOrigin(0.5);

    this.input.keyboard!.on("keydown-M", () => {
      this.sound.mute = !this.sound.mute;
    });
    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
  }
}
