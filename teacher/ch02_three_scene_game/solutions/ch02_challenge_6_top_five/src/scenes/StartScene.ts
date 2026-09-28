import Phaser from "phaser";
import { BEST_TIMES, CLICK_FILE, CLICK_KEY, POP_FILE, POP_KEY, WIN_FILE, WIN_KEY } from "../assets.ts";
import { BALL_FILE, BALL_KEY } from "../objects/Ball.ts";
import { PLAY_SCENE, START_SCENE } from "./keys.ts";

// StartScene - the title screen: says what to do, shows the best time, and waits for SPACE
//
// It is the first scene to run, so it loads everything the game needs - pictures and sounds
// belong to the whole game once loaded.

const LOGO_KEY = "logo";
const LOGO_FILE = "assets/images/logo.png";

export class StartScene extends Phaser.Scene {
  constructor() {
    super(START_SCENE);
  }

  preload(): void {
    this.load.image(LOGO_KEY, LOGO_FILE);
    this.load.image(BALL_KEY, BALL_FILE);
    this.load.audio(POP_KEY, POP_FILE);
    this.load.audio(CLICK_KEY, CLICK_FILE);
    this.load.audio(WIN_KEY, WIN_FILE);
  }

  create(): void {
    const centreX = this.scale.width / 2;

    this.add.image(centreX, 110, LOGO_KEY);

    this.add.text(centreX, 230, "Click the ball 5 times - it gets faster every time.\nEvery miss costs you a second.", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    // CHALLENGE 6: the top five table, from the registry
    // - "?? []" means "or an empty array, if there is nothing there yet"
    const times: number[] = this.registry.get(BEST_TIMES) ?? [];
    let table = "BEST TIMES\n";
    if (times.length === 0) {
      table = table + "none yet";
    }
    times.forEach((time, index) => {
      table = table + `${index + 1}.  ${time.toFixed(2)} s\n`;
    });
    this.add.text(centreX, 395, table, {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#a8dadc",
      align: "center",
    }).setOrigin(0.5);

    this.add.text(centreX, 530, "Press SPACE to start", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(PLAY_SCENE);
    });
  }
}
