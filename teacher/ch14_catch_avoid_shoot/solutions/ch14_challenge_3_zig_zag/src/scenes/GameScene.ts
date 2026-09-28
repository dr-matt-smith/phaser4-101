import Phaser from "phaser";
import {
  EXPLODE_ANIM, EXPLOSION_KEY, EXPLOSION_SOUND, HURT_SOUND, LOSE_SOUND, PARTICLE_KEY, SHOOT_SOUND, SPACE_KEY,
  STARS_FAR_KEY, STARS_NEAR_KEY,
} from "../assets.ts";
import { Bullet } from "../objects/Bullet.ts";
import { Enemy, ENEMY_POINTS } from "../objects/Enemy.ts";
import { PlayerShip } from "../objects/PlayerShip.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import type { GameOverData } from "./GameOverScene.ts";
import { GAME_OVER_SCENE, GAME_SCENE } from "./keys.ts";

// GameScene - the shooter itself: the ship, pools of bullets and enemies, waves, and explosions
//
// Enemies come in WAVES. Odd waves are a ROW that swoops in from the top and then creeps down the
// screen; even waves are a STREAM of ships, one after another, each dropping from above wherever
// the player is at that moment. When every ship in a wave has been shot down (or has flown off
// the bottom), the next wave starts - bigger and faster than the last.

const SHIP_Y = 550;
const MUZZLE_OFFSET = 28;          // bullets appear this far above the centre of the ship
const START_LIVES = 3;

const BULLET_POOL_SIZE = 12;       // at most this many bullets on screen at once
const ENEMY_POOL_SIZE = 30;

const FIRST_WAVE_SIZE = 5;
const MAX_WAVE_SIZE = 12;
const FIRST_WAVE_DELAY = 1000;     // milliseconds before wave 1
const WAVE_PAUSE = 1500;           // milliseconds between waves
const ROW_Y = 90;                  // where a row wave lines up
const ROW_ENTRY_TIME = 800;        // milliseconds for each ship's swoop into the row
const ROW_STAGGER = 120;           // milliseconds between one ship's swoop and the next
const ROW_SPEED = 60;              // pixels per second the row then creeps down
const STREAM_GAP = 550;            // milliseconds between ships in a stream
const STREAM_SPEED = 200;          // pixels per second
const SPEED_PER_WAVE = 12;         // every wave is this much faster than the one before
// CHALLENGE 3: zig-zag waves
const ZIGZAG_GAP = 450;            // milliseconds between ships
const ZIGZAG_SPEED = 110;          // pixels per second down the screen
const ZIGZAG_WIDTH = 120;          // pixels from one side of the zig-zag to the other, at first...
const ZIGZAG_WIDTH_PER_WAVE = 20;  // ...and this much wider every wave
const ZIGZAG_MAX_WIDTH = 360;
const ZIGZAG_TIME = 900;           // milliseconds to cross from one side to the other, at first...
const ZIGZAG_TIME_PER_WAVE = 50;   // ...and this much quicker every wave
const ZIGZAG_MIN_TIME = 450;
const SPAWN_Y = -40;               // just above the top of the screen
const GONE_Y = 650;                // just below the bottom
const EDGE = 60;                   // keep ships this far from the sides

const SPARK_COUNT = 16;

export class GameScene extends Phaser.Scene {
  private ship!: PlayerShip;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

  private score = 0;
  private lives = START_LIVES;
  private wave = 0;
  private enemiesLeft = 0;         // ships in this wave not yet shot down or flown away
  private gameOver = false;

  constructor() {
    super(GAME_SCENE);
  }

  init(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.wave = 0;
    this.enemiesLeft = 0;
    this.gameOver = false;
  }

