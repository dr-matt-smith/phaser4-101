import Phaser from "phaser";
import { Cave } from "../Cave.ts";
import { HERO_FILE, HERO_FRAME_SIZE, HERO_KEY, Player } from "../objects/Player.ts";
import {
  EMPTY,
  FLOOR,
  FLOOR_CRACKED,
  FLOOR_MOSSY,
  TILE_SIZE,
  TILES_FILE,
  TILES_KEY,
  VOID,
  WALL,
  WALL_TORCH,
} from "../tiles.ts";

// WorldScene - a random cave, much bigger than the screen, with a camera that follows the player
// and a minimap made from a second camera
//
// Two tilemap layers: a floor everywhere, and a wall layer on top that is empty (-1) wherever
// the cave is open. Only the wall layer collides.

const COLUMNS = 60;
const ROWS = 40;                    // 60 x 40 tiles = 1920 x 1280 pixels - over 5 screens

const GEM_KEY = "gem";
const GEM_FILE = "assets/images/gem.png";
const COIN_KEY = "coin";
const COIN_FILE = "assets/audio/coin.wav";
const GEM_COUNT = 10;
const GEM_MIN_DISTANCE = 8;         // gems are at least this many tiles from the start

const TORCH_CHANCE = 0.08;          // how many wall faces get a torch

// the minimap: a second camera in the top right corner, zoomed right out
const MINI_ZOOM = 0.1;
const MINI_WIDTH = COLUMNS * TILE_SIZE * MINI_ZOOM;     // 192 - the whole world fits
const MINI_HEIGHT = ROWS * TILE_SIZE * MINI_ZOOM;       // 128
const MINI_X = 800 - MINI_WIDTH - 10;
const MINI_Y = 10;
const MARKER_RADIUS = 30;           // big in the world, so it shows up at a tenth of the size

export class WorldScene extends Phaser.Scene {
  // fields set in create() are marked with ! - "trust me, this will be set before it is used"
  private player!: Player;
  private marker!: Phaser.GameObjects.Arc;
  private hudText!: Phaser.GameObjects.Text;
  private gemsFound = 0;

  constructor() {
    super("WorldScene");
  }

  // R restarts this scene - and Phaser reuses the scene object (Chapter 2), so reset the count here
  init(): void {
    this.gemsFound = 0;
  }

  preload(): void {
    this.load.image(TILES_KEY, TILES_FILE);
    this.load.spritesheet(HERO_KEY, HERO_FILE, { frameWidth: HERO_FRAME_SIZE, frameHeight: HERO_FRAME_SIZE });
    this.load.image(GEM_KEY, GEM_FILE);
    this.load.audio(COIN_KEY, COIN_FILE);
  }

