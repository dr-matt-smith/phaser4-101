import Phaser from "phaser";

// Crate - a wooden box for Matter.js: a rectangle body the size of the picture, that rotates
//
// It extends Phaser.Physics.Matter.Image - an Image with a Matter body and all of Matter's
// setters. The last constructor argument is the body's settings, as an object literal.

export const CRATE_KEY = "crate";
export const CRATE_FILE = "assets/images/crate.png";

// CHALLENGE 5: when a crate counts as knocked down
const TIP_ANGLE = 30;        // degrees either way
const DROP = 24;             // pixels below where it started: half a crate

export class Crate extends Phaser.Physics.Matter.Image {
  // CHALLENGE 5: where the crate was built, to tell whether it has fallen
  private readonly startY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, CRATE_KEY, undefined, {
      friction: 0.6,        // wood on wood: grippy, so a stack stays up (0 = ice, 1 = rubber)
      restitution: 0.05,    // bounce: crates hardly bounce at all
    });
    scene.add.existing(this);
    this.startY = y;   // CHALLENGE 5
  }

  // CHALLENGE 5: tipped over, or fallen? Matter bodies rotate, so angle (in degrees, -180 to 180)
  // tells us how far over it has gone
  public get isDown(): boolean {
    return Math.abs(this.angle) > TIP_ANGLE || this.y > this.startY + DROP;
  }
}
