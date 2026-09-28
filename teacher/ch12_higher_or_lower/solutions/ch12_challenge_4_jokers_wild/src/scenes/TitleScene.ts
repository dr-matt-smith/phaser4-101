import Phaser from "phaser";
import { CARDS_KEY, TABLE_KEY } from "../assets.ts";
import { Button } from "../objects/Button.ts";
import { GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// TitleScene - the name of the game, how to play, and a Play button

// a fan of four aces, as decoration: [frame, x, angle]
const FAN: [number, number, number][] = [[0, 310, -18], [13, 370, -6], [26, 430, 6], [39, 490, 18]];

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(TITLE_SCENE);
  }

  create(): void {
    this.add.image(400, 300, TABLE_KEY);

    for (const [frame, x, angle] of FAN) {
      this.add.image(x, 190, CARDS_KEY, frame).setAngle(angle).setScale(1.2);
    }

    const style = { fontFamily: "Arial", fontSize: "22px", color: "#ffffff", align: "center" };
    this.add.text(400, 55, "Higher or Lower", { ...style, fontSize: "52px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(400, 340, "Guess whether the next card is higher or lower.\nFive right in a row wins. One wrong and you are out.", style)
      .setOrigin(0.5);

    new Button(this, 400, 450, "PLAY", () => {
      this.scene.start(GAME_SCENE);
    });

    // CHALLENGE 4: tell the player about the jokers
    this.add.text(400, 545, "Aces are low. A tie does not count. Two jokers are wild: a joker is always right.", {
      ...style,
      fontSize: "18px",
      color: "#a8dadc",
    }).setOrigin(0.5);
  }
}
