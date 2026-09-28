import Phaser from "phaser";
import { CLICK_KEY, STAR_KEY, WIN_KEY, WRONG_KEY } from "../assets.ts";   // CHALLENGE 2: WRONG_KEY
import { starsFor } from "../rating.ts";
import { GAME_SCENE, START_SCENE, WIN_SCENE } from "./keys.ts";

// WinScene - the result: a star rating, the moves and the time
//
// The stars are three images of the same picture. The ones earned pop in one after another; the
// rest are shown dim and grey, so the player can see what they missed.

export interface WinData {
  moves: number;
  seconds: number;
  pairs: number;
  pairsFound: number;    // CHALLENGE 2
  outOfTime: boolean;    // CHALLENGE 2: true if the clock ran out
}

const STAR_SCALE = 2.5;          // star.png is 32 x 32 - shown at 80 x 80
const STAR_SPACING = 110;
const UNEARNED_TINT = 0x555555;

export class WinScene extends Phaser.Scene {
  private result!: WinData;

  constructor() {
    super(WIN_SCENE);
  }

  init(data: WinData): void {
    this.result = data;
  }

  create(): void {
    this.sound.play(this.result.outOfTime ? WRONG_KEY : WIN_KEY);   // CHALLENGE 2

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "30px", color: "#ffffff" };
    // CHALLENGE 2: no stars if the time ran out
    const stars = this.result.outOfTime ? 0 : starsFor(this.result.moves, this.result.pairs);
    const heading = this.result.outOfTime ? "Out of time!" : "All pairs found!";

    this.add.text(centreX, 110, heading, { ...style, fontSize: "56px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(centreX + (i - 1) * STAR_SPACING, 240, STAR_KEY);
      if (i < stars) {
        // earned: grow from nothing, each a little later than the last
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: STAR_SCALE,
          duration: 400,
          delay: 300 + i * 250,
          ease: "Back.easeOut",
        });
      } else {
        star.setScale(STAR_SCALE).setTint(UNEARNED_TINT).setAlpha(0.4);
      }
    }

    this.add.text(centreX, 340, `Moves: ${this.result.moves}`, style).setOrigin(0.5);
    this.add.text(centreX, 385, `Time: ${this.result.seconds.toFixed(1)} seconds`, style).setOrigin(0.5);
    // CHALLENGE 2
    this.add.text(centreX, 430, `Pairs found: ${this.result.pairsFound} of ${this.result.pairs}`, style).setOrigin(0.5);

    this.add.text(centreX, 490, "Click to play again, ESC for the title screen", { ...style, fontSize: "24px", color: "#a8dadc" })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.sound.play(CLICK_KEY);
      this.scene.start(GAME_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(START_SCENE);
    });
  }
}
