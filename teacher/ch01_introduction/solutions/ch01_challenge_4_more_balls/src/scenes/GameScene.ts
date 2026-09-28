import Phaser from "phaser";
import { Ball, BALL_FILE, BALL_KEY } from "../objects/Ball.ts";

// GameScene - one ball, bouncing around the screen
//
// The scene makes the ball and then forgets about it: the ball moves itself (see Ball.ts). The
// scene's own update() just shows how fast the game is running.

// CHALLENGE 4: how many balls, and the fastest any of them may go, in pixels a second
const BALL_COUNT = 5;
const MAX_SPEED = 300;

export class GameScene extends Phaser.Scene {
  // the text in the top left corner
  private info!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    this.load.image(BALL_KEY, BALL_FILE);
  }

  create(): void {
    // CHALLENGE 4: five balls, each somewhere random, going a random speed in a random direction
    // - a negative speed is just the other direction, so each speed is picked from -300 to 300
    // - the start position keeps the whole ball (radius 32) on the screen
    for (let i = 0; i < BALL_COUNT; i++) {
      const x = Phaser.Math.Between(32, this.scale.width - 32);
      const y = Phaser.Math.Between(32, this.scale.height - 32);
      const speedX = Phaser.Math.Between(-MAX_SPEED, MAX_SPEED);
      const speedY = Phaser.Math.Between(-MAX_SPEED, MAX_SPEED);
      new Ball(this, x, y, speedX, speedY);
    }

    this.info = this.add.text(10, 10, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
    });
  }

  // Phaser calls update() once every frame, after every game object's preUpdate()
  // - "override" because Phaser.Scene already has an (empty) update() that this replaces
  override update(time: number, delta: number): void {
    const seconds = Math.floor(time / 1000);
    const fps = Math.round(this.game.loop.actualFps);

    // a template string: `...${expression}...` puts values into the text
    this.info.setText(`Running for ${seconds}s   ${fps} frames a second   last frame ${delta.toFixed(1)}ms`);
  }
}
