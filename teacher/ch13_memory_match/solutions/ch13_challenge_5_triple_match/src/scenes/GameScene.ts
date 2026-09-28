import Phaser from "phaser";
import { Tile, TILE_SIZE, TILES_FILE, TILES_KEY } from "../objects/Tile.ts";

// GameScene - the whole game: a grid of face-down tiles; turn over three, keep them if they match
//
// CHALLENGE 5: groups of THREE. The states are now about how the current group is going:
//   "idle"     no tiles showing             -> a click turns one over          -> "picking"
//   "picking"  one or two tiles showing,    -> a click turns another over:
//              all the same so far             a different face: a wrong group  -> "wrong"
//                                              the third the same: keep them    -> "idle"
//   "wrong"    a wrong group is showing     -> clicks are IGNORED until they have turned back

const ROWS = 3;
const COLS = 4;
const GAP = 16;                  // pixels between tiles
const MISMATCH_DELAY = 1000;     // how long a wrong group stays face up, in milliseconds
const GROUP_SIZE = 3;            // CHALLENGE 5: tiles in a group - 2 would be the ordinary game

// the three states, as a union of string literals: `state` can hold these three strings and
// nothing else - a typo such as "oneup" is a build error
type State = "idle" | "picking" | "wrong";   // CHALLENGE 5

export class GameScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private state: State = "idle";
  // CHALLENGE 5: every tile of the current group that is face up, in the order turned over
  private showing: Tile[] = [];
  private groupsFound = 0;

  // the ! says "this is set in create(), before anything uses it" - see Chapter 1
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  // runs every time the scene starts - including scene.restart() - so a new game starts clean
  // (Phaser reuses the same scene object: Chapter 2)
  init(): void {
    this.tiles = [];
    this.state = "idle";
    this.showing = [];      // CHALLENGE 5
    this.groupsFound = 0;
  }

  preload(): void {
    // a sprite sheet: one picture, cut into equal frames, numbered from 0, left to right
    this.load.spritesheet(TILES_KEY, TILES_FILE, { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
  }

  create(): void {
    const groups = (ROWS * COLS) / GROUP_SIZE;   // CHALLENGE 5
    const faces = this.makeFaces(groups);
    this.layOutGrid(faces);

    this.messageText = this.add.text(this.scale.width / 2, 40, "Find the groups of three", {
      fontFamily: "Arial",
      fontSize: "30px",
      color: "#ffffff",
    }).setOrigin(0.5);
  }

  // CHALLENGE 5: [1, 1, 1, 2, 2, 2, ...] - each face GROUP_SIZE times - in a random order
  private makeFaces(groups: number): number[] {
    const faces: number[] = [];
    for (let face = 1; face <= groups; face++) {
      for (let i = 0; i < GROUP_SIZE; i++) {
        faces.push(face);
      }
    }
    // Phaser's Fisher-Yates shuffle (Chapter 12 writes one by hand). It shuffles the array
    // in place, and returns it too.
    return Phaser.Utils.Array.Shuffle(faces);
  }

  // ROWS x COLS tiles, with GAP pixels between them, centred in the game
  private layOutGrid(faces: number[]): void {
    const gridWidth = COLS * TILE_SIZE + (COLS - 1) * GAP;
    const gridHeight = ROWS * TILE_SIZE + (ROWS - 1) * GAP;

    // the CENTRE of the top-left tile (a tile's origin is its centre)
    const left = (this.scale.width - gridWidth) / 2 + TILE_SIZE / 2;
    const top = (this.scale.height - gridHeight) / 2 + TILE_SIZE / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = left + col * (TILE_SIZE + GAP);
        const y = top + row * (TILE_SIZE + GAP);
        const face = faces[row * COLS + col];

        const tile = new Tile(this, x, y, face);
        tile.setInteractive({ useHandCursor: true });
        tile.on("pointerdown", () => {
          this.tileClicked(tile);
        });
        this.tiles.push(tile);
      }
    }
  }

  // CHALLENGE 5: one method for the whole group, with the tiles showing kept in an array
  private tileClicked(tile: Tile): void {
    // a wrong group is showing, or this tile is already face up: ignore the click
    if (this.state === "wrong" || tile.isFaceUp()) {
      return;
    }

    tile.showFace();
    this.showing.push(tile);

    if (!tile.matches(this.showing[0])) {
      // a different face - this group is wrong, however many are showing
      this.state = "wrong";
      const wrongGroup = this.showing;
      this.showing = [];
      this.time.delayedCall(MISMATCH_DELAY, () => {
        for (const wrongTile of wrongGroup) {
          wrongTile.hideFace();
        }
        this.state = "idle";
      });
    } else if (this.showing.length === GROUP_SIZE) {
      // a full group, all the same
      for (const groupTile of this.showing) {
        groupTile.setMatched();
      }
      this.showing = [];
      this.groupsFound = this.groupsFound + 1;
      this.state = "idle";
      if (this.groupsFound === this.tiles.length / GROUP_SIZE) {
        this.win();
      }
    } else {
      // the same so far - keep picking
      this.state = "picking";
    }
  }

  private win(): void {
    this.messageText.setText("All groups found! Press SPACE to play again");

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.restart();
    });
  }
}
