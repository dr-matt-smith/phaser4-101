import Phaser from "phaser";
import type { Theme, TileFace } from "../themes/Theme.ts";

// Tile - one tile (or card) on the board
//
// The intermediate version's Tile, made to work with any Theme and at any size:
//   - its face is a TileFace from the theme: a frame to show, and a matchKey to compare
//   - the board may be scaled to fit, so a flip returns to the tile's BASE scale, not to 1
//   - it can glide to a new place on the board, for the "shuffle" twist

const HALF_FLIP = 120;
const HOVER_TINT = 0xc8d8ff;
const MATCHED_ALPHA = 0.45;

export class Tile extends Phaser.GameObjects.Image {
  public readonly face: TileFace;
  private readonly backFrame: number;
  private readonly baseScale: number;
  private faceUp = false;
  private matched = false;

  constructor(scene: Phaser.Scene, x: number, y: number, theme: Theme, face: TileFace, scale: number) {
    super(scene, x, y, theme.texture, theme.backFrame);
    this.face = face;
    this.backFrame = theme.backFrame;
    this.baseScale = scale;
    this.setScale(scale);
    scene.add.existing(this);

    this.setInteractive({ useHandCursor: true });
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

  public isMatched(): boolean {
    return this.matched;
  }

  // compare what the tiles MEAN, not what they show - two cards can match with different pictures
  public matches(other: Tile): boolean {
    return this.face.matchKey === other.face.matchKey;
  }

  public flipUp(onDone?: () => void): void {
    this.faceUp = true;
    this.clearTint();
    this.flipTo(this.face.frame, onDone);
  }

  public flipDown(onDone?: () => void): void {
    this.faceUp = false;
    this.flipTo(this.backFrame, onDone);
  }

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
          scaleX: this.baseScale,
          duration: HALF_FLIP,
          ease: "Sine.easeOut",
          onComplete: () => {
            if (onDone) {
              onDone();
            }
          },
        });
      },
    });
  }

  public celebrate(): void {
    this.matched = true;
    this.disableInteractive();
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { scale: this.baseScale * 1.2, duration: 120, ease: "Back.easeOut", yoyo: true },
        { alpha: MATCHED_ALPHA, duration: 300 },
      ],
    });
  }

  public shake(): void {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 6,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  }

  // glide to a new place on the board
  public slideTo(x: number, y: number, duration: number): void {
    this.scene.tweens.add({
      targets: this,
      x: x,
      y: y,
      duration: duration,
      ease: "Cubic.easeInOut",
    });
  }
}
