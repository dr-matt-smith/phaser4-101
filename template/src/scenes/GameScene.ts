import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create(): void {
    const text = this.add.text(400, 300, "Hello, Phaser 4!", {
      fontFamily: "Arial",
      fontSize: "40px",
      color: "#ffffff",
    });
    text.setOrigin(0.5);
  }
}
