import Phaser from "phaser";
import { EMPTY, TILE_COUNT, TILE_FRAMES_KEY, TILE_SIZE } from "../tiles.ts";

// Palette - a row of small buttons, one for each tile and one for the eraser
//
// Click one to choose it. The palette does not know about the map: it just tells whoever made it
// which tile was chosen, by calling the function it was given.

const SCALE = 0.625;                    // 32-pixel tiles shown at 20 pixels
const SLOT = TILE_SIZE * SCALE + 6;     // distance from one button to the next

export class Palette {
  private marker: Phaser.GameObjects.Rectangle;
  private x: number;

  // onChoose is a FUNCTION, passed in like any other value. (In Java it would be a lambda for a
  // functional interface, such as IntConsumer.) Its type says: takes a number, returns nothing.
  constructor(scene: Phaser.Scene, x: number, y: number, onChoose: (index: number) => void) {
    this.x = x;

    // one button per tile: frame n of the sprite sheet is tile n
    for (let index = 0; index < TILE_COUNT; index++) {
      const button = scene.add.image(this.slotX(index), y, TILE_FRAMES_KEY, index).setScale(SCALE);
      button.setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => onChoose(index));
    }

    // the eraser: an empty dark square with a red cross
    const eraserX = this.slotX(EMPTY);
    const size = TILE_SIZE * SCALE;
    const eraser = scene.add.rectangle(eraserX, y, size, size, 0x1d2433).setStrokeStyle(1, 0xf1faee);
    eraser.setInteractive({ useHandCursor: true });
    eraser.on("pointerdown", () => onChoose(EMPTY));
    const cross = scene.add.graphics().lineStyle(2, 0xe63946);
    cross.lineBetween(eraserX - 6, y - 6, eraserX + 6, y + 6);
    cross.lineBetween(eraserX - 6, y + 6, eraserX + 6, y - 6);

    // a yellow frame round the chosen button
    this.marker = scene.add.rectangle(this.slotX(0), y, SLOT, SLOT).setStrokeStyle(2, 0xffd166);
  }

  // move the frame to show which tile is chosen
  public show(index: number): void {
    this.marker.x = this.slotX(index);
  }

  // where a button goes: tiles 0, 1, 2, 3 left to right, then the eraser last
  private slotX(index: number): number {
    const slot = index === EMPTY ? TILE_COUNT : index;
    return this.x + slot * SLOT;
  }
}
