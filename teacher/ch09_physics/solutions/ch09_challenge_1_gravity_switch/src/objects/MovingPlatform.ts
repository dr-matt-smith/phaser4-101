import Phaser from "phaser";

// MovingPlatform - a platform that slides from side to side, and carries what lands on it
//
// It moves by its own velocity, but nothing that hits it can move it: it is IMMOVABLE. Gravity
// is switched off for it, or it would fall away. Its FRICTION decides how much of its movement
// it passes on to a body riding on top: 1 carries the rider along, 0 slides out from under it.

export const PLATFORM_KEY = "platform";
export const PLATFORM_FILE = "assets/images/platform.png";

const SPEED = 120;   // pixels per second

export class MovingPlatform extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLATFORM_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);            // collisions never push it

    // the Image has no setAllowGravity() - the body itself does. physics.add.existing() made a
    // dynamic body, but Phaser's types cannot know which kind, so `as` says so
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);        // it floats
    this.setVelocityX(SPEED);
    // turn round at the edges of the world: bounce 1 keeps all of its speed
    this.setCollideWorldBounds(true, 1, 1);
  }
}
