import Phaser from "phaser";
import {
  CLICK_SOUND_FILE,
  CLICK_SOUND_KEY,
  COIN_FILE,
  COIN_KEY,
  COIN_SOUND_FILE,
  COIN_SOUND_KEY,
  GEM_FILE,
  GEM_KEY,
  HEART_FILE,
  HEART_KEY,
  HURT_SOUND_FILE,
  HURT_SOUND_KEY,
  LEVEL_SOUND_FILE,
  LEVEL_SOUND_KEY,
  LOSE_SOUND_FILE,
  LOSE_SOUND_KEY,
  WIN_SOUND_FILE,
  WIN_SOUND_KEY,
} from "../assets.ts";
import { DEFAULT_DIFFICULTY, DIFFICULTIES, type Difficulty } from "../Difficulty.ts";   // CHALLENGE 6
import { HighScoreTable, TABLE_SIZE } from "../HighScoreTable.ts";
import type { GameData } from "./GameScene.ts";   // CHALLENGE 6
import { GAME_SCENE, TITLE_SCENE } from "./keys.ts";

// TitleScene - the title screen, which is also the high score table
//
// It is the first scene to run, so it loads everything the game needs. It reads the table from
// local storage every time it starts, so it always shows what is saved. After a new high score it
// is started with the row to highlight.

// what NameEntryScene hands over: which row of the table is new (0 = top)
export interface TitleData {
  highlight?: number;   // "?" - optional: the first time the game starts, there is no new row
  difficulty?: Difficulty;   // CHALLENGE 6 - which table to show (and which game to start)
}

const TABLE_TOP = 165;
const ROW_HEIGHT = 30;
const SCORE_DIGITS = 6;

export class TitleScene extends Phaser.Scene {
  private highlight = -1;
  private difficulty: Difficulty = DEFAULT_DIFFICULTY;   // CHALLENGE 6

  constructor() {
    super(TITLE_SCENE);
  }

  // The first time a scene starts, Phaser passes an empty object as its data - so highlight is
  // undefined, and ?? makes that -1 ("no row").
  init(data: TitleData): void {
    this.highlight = data.highlight ?? -1;
    this.difficulty = data.difficulty ?? DEFAULT_DIFFICULTY;   // CHALLENGE 6
  }

  preload(): void {
    this.load.image(COIN_KEY, COIN_FILE);
    this.load.image(GEM_KEY, GEM_FILE);
    this.load.image(HEART_KEY, HEART_FILE);
    this.load.audio(COIN_SOUND_KEY, COIN_SOUND_FILE);
    this.load.audio(HURT_SOUND_KEY, HURT_SOUND_FILE);
    this.load.audio(LEVEL_SOUND_KEY, LEVEL_SOUND_FILE);
    this.load.audio(LOSE_SOUND_KEY, LOSE_SOUND_FILE);
    this.load.audio(WIN_SOUND_KEY, WIN_SOUND_FILE);
    this.load.audio(CLICK_SOUND_KEY, CLICK_SOUND_FILE);
  }

  create(): void {
    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "24px", color: "#ffffff", align: "center" };

    this.add.text(centreX, 60, "COIN COLLECTOR", { ...style, fontSize: "52px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    // CHALLENGE 6 - whose table this is
    this.add.text(centreX, 122, `HIGH SCORES - ${DIFFICULTIES[this.difficulty].name}`, { ...style, color: "#a8dadc" })
      .setOrigin(0.5);

    this.showTable();

    this.add.text(centreX, 505, "Press SPACE to start", { ...style, fontSize: "34px", color: "#ffd166" })
      .setOrigin(0.5);
    // CHALLENGE 6 - the difficulty choice replaces the hint line
    this.add.text(centreX, 555, "Difficulty:   1 EASY     2 NORMAL     3 HARD", {
      ...style,
      fontSize: "20px",
      color: "#9aa4bd",
    }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      const data: GameData = { difficulty: this.difficulty };   // CHALLENGE 6
      this.scene.start(GAME_SCENE, data);
    });

    // CHALLENGE 6 - choosing a difficulty starts this scene again, showing that difficulty's table
    this.input.keyboard!.once("keydown-ONE", () => this.choose("easy"));
    this.input.keyboard!.once("keydown-TWO", () => this.choose("normal"));
    this.input.keyboard!.once("keydown-THREE", () => this.choose("hard"));
  }

  // CHALLENGE 6
  private choose(difficulty: Difficulty): void {
    const data: TitleData = { difficulty: difficulty };
    this.scene.restart(data);
  }

  // One line of text per row. A monospaced font (every letter the same width) keeps the columns
  // lined up without working out where each one goes.
  private showTable(): void {
    const entries = HighScoreTable.load(this.difficulty).getEntries();   // CHALLENGE 6
    const rowStyle = { fontFamily: "Courier New, monospace", fontSize: "24px", fontStyle: "bold", color: "#ffffff" };

    for (let i = 0; i < TABLE_SIZE; i++) {
      const entry = entries[i];   // undefined once past the end of the table
      const place = String(i + 1).padStart(2, " ");
      const line = entry === undefined
        ? `${place}.  ---   ------`
        : `${place}.  ${entry.initials.padEnd(3, " ")}   ${String(entry.score).padStart(SCORE_DIGITS, "0")}   level ${entry.level}`;

      const row = this.add.text(200, TABLE_TOP + i * ROW_HEIGHT, line, rowStyle);

      if (i === this.highlight) {
        row.setColor("#ffd166");
        this.tweens.add({ targets: row, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
      }
    }
  }
}
