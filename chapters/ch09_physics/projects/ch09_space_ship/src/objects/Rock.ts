import Phaser from "phaser";

// Rock - an asteroid: drifts in a straight line, spins, and bounces off other rocks
//
// A PhysicsGroup resets the bodies added to it, so the scene adds the rock to its group first,
// and only then calls launch() to set it moving.

export const ROCK_KEY = "rock";
export const ROCK_FILE = "assets/images/rock.png";

const SCALE = 1.5;           // the picture is 48 x 48; drawn 72 x 72
const BODY_RADIUS = 21;      // in the picture's own pixels - the body is scaled with the picture
const MIN_SPEED = 40;        // pixels per second
const MAX_SPEED = 110;
const MAX_SPIN = 90;         // degrees per second, either way

export class Rock extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ROCK_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(SCALE);
    const offset = this.width / 2 - BODY_RADIUS;   // width is the picture's size, before scaling
    (this.body as Phaser.Physics.Arcade.Body).setCircle(BODY_RADIUS, offset, offset); // always dynamic
  }

  public launch(): void {
    // a random direction and speed, turned into an x and y velocity
    const angle = Phaser.Math.Between(0, 359);
    const speed = Phaser.Math.Between(MIN_SPEED, MAX_SPEED);
    this.scene.physics.velocityFromAngle(angle, speed, (this.body as Phaser.Physics.Arcade.Body).velocity);

    // spin: angular velocity turns the PICTURE. The body is a circle, so it does not matter
    this.setAngularVelocity(Phaser.Math.Between(-MAX_SPIN, MAX_SPIN));

    // rocks bounce off each other without losing any speed
    this.setBounce(1);
  }
}
