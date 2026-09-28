import Phaser from "phaser";
import {
  EXPLODE_ANIM, EXPLOSION_KEY, EXPLOSION_SOUND, GAME_MUSIC, HIT_SOUND, HURT_SOUND, PARTICLE_KEY, POWERUP_SOUND,
  SHOOT_SOUND, SPACE_KEY, STARS_FAR_KEY, STARS_NEAR_KEY,
} from "../assets.ts";
import {
  BOMBS_CHANGED, BOSS_HEALTH_CHANGED, LEVEL_CHANGED, LIVES_CHANGED, SCORE_CHANGED, WEAPON_CHANGED,
} from "../events.ts";   // CHALLENGE 5: BOMBS_CHANGED
import { LEVELS } from "../levels.ts";
import { playMusic } from "../music.ts";
import { Boss } from "../objects/Boss.ts";
import { Bullet } from "../objects/Bullet.ts";
import { Enemy, ENEMY_POINTS } from "../objects/Enemy.ts";
import { EnemyBullet } from "../objects/EnemyBullet.ts";
import { PlayerShip } from "../objects/PlayerShip.ts";
import { PowerUp } from "../objects/PowerUp.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import { WaveSpawner } from "../WaveSpawner.ts";
import type { GameOverData } from "./GameOverScene.ts";
import type { HudData } from "./HudScene.ts";
import { GAME_OVER_SCENE, GAME_SCENE, HUD_SCENE, MENU_SCENE } from "./keys.ts";

// GameScene - the advanced shooter: levels of waves, each ending with a boss; enemies that shoot
// back; power-ups; and a HUD scene kept up to date with events
//
// A level is a list of waves (see levels.ts). The scene sends each wave in with the WaveSpawner,
// counts its ships down to zero, sends the next - and after the last wave, the boss. Destroy the
// boss and the next level starts; destroy the last boss and the player has won.

const SHIP_Y = 550;
const MUZZLE_OFFSET = 28;
const START_LIVES = 3;
const MAX_LIVES = 5;
const SPREAD_ANGLE = 12;             // degrees either side of straight up

const BULLET_POOL_SIZE = 30;
const ENEMY_POOL_SIZE = 30;
const ENEMY_BULLET_POOL_SIZE = 40;

const LEVEL_START_DELAY = 2000;      // milliseconds from the "LEVEL n" banner to the first wave
const WAVE_PAUSE = 1500;
const LEVEL_END_DELAY = 3000;        // milliseconds after a boss explodes
const GONE_Y = 650;
const GONE_MARGIN = 60;              // how far past the left or right edge counts as gone

const ENEMY_FIRE_TICK = 400;         // every this many ms, one enemy MIGHT fire
const ENEMY_FIRE_MAX_Y = 380;        // enemies lower than this do not fire (too close to be fair)
const ENEMY_BULLET_SPEED = 260;
const BOSS_BULLET_SPEED = 220;
const BOSS_FAN = [-30, -15, 0, 15, 30];   // the boss fires five bullets, fanned out (degrees)
const BOSS_MUZZLE_OFFSET = 40;

const POWERUP_CHANCE = 0.15;         // chance that a destroyed enemy drops a power-up
const POWERUP_FALL_SPEED = 120;

const BOSS_POINTS = 2000;            // times the level number
const SPARK_COUNT = 16;
const BOSS_EXPLOSIONS = 8;
const START_BOMBS = 3;               // CHALLENGE 5
const BOMB_BOSS_DAMAGE = 10;         // CHALLENGE 5: health a bomb takes off the boss
const BOMB_FLASH_TIME = 400;         // CHALLENGE 5

// what the scene is doing - which decides what happens when the last enemy of a wave goes
type Phase = "waves" | "between" | "boss" | "over";

export class GameScene extends Phaser.Scene {
  private ship!: PlayerShip;
  private boss!: Boss;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private spawner!: WaveSpawner;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey!: Phaser.Input.Keyboard.Key;

  private score = 0;
  private lives = START_LIVES;
  private levelIndex = 0;            // 0 = level 1: an index into LEVELS
  private waveIndex = 0;             // which of this level's waves is running
  private enemiesLeft = 0;
  private phase: Phase = "between";
  private weaponDescription = "";    // what the HUD was last told about power-ups
  private bossFireTimer: Phaser.Time.TimerEvent | null = null;
  private bombs = START_BOMBS;       // CHALLENGE 5

  constructor() {
    super(GAME_SCENE);
  }

