import Phaser from "phaser";
import { LEVEL, START_COLUMN, START_ROW } from "../level.ts";
import { HERO_FILE, HERO_FRAME_SIZE, HERO_KEY, Player } from "../objects/Player.ts";
// CHALLENGE 2: SAND imported too
import { SAND, TILE_NAMES, TILE_SIZE, TILES_FILE, TILES_KEY, WALL, WATER } from "../tiles.ts";

// GameScene - a top-down map built from a 2D array, and a player who cannot walk into walls or water
//
// The map is data (level.ts); the tileset is a picture (simple_tiles.png). A Tilemap joins the two,
// and a TilemapLayer draws the result - and, with setCollision, blocks the player.

const INFO_Y = 588;          // the line of text in the strip below the map

// CHALLENGE 2: walking on sand is half speed
const SAND_SPEED = 0.5;

export class GameScene extends Phaser.Scene {
  // fields set in create() are marked with ! - "trust me, this will be set before it is used"
  private player!: Player;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private showDebug = false;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    // a tileset is loaded as a plain image - Phaser cuts it into tiles later
    this.load.image(TILES_KEY, TILES_FILE);
    this.load.spritesheet(HERO_KEY, HERO_FILE, { frameWidth: HERO_FRAME_SIZE, frameHeight: HERO_FRAME_SIZE });
  }

  create(): void {
    // 1. the map: the data, and the size of one tile in pixels
    const map = this.make.tilemap({ data: LEVEL, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });

    // 2. the tileset: which loaded image the tile indexes refer to
    const tileset = map.addTilesetImage(TILES_KEY)!;

    // 3. the layer: the game object that draws the tiles. A map made from an array has one layer, 0.
    //    createLayer can make a TilemapLayer or (if asked) a GPU-only TilemapGPULayer, so its return
    //    type is "either"; we did not ask for a GPU layer, so we tell TypeScript which one it is
    this.layer = map.createLayer(0, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;

    // 4. collision: tiles with these indexes block physics bodies
    this.layer.setCollision([WATER, WALL]);

    // the player starts in the middle of a tile. tileToWorldXY gives the tile's TOP LEFT corner
    const start = map.tileToWorldXY(START_COLUMN, START_ROW)!;
    this.player = new Player(this, start.x + TILE_SIZE / 2, start.y + TILE_SIZE / 2);

    // 5. the player bumps into the colliding tiles
    this.physics.add.collider(this.player, this.layer);

    // D shows which tiles collide
    this.debugGraphics = this.add.graphics();
    this.input.keyboard!.on("keydown-D", () => {
      this.toggleDebug();
    });

    this.infoText = this.add.text(12, INFO_Y, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
    }).setOrigin(0, 0.5);
  }

  override update(): void {
    // which tile is under the middle of the player? getTileAtWorldXY takes PIXELS...
    const tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y);

    // CHALLENGE 2: slow on sand, full speed anywhere else
    const onSand = tile !== null && tile.index === SAND;
    this.player.setSpeedFactor(onSand ? SAND_SPEED : 1);

    // ...and the tile knows its own column and row (x and y, counted in tiles) and index
    if (tile) {
      const name = TILE_NAMES[tile.index];
      this.infoText.setText(
        `Standing on: ${name} (tile ${tile.index})  at column ${tile.x}, row ${tile.y}` +
          `        Arrow keys: walk    D: show collision`,
      );
    }
  }

  private toggleDebug(): void {
    this.showDebug = !this.showDebug;
    this.debugGraphics.clear();

    if (this.showDebug) {
      // renderDebug draws every tile that collides, and its colliding edges
      this.layer.renderDebug(this.debugGraphics, {
        tileColor: null,                                          // tiles that do not collide: nothing
        collidingTileColor: new Phaser.Display.Color(230, 57, 70, 120),
        faceColor: new Phaser.Display.Color(255, 255, 255, 255),
      });
    }
  }
}
