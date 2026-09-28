import Phaser from "phaser";
import { CORRECT_KEY, FLIP_KEY, PARTICLE_KEY, PEEK_KEY, SHUFFLE_KEY, WRONG_KEY } from "../assets.ts";
import { BestResults } from "../BestResults.ts";
import { type LevelData, LEVELS } from "../levels.ts";
import { Button } from "../objects/Button.ts";
import { Tile } from "../objects/Tile.ts";
import { starsFor } from "../rating.ts";
import type { Theme } from "../themes/Theme.ts";
import { type ThemeName, THEMES } from "../themes/themes.ts";
import { GAME_SCENE, LEVEL_COMPLETE_SCENE, MENU_SCENE } from "./keys.ts";
import type { LevelCompleteData } from "./LevelCompleteScene.ts";

// GameScene - one level: any grid size, either theme, with a peek and the shuffle twist
//
// The intermediate version's four states, and two more. Both of the new ones LOCK the board:
//   "idle"       no tiles showing           click: flip one up                 -> "oneUp"
//                                           P / Peek: show every tile           -> "peeking"
//   "oneUp"      one tile showing           click: flip a second up            -> "twoUp"
//   "twoUp"      the second tile flipping   (locked) when it has flipped       -> "checking"
//   "checking"   looking at the pair        (locked) a pair                    -> "idle"
//                                           a wrong pair, flipped back          -> "idle" or "shuffling"
//   "peeking"    every tile face up         (locked) after PEEK_TIME, all back  -> "idle"
//   "shuffling"  the loose tiles moving     (locked) when they have arrived     -> "idle"

export interface GameData {
  level: number;       // an index into LEVELS
  theme: ThemeName;
}

type State = "idle" | "oneUp" | "twoUp" | "checking" | "peeking" | "shuffling";

const GAP = 12;
const AREA_TOP = 80;              // the board fits in this area, below the HUD
const AREA_HEIGHT = 510;
const AREA_WIDTH = 760;
const MISMATCH_DELAY = 700;
const WIN_DELAY = 900;
const PEEK_TIME = 1500;
const PEEKS_PER_LEVEL = 1;
const SHUFFLE_TIME = 600;
const DEAL_STAGGER = 25;          // ms between tiles fading in at the start

export class GameScene extends Phaser.Scene {
  private levelIndex = 0;
  private level!: LevelData;
  private themeName: ThemeName = "pictures";
  private theme!: Theme;

  private tiles: Tile[] = [];
  private state: State = "idle";
  private firstTile: Tile | null = null;
  private secondTile: Tile | null = null;
  private pairsFound = 0;
  private moves = 0;
  private wrongSinceShuffle = 0;
  private peeksLeft = 0;
  private peeked = false;

  private clockRunning = false;
  private startTime = 0;
  private seconds = 0;

