import Phaser from "phaser";

// Tile - one tile on the board, which turns over with a flip, and celebrates when it is matched
//
// The simple version's Tile swapped its frame instantly. This one ANIMATES: a flip squashes the
// tile to nothing across (scaleX 0), swaps the frame while it cannot be seen, and stretches it back.
// Because a flip takes time, flipUp() and flipDown() take an optional callback, run when the
// flip has finished - the scene uses it to wait for the second tile before checking the pair.

export const TILES_KEY = "tiles";
export const TILES_FILE = "assets/spritesheets/memory_tiles.png";
export const TILE_SIZE = 100;

const BACK_FRAME = 0;
const HALF_FLIP = 120;          // milliseconds for each half of a flip
const HOVER_TINT = 0xc8d8ff;    // a face-down tile under the pointer is tinted pale blue
const MATCHED_ALPHA = 0.45;

export class Tile extends Phaser.GameObjects.Image {
  public readonly face: number;
  private faceUp = false;

  constructor(scene: Phaser.Scene, x: number, y: number, face: number) {
    super(scene, x, y, TILES_KEY, BACK_FRAME);
    this.face = face;
    scene.add.existing(this);

    this.setInteractive({ useHandCursor: true });

    // hover: only face-down tiles light up, because only they can be picked
    this.on("pointerover", () => {
      if (!this.faceUp) {
        this.setTint(HOVER_TINT);
      }
    });
    this.on("pointerout", () => {
      this.clearTint();
    });
  }

  public isFaceUp(): boolean {
    return this.faceUp;
  }

  public matches(other: Tile): boolean {
    return this.face === other.face;
  }

  // faceUp changes AT ONCE, not when the flip ends - so a second click on a tile that is still
  // turning over is already ignored
  public flipUp(onDone?: () => void): void {
    this.faceUp = true;
    this.clearTint();
    this.flipTo(this.face, onDone);
  }

  public flipDown(onDone?: () => void): void {
    this.faceUp = false;
    this.flipTo(BACK_FRAME, onDone);
  }

  // squash to nothing, swap the picture, stretch back - two tweens, one after the other
  private flipTo(frame: number, onDone?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: HALF_FLIP,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.setFrame(frame);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: HALF_FLIP,
          ease: "Sine.easeOut",
          onComplete: () => {
            // onDone is optional: call it only if one was given
            if (onDone) {
              onDone();
            }
          },
        });
      },
    });
  }

  // part of a found pair: a quick "pop", then fade back - and no more clicks
  public celebrate(): void {
    this.disableInteractive();
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { scale: 1.2, duration: 120, ease: "Back.easeOut", yoyo: true },
        { alpha: MATCHED_ALPHA, duration: 300 },
      ],
    });
  }

  // a wrong pair: a small shake from side to side
  public shake(): void {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 6,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  }
}