  create(): void {
    this.add.image(400, 300, SPACE_KEY);
    new StarLayer(this, STARS_FAR_KEY, 30);
    new StarLayer(this, STARS_NEAR_KEY, 90);

    this.ship = new PlayerShip(this, 400, SHIP_Y);

    // POOLS: physics groups that make members of our own classes, up to maxSize of them. Asking a
    // pool for an object reuses a switched-off one if it can, and only makes a new one if it must.
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL_SIZE });
    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: ENEMY_POOL_SIZE });

    // one particle emitter for every explosion: it waits (emitting: false) until explode() is called
    this.sparks = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: { min: 60, max: 260 },
      lifespan: 500,
      scale: { start: 0.7, end: 0 },
      tint: [0xffd166, 0xf4a261, 0xe63946],
      blendMode: "ADD",
      emitting: false,
    });

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      this.bulletHitsEnemy(bullet as Bullet, enemy as Enemy);
    });

    // The fifth argument is a PROCESS callback: Phaser asks it first, and only calls the overlap
    // callback if it says true. While the ship is flashing, enemies pass straight through it.
    this.physics.add.overlap(this.ship, this.enemies, (_ship, enemy) => {
      this.enemyHitsShip(enemy as Enemy);
    }, () => {
      return !this.ship.isInvulnerable();
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const hudStyle = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff" };
    this.scoreText = this.add.text(16, 12, "", hudStyle);
    this.livesText = this.add.text(this.scale.width - 16, 12, "", hudStyle).setOrigin(1, 0);
    this.updateHud();

    this.time.delayedCall(FIRST_WAVE_DELAY, () => {
      this.startNextWave();
    });
  }

  override update(time: number): void {
    if (this.gameOver) {
      return;
    }

    if (this.cursors.left.isDown) {
      this.ship.move(-1);
    } else if (this.cursors.right.isDown) {
      this.ship.move(1);
    } else {
      this.ship.move(0);
    }

    // hold SPACE to keep firing - as fast as the ship's fire rate allows
    if (this.fireKey.isDown && this.ship.tryToFire(time)) {
      this.fire();
    }

    // enemies that got past: back to the pool
    for (const enemy of this.enemies.getMatching("active", true) as Enemy[]) {
      if (enemy.y > GONE_Y) {
        enemy.kill();
        this.enemyGone();
      }
    }
  }

  private fire(): void {
    // get() finds a switched-off bullet in the pool (or makes one, if the pool is not full yet).
    // It returns `any`, because a group can hold anything - we know ours holds Bullets. It returns
    // null when all BULLET_POOL_SIZE bullets are already on screen.
    const bullet = this.bullets.get() as Bullet | null;
    if (bullet === null) {
      return;
    }
    bullet.fire(this.ship.x, this.ship.y - MUZZLE_OFFSET);
    this.sound.play(SHOOT_SOUND, { volume: 0.4 });
  }

  private startNextWave(): void {
    this.wave = this.wave + 1;
    const size = Math.min(FIRST_WAVE_SIZE + this.wave - 1, MAX_WAVE_SIZE);
    const extraSpeed = (this.wave - 1) * SPEED_PER_WAVE;
    this.enemiesLeft = size;
    this.showBanner(`WAVE ${this.wave}`);

    // CHALLENGE 3: three patterns in turn - row, stream, zig-zag, row, ...
    const pattern = this.wave % 3;
    if (pattern === 1) {
      this.rowWave(size, ROW_SPEED + extraSpeed);
    } else if (pattern === 2) {
      this.streamWave(size, STREAM_SPEED + extraSpeed);
    } else {
      this.zigZagWave(size, ZIGZAG_SPEED + extraSpeed);
    }
  }

  // CHALLENGE 3: ships drop in one at a time, each at a random place, and sway as they come down.
  // The sway gets wider and quicker every wave (up to a limit), so the zig-zags grow wilder.
  private zigZagWave(size: number, speed: number): void {
    const width = Math.min(ZIGZAG_WIDTH + this.wave * ZIGZAG_WIDTH_PER_WAVE, ZIGZAG_MAX_WIDTH);
    const time = Math.max(ZIGZAG_TIME - this.wave * ZIGZAG_TIME_PER_WAVE, ZIGZAG_MIN_TIME);
    this.time.addEvent({
      delay: ZIGZAG_GAP,
      repeat: size - 1,
      callback: () => {
        // keep the whole sway on screen
        const x = Phaser.Math.Between(EDGE + width / 2, this.scale.width - EDGE - width / 2);
        const enemy = this.spawnEnemy(x, SPAWN_Y);
        if (enemy !== null) {
          enemy.setVelocityY(speed);
          enemy.zigZag(width, time);
        }
      },
    });
  }

  // A row: every ship starts above the screen and swoops down to its place in a line, one after
  // another (each tween has a longer delay). When a ship arrives, it starts creeping downwards.
  private rowWave(size: number, speed: number): void {
    const spacing = (this.scale.width - EDGE * 2) / (size - 1);
    for (let i = 0; i < size; i++) {
      const enemy = this.spawnEnemy(EDGE + i * spacing, SPAWN_Y);
      if (enemy === null) {
        continue;
      }
      this.tweens.add({
        targets: enemy,
        y: ROW_Y,
        duration: ROW_ENTRY_TIME,
        ease: "Back.easeOut",
        delay: i * ROW_STAGGER,
        onComplete: () => {
          enemy.setVelocityY(speed);
        },
      });
    }
  }

  // A stream: a timer drops one ship every STREAM_GAP milliseconds, above wherever the player is.
  // `repeat: size - 1` means the callback runs `size` times in all, then the timer ends by itself.
  private streamWave(size: number, speed: number): void {
    this.time.addEvent({
      delay: STREAM_GAP,
      repeat: size - 1,
      callback: () => {
        const x = Phaser.Math.Clamp(this.ship.x, EDGE, this.scale.width - EDGE);
        const enemy = this.spawnEnemy(x, SPAWN_Y);
        enemy?.setVelocityY(speed);
      },
    });
  }

  private spawnEnemy(x: number, y: number): Enemy | null {
    const enemy = this.enemies.get() as Enemy | null;
    if (enemy === null) {
      this.enemyGone();          // the pool is empty: count it as gone, so the wave can still end
      return null;
    }
    enemy.spawn(x, y);
    return enemy;
  }

  private bulletHitsEnemy(bullet: Bullet, enemy: Enemy): void {
    bullet.kill();
    this.explode(enemy.x, enemy.y);
    enemy.kill();
    this.score = this.score + ENEMY_POINTS;
    this.updateHud();
    this.enemyGone();
  }

  private enemyHitsShip(enemy: Enemy): void {
    this.explode(enemy.x, enemy.y);
    enemy.kill();
    this.enemyGone();

    this.lives = this.lives - 1;
    this.updateHud();
    this.sound.play(HURT_SOUND);
    this.cameras.main.shake(250, 0.015);

    if (this.lives <= 0) {
      this.endGame();
    } else {
      this.ship.makeInvulnerable();
    }
  }

  // one fewer enemy in this wave; when there are none left, the next wave comes after a pause
  private enemyGone(): void {
    this.enemiesLeft = this.enemiesLeft - 1;
    if (this.enemiesLeft === 0 && !this.gameOver) {
      this.time.delayedCall(WAVE_PAUSE, () => {
        this.startNextWave();
      });
    }
  }

  // An explosion is an animated sprite that destroys itself when its animation ends, plus a burst
  // of sparks. (Explosions are not pooled: there are only a few a second. See the chapter.)
  private explode(x: number, y: number): void {
    const boom = this.add.sprite(x, y, EXPLOSION_KEY).play(EXPLODE_ANIM);
    boom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      boom.destroy();
    });
    this.sparks.explode(SPARK_COUNT, x, y);
    this.sound.play(EXPLOSION_SOUND, { volume: 0.5 });
  }

  private endGame(): void {
    this.gameOver = true;
    this.explode(this.ship.x, this.ship.y);
    this.ship.disableBody(true, true);
    this.sound.play(LOSE_SOUND);

    this.time.delayedCall(1500, () => {
      const data: GameOverData = { score: this.score, wave: this.wave };
      this.scene.start(GAME_OVER_SCENE, data);
    });
  }

  // "WAVE 3" in the middle of the screen, fading away
  private showBanner(message: string): void {
    const banner = this.add.text(this.scale.width / 2, 260, message, {
      fontFamily: "Arial",
      fontSize: "56px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);
    this.tweens.add({
      targets: banner,
      alpha: 0,
      scale: 1.4,
      duration: 1200,
      delay: 400,
      onComplete: () => {
        banner.destroy();
      },
    });
  }

  private updateHud(): void {
    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText(`Lives: ${this.lives}`);
  }
}
