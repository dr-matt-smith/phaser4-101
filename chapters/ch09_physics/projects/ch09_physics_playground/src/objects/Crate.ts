import Phaser from "phaser";

// Crate - a square physics body, heavier than a ball
//
// A body's mass only matters when two moving bodies hit each other: Arcade shares the push
// between them by mass, so a ball barely moves a crate, and a crate knocks a ball flying.

export const CRATE_KEY = "crate";
export const CRATE_FILE = "assets/images/crate.png";

export class Crate extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, CRATE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}
