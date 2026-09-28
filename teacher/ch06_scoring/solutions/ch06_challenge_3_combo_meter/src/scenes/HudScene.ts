import Phaser from "phaser";
import { HEART_KEY } from "../assets.ts";
import {
  COMBO_CHANGED,
  COMBO_STEP,       // CHALLENGE 3
  LEVEL_CHANGED,
  LIVES_CHANGED,
  MAX_MULTIPLIER,   // CHALLENGE 3
  SCORE_CHANGED,
  ScoreManager,
} from "../ScoreManager.ts";
import { HUD_SCENE } from "./keys.ts";

// HudScene - the heads-up display: score, level, combo and lives, in a bar across the top
//
// It runs at the same time as the game scene, drawn on top of it (it comes later in the scene list
// in main.ts). It is given the game's ScoreManager when it is launched, and LISTENS to it: it only
// changes what it shows when the ScoreManager says something changed. It never changes the score.

// what the game scene hands over when it launches the HUD
export interface HudData {
  scoreManager: ScoreManager;
}

const BAR_HEIGHT = 70;
const COUNT_UP_TIME = 400;          // milliseconds for the score to count up to its new value
const SCORE_DIGITS = 6;             // 120 is shown as 000120
const MAX_LIVES_SHOWN = 3;
const LABEL_STYLE = { fontFamily: "Arial", fontSize: "14px", color: "#9aa4bd" };
const VALUE_STYLE = { fontFamily: "Arial", fontSize: "30px", fontStyle: "bold", color: "#ffffff" };
// CHALLENGE 3 - the combo meter's size and place (under the combo text)
const METER_X = 20;
const METER_Y = BAR_HEIGHT + 44;
const METER_WIDTH = 160;
const METER_HEIGHT = 8;

