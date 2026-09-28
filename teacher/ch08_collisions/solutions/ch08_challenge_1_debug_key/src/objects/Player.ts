import Phaser from "phaser";
import { PLAYER_KEY } from "../assets.ts";

// Player - the blue blob, moved with the arrow keys
//
// It extends Phaser.Physics.Arcade.Image: an Image with the extra methods a physics object needs
// (setVelocity, setCollideWorldBounds, setSize, ...). Being that class does not give it a body
// by itself - the constructor asks the physics system for one.

const SPEED = 220;   // pixels per second

// player.png is 48 x 48, but the blob drawn in it is 36 x 34, starting 6 across and 10 down.
// The body should be the size of the blob, not of the picture.
const BODY_WIDTH = 36;
const BODY_HEIGHT = 34;
const BODY_OFFSET_X = 6;
const BODY_OFFSET_Y = 10;

export class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLAYER_KEY);

    scene.add.existing(this);           // show it: add it to the scene's display list
    scene.physics.add.existing(this);   // give it a dynamic physics body

    // the body starts as the size of the picture; shrink it to fit the blob, and move it to
    // where the blob is. The offset is measured from the picture's top-left corner.
    this.setSize(BODY_WIDTH, BODY_HEIGHT);
    this.setOffset(BODY_OFFSET_X, BODY_OFFSET_Y);

    // the physics world stops the body at the edges of the game
    this.setCollideWorldBounds(true);
  }

  // called by the scene every frame: set the velocity from the keys that are held down.
  // The physics engine does the moving - and stops the player at crates and edges.
  public move(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    let speedX = 0;
    let speedY = 0;
    if (cursors.left.isDown) {
      speedX = -SPEED;
    } else if (cursors.right.isDown) {
      speedX = SPEED;
    }
    if (cursors.up.isDown) {
      speedY = -SPEED;
    } else if (cursors.down.isDown) {
      speedY = SPEED;
    }
    this.setVelocity(speedX, speedY);
  }
}
