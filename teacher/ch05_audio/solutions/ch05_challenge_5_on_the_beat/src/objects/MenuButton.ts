import Phaser from "phaser";
import { BUTTON_KEY, BUTTON_OVER_KEY, CLICK_KEY } from "../assets.ts";

// MenuButton - a button with a label, that lights up under the pointer and clicks when pressed
//
// The scene says what the button does, by passing a function (`onClick`) for it to call.

export class MenuButton extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void) {
    super(scene, x, y, BUTTON_KEY);
    scene.add.existing(this);

    scene.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.setInteractive({ useHandCursor: true });
    this.on("pointerover", () => {
      this.setTexture(BUTTON_OVER_KEY);
    });
    this.on("pointerout", () => {
      this.setTexture(BUTTON_KEY);
    });
    this.on("pointerdown", () => {
      // fire and forget: the click carries on playing even though onClick() usually starts
      // another scene - sounds belong to the game, not to the scene that played them
      scene.sound.play(CLICK_KEY);
      onClick();
    });
  }
}