export class HudScene extends Phaser.Scene {
  private scoreManager!: ScoreManager;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];
  private meterFill!: Phaser.GameObjects.Rectangle;   // CHALLENGE 3

  // the score on screen, which counts up towards the real score, and the tween doing the counting
  private shownScore = 0;
  private countUp?: Phaser.Tweens.Tween;

  constructor() {
    super(HUD_SCENE);
  }

  init(data: HudData): void {
    this.scoreManager = data.scoreManager;
    this.shownScore = 0;
    this.hearts = [];
  }

  create(): void {
    this.add.rectangle(0, 0, this.scale.width, BAR_HEIGHT, 0x000000, 0.55).setOrigin(0);

    this.add.text(20, 8, "SCORE", LABEL_STYLE);
    this.scoreText = this.add.text(20, 24, "", VALUE_STYLE);

    this.add.text(400, 8, "LEVEL", LABEL_STYLE).setOrigin(0.5, 0);
    this.levelText = this.add.text(400, 24, "", VALUE_STYLE).setOrigin(0.5, 0);

    this.comboText = this.add.text(20, BAR_HEIGHT + 8, "", { ...VALUE_STYLE, fontSize: "22px", color: "#f4a261" });

    // CHALLENGE 3 - the meter: a dark background bar, and an orange bar in front of it that is
    // stretched across with scaleX (0 = empty, 1 = full). Origin (0, 0.5) makes it grow to the right.
    this.add.rectangle(METER_X, METER_Y, METER_WIDTH, METER_HEIGHT, 0x000000, 0.6).setOrigin(0, 0.5);
    this.meterFill = this.add.rectangle(METER_X, METER_Y, METER_WIDTH, METER_HEIGHT, 0xf4a261).setOrigin(0, 0.5);
    this.meterFill.scaleX = 0;

    for (let i = 0; i < MAX_LIVES_SHOWN; i++) {
      this.hearts.push(this.add.image(770 - i * 40, BAR_HEIGHT / 2, HEART_KEY));
    }

    // show how things stand now (the HUD starts a frame after the game - it may have missed news)
    this.showScore(this.scoreManager.getScore());
    this.showLevel(this.scoreManager.getLevel());
    this.showCombo(this.scoreManager.getCombo(), this.scoreManager.getMultiplier());
    this.showLives(this.scoreManager.getLives());

    // then keep up to date by listening
    this.scoreManager.on(SCORE_CHANGED, this.countUpTo, this);
    this.scoreManager.on(LEVEL_CHANGED, this.onLevelChanged, this);
    this.scoreManager.on(COMBO_CHANGED, this.showCombo, this);
    this.scoreManager.on(LIVES_CHANGED, this.showLives, this);

    // when the HUD stops, stop listening. The ScoreManager is not part of this scene, so nothing
    // else removes these listeners: if the HUD were restarted mid-game, it would hear everything twice
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scoreManager.off(SCORE_CHANGED, this.countUpTo, this);
      this.scoreManager.off(LEVEL_CHANGED, this.onLevelChanged, this);
      this.scoreManager.off(COMBO_CHANGED, this.showCombo, this);
      this.scoreManager.off(LIVES_CHANGED, this.showLives, this);
    });
  }

  // The score does not jump: a counter tween runs a number from the score on screen to the new
  // score, and each step of the tween shows the number it has reached.
  private countUpTo(score: number): void {
    this.countUp?.stop();   // a new score while still counting? start again from where it got to
    this.countUp = this.tweens.addCounter({
      from: this.shownScore,
      to: score,
      duration: COUNT_UP_TIME,
      ease: "Cubic.easeOut",
      onUpdate: (tween) => {
        // getValue() is number | null: null only if the tween has no value yet - so 0
        this.showScore(Math.round(tween.getValue() ?? 0));
      },
    });
  }

  private showScore(score: number): void {
    this.shownScore = score;
    this.scoreText.setText(String(score).padStart(SCORE_DIGITS, "0"));
  }

  private showLevel(level: number): void {
    this.levelText.setText(String(level));
  }

  private onLevelChanged(level: number): void {
    this.showLevel(level);

    // a big "LEVEL 2" in the middle of the screen, which grows and fades away
    const banner = this.add.text(400, 300, `LEVEL ${level}`, {
      ...VALUE_STYLE,
      fontSize: "72px",
      color: "#ffd166",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: banner,
      scale: 1.4,
      alpha: 0,
      delay: 400,
      duration: 700,
      onComplete: () => banner.destroy(),
    });
  }

  private showCombo(combo: number, multiplier: number): void {
    if (combo < 2) {
      this.comboText.setText("");
    } else if (multiplier > 1) {
      this.comboText.setText(`COMBO ${combo}   x${multiplier}`);
    } else {
      this.comboText.setText(`COMBO ${combo}`);
    }
    this.showMeter(combo, multiplier);   // CHALLENGE 3
  }

  // CHALLENGE 3 - how far the combo is towards the next multiplier
  private showMeter(combo: number, multiplier: number): void {
    this.tweens.killTweensOf(this.meterFill);

    if (multiplier >= MAX_MULTIPLIER) {
      this.meterFill.scaleX = 1;   // the top multiplier: nothing more to fill, so it stays full
      return;
    }

    const step = combo % COMBO_STEP;   // 0 to 4: pickups since the multiplier last went up
    if (combo > 0 && step === 0) {
      // the multiplier has just gone up: show the bar full for a moment, then empty it
      this.meterFill.scaleX = 1;
      this.tweens.add({ targets: this.meterFill, scaleX: 0, delay: 150, duration: 300 });
    } else {
      // a fifth for each pickup - or empty when the combo is broken (combo 0, step 0)
      this.tweens.add({ targets: this.meterFill, scaleX: step / COMBO_STEP, duration: 120 });
    }
  }

  // one heart for each life left; lost lives are shown as faded hearts
  private showLives(lives: number): void {
    this.hearts.forEach((heart, index) => {
      heart.setAlpha(index < lives ? 1 : 0.2);
    });
  }
}
