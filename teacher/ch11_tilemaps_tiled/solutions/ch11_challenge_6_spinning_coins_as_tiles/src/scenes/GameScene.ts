import Phaser from "phaser";
import {
  BACKGROUND_LAYER,
  COIN_KEY,
  COIN_FILE,
  COIN_SOUND,
  COIN_SOUND_FILE,
  COINS_TILESET_NAME, // CHALLENGE 6
  GROUND_LAYER,
  HERO_FILE,
  HERO_KEY,
  HURT_SOUND,
  HURT_SOUND_FILE,
  JUMP_SOUND,
  JUMP_SOUND_FILE,
  MAP_FILE,
  MAP_KEY,
  OBJECTS_LAYER,
  PICKUPS_LAYER, // CHALLENGE 6
  SKY_FILE,
  SKY_KEY,
  SLIME_FILE,
  SLIME_KEY,
  TILES_FILE,
  TILES_KEY,
  TILESET_NAME,
  WIN_SOUND,
  WIN_SOUND_FILE,
} from "../assets.ts";
import { Player } from "../objects/Player.ts";
import { Slime } from "../objects/Slime.ts";
import { getTiledProperty } from "../tiled.ts";

// GameScene - a platform level, made in Tiled
//
// Everything about the level - the ground, the scenery, where the player starts, where the coins and
// enemies are, how fast each enemy walks, and where the finish is - comes from the map file. The code
// only says what those things DO.

const COIN_SPIN = "coin-spin";
const DEFAULT_SLIME_SPEED = 60; // pixels per second, for an enemy with no "speed" property

const TEXT_STYLE = {
  fontFamily: "Arial",
  fontSize: "22px",
  color: "#ffffff",
  stroke: "#1d3557",
  strokeThickness: 4,
};

export class GameScene extends Phaser.Scene {
  // Fields set in create() are declared with "!": it tells TypeScript "this will have a value
  // before it is used", as it cannot see that create() always runs first.
  private map!: Phaser.Tilemaps.Tilemap;
  private ground!: Phaser.Tilemaps.TilemapLayer;
  private pickups!: Phaser.Tilemaps.TilemapLayer; // CHALLENGE 6
  private player!: Player;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private coinText!: Phaser.GameObjects.Text;

