import Phaser from "phaser";
import { HEART_KEY } from "../assets.ts";
import {
  BOMBS_CHANGED, BOSS_HEALTH_CHANGED, LEVEL_CHANGED, LIVES_CHANGED, SCORE_CHANGED, WEAPON_CHANGED,
} from "../events.ts";   // CHALLENGE 5: BOMBS_CHANGED
import { GAME_SCENE, HUD_SCENE } from "./keys.ts";

// HudScene - the score, lives, level, power-ups and the boss's health bar, drawn on top of the
// game by a scene of its own (Chapters 4 and 6)
//
// It never reads GameScene's fields. GameScene EMITS events when something changes, and this
// scene listens for them - so the HUD only redraws when there is something new to show.

export interface HudData {
  score: number;
  lives: number;
  level: number;
  bombs: number;               // CHALLENGE 5
}

const MAX_HEARTS = 5;
const BAR_WIDTH = 300;
const BAR_HEIGHT = 14;
const BAR_Y = 70;

export class HudScene extends Phaser.Scene {
  private startData!: HudData;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private bombsText!: Phaser.GameObjects.Text;     // CHALLENGE 5
  private hearts: Phaser.GameObjects.Image[] = [];
  private bossBar!: Phaser.GameObjects.Container;
  private bossBarFill!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(HUD_SCENE);
  }

  init(data: HudData): void {
    this.startData = data;
    this.hearts = [];
  }

  create(): void {
    const width = this.scale.width;
    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff" };

    this.scoreText = this.add.text(16, 12, "", style);
    this.levelText = this.add.text(width / 2, 12, "", style).setOrigin(0.5, 0);
    this.weaponText = this.add.text(16, 42, "", { ...style, fontSize: "18px", color: "#ffd166" });
    // CHALLENGE 5: bombs left, under the hearts
    this.bombsText = this.add.text(width - 16, 50, "", { ...style, fontSize: "18px", color: "#f4a261" })
      .setOrigin(1, 0);
    for (let i = 0; i < MAX_HEARTS; i++) {
      this.hearts.push(this.add.image(width - 24 - i * 36, 28, HEART_KEY));
    }

    // The boss's health bar: a label, a dark background and a red fill, in a Container so they can
    // be shown and hidden together. The fill's origin is its left end, so scaling it across
    // (scaleX 0.5 = half as wide) shrinks it towards the left.
    const barLeft = width / 2 - BAR_WIDTH / 2;
    this.bossBarFill = this.add.rectangle(barLeft, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 0xe63946).setOrigin(0, 0.5);
    this.bossBar = this.add.container(0, 0, [
      this.add.text(barLeft - 10, BAR_Y, "BOSS", { ...style, fontSize: "18px" }).setOrigin(1, 0.5),
      this.add.rectangle(width / 2, BAR_Y, BAR_WIDTH + 4, BAR_HEIGHT + 4, 0x1d3557),
      this.bossBarFill,
    ]);
    this.bossBar.setVisible(false);

    this.showScore(this.startData.score);
    this.showLives(this.startData.lives);
    this.showLevel(this.startData.level);
    this.showBombs(this.startData.bombs);   // CHALLENGE 5

    // Listen to GameScene's events. The same methods, with the same `this`, are passed to off()
    // when this scene shuts down: GameScene's emitter outlives the HUD, and would otherwise keep
    // calling methods of a HUD whose text objects have been destroyed (Chapter 4).
    const gameEvents = this.scene.get(GAME_SCENE).events;
    gameEvents.on(SCORE_CHANGED, this.showScore, this);
    gameEvents.on(LIVES_CHANGED, this.showLives, this);
    gameEvents.on(LEVEL_CHANGED, this.showLevel, this);
    gameEvents.on(WEAPON_CHANGED, this.showWeapon, this);
    gameEvents.on(BOSS_HEALTH_CHANGED, this.showBossHealth, this);
    gameEvents.on(BOMBS_CHANGED, this.showBombs, this);   // CHALLENGE 5

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off(SCORE_CHANGED, this.showScore, this);
      gameEvents.off(LIVES_CHANGED, this.showLives, this);
      gameEvents.off(LEVEL_CHANGED, this.showLevel, this);
      gameEvents.off(WEAPON_CHANGED, this.showWeapon, this);
      gameEvents.off(BOSS_HEALTH_CHANGED, this.showBossHealth, this);
      gameEvents.off(BOMBS_CHANGED, this.showBombs, this);   // CHALLENGE 5
    });
  }

  private showScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  private showLives(lives: number): void {
    this.hearts.forEach((heart, index) => {
      heart.setVisible(index < lives);
    });
  }

  private showLevel(level: number): void {
    this.levelText.setText(`Level ${level}`);
  }

  private showWeapon(description: string): void {
    this.weaponText.setText(description);
  }

  // CHALLENGE 5
  private showBombs(bombs: number): void {
    this.bombsText.setText(`BOMBS ${bombs}  (B)`);
  }

  private showBossHealth(health: number, maxHealth: number): void {
    this.bossBar.setVisible(health > 0);
    this.bossBarFill.setScale(Math.max(health, 0) / maxHealth, 1);
  }
}
