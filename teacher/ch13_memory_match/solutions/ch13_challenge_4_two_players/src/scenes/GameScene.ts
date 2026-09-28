import Phaser from "phaser";
import { CORRECT_KEY, FLIP_KEY, WRONG_KEY } from "../assets.ts";
import { Tile, TILE_SIZE } from "../objects/Tile.ts";
import { GAME_SCENE, WIN_SCENE } from "./keys.ts";
import type { WinData } from "./WinScene.ts";

// GameScene - a 4 x 4 board of tiles that flip, with a moves counter and a clock
//
// The state machine from the simple version, with one more state. Flips now take time, so
// there is a moment when the second tile is still turning over and the pair cannot be checked yet:
//   "idle"      no tiles showing          click: flip one up                      -> "oneUp"
//   "oneUp"     one tile showing          click: flip a second up                 -> "twoUp"
//   "twoUp"     the second tile flipping  clicks ignored; when the flip ends      -> "checking"
//   "checking"  looking at the pair       clicks ignored; a pair                  -> "idle"
//                                         a wrong pair: wait, flip both back      -> "idle"

const ROWS = 4;
const COLS = 4;
const GAP = 14;
const GRID_TOP = 90;              // leave room above the grid for the moves and time
const MISMATCH_DELAY = 700;       // how long a wrong pair stays up (after it has finished flipping)
const WIN_DELAY = 900;            // let the last pair celebrate before the win scene
const PLAYER_COLOURS = ["#ffd166", "#a8dadc"];   // CHALLENGE 4: player 1 yellow, player 2 blue

type State = "idle" | "oneUp" | "twoUp" | "checking";

export class GameScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private state: State = "idle";
  private firstTile: Tile | null = null;
  private secondTile: Tile | null = null;
  private pairsFound = 0;
  private moves = 0;
  // CHALLENGE 4: whose turn it is (0 = player 1, 1 = player 2), and each player's pairs
  private player = 0;
  private scores = [0, 0];

  // the clock starts at the first click, not when the board appears
  private clockRunning = false;
  private startTime = 0;
  private seconds = 0;

  private movesText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;   // CHALLENGE 4

  constructor() {
    super(GAME_SCENE);
  }

  init(): void {
    this.tiles = [];
    this.state = "idle";
    this.firstTile = null;
    this.secondTile = null;
    this.pairsFound = 0;
    this.moves = 0;
    this.player = 0;          // CHALLENGE 4
    this.scores = [0, 0];     // CHALLENGE 4: a NEW array - see solutions.md
    this.clockRunning = false;
    this.seconds = 0;
  }

  create(): void {
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" };
    this.movesText = this.add.text(40, 30, "", { ...style, fontSize: "22px" });   // CHALLENGE 4: smaller, to make room
    this.timeText = this.add.text(this.scale.width - 40, 30, "", { ...style, fontSize: "22px" }).setOrigin(1, 0);
    this.turnText = this.add.text(this.scale.width / 2, 30, "", style).setOrigin(0.5, 0);   // CHALLENGE 4
    this.updateHud();

    const faces = this.makeFaces((ROWS * COLS) / 2);
    this.layOutGrid(faces);
  }

  override update(time: number): void {
    if (this.clockRunning) {
      this.seconds = (time - this.startTime) / 1000;
      this.updateHud();
    }
  }

  private updateHud(): void {
    this.movesText.setText(`Moves: ${this.moves}`);
    this.timeText.setText(`Time: ${this.seconds.toFixed(1)}`);
    // CHALLENGE 4: both scores, and whose turn - in that player's colour
    this.turnText.setText(`P1: ${this.scores[0]}   P2: ${this.scores[1]}   -   Player ${this.player + 1}'s turn`);
    this.turnText.setColor(PLAYER_COLOURS[this.player]);
  }

  private makeFaces(pairs: number): number[] {
    const faces: number[] = [];
    for (let face = 1; face <= pairs; face++) {
      faces.push(face, face);
    }
    return Phaser.Utils.Array.Shuffle(faces);
  }

  // as the simple version, but centred across only - the top of the grid is fixed, below the HUD
  private layOutGrid(faces: number[]): void {
    const gridWidth = COLS * TILE_SIZE + (COLS - 1) * GAP;
    const left = (this.scale.width - gridWidth) / 2 + TILE_SIZE / 2;
    const top = GRID_TOP + TILE_SIZE / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = left + col * (TILE_SIZE + GAP);
        const y = top + row * (TILE_SIZE + GAP);
        const tile = new Tile(this, x, y, faces[row * COLS + col]);
        tile.on("pointerdown", () => {
          this.tileClicked(tile);
        });
        this.tiles.push(tile);
      }
    }
  }

  private tileClicked(tile: Tile): void {
    // "twoUp" and "checking" are the LOCKED states: the board ignores the player
    if (this.state === "twoUp" || this.state === "checking") {
      return;
    }
    if (tile.isFaceUp()) {
      return;
    }

    this.sound.play(FLIP_KEY);

    if (this.state === "idle") {
      if (!this.clockRunning) {
        this.clockRunning = true;
        this.startTime = this.time.now;
      }
      this.firstTile = tile;
      this.state = "oneUp";
      tile.flipUp();
    } else {
      // "oneUp": this is the second tile. Wait for its flip to finish before checking the pair
      this.secondTile = tile;
      this.state = "twoUp";
      this.moves = this.moves + 1;
      this.updateHud();
      tile.flipUp(() => {
        this.checkPair();
      });
    }
  }

  private checkPair(): void {
    this.state = "checking";
    const first = this.firstTile!;
    const second = this.secondTile!;
    this.firstTile = null;
    this.secondTile = null;

    if (first.matches(second)) {
      this.sound.play(CORRECT_KEY);
      first.celebrate();
      second.celebrate();
      this.pairsFound = this.pairsFound + 1;
      // CHALLENGE 4: a pair scores for the player whose turn it is - and they go again
      this.scores[this.player] = this.scores[this.player] + 1;
      this.updateHud();

      if (this.pairsFound === this.tiles.length / 2) {
        this.win();              // stays "checking", so the board stays locked
      } else {
        this.state = "idle";
      }
    } else {
      this.sound.play(WRONG_KEY);
      first.shake();
      second.shake();
      this.time.delayedCall(MISMATCH_DELAY, () => {
        first.flipDown();
        second.flipDown(() => {
          // CHALLENGE 4: THE place where a turn ends - a wrong pair, now face down again
          this.player = 1 - this.player;
          this.updateHud();
          this.state = "idle";   // unlock only once both are face down again
        });
      });
    }
  }

  private win(): void {
    this.clockRunning = false;
    this.seconds = (this.time.now - this.startTime) / 1000;
    const data: WinData = {
      moves: this.moves,
      seconds: this.seconds,
      pairs: this.tiles.length / 2,
      scores: this.scores,   // CHALLENGE 4
    };
    this.time.delayedCall(WIN_DELAY, () => {
      this.scene.start(WIN_SCENE, data);
    });
  }
}