  init(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.levelIndex = 0;
    this.waveIndex = 0;
    this.enemiesLeft = 0;
    this.phase = "between";
    this.weaponDescription = "";
    this.bossFireTimer = null;
    this.bombs = START_BOMBS;        // CHALLENGE 5
  }

  create(): void {
    this.add.image(400, 300, SPACE_KEY);
    new StarLayer(this, STARS_FAR_KEY, 30);
    new StarLayer(this, STARS_NEAR_KEY, 90);

    this.ship = new PlayerShip(this, 400, SHIP_Y);
    this.boss = new Boss(this);

    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL_SIZE });
    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: ENEMY_POOL_SIZE });
    this.enemyBullets = this.physics.add.group({ classType: EnemyBullet, maxSize: ENEMY_BULLET_POOL_SIZE });
    // not a pool: every power-up added gets a body, moving down at POWERUP_FALL_SPEED
    this.powerUps = this.physics.add.group({ velocityY: POWERUP_FALL_SPEED });

    this.spawner = new WaveSpawner(this, this.enemies, this.ship, () => {
      this.enemyGone();
    });

    this.sparks = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: { min: 60, max: 260 },
      lifespan: 500,
      scale: { start: 0.7, end: 0 },
      tint: [0xffd166, 0xf4a261, 0xe63946],
      blendMode: "ADD",
      emitting: false,
    });

    this.addOverlaps();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard!.on("keydown-M", () => {
      this.sound.mute = !this.sound.mute;
    });
    // CHALLENGE 5: B lets off a smart bomb
    this.input.keyboard!.on("keydown-B", () => {
      this.useBomb();
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.stop(HUD_SCENE);
      this.scene.start(MENU_SCENE);
    });

    // every ENEMY_FIRE_TICK ms, perhaps one enemy fires (see enemyFires)
    this.time.addEvent({
      delay: ENEMY_FIRE_TICK,
      loop: true,
      callback: () => {
        this.enemyFires();
      },
    });

    // the HUD runs on top of this scene, starting from these values
    const hudData: HudData = { score: this.score, lives: this.lives, level: 1, bombs: this.bombs };   // CHALLENGE 5: bombs
    this.scene.launch(HUD_SCENE, hudData);

    playMusic(this, GAME_MUSIC);
    this.startLevel(0);
  }

  // Everything that can touch everything else. The process callbacks (the last function in some
  // of these) say "only if the ship can be hurt right now".
  private addOverlaps(): void {
    const canHurtShip = (): boolean => {
      return !this.ship.isInvulnerable() && this.phase !== "over";
    };

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      this.bulletHitsEnemy(bullet as Bullet, enemy as Enemy);
    });
    // the boss first, so the callback is given (boss, bullet) in that order
    this.physics.add.overlap(this.boss, this.bullets, (_boss, bullet) => {
      this.bulletHitsBoss(bullet as Bullet);
    });
    this.physics.add.overlap(this.ship, this.enemies, (_ship, enemy) => {
      this.enemyCrashes(enemy as Enemy);
    }, canHurtShip);
    this.physics.add.overlap(this.ship, this.enemyBullets, (_ship, bullet) => {
      (bullet as EnemyBullet).kill();
      this.shipHit();
    }, canHurtShip);
    this.physics.add.overlap(this.ship, this.powerUps, (_ship, powerUp) => {
      this.collect(powerUp as PowerUp);
    });
  }

  override update(time: number): void {
    if (this.phase === "over") {
      return;
    }

    if (this.cursors.left.isDown) {
      this.ship.move(-1);
    } else if (this.cursors.right.isDown) {
      this.ship.move(1);
    } else {
      this.ship.move(0);
    }

    if (this.fireKey.isDown && this.ship.tryToFire(time)) {
      this.fire(time);
    }

    const width = this.scale.width;
    for (const enemy of this.enemies.getMatching("active", true) as Enemy[]) {
      if (enemy.y > GONE_Y || enemy.x < -GONE_MARGIN || enemy.x > width + GONE_MARGIN) {
        enemy.kill();
        this.enemyGone();
      }
    }
    for (const powerUp of this.powerUps.getChildren() as PowerUp[]) {
      if (powerUp.y > GONE_Y) {
        powerUp.destroy();
      }
    }

    // tell the HUD about power-ups only when what it shows would change (about once a second)
    const description = this.ship.describeWeapon(time);
    if (description !== this.weaponDescription) {
      this.weaponDescription = description;
      this.events.emit(WEAPON_CHANGED, description);
    }
  }

  // one bullet - or three, fanned out, with the spread power-up
  private fire(time: number): void {
    const angles = this.ship.hasSpread(time) ? [-SPREAD_ANGLE, 0, SPREAD_ANGLE] : [0];
    for (const angle of angles) {
      const bullet = this.bullets.get() as Bullet | null;
      if (bullet === null) {
        break;
      }
      bullet.fire(this.ship.x, this.ship.y - MUZZLE_OFFSET, angle);
    }
    this.sound.play(SHOOT_SOUND, { volume: 0.3 });
  }

  // ---- levels, waves and the boss ----

  private startLevel(index: number): void {
    this.levelIndex = index;
    this.waveIndex = -1;             // nextWave() adds one, making it 0: the first wave
    this.phase = "between";
    this.events.emit(LEVEL_CHANGED, index + 1);
    this.showBanner(`LEVEL ${index + 1}`);
    this.time.delayedCall(LEVEL_START_DELAY, () => {
      this.nextWave();
    });
  }

  private nextWave(): void {
    const level = LEVELS[this.levelIndex];
    this.waveIndex = this.waveIndex + 1;
    if (this.waveIndex >= level.waves.length) {
      this.startBoss();
      return;
    }
    const wave = level.waves[this.waveIndex];
    this.phase = "waves";
    this.enemiesLeft = wave.size;
    this.spawner.start(wave);
  }

  private enemyGone(): void {
    this.enemiesLeft = this.enemiesLeft - 1;
    if (this.enemiesLeft === 0 && this.phase === "waves") {
      this.phase = "between";
      this.time.delayedCall(WAVE_PAUSE, () => {
        this.nextWave();
      });
    }
  }

  private startBoss(): void {
    const level = LEVELS[this.levelIndex];
    this.phase = "boss";
    this.showBanner("BOSS!");
    this.boss.appear(level.bossHealth, level.bossSweepTime);
    this.events.emit(BOSS_HEALTH_CHANGED, level.bossHealth, level.bossHealth);
    this.bossFireTimer = this.time.addEvent({
      delay: level.bossFireDelay,
      loop: true,
      callback: () => {
        this.bossFires();
      },
    });
  }

  private bossFires(): void {
    for (const angle of BOSS_FAN) {
      const bullet = this.enemyBullets.get() as EnemyBullet | null;
      if (bullet === null) {
        return;
      }
      // 90 degrees is straight down
      bullet.fire(this.boss.x, this.boss.y + BOSS_MUZZLE_OFFSET, Phaser.Math.DegToRad(90 + angle), BOSS_BULLET_SPEED);
    }
  }

  private bulletHitsBoss(bullet: Bullet): void {
    bullet.kill();
    this.sparks.explode(4, bullet.x, bullet.y);
    this.sound.play(HIT_SOUND, { volume: 0.4 });

    const destroyed = this.boss.damage();
    this.events.emit(BOSS_HEALTH_CHANGED, this.boss.getHealth(), this.boss.getMaxHealth());
    if (destroyed) {
      this.bossDestroyed();
    }
  }

  private bossDestroyed(): void {
    const { x, y } = this.boss;
    this.boss.kill();
    this.bossFireTimer?.remove();
    this.phase = "between";

    // a chain of explosions over the boss, one after another
    for (let i = 0; i < BOSS_EXPLOSIONS; i++) {
      this.time.delayedCall(i * 150, () => {
        this.explode(x + Phaser.Math.Between(-60, 60), y + Phaser.Math.Between(-40, 40));
      });
    }
    // clear the boss's bullets off the screen - the fight is over
    for (const bullet of this.enemyBullets.getMatching("active", true) as EnemyBullet[]) {
      bullet.kill();
    }

    this.addScore(BOSS_POINTS * (this.levelIndex + 1));

    const lastLevel = this.levelIndex === LEVELS.length - 1;
    this.time.delayedCall(LEVEL_END_DELAY, () => {
      if (lastLevel) {
        this.endGame(true);
      } else {
        this.startLevel(this.levelIndex + 1);
      }
    });
    if (!lastLevel) {
      this.showBanner("LEVEL COMPLETE");
    }
  }

  // Now and then, a random enemy that is on screen (and not too low) fires straight at the ship.
  private enemyFires(): void {
    if (this.phase !== "waves") {
      return;
    }
    if (Math.random() >= LEVELS[this.levelIndex].enemyFireChance) {
      return;
    }
    const width = this.scale.width;
    const shooters = (this.enemies.getMatching("active", true) as Enemy[]).filter((enemy) =>
      enemy.y > 0 && enemy.y < ENEMY_FIRE_MAX_Y && enemy.x > 0 && enemy.x < width
    );
    if (shooters.length === 0) {
      return;
    }
    const shooter: Enemy = Phaser.Utils.Array.GetRandom(shooters);
    const bullet = this.enemyBullets.get() as EnemyBullet | null;
    if (bullet === null) {
      return;
    }
    const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, this.ship.x, this.ship.y);
    bullet.fire(shooter.x, shooter.y, angle, ENEMY_BULLET_SPEED);
  }

  // CHALLENGE 5: the smart bomb.
  // Only enemies that are really ON SCREEN explode: getMatching("active", true) also finds ships
  // that are waiting just off the edge to start a swoop or a row. Each one is destroyed the normal
  // way - kill() and enemyGone() - so enemiesLeft counts down properly, and the next wave comes
  // exactly once. (Setting enemiesLeft to 0 would be wrong: in a stream wave, ships still to come
  // would then count it below zero, and the wave would never end.)
  private useBomb(): void {
    if (this.bombs === 0 || this.phase === "over") {
      return;
    }
    this.bombs = this.bombs - 1;
    this.events.emit(BOMBS_CHANGED, this.bombs);
    this.cameras.main.flash(BOMB_FLASH_TIME);

    const { width, height } = this.scale;
    for (const enemy of this.enemies.getMatching("active", true) as Enemy[]) {
      if (enemy.x >= 0 && enemy.x <= width && enemy.y >= 0 && enemy.y <= height) {
        this.explode(enemy.x, enemy.y);
        enemy.kill();
        this.addScore(ENEMY_POINTS);
        this.enemyGone();
      }
    }
    for (const bullet of this.enemyBullets.getMatching("active", true) as EnemyBullet[]) {
      bullet.kill();
    }
    if (this.phase === "boss" && this.boss.active) {
      this.boss.weaken(BOMB_BOSS_DAMAGE);
      this.events.emit(BOSS_HEALTH_CHANGED, this.boss.getHealth(), this.boss.getMaxHealth());
    }
  }

  // ---- hits ----

  private bulletHitsEnemy(bullet: Bullet, enemy: Enemy): void {
    bullet.kill();
    this.explode(enemy.x, enemy.y);
    if (Math.random() < POWERUP_CHANCE) {
      this.powerUps.add(new PowerUp(this, enemy.x, enemy.y, PowerUp.randomKind()));
    }
    enemy.kill();
    this.addScore(ENEMY_POINTS);
    this.enemyGone();
  }

  private enemyCrashes(enemy: Enemy): void {
    this.explode(enemy.x, enemy.y);
    enemy.kill();
    this.enemyGone();
    this.shipHit();
  }

  private shipHit(): void {
    this.lives = this.lives - 1;
    this.events.emit(LIVES_CHANGED, this.lives);
    this.sound.play(HURT_SOUND);
    this.cameras.main.shake(250, 0.015);

    if (this.lives <= 0) {
      this.endGame(false);
    } else {
      this.ship.makeInvulnerable();
    }
  }

  private collect(powerUp: PowerUp): void {
    this.sound.play(POWERUP_SOUND);
    if (powerUp.kind === "life") {
      this.lives = Math.min(this.lives + 1, MAX_LIVES);
      this.events.emit(LIVES_CHANGED, this.lives);
    } else {
      // here TypeScript knows kind is "spread" or "rapid" - the only other possibilities
      this.ship.powerUp(powerUp.kind, this.time.now);
    }
    powerUp.destroy();
  }

  private addScore(points: number): void {
    this.score = this.score + points;
    this.events.emit(SCORE_CHANGED, this.score);
  }

  private explode(x: number, y: number): void {
    const boom = this.add.sprite(x, y, EXPLOSION_KEY).play(EXPLODE_ANIM);
    boom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      boom.destroy();
    });
    this.sparks.explode(SPARK_COUNT, x, y);
    this.sound.play(EXPLOSION_SOUND, { volume: 0.5 });
  }

  private endGame(won: boolean): void {
    this.phase = "over";
    this.bossFireTimer?.remove();
    if (!won) {
      this.explode(this.ship.x, this.ship.y);
      this.ship.disableBody(true, true);
    }

    this.time.delayedCall(1500, () => {
      this.scene.stop(HUD_SCENE);
      const data: GameOverData = { won: won, score: this.score, level: this.levelIndex + 1 };
      this.scene.start(GAME_OVER_SCENE, data);
    });
  }

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
      delay: 600,
      onComplete: () => {
        banner.destroy();
      },
    });
  }
}
