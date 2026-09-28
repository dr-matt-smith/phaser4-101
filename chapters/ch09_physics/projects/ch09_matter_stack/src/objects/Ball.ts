import Phaser from "phaser";

// Ball - a bouncy ball for Matter.js
//
// Without `shape`, Matter would give the ball a rectangle body the size of the picture - and it
// would sit on a corner. { type: "circle", radius } makes it round.

export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball.png";

const RADIUS = 32;   // the picture is 64 x 64

export class Ball extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, BALL_KEY, undefined, {
      shape: { type: "circle", radius: RADIUS },
      restitution: 0.7,     // bouncy: keeps 70% of its speed after a hit
      friction: 0.05,
    });
    scene.add.existing(this);
  }
}
