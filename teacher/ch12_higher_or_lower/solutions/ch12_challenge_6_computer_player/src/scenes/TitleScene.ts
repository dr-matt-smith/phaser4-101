import Phaser from "phaser";
import { CARDS_KEY, TABLE_KEY } from "../assets.ts";
import { Button } from "../objects/Button.ts";
import { Records } from "../Records.ts";
import { GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// TitleScene - the name of the game, how to play, the records, and a Play button

// a fan of four aces, as decoration: [frame, x, angle]
const FAN: [number, number, number][] = [[0, 310, -18], [13, 370, -6], [26, 430, 6], [39, 490, 18]];
const FAN_Y = 175;

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(TITLE_SCENE);
  }

  create(): void {
    this.add.image(400, 300, TABLE_KEY);

    // the aces fan out from a pile, one after another: each tween waits a little longer (delay)
    FAN.forEach(([frame, x, angle], index) => {
      const ace = this.add.image(400, FAN_Y, CARDS_KEY, frame).setScale(1.1);
      this.tweens.add({ targets: ace, x: x, angle: angle, duration: 500, ease: "Back.easeOut", delay: index * 120 });
    });

    const style = { fontFamily: "Arial", fontSize: "20px", color: "#ffffff", align: "center" };
    this.add.text(400, 50, "Higher or Lower", { ...style, fontSize: "52px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(
      400,
      320,
      "Every right guess adds to your pot - more for a risky guess, more for a long run.\n" +
        "CASH OUT to bank the pot. A wrong guess loses the pot and a life.\n" +
        "Three lives, one deck. Aces are low; a tie does not count.",
      style,
    ).setOrigin(0.5);

    const records = new Records();
    this.add.text(400, 400, `Best score: ${records.bestScore}      Longest run: ${records.bestStreak}`, {
      ...style,
      fontSize: "22px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    new Button(this, 400, 490, "PLAY", () => {
      this.scene.start(GAME_SCENE);
    });
  }
}
