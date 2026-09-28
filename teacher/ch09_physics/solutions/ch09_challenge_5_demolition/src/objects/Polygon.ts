import Phaser from "phaser";

// Polygon - a regular polygon (triangle, hexagon ...) for Matter.js
//
// Matter can make a body of any convex shape. { type: "polygon", sides, radius } makes a regular
// one. There are no pictures of polygons in the asset library, so this class draws its own,
// using exactly the corners Matter uses, so the picture and the body match.

const RADIUS = 30;           // centre to corner, in pixels

export class Polygon extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, sides: number, colour: number) {
    const key = Polygon.makeTexture(scene, sides, colour);
    super(scene.matter.world, x, y, key, undefined, {
      shape: { type: "polygon", sides: sides, radius: RADIUS },
      friction: 0.4,
      restitution: 0.3,
    });
    scene.add.existing(this);
  }

  // Draws the polygon into a texture (once per kind), and returns the texture's key.
  private static makeTexture(scene: Phaser.Scene, sides: number, colour: number): string {
    const key = `polygon${sides}_${colour}`;
    if (scene.textures.exists(key)) {
      return key;
    }

    // Matter puts corner i at angle (i + 0.5) * (360 / sides) degrees from the centre
    const corners: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i + 0.5) * (Math.PI * 2 / sides);
      corners.push(new Phaser.Math.Vector2(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS));
    }

    // The texture must be exactly the size of the shape's bounding box: Phaser lines up the
    // picture with the body by where the body's centre of mass sits inside that box.
    const minX = Math.min(...corners.map((c) => c.x));
    const maxX = Math.max(...corners.map((c) => c.x));
    const minY = Math.min(...corners.map((c) => c.y));
    const maxY = Math.max(...corners.map((c) => c.y));
    const points = corners.map((c) => new Phaser.Math.Vector2(c.x - minX, c.y - minY));

    const graphics = scene.make.graphics({}, false);
    graphics.fillStyle(colour);
    graphics.fillPoints(points, true);
    graphics.lineStyle(3, 0x1b1f2a);
    graphics.strokePoints(points, true);
    graphics.generateTexture(key, Math.ceil(maxX - minX), Math.ceil(maxY - minY));
    graphics.destroy();
    return key;
  }
}
