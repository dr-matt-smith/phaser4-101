import Phaser from "phaser";
import { PANEL_KEY } from "../assets.ts";
import { GAME_SCENE, MENU_SCENE, PAUSE_SCENE } from "./keys.ts";

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

// CHALLENGE 3: what the pause scene hands back to GameScene when it resumes it
export interface ResumeData {
  pausedFor: number;     // milliseconds
}

export class PauseScene extends Phaser.Scene {
  private info!: PauseData;
  private pausedFor = 0;                          // CHALLENGE 3: milliseconds, while this scene runs
  private awayText!: Phaser.GameObjects.Text;     // CHALLENGE 3

  constructor() {
    super(PAUSE_SCENE);
  }

  init(data: PauseData): void {
    this.info = data;
    this.pausedFor = 0;      // CHALLENGE 3: this scene object is reused for every pause
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

    // CHALLENGE 3: how long the game has been paused - only when there is a game to go back to
    this.awayText = this.add.text(centreX, centreY + 125, "", { ...style, fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setVisible(!this.info.gameOver);

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
      this.scene.start(GAME_SCENE);
    });
    keyboard.once("keydown-Q", () => {
      this.scene.stop(GAME_SCENE);
      this.scene.start(MENU_SCENE);
    });
  }

  // CHALLENGE 3: this scene is running while the game is paused, so its update() does the counting
  override update(_time: number, delta: number): void {
    this.pausedFor = this.pausedFor + delta;
    this.awayText.setText(`Paused for ${(this.pausedFor / 1000).toFixed(1)} s`);
  }

  // resume the game, and take this scene away
  private carryOn(): void {
    // CHALLENGE 3: resume() can hand data to the scene it resumes - it arrives with the RESUME event
    const data: ResumeData = { pausedFor: this.pausedFor };
    this.scene.resume(GAME_SCENE, data);
    this.scene.stop();
  }
}
