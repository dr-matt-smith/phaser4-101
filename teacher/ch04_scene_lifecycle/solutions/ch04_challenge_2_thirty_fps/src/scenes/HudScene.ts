import Phaser from "phaser";
import { HEART_KEY } from "../assets.ts";
import { LIVES_CHANGED, SCORE_CHANGED, TIME_CHANGED } from "./gameEvents.ts";
import { GAME_SCENE, HUD_SCENE } from "./keys.ts";

// HudScene - the score, lives and time, drawn on top of the game
//
// A scene of its own, launched by GameScene to run alongside it. It has its own camera, so
// nothing the game does to its camera (shaking it, following the player) moves the HUD. It never
// looks inside GameScene: it listens for the events GameScene emits.

// what GameScene hands the HUD when it launches it
export interface HudData {
  score: number;
  lives: number;
  seconds: number;
}

const BAR_HEIGHT = 46;
const STYLE = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff" };

export class HudScene extends Phaser.Scene {
  private startValues!: HudData;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];
  private fpsText!: Phaser.GameObjects.Text;     // CHALLENGE 2
  private framesCounted = 0;                     // CHALLENGE 2: game frames since the last display
  private timeCounted = 0;                       // CHALLENGE 2: and the milliseconds they took

  constructor() {
    super(HUD_SCENE);
  }

  init(data: HudData): void {
    this.startValues = data;
    this.hearts = [];
    this.framesCounted = 0;       // CHALLENGE 2
    this.timeCounted = 0;
  }

  create(): void {
    this.add.rectangle(0, 0, this.scale.width, BAR_HEIGHT, 0x000000, 0.55).setOrigin(0, 0);

    this.scoreText = this.add.text(16, 10, "", STYLE);
    this.timeText = this.add.text(400, 10, "", STYLE).setOrigin(0.5, 0);
    this.add.text(this.scale.width - 16, 14, "P - pause", { ...STYLE, fontSize: "18px", color: "#a8dadc" })
      .setOrigin(1, 0);

    // CHALLENGE 2: the frame rate, in the bottom right corner
    this.fpsText = this.add.text(this.scale.width - 12, this.scale.height - 10, "", { ...STYLE, fontSize: "16px", color: "#a8dadc" })
      .setOrigin(1, 1);

    for (let i = 0; i < this.startValues.lives; i++) {
      this.hearts.push(this.add.image(560 + i * 36, BAR_HEIGHT / 2, HEART_KEY));
    }

    this.showScore(this.startValues.score);
    this.showTime(this.startValues.seconds);

    // Listen to GameScene's own emitter. That emitter belongs to GameScene, not to this scene,
    // so Phaser will not remove these listeners when the HUD shuts down - we must.
    const gameScene = this.scene.get(GAME_SCENE);
    gameScene.events.on(SCORE_CHANGED, this.showScore, this);
    gameScene.events.on(LIVES_CHANGED, this.showLives, this);
    gameScene.events.on(TIME_CHANGED, this.showTime, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameScene.events.off(SCORE_CHANGED, this.showScore, this);
      gameScene.events.off(LIVES_CHANGED, this.showLives, this);
      gameScene.events.off(TIME_CHANGED, this.showTime, this);
    });
  }

  // CHALLENGE 2: the HUD's update() runs once for every frame the game really runs - so count
  // them, and once a second show how many there were. (game.loop.actualFps counts the frames the
  // BROWSER offers, including the ones the fps limit skips - it stays at 60.)
  override update(_time: number, delta: number): void {
    this.framesCounted = this.framesCounted + 1;
    this.timeCounted = this.timeCounted + delta;

    if (this.timeCounted >= 1000) {
      const fps = this.framesCounted * 1000 / this.timeCounted;
      this.fpsText.setText(`fps: ${fps.toFixed(1)}   (browser: ${this.game.loop.actualFps.toFixed(1)})`);
      this.framesCounted = 0;
      this.timeCounted = 0;
    }
  }

  private showScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  private showTime(seconds: number): void {
    this.timeText.setText(`Time: ${seconds}`);
    this.timeText.setColor(seconds <= 10 ? "#e63946" : "#ffffff");
  }

  // one heart for each life left
  private showLives(lives: number): void {
    this.hearts.forEach((heart, index) => {
      heart.setVisible(index < lives);
    });
  }
}
