import Phaser from "phaser";
import { PLAYER_KEY } from "../assets.ts";

// Player - the blue blob, moved with the arrow keys
//
// It moves itself in preUpdate(), which Phaser calls every frame - but only while the scene is
// RUNNING. Pause the scene and the player stops, with no code of ours needed.

const SPEED = 280;       // pixels per second
const TOP = 70;          // keep clear of the HUD bar at the top of the screen
const MARGIN = 24;       // half the blob's width, so it stays wholly on screen

export class Player extends Phaser.GameObjects.Image {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLAYER_KEY);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    scene.add.existing(this);
  }

  // (no `override`: Image has no preUpdate() of its own - see Chapter 1)
  preUpdate(_time: number, delta: number): void {
    const distance = SPEED * delta / 1000;

    if (this.cursors.left.isDown) {
      this.x = this.x - distance;
    } else if (this.cursors.right.isDown) {
      this.x = this.x + distance;
    }
    if (this.cursors.up.isDown) {
      this.y = this.y - distance;
    } else if (this.cursors.down.isDown) {
      this.y = this.y + distance;
    }

    this.x = Phaser.Math.Clamp(this.x, MARGIN, this.scene.scale.width - MARGIN);
    this.y = Phaser.Math.Clamp(this.y, TOP, this.scene.scale.height - MARGIN);
  }
}
