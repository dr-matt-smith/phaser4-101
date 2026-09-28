import Phaser from "phaser";
import { BUTTON_DOWN_KEY, BUTTON_KEY, BUTTON_OVER_KEY } from "../assets.ts";

// Button - a clickable picture with a label, that looks different when hovered and pressed
//
// The button is an Image; its label is a separate Text on top of it. Whoever makes the button
// says what a click does, by passing a function.

const BUTTON_SCALE = 0.7;          // button.png is 220 x 64: a little smaller fits nine down the side

export class Button extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y, BUTTON_KEY);
    scene.add.existing(this);
    this.setScale(BUTTON_SCALE);

    scene.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.setInteractive({ useHandCursor: true });

    // swap the picture to show what the pointer is doing
    this.on("pointerover", () => this.setTexture(BUTTON_OVER_KEY));
    this.on("pointerout", () => this.setTexture(BUTTON_KEY));
    this.on("pointerup", () => this.setTexture(BUTTON_OVER_KEY));
    this.on("pointerdown", () => {
      this.setTexture(BUTTON_DOWN_KEY);
      onClick();
    });
  }
}
