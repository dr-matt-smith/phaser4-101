import Phaser from "phaser";
import { COIN_SOUND_KEY, HURT_SOUND_KEY } from "../assets.ts";
import { Coin } from "../objects/Coin.ts";
import { Enemy } from "../objects/Enemy.ts";
import { Player } from "../objects/Player.ts";
import { LIVES_CHANGED, PAUSED_CHANGED, SCORE_CHANGED, TIME_CHANGED } from "./gameEvents.ts";
import type { HudData } from "./HudScene.ts";
import { GAME_SCENE, HUD_SCENE, PAUSE_SCENE } from "./keys.ts";
import type { PauseData, ResumeData } from "./PauseScene.ts";

// GameScene - the game itself: collect coins, dodge the triangles, before the time runs out
//
// It does not draw the score, lives or time. It LAUNCHES HudScene to run on top of it, and tells
// the HUD what has changed by emitting events. P or ESC pauses this scene and launches
// PauseScene on top; when the round ends, PauseScene is launched to show "game over".

const ROUND_TIME = 45000;       // milliseconds in a round
const LIVES = 3;
const COIN_EVERY = 900;         // a new coin every 0.9 seconds
const COIN_POINTS = 10;
const ENEMY_COUNT = 3;
const ENEMY_SPEED = 170;        // pixels per second
const COIN_REACH = 36;          // how close (centre to centre) the player must be to collect a coin
const ENEMY_REACH = 38;         // how close an enemy must be to hurt the player
const SAFE_TIME = 1500;         // milliseconds the player cannot be hurt again after a hit
const TOP = 70;                 // things are placed below the HUD bar

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private coins!: Phaser.GameObjects.Group;
  private roundTimer!: Phaser.Time.TimerEvent;

  private score = 0;
  private lives = LIVES;
  private safe = false;         // true for a moment after a hit
  private ended = false;        // true once the round is over
  private secondsShown = 0;     // the time left, in whole seconds, that the HUD was last told
  private timePaused = 0;       // CHALLENGE 3: milliseconds spent paused this round

  constructor() {
    super(GAME_SCENE);
  }

  // every round starts here - the same GameScene object is used for every round (Chapter 2)
  init(): void {
    this.score = 0;
    this.lives = LIVES;
    this.safe = false;
    this.ended = false;
    this.secondsShown = ROUND_TIME / 1000;
    this.enemies = [];
    this.timePaused = 0;          // CHALLENGE 3
  }

  create(): void {
    this.player = new Player(this, 400, 330);

    for (let i = 0; i < ENEMY_COUNT; i++) {
      // start along the top, heading off in a random downward direction
      const angle = Phaser.Math.FloatBetween(0.3, Math.PI - 0.3);
      this.enemies.push(new Enemy(this, 150 + i * 250, TOP + 30,
        Math.cos(angle) * ENEMY_SPEED, Math.sin(angle) * ENEMY_SPEED));
    }

    // A group is a list of game objects that notices when one is destroyed and drops it - so a
    // coin that fades away removes itself. (Groups come back in Chapter 8.)
    this.coins = this.add.group();

    // Timers belong to the scene's clock, which only runs while the scene is running: pause the
    // scene, and they wait. Stop it, and Phaser throws them away.
    this.time.addEvent({
      delay: COIN_EVERY,
      loop: true,
      callback: () => {
        this.spawnCoin();
      },
    });
    this.roundTimer = this.time.addEvent({
      delay: ROUND_TIME,
      callback: () => {
        this.endRound("Time's up!");
      },
    });

    // `on`, not `once`: this scene keeps running after a pause, and P must work every time
    this.input.keyboard!.on("keydown-P", () => {
      this.pauseGame();
    });
    this.input.keyboard!.on("keydown-ESC", () => {
      this.pauseGame();
    });

    // Run the HUD alongside this scene. launch() is queued: the HUD's create() runs after this
    // create() has finished - too late to hear any event emitted here - so it is handed its
    // starting values instead.
    const hudData: HudData = { score: this.score, lives: this.lives, seconds: this.secondsShown };
    this.scene.launch(HUD_SCENE, hudData);

    // CHALLENGE 3: hear about each resume, and the data PauseScene sends with it
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);

    // when this scene shuts down (restart, or quit to the menu), stop the HUD too - it belongs
    // with the game
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop(HUD_SCENE);

      // CHALLENGE 3: listeners on this.events outlive a shutdown - without this, every restart
      // would add another, and a pause would be counted twice, three times, ...
      this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    });
  }

  override update(): void {
    // collect any coin the player is touching (getChildren() is copied with [...] because
    // collecting a coin destroys it, which changes the group's list while we go through it)
    for (const child of [...this.coins.getChildren()]) {
      const coin = child as Coin;     // the group only ever holds Coins; its type cannot know that
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, coin.x, coin.y) < COIN_REACH) {
        this.collect(coin);
      }
    }

    for (const enemy of this.enemies) {
      if (!this.safe && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < ENEMY_REACH) {
        this.hurt();
      }
    }

    // tell the HUD when the whole number of seconds left changes - not every frame
    const secondsLeft = Math.ceil(this.roundTimer.getRemaining() / 1000);
    if (secondsLeft !== this.secondsShown) {
      this.secondsShown = secondsLeft;
      this.events.emit(TIME_CHANGED, secondsLeft);
    }
  }

  private spawnCoin(): void {
    const x = Phaser.Math.Between(40, this.scale.width - 40);
    const y = Phaser.Math.Between(TOP + 20, this.scale.height - 40);
    this.coins.add(new Coin(this, x, y));
  }

  private collect(coin: Coin): void {
    coin.destroy();
    this.sound.play(COIN_SOUND_KEY);
    this.score = this.score + COIN_POINTS;
    this.events.emit(SCORE_CHANGED, this.score);
  }

  private hurt(): void {
    this.sound.play(HURT_SOUND_KEY);
    this.lives = this.lives - 1;
    this.events.emit(LIVES_CHANGED, this.lives);

    this.safe = true;
    if (this.lives <= 0) {
      this.endRound("Out of lives!");
      return;
    }

    // Safe for SAFE_TIME milliseconds. A timer, not "remember this.time.now and compare": the
    // clock's time keeps moving while the scene is paused, so a pause would eat into the safe
    // time. A timer only counts while the scene runs.
    this.player.setAlpha(0.4);
    this.time.delayedCall(SAFE_TIME, () => {
      this.safe = false;
      this.player.setAlpha(1);
    });
  }

  private pauseGame(): void {
    const data: PauseData = { gameOver: false, title: "Paused", score: this.score };
    this.scene.launch(PAUSE_SCENE, data);
    this.scene.pause();
  }

  // CHALLENGE 3: the RESUME event's listener is given the scene's Systems, then the data
  private onResume(_sys: Phaser.Scenes.Systems, data: ResumeData): void {
    this.timePaused = this.timePaused + data.pausedFor;
    this.events.emit(PAUSED_CHANGED, this.timePaused / 1000);
  }

  private endRound(title: string): void {
    if (this.ended) {
      return;
    }
    this.ended = true;

    // Pause, rather than stop, so the last moment of the game stays on screen behind the message
    const data: PauseData = { gameOver: true, title: title, score: this.score };
    this.scene.launch(PAUSE_SCENE, data);
    this.scene.pause();
  }
}
