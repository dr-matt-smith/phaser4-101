import Phaser from "phaser";
import { Ball } from "../objects/Ball.ts";
import { PLAY_SCENE, WIN_SCENE } from "./keys.ts";
import type { WinData } from "./WinScene.ts";

// PlayScene - a ball bounces around; click it to win
//
// It times how long the player takes, and hands the time to WinScene.

// how fast the ball moves, in pixels per second
const BALL_SPEED = 380;

export class PlayScene extends Phaser.Scene {
  // when this round started, by the scene's clock, in milliseconds
  private startTime = 0;

  // the text showing the time so far
  private timeText!: Phaser.GameObjects.Text;

  constructor() {
    super(PLAY_SCENE);
  }

  create(): void {
    // the ball starts in the middle, heading off at a random angle
    // - Phaser.Math.Angle.Random() is an angle in radians; cos and sin split the speed into its
    //   across and down parts
    const angle = Phaser.Math.Angle.Random();
    const ball = new Ball(this, 400, 300, Math.cos(angle) * BALL_SPEED, Math.sin(angle) * BALL_SPEED);

    // make the ball INTERACTIVE, so the pointer (mouse or finger) can click it
    // - useHandCursor shows a pointing hand while the mouse is over it
    ball.setInteractive({ useHandCursor: true });

    // when the pointer goes down ON THE BALL, the player has won
    ball.on("pointerdown", () => {
      this.win();
    });

    this.timeText = this.add.text(20, 20, "Time: 0.0", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
    });

    // this.time is the scene's clock; now is the time in milliseconds
    this.startTime = this.time.now;
  }

  override update(time: number, _delta: number): void {
    const seconds = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${seconds.toFixed(1)}`);
  }

  private win(): void {
    const seconds = (this.time.now - this.startTime) / 1000;

    // start the win scene, and hand it the time
    // - the object is passed to WinScene's init()
    const data: WinData = { seconds: seconds };
    this.scene.start(WIN_SCENE, data);
  }
}
