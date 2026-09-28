import Phaser from "phaser";
import { CLICK_KEY, POP_KEY } from "../assets.ts";
import { Ball, DECOY_KEY } from "../objects/Ball.ts";
import { PLAY_SCENE, START_SCENE, WIN_SCENE } from "./keys.ts";
import type { WinData } from "./WinScene.ts";

// PlayScene - click the ball HITS_TO_WIN times; it speeds up after every hit
//
// Clicking anywhere else is a miss, and every miss adds a time penalty.

const BALL_SPEED = 300;
const HITS_TO_WIN = 5;
const SPEED_UP = 1.2;          // 20% faster after every hit
const MISS_PENALTY = 1;        // seconds added for each miss
const DECOY_SPEED = 250;       // CHALLENGE 5
const DECOY_MISSES = 2;        // CHALLENGE 5: clicking the decoy counts as this many misses

export class PlayScene extends Phaser.Scene {
  private ball!: Ball;
  private startTime = 0;
  private hits = 0;
  private misses = 0;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super(PLAY_SCENE);
  }

  // Phaser makes ONE PlayScene, and starts that same object again for every round - so its fields
  // still hold the last round's numbers. init() runs every time the scene starts: put them back.
  init(): void {
    this.hits = 0;
    this.misses = 0;
  }

  create(): void {
    const angle = Phaser.Math.Angle.Random();
    this.ball = new Ball(this, 400, 300, Math.cos(angle) * BALL_SPEED, Math.sin(angle) * BALL_SPEED);
    this.ball.setInteractive({ useHandCursor: true });

    // a click ON the ball: a hit
    this.ball.on("pointerdown", () => {
      this.hit();
    });

    // CHALLENGE 5: the decoy - a blue ball, bouncing on its own
    // - it is interactive, so clicking it does NOT count as "missed everything" below; its own
    //   listener counts the misses instead
    const decoyAngle = Phaser.Math.Angle.Random();
    const decoy = new Ball(
      this,
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500),
      Math.cos(decoyAngle) * DECOY_SPEED,
      Math.sin(decoyAngle) * DECOY_SPEED,
      DECOY_KEY,
    );
    decoy.setInteractive({ useHandCursor: true });
    decoy.on("pointerdown", () => {
      for (let i = 0; i < DECOY_MISSES; i++) {
        this.miss();
      }
    });

    // a click ANYWHERE in the scene - Phaser also passes the list of interactive game objects
    // under the pointer, so an empty list means the click missed everything
    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (over.length === 0) {
        this.miss();
      }
    });

    // ESC gives up and goes back to the title screen
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(START_SCENE);
    });

    this.statusText = this.add.text(20, 20, "", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
    });

    this.startTime = this.time.now;
  }

  override update(time: number, _delta: number): void {
    const seconds = (time - this.startTime) / 1000;
    this.statusText.setText(
      `Hits: ${this.hits} / ${HITS_TO_WIN}    Misses: ${this.misses}    Time: ${seconds.toFixed(1)}`,
    );
  }

  private hit(): void {
    this.sound.play(POP_KEY);
    this.hits = this.hits + 1;

    if (this.hits >= HITS_TO_WIN) {
      this.win();
    } else {
      this.ball.speedUp(SPEED_UP);
      this.ball.teleport();
    }
  }

  private miss(): void {
    this.sound.play(CLICK_KEY);
    this.misses = this.misses + 1;
  }

  private win(): void {
    const data: WinData = {
      seconds: (this.time.now - this.startTime) / 1000,
      misses: this.misses,
      penalty: this.misses * MISS_PENALTY,
    };
    this.scene.start(WIN_SCENE, data);
  }
}
