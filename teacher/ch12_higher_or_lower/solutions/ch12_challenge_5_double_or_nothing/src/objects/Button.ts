import Phaser from "phaser";
import { BUTTON_DOWN_KEY, BUTTON_KEY, BUTTON_OVER_KEY, CLICK_KEY } from "../assets.ts";

// Button - a clickable button: a picture with a label on it, that lights up when the pointer is
// over it, looks pressed while held down, and calls a function when clicked
//
// It is a Container: one game object that holds others (here an Image and a Text) and moves,
// scales and hides them together. The Image is the part that listens to the pointer.

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private enabled = true;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y);

    // positions inside a container are relative to the container: (0, 0) is its centre
    this.background = scene.add.image(0, 0, BUTTON_KEY);
    this.label = scene.add.text(0, -2, text, {
      fontFamily: "Arial",
      fontSize: "26px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5);
    this.add([this.background, this.label]);

    this.background.setInteractive({ useHandCursor: true });

    // three pictures for three states: normal, pointer over it, pressed
    this.background.on("pointerover", () => {
      this.background.setTexture(BUTTON_OVER_KEY);
    });
    this.background.on("pointerout", () => {
      this.background.setTexture(BUTTON_KEY);
    });
    this.background.on("pointerdown", () => {
      this.background.setTexture(BUTTON_DOWN_KEY);
    });
    // a click is a press AND a release on the button - so the player can change their mind by
    // sliding off before letting go
    this.background.on("pointerup", () => {
      this.background.setTexture(BUTTON_OVER_KEY);
      if (this.enabled) {
        scene.sound.play(CLICK_KEY);
        onClick();
      }
    });

    scene.add.existing(this);
  }

  public setText(text: string): void {
    this.label.setText(text);
  }

  // A disabled button is faded, and clicking it does nothing.
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.5);
  }
}
