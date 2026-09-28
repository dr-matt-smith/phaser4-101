import Phaser from "phaser";

// StarLayer - one layer of stars that scrolls down the screen for ever
//
// A TileSprite is a rectangle filled with a picture repeated over and over, like tiles on a floor.
// Changing its tilePositionY slides the picture inside the rectangle - the rectangle itself does
// not move - so a small picture of a few stars can fill the screen and scroll without end.
//
// Two layers moving at different speeds - slow, dim stars far away and faster, brighter ones close
// by - give PARALLAX: the feeling of depth you get looking out of a train window.

const TILE_SIZE = 256;          // the star picture is 256 x 256, repeated to fill the screen

export class StarLayer extends Phaser.GameObjects.TileSprite {
  private speed: number;        // pixels per second

  constructor(scene: Phaser.Scene, textureKey: string, speed: number) {
    super(scene, 0, 0, scene.scale.width, scene.scale.height, textureKey);
    this.setOrigin(0, 0);
    this.speed = speed;
    scene.add.existing(this);
  }

  // TileSprite has a preUpdate of its own, so call it too (Chapter 4)
  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    // a smaller tilePositionY slides the picture DOWN, which looks like flying UP
    this.tilePositionY = this.tilePositionY - this.speed * delta / 1000;
  }

  // Draws a texture of `count` random stars with Graphics, and saves it under `key`, so it can be
  // used like any loaded picture. No image file needed.
  public static makeTexture(scene: Phaser.Scene, key: string, count: number, radius: number, alpha: number): void {
    if (scene.textures.exists(key)) {
      return;                   // made already (the start scene can run many times)
    }
    const graphics = scene.make.graphics({}, false);   // false: draw it, but not on screen
    graphics.fillStyle(0xffffff, alpha);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(radius, TILE_SIZE - radius);
      const y = Phaser.Math.Between(radius, TILE_SIZE - radius);
      graphics.fillCircle(x, y, radius);
    }
    graphics.generateTexture(key, TILE_SIZE, TILE_SIZE);
    graphics.destroy();         // the texture is saved; the Graphics is no longer needed
  }
}
