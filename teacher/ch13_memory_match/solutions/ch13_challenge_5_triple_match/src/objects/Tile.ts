import Phaser from "phaser";

// Tile - one tile on the board: a picture on one side, a "?" on the other
//
// The pictures come from ONE sprite sheet, memory_tiles.png: frame 0 is the back of every tile,
// and frames 1-12 are twelve different faces. An Image can show any single frame of a sprite
// sheet - a Sprite is only needed when the frames are played as an animation (Chapter 7).
//
// The tile knows its own face, and whether it is face up. It does NOT know about the
// rules of the game - the scene decides when a tile turns over, and what a pair means.

export const TILES_KEY = "tiles";
export const TILES_FILE = "assets/spritesheets/memory_tiles.png";
export const TILE_SIZE = 100;        // each frame is 100 x 100 pixels

const BACK_FRAME = 0;
const MATCHED_ALPHA = 0.5;           // matched tiles are faded, so the board visibly empties

export class Tile extends Phaser.GameObjects.Image {
  // which picture this tile hides (1-12). CHALLENGE 5: three tiles on the board have each face.
  // readonly: set once, in the constructor, and never changed - like final in Java
  public readonly face: number;

  private faceUp = false;

  constructor(scene: Phaser.Scene, x: number, y: number, face: number) {
    super(scene, x, y, TILES_KEY, BACK_FRAME);
    this.face = face;
    scene.add.existing(this);
  }

  public isFaceUp(): boolean {
    return this.faceUp;
  }

  // two tiles match when they hide the same picture
  public matches(other: Tile): boolean {
    return this.face === other.face;
  }

  public showFace(): void {
    this.faceUp = true;
    this.setFrame(this.face);
  }

  public hideFace(): void {
    this.faceUp = false;
    this.setFrame(BACK_FRAME);
  }

  // part of a pair that has been found: it stays face up, and stops listening to the pointer
  public setMatched(): void {
    this.setAlpha(MATCHED_ALPHA);
    this.disableInteractive();
  }
}
