import Phaser from "phaser";
import { ENEMY_KEY } from "../assets.ts";

// Enemy - an enemy ship, pooled
//
// New in the advanced version: an enemy can follow a PATH - a curve through a list of points.
// A tween moves `pathProgress` from 0 (the start of the path) to 1 (the end), and every frame the
// enemy puts itself at that point along the curve.

export const ENEMY_POINTS = 100;

export class Enemy extends Phaser.Physics.Arcade.Image {
  public pathProgress = 0;                         // tweened from 0 to 1 by followPath()
  private path: Phaser.Curves.Curve | null = null;
  private point = new Phaser.Math.Vector2();       // reused, so no new object every frame

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ENEMY_KEY);
  }

  public spawn(x: number, y: number): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
    this.path = null;
  }

  // fly along `path`, taking `duration` milliseconds, starting after `delay` milliseconds
  public followPath(path: Phaser.Curves.Curve, duration: number, delay: number): void {
    this.path = path;
    this.pathProgress = 0;
    this.scene.tweens.add({
      targets: this,
      pathProgress: 1,
      duration: duration,
      delay: delay,
    });
  }

  public kill(): void {
    this.scene.tweens.killTweensOf(this);
    this.path = null;
    this.disableBody(true, true);
  }

  preUpdate(_time: number, _delta: number): void {
    if (this.path !== null) {
      // getPointAt measures along the curve's length, so the ship moves at an even speed
      this.path.getPointAt(this.pathProgress, this.point);
      this.setPosition(this.point.x, this.point.y);
    }
  }
}