  private spawnX = 0;
  private spawnY = 0;
  private coinsCollected = 0;
  private coinsTotal = 0;
  private finished = false;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super("GameScene");
  }

  // runs every time the scene starts - R restarts it, so put the fields back (see Chapter 2)
  init(): void {
    this.coinsCollected = 0;
    this.finished = false;
    this.debugGraphics = null;
  }

  preload(): void {
    // the map (JSON), and the picture its tileset uses - two separate files
    this.load.tilemapTiledJSON(MAP_KEY, MAP_FILE);
    this.load.image(TILES_KEY, TILES_FILE);

    this.load.image(SKY_KEY, SKY_FILE);
    this.load.spritesheet(HERO_KEY, HERO_FILE, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet(COIN_KEY, COIN_FILE, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet(SLIME_KEY, SLIME_FILE, { frameWidth: 32, frameHeight: 32 });
    this.load.audio(COIN_SOUND, COIN_SOUND_FILE);
    this.load.audio(JUMP_SOUND, JUMP_SOUND_FILE);
    this.load.audio(HURT_SOUND, HURT_SOUND_FILE);
    this.load.audio(WIN_SOUND, WIN_SOUND_FILE);
  }

  create(): void {
    // the sky stays still while the camera moves (scroll factor 0)
    this.add.image(0, 0, SKY_KEY).setOrigin(0, 0).setScrollFactor(0);

    this.createMap();
    this.createPlayer();
    this.createCoins();
    this.createEnemies();
    this.createGoal();
    this.createCameraAndText();

    this.input.keyboard!.on("keydown-R", () => {
      this.scene.restart();
    });
    this.input.keyboard!.on("keydown-D", () => {
      this.toggleDebug();
    });
  }

  override update(): void {
    if (!this.finished && this.touchingHazard()) {
      this.hurt();
    }
  }

  // ---- the map --------------------------------------------------------------------------------

  private createMap(): void {
    // 1. the map: its layers, tileset and objects, all read from the JSON file loaded in preload()
    this.map = this.make.tilemap({ key: MAP_KEY });

    // 2. join the tileset in the map (by its NAME in Tiled) to the picture Phaser loaded (by its KEY)
    const tiles = this.map.addTilesetImage(TILESET_NAME, TILES_KEY);
    if (tiles === null) {
      throw new Error(`No tileset "${TILESET_NAME}" in the map, or no picture "${TILES_KEY}" loaded`);
    }

    // 3. a game object for each tile layer, by its name in Tiled. They are drawn in the order they
    //    are made, so the background goes first. (createLayer can also make a GPU layer, which is a
    //    different type - we did not ask for one, so this is an ordinary TilemapLayer.)
    this.map.createLayer(BACKGROUND_LAYER, tiles);
    this.ground = this.map.createLayer(GROUND_LAYER, tiles) as Phaser.Tilemaps.TilemapLayer;

    // CHALLENGE 6 - the second tileset, "coins", joined to the coin_spin picture. Its tiles have GIDs
    // from 17 (its firstgid), so they cannot be mixed up with platform_tiles' 1-16. Phaser 4 plays
    // the tile animation made in Tiled's Tile Animation Editor by itself.
    const coinTiles = this.map.addTilesetImage(COINS_TILESET_NAME, COIN_KEY);
    if (coinTiles === null) {
      throw new Error(`No tileset "${COINS_TILESET_NAME}" in the map, or no picture "${COIN_KEY}" loaded`);
    }
    this.pickups = this.map.createLayer(PICKUPS_LAYER, coinTiles) as Phaser.Tilemaps.TilemapLayer;

    // 4. every tile whose "collides" property is ticked in Tiled's tileset becomes solid
    this.ground.setCollisionByProperty({ collides: true });

    // the physics world is the size of the map, not the size of the screen
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  // ---- things placed in Tiled's object layer ---------------------------------------------------

  private createPlayer(): void {
    // findObject: the first object in the layer that the function says yes to
    const spawn = this.map.findObject(OBJECTS_LAYER, (obj) => obj.name === "player");
    if (spawn === null) {
      throw new Error('The map has no object called "player" in its Objects layer');
    }
    // x and y are optional in Phaser's type for a Tiled object, so give them a fallback
    this.spawnX = spawn.x ?? 0;
    this.spawnY = spawn.y ?? 0;

    Player.createAnimations(this.anims);
    this.player = new Player(this, this.spawnX, this.spawnY);
    this.physics.add.collider(this.player, this.ground);
  }

  private createCoins(): void {
    if (!this.anims.exists(COIN_SPIN)) {
      this.anims.create({
        key: COIN_SPIN,
        frames: this.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // createFromObjects: a Sprite for every object called "coin", placed where the object is, with
    // the texture we ask for
    const coinSprites = this.map.createFromObjects(OBJECTS_LAYER, { name: "coin", key: COIN_KEY });
    // CHALLENGE 6 - the coin tiles count too: every place in the Pickups layer that has a tile
    const coinTiles = this.pickups.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index !== -1);
    this.coinsTotal = coinSprites.length + coinTiles.length;

    // a static physics group gives each coin a body that never moves, so the player can touch it
    this.coins = this.physics.add.staticGroup(coinSprites);
    this.coins.playAnimation(COIN_SPIN);

    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      // Phaser's type for the callback allows bodies and tiles too; here it is always a coin sprite
      this.collectCoin(coin as Phaser.GameObjects.Sprite);
    });

    // CHALLENGE 6 - an overlap with a tile layer reports EVERY tile under the player's body,
    // including the empty places (index -1), so only a real coin tile counts
    this.physics.add.overlap(this.player, this.pickups, (_player, object) => {
      const tile = object as Phaser.Tilemaps.Tile; // from a tile layer, the second object is a Tile
      if (tile.index !== -1) {
        this.collectCoinTile(tile);
      }
    });
  }

  private createEnemies(): void {
    // getObjectLayer(...).objects: every object in the layer, to look through ourselves
    const objectLayer = this.map.getObjectLayer(OBJECTS_LAYER);
    if (objectLayer === null) {
      throw new Error(`The map has no object layer called "${OBJECTS_LAYER}"`);
    }

    const slimes: Slime[] = [];
    for (const obj of objectLayer.objects) {
      if (obj.name === "enemy") {
        // a custom property, set on each enemy in Tiled
        const speed = getTiledProperty(obj.properties, "speed", DEFAULT_SLIME_SPEED);
        slimes.push(new Slime(this, obj.x ?? 0, obj.y ?? 0, speed, this.ground));
      }
    }

    this.physics.add.collider(slimes, this.ground);
    this.physics.add.overlap(this.player, slimes, () => {
      this.hurt();
    });
  }

  private createGoal(): void {
    const goal = this.map.findObject(OBJECTS_LAYER, (obj) => obj.name === "goal");
    if (goal === null) {
      throw new Error('The map has no object called "goal" in its Objects layer');
    }
    const x = goal.x ?? 0;
    const y = goal.y ?? 0;
    const width = goal.width ?? 32;
    const height = goal.height ?? 32;

    // Tiled measures a rectangle from its top-left corner; a Zone - like most game objects - is
    // placed by its centre. A Zone is an invisible rectangle: just right for "is the player here?"
    const zone = this.add.zone(x + width / 2, y + height / 2, width, height);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => {
      this.finish();
    });
  }

  // ---- the camera and the text on screen -------------------------------------------------------

  private createCameraAndText(): void {
    // the camera shows an 800 x 600 window onto the map, following the player (Chapter 10)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);

    // a custom property on the MAP itself (Map > Map Properties in Tiled)
    const levelName = getTiledProperty(this.map.properties, "name", "Unnamed level");

    this.coinText = this.add.text(16, 12, "", TEXT_STYLE).setScrollFactor(0).setDepth(10);
    this.add.text(784, 12, levelName, TEXT_STYLE).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
    this.updateCoinText();
  }

  private updateCoinText(): void {
    this.coinText.setText(`Coins: ${this.coinsCollected} / ${this.coinsTotal}`);
  }

  // ---- what happens -----------------------------------------------------------------------------

  private collectCoin(coin: Phaser.GameObjects.Sprite): void {
    coin.destroy();
    this.coinsCollected = this.coinsCollected + 1;
    this.sound.play(COIN_SOUND);
    this.updateCoinText();
  }

  // CHALLENGE 6 - take the coin tile out of the layer, and count it
  private collectCoinTile(tile: Phaser.Tilemaps.Tile): void {
    this.pickups.removeTileAt(tile.x, tile.y);
    this.coinsCollected = this.coinsCollected + 1;
    this.sound.play(COIN_SOUND);
    this.updateCoinText();
  }

  // Is the player touching a tile with the "hazard" property (spikes, water, lava)? Phaser has
  // turned each tile's Tiled properties into an object, so it is just tile.properties.hazard.
  private touchingHazard(): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    // the tiles under the player's body - trimmed by 2 pixels, so only a real touch counts
    const tiles = this.ground.getTilesWithinWorldXY(body.x + 2, body.y + 2, body.width - 4, body.height - 2);
    return tiles.some((tile) => tile.properties.hazard === true);
  }

  private hurt(): void {
    this.sound.play(HURT_SOUND);
    this.player.respawn(this.spawnX, this.spawnY);
  }

  private finish(): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.physics.pause();
    this.sound.play(WIN_SOUND);

    this.add.rectangle(400, 300, 480, 220, 0x1d3557, 0.85).setScrollFactor(0).setDepth(10);
    const message = `Level complete!\nCoins: ${this.coinsCollected} / ${this.coinsTotal}\n\nPress R to play again`;
    this.add.text(400, 300, message, { ...TEXT_STYLE, fontSize: "36px", align: "center" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);
  }

  // D shows which tiles are solid: Phaser draws the colliding tiles, and their edges that matter
  private toggleDebug(): void {
    if (this.debugGraphics !== null) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
      return;
    }
    this.debugGraphics = this.add.graphics().setDepth(5);
    this.ground.renderDebug(this.debugGraphics, {
      tileColor: null, // tiles that do not collide: not drawn
      collidingTileColor: new Phaser.Display.Color(230, 57, 70, 120),
      faceColor: new Phaser.Display.Color(29, 53, 87, 255),
    });
  }
}
