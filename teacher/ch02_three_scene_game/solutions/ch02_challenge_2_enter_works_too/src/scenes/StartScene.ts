import Phaser from "phaser";
import { BALL_FILE, BALL_KEY } from "../objects/Ball.ts";
import { PLAY_SCENE, START_SCENE } from "./keys.ts";

// StartScene - the title screen: says what to do, and waits for SPACE
//
// It is the first scene to run, so it also LOADS everything the game needs. A loaded picture
// belongs to the whole game, not to the scene that loaded it - PlayScene can use "ball" too.

const LOGO_KEY = "logo";
const LOGO_FILE = "assets/images/logo.png";

export class StartScene extends Phaser.Scene {
  constructor() {
    super(START_SCENE);
  }

  preload(): void {
    this.load.image(LOGO_KEY, LOGO_FILE);
    this.load.image(BALL_KEY, BALL_FILE);
  }

  create(): void {
    const centreX = this.scale.width / 2;

    this.add.image(centreX, 170, LOGO_KEY);

    this.add.text(centreX, 330, "Click the bouncing ball as fast as you can", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(centreX, 420, "Press SPACE or ENTER to start", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#ffd166",
    }).setOrigin(0.5);

    // once() is on() that only happens the first time - SPACE starts the game once, not again
    // every time it is pressed
    // CHALLENGE 2: SPACE or ENTER - both call the same method
    // - both listeners are removed when this scene shuts down, so once the game has moved on,
    //   pressing the other key does nothing
    this.input.keyboard!.once("keydown-SPACE", () => {
      this.next();
    });
    this.input.keyboard!.once("keydown-ENTER", () => {
      this.next();
    });
  }

  // CHALLENGE 2: what SPACE and ENTER do
  private next(): void {
    this.scene.start(PLAY_SCENE);
  }
}
