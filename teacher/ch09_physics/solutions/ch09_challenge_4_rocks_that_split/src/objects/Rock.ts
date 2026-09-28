import Phaser from "phaser";

// Rock - an asteroid: drifts in a straight line, spins, and bounces off other rocks
//
// A PhysicsGroup resets the bodies added to it, so the scene adds the rock to its group first,
// and only then calls launch() to set it moving.
//
// CHALLENGE 4: rocks come in three sizes. A big or medium rock splits in two when it is shot.

export const ROCK_KEY = "rock";
export const ROCK_FILE = "assets/images/rock.png";

// CHALLENGE 4: the three sizes. Smaller rocks are drawn smaller, move faster, weigh less, and
// are worth more
export const BIG = 3;
export const MEDIUM = 2;
export const SMALL = 1;
const SCALES = [0, 0.7, 1.1, 1.5];        // indexed by size (index 0 is not used)
const SPEED_UP = [0, 1.9, 1.4, 1];        // how much faster than a big rock
const POINTS = [0, 100, 50, 20];

const BODY_RADIUS = 21;      // in the picture's own pixels - the body is scaled with the picture
const MIN_SPEED = 40;        // pixels per second
const MAX_SPEED = 110;
const MAX_SPIN = 90;         // degrees per second, either way

export class Rock extends Phaser.Physics.Arcade.Image {
  public readonly size: number;   // CHALLENGE 4

  constructor(scene: Phaser.Scene, x: number, y: number, size: number = BIG) {
    super(scene, x, y, ROCK_KEY);
    this.size = size;             // CHALLENGE 4

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(SCALES[size]);  // CHALLENGE 4: the circle body below is scaled too
    const offset = this.width / 2 - BODY_RADIUS;   // width is the picture's size, before scaling
    (this.body as Phaser.Physics.Arcade.Body).setCircle(BODY_RADIUS, offset, offset); // always dynamic
  }

  // CHALLENGE 4: launch in a given direction (degrees), or a random one if none is given
  public launch(angle: number = Phaser.Math.Between(0, 359)): void {
    // a random speed, faster for smaller rocks, turned into an x and y velocity
    const speed = Phaser.Math.Between(MIN_SPEED, MAX_SPEED) * SPEED_UP[this.size];
    this.scene.physics.velocityFromAngle(angle, speed, (this.body as Phaser.Physics.Arcade.Body).velocity);

    // spin: angular velocity turns the PICTURE. The body is a circle, so it does not matter
    this.setAngularVelocity(Phaser.Math.Between(-MAX_SPIN, MAX_SPIN));

    // rocks bounce off each other without losing any speed
    this.setBounce(1);
    // CHALLENGE 4: now that rocks differ, mass matters: a small rock bounces off a big one
    this.setMass(this.size * this.size);
  }

  // CHALLENGE 4: the score for shooting this rock
  public get points(): number {
    return POINTS[this.size];
  }
}
