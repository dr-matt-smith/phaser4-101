import Phaser from "phaser";
import { BUTTON_DOWN_KEY, BUTTON_KEY, BUTTON_OVER_KEY, CLICK_KEY } from "../assets.ts";

// Button - a picture with a label on it, which changes as the pointer moves over it and presses it
//
// It is a CONTAINER: a game object that holds other game objects (here an Image and a Text) and
// moves, scales and fades them together. Their positions are relative to the container, so
// (0, 0) is the middle of the button.

export class Button extends Phaser.GameObjects.Container {
  private readonly image: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y);

    this.image = new Phaser.GameObjects.Image(scene, 0, 0, BUTTON_KEY);
    this.label = new Phaser.GameObjects.Text(scene, 0, 0, text, {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#ffffff",
    }).setOrigin(0.5);
    this.add([this.image, this.label]);

    // the IMAGE is what the pointer hits - a container has no size of its own to click on
    this.image.setInteractive({ useHandCursor: true });
    this.image.on("pointerover", () => {
      this.image.setTexture(BUTTON_OVER_KEY);
    });
    this.image.on("pointerout", () => {
      this.image.setTexture(BUTTON_KEY);
    });
    this.image.on("pointerdown", () => {
      this.image.setTexture(BUTTON_DOWN_KEY);
    });
    this.image.on("pointerup", () => {
      this.image.setTexture(BUTTON_OVER_KEY);
      scene.sound.play(CLICK_KEY);
      onClick();
    });

    scene.add.existing(this);
  }

  public setLabel(text: string): this {
    this.label.setText(text);
    return this;
  }

  // a disabled button is faded, and ignores the pointer
  public setEnabled(enabled: boolean): this {
    this.setAlpha(enabled ? 1 : 0.4);
    if (enabled) {
      this.image.setInteractive({ useHandCursor: true });
    } else {
      this.image.disableInteractive();
      this.image.setTexture(BUTTON_KEY);
    }
    return this;
  }
}
