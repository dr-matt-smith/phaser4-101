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

  // CHALLENGE 1: new wording and colours below
  create(): void {
    const centreX = this.scale.width / 2;

    this.add.image(centreX, 170, LOGO_KEY);

    this.add.text(centreX, 330, "Catch the speedy blue ball!", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(centreX, 420, "Hit SPACE when you are ready", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#8ecae6",
    }).setOrigin(0.5);

    // once() is on() that only happens the first time - SPACE starts the game once, not again
    // every time it is pressed
    this.input.keyboard!.once("keydown-SPACE", () => {
      // stop this scene, and start the play scene
      this.scene.start(PLAY_SCENE);
    });
  }
}
