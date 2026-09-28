import Phaser from "phaser";

// Crate - a wooden box for Matter.js: a rectangle body the size of the picture, that rotates
//
// It extends Phaser.Physics.Matter.Image - an Image with a Matter body and all of Matter's
// setters. The last constructor argument is the body's settings, as an object literal.

export const CRATE_KEY = "crate";
export const CRATE_FILE = "assets/images/crate.png";

export class Crate extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, CRATE_KEY, undefined, {
      friction: 0.6,        // wood on wood: grippy, so a stack stays up (0 = ice, 1 = rubber)
      restitution: 0.05,    // bounce: crates hardly bounce at all
    });
    scene.add.existing(this);
  }
}
