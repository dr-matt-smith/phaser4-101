import Phaser from "phaser";
import { Palette } from "../objects/Palette.ts";
import { EMPTY, GRASS, TILE_COUNT, TILE_FRAMES_KEY, TILE_NAMES, TILE_SIZE, TILES_FILE, TILES_KEY } from "../tiles.ts";

// PainterScene - a tile map you paint with the mouse
//
// Click or drag to put the chosen tile down; number keys (or the palette) choose the tile. The map
// can be saved in the browser's localStorage, loaded again, and printed as a 2D array ready to
// paste into code.

// the same size as ch10_array_map's level: 25 x 18 tiles, 800 x 576 pixels
const MAP_COLUMNS = 25;
const MAP_ROWS = 18;

const STRIP_Y = 588;                        // the middle of the strip below the map
const SAVE_KEY = "ch10-tile-painter-map";   // the name the map is saved under in localStorage
const MESSAGE_TIME = 2000;                  // how long "Saved" etc. stays on screen, in ms

export class PainterScene extends Phaser.Scene {
  // fields set in create() are marked with ! - "trust me, this will be set before it is used"
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private palette!: Palette;
  private highlight!: Phaser.GameObjects.Rectangle;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private current = GRASS;                  // the tile that clicks paint

  constructor() {
    super("PainterScene");
  }

  preload(): void {
    this.load.image(TILES_KEY, TILES_FILE);
    // the same PNG, under a second key, cut into frames - for the palette's buttons
    this.load.spritesheet(TILE_FRAMES_KEY, TILES_FILE, { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
  }

  create(): void {
    // no data this time: an empty map of the right size, and a blank layer to paint on
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_COLUMNS,
      height: MAP_ROWS,
    });
    const tileset = map.addTilesetImage(TILES_KEY)!;
    this.layer = map.createBlankLayer("ground", tileset)!;
    this.layer.fill(GRASS);

    // a frame that shows which tile the mouse is over (hidden until the mouse moves onto the map)
    this.highlight = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE).setOrigin(0).setStrokeStyle(2, 0xffffff);
    this.highlight.setVisible(false);

    this.palette = new Palette(this, 20, STRIP_Y, (index) => this.choose(index));

    const style = { fontFamily: "Arial", fontSize: "15px", color: "#ffffff" };
    this.statusText = this.add.text(150, STRIP_Y, "", style).setOrigin(0, 0.5);
    this.messageText = this.add.text(788, STRIP_Y, "", { ...style, color: "#ffd166" }).setOrigin(1, 0.5);

    // paint when the button goes down, and while it is held and the mouse moves
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.paint(pointer));
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.hover(pointer);
      if (pointer.isDown) {
        this.paint(pointer);
      }
    });

    // 1-4 choose a tile, 0 the eraser. "keydown" hears every key; event.key is the key's text
    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      const digit = Number(event.key);
      if (event.key === "0") {
        this.choose(EMPTY);
      } else if (digit >= 1 && digit <= TILE_COUNT) {
        this.choose(digit - 1);
      }
    });
    this.input.keyboard!.on("keydown-S", () => this.saveMap());
    this.input.keyboard!.on("keydown-L", () => this.loadMap());
    this.input.keyboard!.on("keydown-C", () => this.layer.fill(GRASS));
    this.input.keyboard!.on("keydown-P", () => this.print());

    this.choose(GRASS);
  }

  private choose(index: number): void {
    this.current = index;
    this.palette.show(index);
    const name = index === EMPTY ? "eraser" : `${TILE_NAMES[index]} (${index})`;
    this.statusText.setText(`Painting: ${name}`);
  }

  // which tile is under the pointer? worldToTileXY turns pixels into a column and a row
  private tileUnder(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 | null {
    const cell = this.layer.worldToTileXY(pointer.worldX, pointer.worldY);
    const onMap = cell.x >= 0 && cell.x < MAP_COLUMNS && cell.y >= 0 && cell.y < MAP_ROWS;
    return onMap ? cell : null;
  }

  private paint(pointer: Phaser.Input.Pointer): void {
    const cell = this.tileUnder(pointer);
    if (cell === null) {
      return;         // below the map - the palette handles its own clicks
    }

    if (this.current === EMPTY) {
      this.layer.removeTileAt(cell.x, cell.y);          // leaves a hole: nothing is drawn there
    } else {
      this.layer.putTileAt(this.current, cell.x, cell.y);
    }
  }

  // move the white frame onto the tile under the pointer. tileToWorldXY turns a column and row back
  // into pixels - the tile's top left corner
  private hover(pointer: Phaser.Input.Pointer): void {
    const cell = this.tileUnder(pointer);
    this.highlight.setVisible(cell !== null);
    if (cell !== null) {
      const corner = this.layer.tileToWorldXY(cell.x, cell.y);
      this.highlight.setPosition(corner.x, corner.y);
    }
  }

  // the map as a 2D array of tile indexes, one inner array per row - like level.ts in ch10_array_map
  private toArray(): number[][] {
    const rows: number[][] = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      const indexes: number[] = [];
      for (let column = 0; column < MAP_COLUMNS; column++) {
        const tile = this.layer.getTileAt(column, row);      // null where there is no tile
        indexes.push(tile === null ? EMPTY : tile.index);
      }
      rows.push(indexes);
    }
    return rows;
  }

  // localStorage keeps strings, in this browser, until they are deleted (Chapter 6)
  private saveMap(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.toArray()));
    this.showMessage("Saved");
  }

  private loadMap(): void {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved === null) {
      this.showMessage("Nothing saved yet");
      return;
    }

    // what comes back is only text - check it really is a map of the right size before using it.
    // JSON.parse throws an exception if the text is not JSON at all
    let data: unknown = null;
    try {
      data = JSON.parse(saved);
    } catch {
      // leave data as null - isMap says no
    }
    if (!this.isMap(data)) {
      this.showMessage("The saved map is damaged");
      return;
    }

    // putTilesAt puts a whole 2D array down at once, starting at column 0, row 0. -1 becomes empty
    this.layer.putTilesAt(data, 0, 0);
    this.showMessage("Loaded");
  }

  // true if value is MAP_ROWS arrays of MAP_COLUMNS tile indexes (or -1)
  private isMap(value: unknown): value is number[][] {
    return Array.isArray(value) && value.length === MAP_ROWS &&
      value.every((row) =>
        Array.isArray(row) && row.length === MAP_COLUMNS &&
        row.every((index) => Number.isInteger(index) && index >= EMPTY && index < TILE_COUNT)
      );
  }

  // write the map to the browser's console as TypeScript, ready to paste into level.ts
  private print(): void {
    const lines = this.toArray().map((row) => `  [${row.join(", ")}],`);
    console.log(`export const LEVEL: number[][] = [\n${lines.join("\n")}\n];`);
    this.showMessage("Printed to the browser's console");
  }

  private showMessage(message: string): void {
    this.messageText.setText(message);
    this.time.delayedCall(MESSAGE_TIME, () => {
      if (this.messageText.text === message) {
        this.messageText.setText("");
      }
    });
  }
}
