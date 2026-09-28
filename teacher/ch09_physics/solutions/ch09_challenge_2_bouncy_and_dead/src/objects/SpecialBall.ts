import Phaser from "phaser";
import { Ball } from "./Ball.ts";

// CHALLENGE 2: SpecialBall - a ball with its own bounce and mass, which the B key does not change
//
// It is still a Ball (it rolls, it has a circle body), so it extends Ball. The scene adds it to
// the physics group first - which resets its body - and then calls setUp() to give it its own
// bounce and mass.

export const BLUE_BALL_KEY = "ball_blue";
export const BLUE_BALL_FILE = "assets/images/ball_blue.png";

export class SpecialBall extends Ball {
  private readonly ownBounce: number;
  private readonly ownMass: number;

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, bounce: number, mass: number) {
    super(scene, x, y, key);
    this.ownBounce = bounce;
    this.ownMass = mass;
  }

  public setUp(): void {
    this.setBounce(this.ownBounce);
    this.setMass(this.ownMass);
  }
}
