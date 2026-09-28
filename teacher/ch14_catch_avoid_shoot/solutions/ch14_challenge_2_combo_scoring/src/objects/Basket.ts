import Phaser from "phaser";

// Basket - the player: a basket that slides left and right along the bottom of the screen
//
// It is an Arcade Physics image, so it has a BODY - that is what lets the scene ask "is this fruit
// touching the basket?" (Chapter 8). It only moves when the scene tells it to.

export const BASKET_KEY = "basket";
export const BASKET_FILE = "assets/images/basket.png";

const SPEED = 480;            // pixels per second

// the part of the picture that catches things: a strip across the top of the basket, so fruit
// that brushes the side does not count (the picture is 96 x 48)
const CATCH_WIDTH = 84;
const CATCH_HEIGHT = 16;
const CATCH_OFFSET_X = 6;
const CATCH_OFFSET_Y = 4;

export class Basket extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, BASKET_KEY);

    scene.add.existing(this);          // show it
    scene.physics.add.existing(this);  // give it a body

    this.setBodySize(CATCH_WIDTH, CATCH_HEIGHT, false);
    this.setOffset(CATCH_OFFSET_X, CATCH_OFFSET_Y);

    // the edges of the game stop the basket: no checks of our own needed
    this.setCollideWorldBounds(true);
  }

  // -1 = left, 0 = stop, 1 = right. Physics moves it at this velocity until told otherwise.
  public move(direction: number): void {
    this.setVelocityX(direction * SPEED);
  }
}
