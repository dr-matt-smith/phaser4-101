import Phaser from "phaser";
import { COIN_SOUND_KEY, HURT_SOUND_KEY, LEVEL_SOUND_KEY, LOSE_SOUND_KEY } from "../assets.ts";
import { Coin, COIN_EXPIRED, GEM, GOLD_COIN } from "../objects/Coin.ts";
import { FloatingText } from "../objects/FloatingText.ts";
import { GAME_OVER, LEVEL_CHANGED, ScoreManager } from "../ScoreManager.ts";
import type { GameOverData } from "./GameOverScene.ts";
import type { HudData } from "./HudScene.ts";
import { GAME_OVER_SCENE, GAME_SCENE, HUD_SCENE } from "./keys.ts";

// GameScene - coins pop up and vanish; click them before they go
//
// This scene runs the game: it makes coins, notices clicks, and plays sounds. It does NOT keep the
// score or draw the HUD. It reports what happens to a ScoreManager, and the HUD - a separate scene,
// launched to run on top of this one - listens to the ScoreManager and shows the numbers.

const GEM_CHANCE = 0.12;           // 12% of pickups are gems
const FIRST_SPAWN_DELAY = 1000;    // milliseconds between pickups at level 1 ...
const SPAWN_DELAY_STEP = 90;       // ... this much less at each level ...
const MIN_SPAWN_DELAY = 350;       // ... but never less than this
const FIRST_LIFETIME = 2400;       // how long a coin stays at level 1 ...
const LIFETIME_STEP = 180;         // ... this much less at each level ...
const MIN_LIFETIME = 900;          // ... but never less than this
const GAME_OVER_PAUSE = 1200;      // time to take in the end, before the game over screen

// where pickups may appear: clear of the edges, and below the HUD's bar
const SPAWN_AREA = new Phaser.Geom.Rectangle(60, 130, 680, 430);

export class GameScene extends Phaser.Scene {
  private scoreManager!: ScoreManager;
  private spawnTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super(GAME_SCENE);
  }

  // A NEW ScoreManager for every game - so there is nothing to reset, and the last game's
  // listeners go with the last game's ScoreManager.
  init(): void {
    this.scoreManager = new ScoreManager();
  }

  create(): void {
    // the HUD runs at the same time, drawn on top; it is handed the ScoreManager to listen to
    const hudData: HudData = { scoreManager: this.scoreManager };
    this.scene.launch(HUD_SCENE, hudData);

    // this scene listens to the ScoreManager too - for the things that are its job
    this.scoreManager.on(LEVEL_CHANGED, () => this.sound.play(LEVEL_SOUND_KEY));
    this.scoreManager.once(GAME_OVER, () => this.endGame());

    // a click that hits no coin breaks the combo (the same "over" list as in Chapter 2)
    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (over.length === 0) {
        this.scoreManager.breakCombo();
      }
    });

    this.scheduleNextPickup();
  }

  // Wait, make a pickup, and schedule the next one. The delay is worked out afresh each time, so
  // pickups come faster as the level goes up.
  private scheduleNextPickup(): void {
    const level = this.scoreManager.getLevel();
    const delay = Math.max(MIN_SPAWN_DELAY, FIRST_SPAWN_DELAY - (level - 1) * SPAWN_DELAY_STEP);
    this.spawnTimer = this.time.delayedCall(delay, () => {
      this.spawnPickup();
      this.scheduleNextPickup();
    });
  }

  private spawnPickup(): void {
    const level = this.scoreManager.getLevel();
    const lifetime = Math.max(MIN_LIFETIME, FIRST_LIFETIME - (level - 1) * LIFETIME_STEP);
    const kind = Math.random() < GEM_CHANCE ? GEM : GOLD_COIN;
    const place = SPAWN_AREA.getRandomPoint();

    const coin = new Coin(this, place.x, place.y, kind, lifetime);
    coin.setInteractive({ useHandCursor: true });
    coin.on("pointerdown", () => this.collect(coin));
    coin.once(COIN_EXPIRED, () => this.coinGotAway());
  }

  private collect(coin: Coin): void {
    if (this.scoreManager.isGameOver()) {
      return;
    }
    coin.collect();
    this.sound.play(COIN_SOUND_KEY);

    // the ScoreManager applies the multiplier, and says how many points that was worth
    const points = this.scoreManager.collect(coin.points);
    const multiplier = this.scoreManager.getMultiplier();
    const message = multiplier > 1 ? `+${points}  x${multiplier}` : `+${points}`;
    const colour = multiplier > 1 ? "#f4a261" : "#ffd166";
    new FloatingText(this, coin.x, coin.y - 20, message, colour);
  }

  private coinGotAway(): void {
    if (this.scoreManager.isGameOver()) {
      return;
    }
    this.sound.play(HURT_SOUND_KEY);
    this.cameras.main.shake(150, 0.005);
    this.scoreManager.loseLife();
  }

  // The ScoreManager says the game is over: stop making coins, pause for a moment, then hand the
  // results to the game over scene.
  private endGame(): void {
    this.spawnTimer?.remove();
    this.sound.play(LOSE_SOUND_KEY);

    this.time.delayedCall(GAME_OVER_PAUSE, () => {
      const result: GameOverData = {
        score: this.scoreManager.getScore(),
        level: this.scoreManager.getLevel(),
        bestCombo: this.scoreManager.getBestCombo(),
      };
      this.scene.stop(HUD_SCENE);
      this.scene.start(GAME_OVER_SCENE, result);
    });
  }
}
