import Phaser from "phaser";
import { BALL_KEY } from "../assets.ts";
import { EASING_SCENE, PLAYGROUND_SCENE } from "./keys.ts";

// EasingScene - the same tween, run with eight different eases, side by side
//
// Every ball goes from the left of its lane to the right in exactly the same time. The EASE
// decides how it gets there: steadily, speeding up, slowing down, overshooting, bouncing... Next
// to each name is the ease's curve: time goes across, distance travelled goes up.

// "In" eases start slowly, "Out" eases finish slowly, "InOut" do both
export type EaseVariant = "easeIn" | "easeOut" | "easeInOut";

export interface EasingData {
  variant: EaseVariant;
}

const FAMILIES = ["Linear", "Quad", "Cubic", "Sine", "Expo", "Back", "Elastic", "Bounce"];
const LANE_TOP = 95;
const LANE_HEIGHT = 58;
const TRACK_LEFT = 320;
const TRACK_RIGHT = 760;
const GRAPH_LEFT = 175;
const GRAPH_WIDTH = 90;
const GRAPH_HEIGHT = 40;
const DURATION = 2000;
const PAUSE = 700;              // at each end, before going back

export class EasingScene extends Phaser.Scene {
  private variant: EaseVariant = "easeOut";

  constructor() {
    super(EASING_SCENE);
  }

  // started from the playground with no data: data.variant is undefined, so use "easeOut"
  init(data: Partial<EasingData>): void {
    this.variant = data.variant ?? "easeOut";
  }

  create(): void {
    this.add.text(400, 22, `Easing - ${this.variant}`, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);
    this.add.text(400, 56, "1 easeIn    2 easeOut    3 easeInOut    SPACE again    ESC back", {
      fontFamily: "Arial",
      fontSize: "17px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    FAMILIES.forEach((family, i) => {
      const y = LANE_TOP + i * LANE_HEIGHT + LANE_HEIGHT / 2;
      // "Linear" has no In or Out - it is the same all the way
      const ease = family === "Linear" ? "Linear" : `${family}.${this.variant}`;

      this.add.text(20, y, ease, { fontFamily: "Arial", fontSize: "17px", color: "#ffffff" }).setOrigin(0, 0.5);
      this.drawCurve(ease, y);
      this.add.rectangle(TRACK_LEFT, y, TRACK_RIGHT - TRACK_LEFT, 2, 0x457b9d).setOrigin(0, 0.5);

      const ball = this.add.image(TRACK_LEFT, y, BALL_KEY).setScale(0.45);

      this.tweens.add({
        targets: ball,
        x: TRACK_RIGHT,
        duration: DURATION,
        ease: ease,
        hold: PAUSE,              // wait at the right...
        repeatDelay: PAUSE,       // ...and at the left
        yoyo: true,
        repeat: -1,
      });
    });

    const keyboard = this.input.keyboard!;
    keyboard.on("keydown-ONE", () => this.restartWith("easeIn"));
    keyboard.on("keydown-TWO", () => this.restartWith("easeOut"));
    keyboard.on("keydown-THREE", () => this.restartWith("easeInOut"));
    keyboard.on("keydown-SPACE", () => this.restartWith(this.variant));
    keyboard.once("keydown-ESC", () => this.scene.start(PLAYGROUND_SCENE));
  }

  private restartWith(variant: EaseVariant): void {
    const data: EasingData = { variant: variant };
    this.scene.restart(data);
  }

  // Plot the ease: an ease is a function from "how far through the time" (0 to 1) to "how far
  // along the way" (0 to 1 - though Back and Elastic go past the ends).
  private drawCurve(ease: string, centreY: number): void {
    // Phaser's types only say GetEaseFunction returns a Function; it is really this
    const easeFunction = Phaser.Tweens.Builders.GetEaseFunction(ease) as (t: number) => number;
    const bottom = centreY + GRAPH_HEIGHT / 2;

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x457b9d);
    graphics.strokeRect(GRAPH_LEFT, bottom - GRAPH_HEIGHT, GRAPH_WIDTH, GRAPH_HEIGHT);

    graphics.lineStyle(2, 0xf4a261);
    graphics.beginPath();
    for (let step = 0; step <= GRAPH_WIDTH; step++) {
      const t = step / GRAPH_WIDTH;
      const x = GRAPH_LEFT + step;
      const y = bottom - easeFunction(t) * GRAPH_HEIGHT;
      if (step === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.strokePath();
  }
}
