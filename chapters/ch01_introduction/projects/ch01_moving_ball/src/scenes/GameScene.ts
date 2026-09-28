import Phaser from "phaser";
import { Ball, BALL_FILE, BALL_KEY } from "../objects/Ball.ts";

// GameScene - one ball, bouncing around the screen
//
// The scene makes the ball and then forgets about it: the ball moves itself (see Ball.ts). The
// scene's own update() just shows how fast the game is running.

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
    // a ball in the middle, moving right at 240 and down at 180 pixels a second
    new Ball(this, 400, 300, 240, 180);

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
