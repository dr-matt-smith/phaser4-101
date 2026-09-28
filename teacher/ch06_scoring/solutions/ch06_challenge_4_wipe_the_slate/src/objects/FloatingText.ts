import Phaser from "phaser";

// FloatingText - a "+10" that drifts upwards, fades out, and removes itself
//
// Make one and forget it: the tween it starts moves it and fades it, and when the tween is
// finished the text destroys itself. Nothing else needs to keep track of it.

const RISE = 60;          // pixels it drifts up
const DURATION = 800;     // milliseconds before it has gone

export class FloatingText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, message: string, colour: string) {
    super(scene, x, y, message, {
      fontFamily: "Arial",
      fontSize: "26px",
      fontStyle: "bold",
      color: colour,
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.setOrigin(0.5);
    scene.add.existing(this);

    // two properties in one tween: it rises quickly at first then slows (Cubic.easeOut), and fades
    // slowly at first then quickly (Cubic.easeIn) - so it can be read before it goes
    scene.tweens.add({
      targets: this,
      y: y - RISE,
      alpha: { value: 0, ease: "Cubic.easeIn" },
      duration: DURATION,
      ease: "Cubic.easeOut",
      onComplete: () => this.destroy(),
    });
  }
}