  create(): void {
    const cave = new Cave(COLUMNS, ROWS);

    // an empty map; its layers are made blank, then filled in
    const map = this.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: COLUMNS, height: ROWS });
    const tileset = map.addTilesetImage(TILES_KEY)!;

    // layer 1, the floor: every cell, mostly plain, some cracked or mossy. weightedRandomize picks a
    // random index for each tile - a weight of 12 is 12 times as likely as a weight of 1
    const floor = map.createBlankLayer("floor", tileset)!;
    floor.weightedRandomize([
      { index: FLOOR, weight: 12 },
      { index: FLOOR_CRACKED, weight: 1 },
      { index: FLOOR_MOSSY, weight: 1 },
    ]);

    // layer 2, the walls: drawn on top of the floor, and empty (-1) where the cave is open
    const walls = map.createBlankLayer("walls", tileset)!;
    walls.putTilesAt(this.wallTiles(cave), 0, 0);
    walls.setCollisionByExclusion([EMPTY]);       // every tile that is not empty collides

    const start = map.tileToWorldXY(cave.start.column, cave.start.row)!;
    this.player = new Player(this, start.x + TILE_SIZE / 2, start.y + TILE_SIZE / 2);
    this.physics.add.collider(this.player, walls);

    this.addGems(cave);

    // the world is bigger than the screen. The camera follows the player, but never shows
    // anything outside the map; the physics world is the size of the map too
    const width = map.widthInPixels;
    const height = map.heightInPixels;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player, true);     // true: round to whole pixels - no shimmer

    this.hudText = this.add.text(10, 10, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#1d2433",
      padding: { x: 8, y: 6 },
    });
    this.hudText.setScrollFactor(0);        // stays put on the screen while the camera moves
    this.updateHud();

    this.addMinimap(width, height);

    this.input.keyboard!.once("keydown-R", () => {
      this.scene.restart();                 // a new scene start - so a new cave
    });
  }

  override update(): void {
    // the minimap's dot goes wherever the player goes
    this.marker.setPosition(this.player.x, this.player.y);
  }

  // turn the cave into tile indexes for the wall layer: -1 where it is open; for rock, bricks
  // where it is next to the floor (with the odd torch, if the floor is just below), and black
  // where it is deep inside the rock
  private wallTiles(cave: Cave): number[][] {
    const data: number[][] = [];
    for (let row = 0; row < cave.rows; row++) {
      const line: number[] = [];
      for (let column = 0; column < cave.columns; column++) {
        if (!cave.isSolid(column, row)) {
          line.push(EMPTY);
        } else if (!cave.isSolid(column, row + 1) && Math.random() < TORCH_CHANCE) {
          line.push(WALL_TORCH);
        } else if (this.nextToFloor(cave, column, row)) {
          line.push(WALL);
        } else {
          line.push(VOID);
        }
      }
      data.push(line);
    }
    return data;
  }

  // is any of the 8 cells around this one open floor?
  private nextToFloor(cave: Cave, column: number, row: number): boolean {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!cave.isSolid(column + dx, row + dy)) {
          return true;
        }
      }
    }
    return false;
  }

  // gems on random floor cells, not too near the start
  private addGems(cave: Cave): void {
    const places = cave.openCells().filter((cell) =>
      Phaser.Math.Distance.Between(cell.column, cell.row, cave.start.column, cave.start.row) >= GEM_MIN_DISTANCE
    );
    Phaser.Utils.Array.Shuffle(places);

    const gems = this.physics.add.staticGroup();
    for (const cell of places.slice(0, GEM_COUNT)) {
      gems.create(cell.column * TILE_SIZE + TILE_SIZE / 2, cell.row * TILE_SIZE + TILE_SIZE / 2, GEM_KEY);
    }

    this.physics.add.overlap(this.player, gems, (_player, gem) => {
      // Phaser's callback type allows bodies and tiles too; here it can only be one of the gems
      (gem as Phaser.Physics.Arcade.Image).destroy();
      this.sound.play(COIN_KEY);
      this.gemsFound++;
      this.updateHud();
    });
  }

  private updateHud(): void {
    const done = this.gemsFound === GEM_COUNT ? "  - all found! R for a new cave" : "";
    this.hudText.setText(`Gems: ${this.gemsFound} / ${GEM_COUNT}${done}`);
  }

  // a second camera: small, in the corner, zoomed out to show the whole world. Every camera draws
  // every game object - unless told to ignore it
  private addMinimap(width: number, height: number): void {
    const minimap = this.cameras.add(MINI_X, MINI_Y, MINI_WIDTH, MINI_HEIGHT);
    minimap.setZoom(MINI_ZOOM);
    minimap.setBounds(0, 0, width, height);
    minimap.centerOn(width / 2, height / 2);
    minimap.setBackgroundColor(0x000000);

    // a big red dot on the player: only the minimap shows it
    this.marker = this.add.circle(this.player.x, this.player.y, MARKER_RADIUS, 0xe63946);
    this.cameras.main.ignore(this.marker);

    // a frame round the minimap, drawn by the main camera, which does not scroll (scroll factor 0)
    const frame = this.add.rectangle(MINI_X, MINI_Y, MINI_WIDTH, MINI_HEIGHT).setOrigin(0);
    frame.setStrokeStyle(2, 0xf1faee).setScrollFactor(0);

    // the minimap should not draw the frame or the HUD text
    minimap.ignore([frame, this.hudText]);
  }
}
