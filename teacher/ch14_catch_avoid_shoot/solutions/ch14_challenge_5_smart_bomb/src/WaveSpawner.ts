import Phaser from "phaser";
import type { WaveData } from "./levels.ts";
import type { Enemy } from "./objects/Enemy.ts";

// WaveSpawner - sends in a wave of enemies, moving in one of three patterns
//
//   row     - ships swoop into a line at the top (tweens with a stagger), then creep down
//   stream  - a timer drops ships one at a time, each above wherever the player is
//   swoop   - ships follow one another along a curved PATH across the screen
//
// The first two are the intermediate version's waves, moved out of the game scene into a class of
// their own; "swoop" is new. The spawner only STARTS waves - the game scene still counts what is
// shot down and decides when the next wave comes.

const SPAWN_Y = -40;
const EDGE = 60;
const ROW_Y = 90;
const ROW_ENTRY_TIME = 800;
const ROW_STAGGER = 120;
const STREAM_GAP = 550;
const SWOOP_GAP = 350;            // milliseconds between ships on the path

// the swoop's curve, from off the left edge, down across the screen, and off the right edge
// (x, y pairs). A spline passes smoothly through every point.
const SWOOP_POINTS = [-50, 80, 180, 160, 330, 380, 470, 380, 620, 160, 880, 60];

export class WaveSpawner {
  private scene: Phaser.Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  private player: Phaser.GameObjects.Components.Transform;
  private onMissing: () => void;

  // `onMissing` is called for every ship that could not be made because the pool was empty, so
  // the game scene can still count the wave down to zero
  constructor(scene: Phaser.Scene, enemies: Phaser.Physics.Arcade.Group,
    player: Phaser.GameObjects.Components.Transform, onMissing: () => void) {
    this.scene = scene;
    this.enemies = enemies;
    this.player = player;
    this.onMissing = onMissing;
  }

  public start(wave: WaveData): void {
    switch (wave.pattern) {
      case "row":
        this.row(wave.size, wave.speed);
        break;
      case "stream":
        this.stream(wave.size, wave.speed);
        break;
      case "swoop":
        this.swoop(wave.size, wave.speed);
        break;
    }
  }

  private row(size: number, speed: number): void {
    const spacing = (this.scene.scale.width - EDGE * 2) / (size - 1);
    for (let i = 0; i < size; i++) {
      const enemy = this.spawnEnemy(EDGE + i * spacing, SPAWN_Y);
      if (enemy === null) {
        continue;
      }
      this.scene.tweens.add({
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

  private stream(size: number, speed: number): void {
    this.scene.time.addEvent({
      delay: STREAM_GAP,
      repeat: size - 1,
      callback: () => {
        const x = Phaser.Math.Clamp(this.player.x, EDGE, this.scene.scale.width - EDGE);
        const enemy = this.spawnEnemy(x, SPAWN_Y);
        enemy?.setVelocityY(speed);
      },
    });
  }

  // Every ship follows the same curve, each starting SWOOP_GAP ms after the one before.
  // Half the time the curve is mirrored, so the swoop comes from the right instead.
  private swoop(size: number, duration: number): void {
    const width = this.scene.scale.width;
    const fromRight = Math.random() < 0.5;
    const points = SWOOP_POINTS.map((value, index) => {
      const isX = index % 2 === 0;
      return fromRight && isX ? width - value : value;
    });
    const path = new Phaser.Curves.Spline(points);
    const start = path.getStartPoint();

    for (let i = 0; i < size; i++) {
      const enemy = this.spawnEnemy(start.x, start.y);
      enemy?.followPath(path, duration, i * SWOOP_GAP);
    }
  }

  private spawnEnemy(x: number, y: number): Enemy | null {
    const enemy = this.enemies.get() as Enemy | null;
    if (enemy === null) {
      this.onMissing();
      return null;
    }
    enemy.spawn(x, y);
    return enemy;
  }
}
