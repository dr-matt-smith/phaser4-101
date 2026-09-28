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
//
// CHALLENGE 6: two players, each with their own ship, keys, score and lives. Everything that
// belongs to one player is kept together in a Player object, and the scene loops over the players.

const SHIP_Y = 550;
const MUZZLE_OFFSET = 28;          // bullets appear this far above the centre of the ship
const START_LIVES = 3;

const BULLET_POOL_SIZE = 24;       // CHALLENGE 6: two ships share one pool, so it is twice the size
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
const SPAWN_Y = -40;               // just above the top of the screen
const GONE_Y = 650;                // just below the bottom
const EDGE = 60;                   // keep ships this far from the sides

const SPARK_COUNT = 16;

// CHALLENGE 6: where each player starts, and player 2's colour
const PLAYER_1_X = 250;
const PLAYER_2_X = 550;
const PLAYER_2_TINT = 0x80ff80;

// CHALLENGE 6: everything that belongs to one player. The ship does not know its keys - the scene
// reads them and tells the ship what to do, exactly as it did with one player.
interface Player {
  name: string;
  ship: PlayerShip;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  fire: Phaser.Input.Keyboard.Key;
  score: number;
  lives: number;
  hudText: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private players: Player[] = [];  // CHALLENGE 6: replaces ship, cursors, fireKey, score, lives and the HUD texts
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;

  private wave = 0;
  private enemiesLeft = 0;         // ships in this wave not yet shot down or flown away
  private gameOver = false;

  constructor() {
    super(GAME_SCENE);
  }

  init(): void {
    this.players = [];             // CHALLENGE 6: made afresh in create()
    this.wave = 0;
    this.enemiesLeft = 0;
    this.gameOver = false;
  }

