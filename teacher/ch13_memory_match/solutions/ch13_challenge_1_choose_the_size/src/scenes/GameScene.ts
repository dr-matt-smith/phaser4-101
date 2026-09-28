import Phaser from "phaser";
import { Tile, TILE_SIZE, TILES_FILE, TILES_KEY } from "../objects/Tile.ts";

// GameScene - the whole game: a grid of face-down tiles; turn over two, keep them if they match
//
// The rules are a small STATE MACHINE. The game is always in exactly one of three states, and a
// click means something different in each:
//   "idle"   no tiles showing          -> a click turns one over, and the game becomes "oneUp"
//   "oneUp"  one tile showing          -> a click turns a second over; a pair stays up ("idle"),
//                                         a wrong pair stays up for a moment ("twoUp")
//   "twoUp"  a wrong pair is showing   -> clicks are IGNORED until both have turned back ("idle")

// CHALLENGE 1: the three sizes the player can choose, by pressing 1, 2 or 3
const SIZES: BoardSize[] = [
  { rows: 3, cols: 4 },
  { rows: 4, cols: 4 },
  { rows: 4, cols: 6 },
];
const GAP = 16;                  // pixels between tiles
const MISMATCH_DELAY = 1000;     // how long a wrong pair stays face up, in milliseconds

// the three states, as a union of string literals: `state` can hold these three strings and
// nothing else - a typo such as "oneup" is a build error
type State = "idle" | "oneUp" | "twoUp";

// CHALLENGE 1: the size of a board
export interface BoardSize {
  rows: number;
  cols: number;
}

export class GameScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private state: State = "idle";
  private firstTile: Tile | null = null;   // the tile turned over first, while in "oneUp"
  private pairsFound = 0;
  private rows = SIZES[0].rows;   // CHALLENGE 1: the size is a field now, not a constant
  private cols = SIZES[0].cols;

  // the ! says "this is set in create(), before anything uses it" - see Chapter 1
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  // runs every time the scene starts - including scene.restart() - so a new game starts clean
  // (Phaser reuses the same scene object: Chapter 2)
  // CHALLENGE 1: restart(data) hands the new size to init(). The first start (from the config)
  // and restart() with no data pass an EMPTY object - so both fields may be missing.
  // Partial<BoardSize> means "a BoardSize, but every field optional"; ?? keeps the size we had
  init(data: Partial<BoardSize>): void {
    this.rows = data.rows ?? this.rows;
    this.cols = data.cols ?? this.cols;
    this.tiles = [];
    this.state = "idle";
    this.firstTile = null;
    this.pairsFound = 0;
  }

  preload(): void {
    // a sprite sheet: one picture, cut into equal frames, numbered from 0, left to right
    this.load.spritesheet(TILES_KEY, TILES_FILE, { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
  }

  create(): void {
    const pairs = (this.rows * this.cols) / 2;   // CHALLENGE 1
    const faces = this.makeFaces(pairs);
    this.layOutGrid(faces);

    // CHALLENGE 1: the message says the size, and how to change it
    this.messageText = this.add.text(this.scale.width / 2, 40, `${this.cols} x ${this.rows} - find the pairs (1, 2, 3: board size)`, {
      fontFamily: "Arial",
      fontSize: "26px",   // CHALLENGE 1: a smaller font, for the longer message
      color: "#ffffff",
    }).setOrigin(0.5);

    // CHALLENGE 1: 1, 2 and 3 start a new game at that size - at any time
    this.input.keyboard!.on("keydown-ONE", () => {
      this.scene.restart(SIZES[0]);
    });
    this.input.keyboard!.on("keydown-TWO", () => {
      this.scene.restart(SIZES[1]);
    });
    this.input.keyboard!.on("keydown-THREE", () => {
      this.scene.restart(SIZES[2]);
    });
  }

  // [1, 1, 2, 2, 3, 3, ...] - each face twice - in a random order
  private makeFaces(pairs: number): number[] {
    const faces: number[] = [];
    for (let face = 1; face <= pairs; face++) {
      faces.push(face, face);
    }
    // Phaser's Fisher-Yates shuffle (Chapter 12 writes one by hand). It shuffles the array
    // in place, and returns it too.
    return Phaser.Utils.Array.Shuffle(faces);
  }

  // this.rows x this.cols tiles, with GAP pixels between them, centred in the game (CHALLENGE 1)
  private layOutGrid(faces: number[]): void {
    const gridWidth = this.cols * TILE_SIZE + (this.cols - 1) * GAP;
    const gridHeight = this.rows * TILE_SIZE + (this.rows - 1) * GAP;

    // the CENTRE of the top-left tile (a tile's origin is its centre)
    const left = (this.scale.width - gridWidth) / 2 + TILE_SIZE / 2;
    const top = (this.scale.height - gridHeight) / 2 + TILE_SIZE / 2;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = left + col * (TILE_SIZE + GAP);
        const y = top + row * (TILE_SIZE + GAP);
        const face = faces[row * this.cols + col];

        const tile = new Tile(this, x, y, face);
        tile.setInteractive({ useHandCursor: true });
        tile.on("pointerdown", () => {
          this.tileClicked(tile);
        });
        this.tiles.push(tile);
      }
    }
  }

  private tileClicked(tile: Tile): void {
    // a tile that is already face up - the first of this pair - cannot be picked again
    if (tile.isFaceUp()) {
      return;
    }

    switch (this.state) {
      case "idle":
        tile.showFace();
        this.firstTile = tile;
        this.state = "oneUp";
        break;

      case "oneUp":
        tile.showFace();
        this.checkPair(this.firstTile!, tile);
        break;

      case "twoUp":
        // a wrong pair is showing: ignore the click. Without this "lock", a quick player could
        // turn over a third and fourth tile while the first two are still up
        break;
    }
  }

  private checkPair(first: Tile, second: Tile): void {
    this.firstTile = null;

    if (first.matches(second)) {
      first.setMatched();
      second.setMatched();
      this.pairsFound = this.pairsFound + 1;
      this.state = "idle";

      if (this.pairsFound === this.tiles.length / 2) {
        this.win();
      }
    } else {
      // leave the wrong pair showing long enough to remember, then turn both back
      this.state = "twoUp";
      this.time.delayedCall(MISMATCH_DELAY, () => {
        first.hideFace();
        second.hideFace();
        this.state = "idle";
      });
    }
  }

  private win(): void {
    this.messageText.setText("All pairs found! SPACE to play again (1, 2, 3: board size)");

    // CHALLENGE 1: restart() with no data - init() keeps the current size
    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.restart();
    });
  }
}
