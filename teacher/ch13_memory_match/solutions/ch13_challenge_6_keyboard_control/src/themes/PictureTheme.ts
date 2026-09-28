import Phaser from "phaser";
import type { Theme, TileFace } from "./Theme.ts";

// PictureTheme - the picture tiles from memory_tiles.png: a pair is two of the same picture
//
// Frame 0 is the back; frames 1-12 are the pictures. A level with fewer than 12 pairs uses a
// random choice of pictures, so the same level looks different each time.

const PICTURE_COUNT = 12;

export class PictureTheme implements Theme {
  public readonly label = "Pictures";
  public readonly texture = "tiles";
  public readonly file = "assets/spritesheets/memory_tiles.png";
  public readonly tileWidth = 100;
  public readonly tileHeight = 100;
  public readonly backFrame = 0;
  public readonly maxPairs = PICTURE_COUNT;

  public makeFaces(pairs: number): TileFace[] {
    const pictures: number[] = [];
    for (let picture = 1; picture <= PICTURE_COUNT; picture++) {
      pictures.push(picture);
    }
    Phaser.Utils.Array.Shuffle(pictures);

    const faces: TileFace[] = [];
    for (const picture of pictures.slice(0, pairs)) {
      const face: TileFace = { frame: picture, matchKey: `picture ${picture}` };
      faces.push(face, face);
    }
    return faces;
  }
}
