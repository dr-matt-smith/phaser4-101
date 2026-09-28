import Phaser from "phaser";

// Cannonball - small, heavy and fast: fired at the pointer to knock things down
//
// Its DENSITY is ten times Matter's default (0.001), so it is ten times as heavy as anything
// else its size. Matter works out every body's mass from its area and its density.

export const CANNONBALL_KEY = "cannonball";

const RADIUS = 16;

export class Cannonball extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, CANNONBALL_KEY, undefined, {
      shape: { type: "circle", radius: RADIUS },
      density: 0.01,
      restitution: 0.2,
    });
    scene.add.existing(this);
  }

  // There is no cannonball picture in the asset library, so draw one - once - and keep it as a
  // texture called CANNONBALL_KEY, just as if it had been loaded.
  public static makeTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(CANNONBALL_KEY)) {
      return;
    }
    const graphics = scene.make.graphics({}, false);   // false: do not add it to the scene
    graphics.fillStyle(0x1b1f2a);
    graphics.fillCircle(RADIUS, RADIUS, RADIUS);
    graphics.fillStyle(0x6c7a93);
    graphics.fillCircle(RADIUS - 5, RADIUS - 5, 4);     // a highlight
    graphics.generateTexture(CANNONBALL_KEY, RADIUS * 2, RADIUS * 2);
    graphics.destroy();
  }
}
