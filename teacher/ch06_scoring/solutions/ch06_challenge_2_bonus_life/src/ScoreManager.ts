import Phaser from "phaser";

// ScoreManager - the rules of scoring, and the numbers that go with them: score, lives, level,
// combo and multiplier
//
// It is a plain class - not a scene, not a game object. It knows nothing about text, pictures,
// sounds or the HUD. The game scene TELLS it what happened ("a coin was collected", "a coin got
// away"); it works out what that means for the score, and ANNOUNCES the results as events. Anyone
// who cares - the HUD, the game scene itself - listens.
//
// It extends Phaser's EventEmitter, the same class behind this.events, this.game.events and every
// game object's on(...) - so it gets on / once / off / emit for free.

// The events a ScoreManager sends, and what each one passes to its listeners.
export const SCORE_CHANGED = "score-changed";   // (score: number, added: number)
export const LIVES_CHANGED = "lives-changed";   // (lives: number)
export const COMBO_CHANGED = "combo-changed";   // (combo: number, multiplier: number)
export const LEVEL_CHANGED = "level-changed";   // (level: number)
export const GAME_OVER = "game-over";           // ()

const START_LIVES = 3;
const PICKUPS_PER_LEVEL = 10;   // level up after every 10 pickups
const COMBO_STEP = 5;           // the multiplier goes up by 1 for every 5 pickups in a row
const MAX_MULTIPLIER = 5;

export class ScoreManager extends Phaser.Events.EventEmitter {
  private score = 0;
  private lives = START_LIVES;
  private level = 1;
  private combo = 0;
  private bestCombo = 0;
  private pickups = 0;

  // A pickup worth `basePoints` was collected. Returns the points actually scored, after the
  // multiplier, so the game scene can show them.
  public collect(basePoints: number): number {
    if (this.isGameOver()) {
      return 0;
    }

    this.combo = this.combo + 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const points = basePoints * this.getMultiplier();
    this.score = this.score + points;
    this.pickups = this.pickups + 1;

    this.emit(SCORE_CHANGED, this.score, points);
    this.emit(COMBO_CHANGED, this.combo, this.getMultiplier());

    if (this.pickups % PICKUPS_PER_LEVEL === 0) {
      this.level = this.level + 1;
      this.emit(LEVEL_CHANGED, this.level);

      // CHALLENGE 2 - a new level gives back one lost life. The HUD already listens for
      // LIVES_CHANGED, so it fills a heart in again without being changed at all.
      if (this.lives < START_LIVES) {
        this.lives = this.lives + 1;
        this.emit(LIVES_CHANGED, this.lives);
      }
    }
    return points;
  }

  // A pickup got away: lose a life, and the combo with it.
  public loseLife(): void {
    if (this.isGameOver()) {
      return;
    }

    this.lives = this.lives - 1;
    this.emit(LIVES_CHANGED, this.lives);
    this.breakCombo();

    if (this.lives === 0) {
      this.emit(GAME_OVER);
    }
  }

  // A click that hit nothing: the combo is over, but it costs no life.
  public breakCombo(): void {
    if (this.combo === 0) {
      return;
    }
    this.combo = 0;
    this.emit(COMBO_CHANGED, this.combo, this.getMultiplier());
  }

  // 1 for the first 4 in a row, 2 from the 5th, 3 from the 10th ... never more than MAX_MULTIPLIER
  public getMultiplier(): number {
    return Math.min(1 + Math.floor(this.combo / COMBO_STEP), MAX_MULTIPLIER);
  }

  public getScore(): number {
    return this.score;
  }

  public getLives(): number {
    return this.lives;
  }

  public getLevel(): number {
    return this.level;
  }

  public getCombo(): number {
    return this.combo;
  }

  public getBestCombo(): number {
    return this.bestCombo;
  }

  public isGameOver(): boolean {
    return this.lives <= 0;
  }
}
