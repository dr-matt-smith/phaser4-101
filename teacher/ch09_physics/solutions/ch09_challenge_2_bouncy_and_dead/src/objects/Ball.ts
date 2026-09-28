import Phaser from "phaser";

// Ball - a round physics body that falls, bounces and rolls
//
// It extends Phaser.Physics.Arcade.Image: an Image with all of Arcade Physics' setters
// (setVelocity, setBounce, setDrag ...) built in. The body is made in the constructor.

export const BALL_KEY = "ball";
export const BALL_FILE = "assets/images/ball.png";

export class Ball extends Phaser.Physics.Arcade.Image {
  // CHALLENGE 2: which picture to use - the red ball unless told otherwise
  constructor(scene: Phaser.Scene, x: number, y: number, key: string = BALL_KEY) {
    super(scene, x, y, key);

    scene.add.existing(this);          // show it
    scene.physics.add.existing(this);  // give it a dynamic Arcade body

    // a circle body, the size of the picture (the picture is 64 x 64, so radius 32).
    // Without this the body would be a square, and balls would rest on their corners.
    this.setCircle(this.width / 2);
  }

  // Arcade bodies never rotate - but a ball that rolls should LOOK as if it turns. A ball of
  // radius r rolling at v pixels per second turns v / r radians per second.
  preUpdate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body; // physics.add.existing made a dynamic body
    const radius = this.width / 2;
    this.setAngularVelocity(Phaser.Math.RadToDeg(body.velocity.x / radius));
  }
}
