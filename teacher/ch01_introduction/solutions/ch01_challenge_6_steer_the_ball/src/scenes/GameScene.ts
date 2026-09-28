import Phaser from "phaser";
import { Ball, BALL_FILE, BALL_KEY } from "../objects/Ball.ts";

// GameScene - one ball, bouncing around the screen
//
// The scene makes the ball and then forgets about it: the ball moves itself (see Ball.ts). The
// scene's own update() just shows how fast the game is running.

// CHALLENGE 6: how quickly an arrow key speeds the ball up, in pixels a second, per second
const PUSH_STRENGTH = 400;

export class GameScene extends Phaser.Scene {
  // the text in the top left corner
  private info!: Phaser.GameObjects.Text;

  // CHALLENGE 6: the ball (so the scene can push it), the arrow keys, and a speed readout
  private ball!: Ball;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private speedText!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    this.load.image(BALL_KEY, BALL_FILE);
  }

  create(): void {
    // a ball in the middle, moving right at 240 and down at 180 pixels a second
    this.ball = new Ball(this, 400, 300, 240, 180);

    // CHALLENGE 6: the four arrow keys, as one object - cursors.left.isDown and so on
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.info = this.add.text(10, 10, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
    });

    this.speedText = this.add.text(10, 36, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffd166",
    });
  }

  // Phaser calls update() once every frame, after every game object's preUpdate()
  // - "override" because Phaser.Scene already has an (empty) update() that this replaces
  override update(time: number, delta: number): void {
    // CHALLENGE 6: every arrow held down pushes the ball its way. The push is PUSH_STRENGTH
    // pixels a second, every second - so this frame's share of it is PUSH_STRENGTH x seconds.
    // (These are POLLED keys: "is it down right now?", asked every frame, rather than events.)
    const push = PUSH_STRENGTH * (delta / 1000);
    let pushX = 0;
    let pushY = 0;
    if (this.cursors.left.isDown) pushX = pushX - push;
    if (this.cursors.right.isDown) pushX = pushX + push;
    if (this.cursors.up.isDown) pushY = pushY - push;
    if (this.cursors.down.isDown) pushY = pushY + push;
    this.ball.push(pushX, pushY);

    this.speedText.setText(`Speed: ${Math.round(this.ball.getSpeed())} pixels a second`);

    const seconds = Math.floor(time / 1000);
    const fps = Math.round(this.game.loop.actualFps);

    // a template string: `...${expression}...` puts values into the text
    this.info.setText(`Running for ${seconds}s   ${fps} frames a second   last frame ${delta.toFixed(1)}ms`);
  }
}