  private movesText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private shuffleText!: Phaser.GameObjects.Text;
  private peekButton!: Button;
  private sparkles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super(GAME_SCENE);
  }

  init(data: GameData): void {
    this.levelIndex = data.level;
    this.level = LEVELS[data.level];
    this.themeName = data.theme;
    this.theme = THEMES[data.theme];

    this.tiles = [];
    this.state = "idle";
    this.firstTile = null;
    this.secondTile = null;
    this.pairsFound = 0;
    this.moves = 0;
    this.wrongSinceShuffle = 0;
    this.peeksLeft = PEEKS_PER_LEVEL;
    this.peeked = false;
    this.clockRunning = false;
    this.seconds = 0;
  }

  create(): void {
    if (this.theme.background !== undefined) {
      this.add.image(this.scale.width / 2, this.scale.height / 2, this.theme.background);
    }
    this.createHud();
    this.layOutGrid();

    // one emitter for every burst of sparkles: explode() fires a burst wherever it is told
    this.sparkles = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: { min: 60, max: 200 },
      lifespan: 600,
      scale: { start: 0.9, end: 0 },
      tint: 0xffd166,
      emitting: false,
    });

    this.input.keyboard!.on("keydown-P", () => {
      this.peek();
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(MENU_SCENE);
    });
  }

  override update(time: number): void {
    if (this.clockRunning) {
      this.seconds = (time - this.startTime) / 1000;
      this.updateHud();
    }
  }

  private createHud(): void {
    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff" };
    this.add.text(20, 14, `${this.levelIndex + 1}. ${this.level.name}`, { ...style, color: "#ffd166" });
    this.movesText = this.add.text(300, 14, "", style);
    this.timeText = this.add.text(440, 14, "", style);
    this.shuffleText = this.add.text(20, 46, "", { ...style, fontSize: "18px", color: "#f4a261" });
    this.peekButton = new Button(this, 690, 38, "", () => {
      this.peek();
    }).setScale(0.7);
    this.updateHud();
  }

  private updateHud(): void {
    this.movesText.setText(`Moves: ${this.moves}`);
    this.timeText.setText(`Time: ${this.seconds.toFixed(1)}`);
    this.peekButton.setLabel(`Peek (${this.peeksLeft})`);
    if (this.level.shuffleAfter > 0) {
      this.shuffleText.setText(`Shuffle after ${this.level.shuffleAfter - this.wrongSinceShuffle} more wrong pairs`);
    }
  }

  // the grid is worked out from the level (cols, rows) and the theme (tile size) - and if it
  // would be too big for the area, every tile is scaled down by the same amount to fit
  private layOutGrid(): void {
    const cols = this.level.cols;
    const rows = this.level.rows;
    const width = this.theme.tileWidth;
    const height = this.theme.tileHeight;

    const gridWidth = cols * width + (cols - 1) * GAP;
    const gridHeight = rows * height + (rows - 1) * GAP;
    const scale = Math.min(1, AREA_WIDTH / gridWidth, AREA_HEIGHT / gridHeight);

    const left = (this.scale.width - gridWidth * scale) / 2 + (width * scale) / 2;
    const top = AREA_TOP + (AREA_HEIGHT - gridHeight * scale) / 2 + (height * scale) / 2;

    const faces = Phaser.Utils.Array.Shuffle(this.theme.makeFaces((cols * rows) / 2));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = left + col * (width + GAP) * scale;
        const y = top + row * (height + GAP) * scale;
        const tile = new Tile(this, x, y, this.theme, faces[row * cols + col], scale);
        tile.on("pointerdown", () => {
          this.tileClicked(tile);
        });
        this.tiles.push(tile);
      }
    }

    // deal the tiles in: each fades in a little after the one before
    this.tweens.add({
      targets: this.tiles,
      alpha: { from: 0, to: 1 },
      duration: 200,
      delay: this.tweens.stagger(DEAL_STAGGER),
    });
  }

  private tileClicked(tile: Tile): void {
    if (this.state !== "idle" && this.state !== "oneUp") {
      return;                    // every other state is locked
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
      for (const tile of [first, second]) {
        tile.celebrate();
        this.sparkles.explode(16, tile.x, tile.y);
      }
      this.pairsFound = this.pairsFound + 1;

      if (this.pairsFound === this.tiles.length / 2) {
        this.win();
      } else {
        this.state = "idle";
      }
    } else {
      this.sound.play(WRONG_KEY);
      first.shake();
      second.shake();
      this.wrongSinceShuffle = this.wrongSinceShuffle + 1;
      this.time.delayedCall(MISMATCH_DELAY, () => {
        first.flipDown();
        second.flipDown(() => {
          this.afterWrongPair();
        });
      });
    }
  }

  // both tiles of a wrong pair are face down again: time for the twist, or back to the player
  private afterWrongPair(): void {
    const shuffleAfter = this.level.shuffleAfter;
    if (shuffleAfter > 0 && this.wrongSinceShuffle >= shuffleAfter) {
      this.shuffleUnmatched();
    } else {
      this.state = "idle";
    }
    this.updateHud();
  }

  // the twist: every tile not yet matched moves to where another unmatched tile was
  private shuffleUnmatched(): void {
    this.state = "shuffling";
    this.wrongSinceShuffle = 0;

    const loose = this.tiles.filter((tile) => !tile.isMatched());
    const places = loose.map((tile) => ({ x: tile.x, y: tile.y }));
    Phaser.Utils.Array.Shuffle(places);

    this.sound.play(SHUFFLE_KEY);
    loose.forEach((tile, index) => {
      tile.slideTo(places[index].x, places[index].y, SHUFFLE_TIME);
    });
    this.flashMessage("Shuffle!");

    this.time.delayedCall(SHUFFLE_TIME, () => {
      this.state = "idle";
    });
  }

  // the power-up: every unmatched tile turns face up for a moment. Only when no tile is showing
  private peek(): void {
    if (this.state !== "idle" || this.peeksLeft === 0) {
      return;
    }
    this.state = "peeking";
    this.peeksLeft = this.peeksLeft - 1;
    this.peeked = true;
    this.peekButton.setEnabled(this.peeksLeft > 0);
    this.updateHud();
    this.sound.play(PEEK_KEY);

    const hidden = this.tiles.filter((tile) => !tile.isMatched());
    for (const tile of hidden) {
      tile.flipUp();
    }
    this.time.delayedCall(PEEK_TIME, () => {
      hidden.forEach((tile, index) => {
        if (index === hidden.length - 1) {
          // the flips all take the same time: when the last has finished, so have the rest
          tile.flipDown(() => {
            this.state = "idle";
          });
        } else {
          tile.flipDown();
        }
      });
    });
  }

  // big text in the middle: it pops up, stays a moment, then fades away
  private flashMessage(message: string): void {
    const text = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontFamily: "Arial",
      fontSize: "72px",
      fontStyle: "bold",
      color: "#f4a261",
      stroke: "#1d2433",
      strokeThickness: 8,
    }).setOrigin(0.5).setScale(0.5).setDepth(1);   // depth 1: drawn above the tiles (depth 0)

    this.tweens.chain({
      targets: text,
      tweens: [
        { scale: 1, duration: 250, ease: "Back.easeOut" },
        { alpha: 0, duration: 400, delay: 400 },
      ],
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private win(): void {
    this.clockRunning = false;
    this.seconds = (this.time.now - this.startTime) / 1000;
    const stars = starsFor(this.moves, this.tiles.length / 2, this.peeked);
    const isNewBest = new BestResults().record(this.themeName, this.levelIndex, {
      stars: stars,
      moves: this.moves,
      seconds: this.seconds,
    });

    const data: LevelCompleteData = {
      level: this.levelIndex,
      theme: this.themeName,
      moves: this.moves,
      seconds: this.seconds,
      stars: stars,
      peeked: this.peeked,
      isNewBest: isNewBest,
    };
    this.time.delayedCall(WIN_DELAY, () => {
      this.scene.start(LEVEL_COMPLETE_SCENE, data);
    });
  }
}
