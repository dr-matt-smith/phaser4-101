import Phaser from "phaser";
import { PANEL_KEY } from "../assets.ts";
import { FADE_TIME, GAME_SCENE, MENU_SCENE, PAUSE_SCENE } from "./keys.ts";

// PauseScene - the pause menu, and the "game over" message, drawn over the paused game
//
// GameScene pauses itself and launches this. A paused scene is still DRAWN - it just is not
// updated - so the game stays on screen, frozen, behind the menu. The keys are read here,
// because a paused scene does not hear the keyboard.

// what GameScene hands the pause scene
export interface PauseData {
  gameOver: boolean;     // true: the round is over, so there is nothing to resume
  title: string;         // "Paused", "Time's up!", ...
  score: number;
}

export class PauseScene extends Phaser.Scene {
  private info!: PauseData;
  private leaving = false;     // CHALLENGE 5: true once a fade out has begun - ignore other keys

  constructor() {
    super(PAUSE_SCENE);
  }

  init(data: PauseData): void {
    this.info = data;
    this.leaving = false;      // CHALLENGE 5
  }

  create(): void {
    // Scenes are drawn in the order of the scene list. This one is last in the config anyway,
    // but bringToTop() makes sure it is drawn over everything else, whatever that order.
    this.scene.bringToTop();

    const centreX = this.scale.width / 2;
    const centreY = this.scale.height / 2;
    const style = { fontFamily: "Arial", fontSize: "26px", color: "#ffffff", align: "center" };

    // darken the whole game, then a panel in the middle
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0, 0);
    this.add.image(centreX, centreY, PANEL_KEY);

    this.add.text(centreX, centreY - 95, this.info.title, { ...style, fontSize: "48px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(centreX, centreY - 35, `Score: ${this.info.score}`, style).setOrigin(0.5);

    const choices = this.info.gameOver
      ? "R - play again\nQ - quit to the menu"
      : "P - carry on\nR - restart\nQ - quit to the menu";
    this.add.text(centreX, centreY + 55, choices, { ...style, fontSize: "24px", color: "#a8dadc", lineSpacing: 6 })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard!;
    if (!this.info.gameOver) {
      keyboard.once("keydown-P", () => {
        this.carryOn();
      });
      keyboard.once("keydown-ESC", () => {
        this.carryOn();
      });
    }
    keyboard.once("keydown-R", () => {
      // start() stops THIS scene and starts GameScene - which, being paused, is shut down and
      // started again from init()
      this.fadeOutThen(() => {             // CHALLENGE 5
        this.scene.start(GAME_SCENE);
      });
    });
    keyboard.once("keydown-Q", () => {
      this.fadeOutThen(() => {             // CHALLENGE 5
        this.scene.stop(GAME_SCENE);
        this.scene.start(MENU_SCENE);
      });
    });
  }

  // CHALLENGE 5: fade to black, then do `next`.
  //
  // It is THIS scene's camera that fades. GameScene is paused, and a paused scene's cameras are
  // not updated either - a fade started on its camera would never finish. A camera's fade covers
  // everything under it, so fading the top scene fades the whole screen.
  private fadeOutThen(next: () => void): void {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    this.cameras.main.fadeOut(FADE_TIME);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, next);
  }

  // resume the game, and take this scene away
  private carryOn(): void {
    if (this.leaving) {                    // CHALLENGE 5: too late to carry on
      return;
    }
    this.scene.resume(GAME_SCENE);
    this.scene.stop();
  }
}