  create(): void {
    this.add.image(400, 300, SPACE_KEY);
    new StarLayer(this, STARS_FAR_KEY, 30);
    new StarLayer(this, STARS_NEAR_KEY, 90);

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

    // CHALLENGE 6: the two players
    const keyboard = this.input.keyboard!;
    const KeyCodes = Phaser.Input.Keyboard.KeyCodes;
    const hudStyle = { fontFamily: "Arial", fontSize: "22px", color: "#ffffff" };
    this.players.push({
      name: "Player 1",
      ship: new PlayerShip(this, PLAYER_1_X, SHIP_Y),
      left: keyboard.addKey(KeyCodes.LEFT),
      right: keyboard.addKey(KeyCodes.RIGHT),
      fire: keyboard.addKey(KeyCodes.SPACE),
      score: 0,
      lives: START_LIVES,
      hudText: this.add.text(16, 12, "", hudStyle),
    });
    this.players.push({
      name: "Player 2",
      ship: new PlayerShip(this, PLAYER_2_X, SHIP_Y).setTint(PLAYER_2_TINT),
      left: keyboard.addKey(KeyCodes.A),
      right: keyboard.addKey(KeyCodes.D),
      fire: keyboard.addKey(KeyCodes.W),
      score: 0,
      lives: START_LIVES,
      hudText: this.add.text(this.scale.width - 16, 12, "", { ...hudStyle, color: "#80ff80" }).setOrigin(1, 0),
    });

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      this.bulletHitsEnemy(bullet as Bullet, enemy as Enemy);
    });

    // The fifth argument is a PROCESS callback: Phaser asks it first, and only calls the overlap
    // callback if it says true. While the ship is flashing, enemies pass straight through it.
    // CHALLENGE 6: one overlap for each player's ship
    for (const player of this.players) {
      this.physics.add.overlap(player.ship, this.enemies, (_ship, enemy) => {
        this.enemyHitsShip(enemy as Enemy, player);
      }, () => {
        return !player.ship.isInvulnerable();
      });
    }

    this.updateHud();

    this.time.delayedCall(FIRST_WAVE_DELAY, () => {
      this.startNextWave();
    });
  }

  override update(time: number): void {
    if (this.gameOver) {
      return;
    }

    // CHALLENGE 6: the same controls code as before, once for each player still in the game
    for (const player of this.livingPlayers()) {
      if (player.left.isDown) {
        player.ship.move(-1);
      } else if (player.right.isDown) {
        player.ship.move(1);
      } else {
        player.ship.move(0);
      }

      // hold the fire key to keep firing - as fast as the ship's fire rate allows
      if (player.fire.isDown && player.ship.tryToFire(time)) {
        this.fire(player);
      }
    }

    // enemies that got past: back to the pool
    for (const enemy of this.enemies.getMatching("active", true) as Enemy[]) {
      if (enemy.y > GONE_Y) {
        enemy.kill();
        this.enemyGone();
      }
    }
  }

  // CHALLENGE 6: the players with lives left
  private livingPlayers(): Player[] {
    return this.players.filter((player) => player.lives > 0);
  }

  private fire(player: Player): void {
    // get() finds a switched-off bullet in the pool (or makes one, if the pool is not full yet).
    // It returns `any`, because a group can hold anything - we know ours holds Bullets. It returns
    // null when all BULLET_POOL_SIZE bullets are already on screen.
    const bullet = this.bullets.get() as Bullet | null;
    if (bullet === null) {
      return;
    }
    // CHALLENGE 6: the bullet remembers who fired it, so the right player scores
    bullet.fire(player.ship.x, player.ship.y - MUZZLE_OFFSET, this.players.indexOf(player));
    this.sound.play(SHOOT_SOUND, { volume: 0.4 });
  }

  private startNextWave(): void {
    this.wave = this.wave + 1;
    const size = Math.min(FIRST_WAVE_SIZE + this.wave - 1, MAX_WAVE_SIZE);
    const extraSpeed = (this.wave - 1) * SPEED_PER_WAVE;
    this.enemiesLeft = size;
    this.showBanner(`WAVE ${this.wave}`);

    if (this.wave % 2 === 1) {
      this.rowWave(size, ROW_SPEED + extraSpeed);
    } else {
      this.streamWave(size, STREAM_SPEED + extraSpeed);
    }
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

  // A stream: a timer drops one ship every STREAM_GAP milliseconds, above a player.
  // `repeat: size - 1` means the callback runs `size` times in all, then the timer ends by itself.
  // CHALLENGE 6: each ship aims at a player chosen at random from those still in the game
  private streamWave(size: number, speed: number): void {
    this.time.addEvent({
      delay: STREAM_GAP,
      repeat: size - 1,
      callback: () => {
        const living = this.livingPlayers();
        if (living.length === 0) {
          return;
        }
        const target: Player = Phaser.Utils.Array.GetRandom(living);
        const x = Phaser.Math.Clamp(target.ship.x, EDGE, this.scale.width - EDGE);
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
    const shooter = this.players[bullet.owner];   // CHALLENGE 6: read before kill(), to be clear
    bullet.kill();
    this.explode(enemy.x, enemy.y);
    enemy.kill();
    shooter.score = shooter.score + ENEMY_POINTS;  // CHALLENGE 6
    this.updateHud();
    this.enemyGone();
  }

  // CHALLENGE 6: which player was hit
  private enemyHitsShip(enemy: Enemy, player: Player): void {
    this.explode(enemy.x, enemy.y);
    enemy.kill();
    this.enemyGone();

    player.lives = player.lives - 1;
    this.updateHud();
    this.sound.play(HURT_SOUND);
    this.cameras.main.shake(250, 0.015);

    if (player.lives <= 0) {
      this.playerOut(player);
    } else {
      player.ship.makeInvulnerable();
    }
  }

  // CHALLENGE 6: a player with no lives disappears; when both are out, the game is over
  private playerOut(player: Player): void {
    this.explode(player.ship.x, player.ship.y);
    player.ship.disableBody(true, true);
    if (this.livingPlayers().length === 0) {
      this.endGame();
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
    this.sound.play(LOSE_SOUND);

    this.time.delayedCall(1500, () => {
      // CHALLENGE 6: both scores go to the game over scene
      const data: GameOverData = { scores: this.players.map((player) => player.score), wave: this.wave };
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

  // CHALLENGE 6: a line for each player; OUT when they have no lives left
  private updateHud(): void {
    for (const player of this.players) {
      const lives = player.lives > 0 ? `Lives: ${player.lives}` : "OUT";
      player.hudText.setText(`${player.name}  Score: ${player.score}  ${lives}`);
    }
  }
}
