import Phaser from "phaser";
import {
  CLOUD_KEY,
  COIN_KEY,
  COIN_SOUND,
  FLAG_FRAME,
  MAP_KEY,
  SKY_KEY,
  STOMP_SOUND,
  TILES_KEY,
  TILESET_NAME,
} from "../assets.ts";
import { Hero } from "../objects/Hero.ts";
import { Slime } from "../objects/Slime.ts";
import type { EndData } from "./EndScene.ts";
import { END_SCENE, GAME_SCENE } from "./keys.ts";
import { COIN_SPIN } from "./TitleScene.ts";

// GameScene - one level, made in Tiled: run to the flag
//
// The map has three tile layers and an object layer:
//   Background - bushes and signs, just for looks
//   Ground     - everything solid; its tiles have a `collides` property, set in Tiled
//   Hazards    - spikes and lava; their tiles have a `hazard` property
//   Objects    - points marking the player's start, the coins, the slimes and the flag
// Being hurt restarts the level; the scene is handed how many attempts there have been so far.

export interface GameData {
  attempt: number;
}

const STOMP_MARGIN = 12; // how far into an enemy's top the hero's feet may be, and still stomp
const HAZARD_MARGIN = 12; // how far into a hazard tile the feet must go before it hurts
const RESTART_DELAY = 1200; // ms from being hurt to starting again

export class GameScene extends Phaser.Scene {
  private hero!: Hero;
  private map!: Phaser.Tilemaps.Tilemap;
  private hudText!: Phaser.GameObjects.Text;
  private attempt = 1;
  private coins = 0;
  private totalCoins = 0;
  private startTime = 0;
  private finished = false;

  constructor() {
    super(GAME_SCENE);
  }

  init(data: GameData): void {
    this.attempt = data.attempt;
    this.coins = 0;
    this.finished = false;
  }

  create(): void {
    // the sky stays put while the camera moves (scroll factor 0); the clouds move a little
    // (0.3) - far-away things seem to move more slowly: PARALLAX
    this.add.image(0, 0, SKY_KEY).setOrigin(0).setScrollFactor(0);
    for (let i = 0; i < 6; i++) {
      this.add.image(120 + i * 260, 60 + (i % 3) * 50, CLOUD_KEY).setScrollFactor(0.3);
    }

    // --- the map, from the Tiled file TitleScene loaded
    this.map = this.make.tilemap({ key: MAP_KEY });
    const tileset = this.map.addTilesetImage(TILESET_NAME, TILES_KEY);
    if (tileset === null) {
      // null means the name did not match the tileset's name inside the map
      throw new Error(`The map has no tileset called "${TILESET_NAME}"`);
    }
    this.map.createLayer("Background", tileset);
    const ground = this.createLayer("Ground", tileset);
    const hazards = this.createLayer("Hazards", tileset);

    // collide with every tile that has collides = true in Tiled - no tile numbers in the code
    ground.setCollisionByProperty({ collides: true });

    // the physics world and the camera are the size of the map, not the screen. The bottom of
    // the world is open, so the hero can fall down a hole
    const width = this.map.widthInPixels;
    const height = this.map.heightInPixels;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, width, height);

    // --- the things placed on the Objects layer
    const start = this.findObject("player");
    this.hero = new Hero(this, start.x!, start.y!);
    this.physics.add.collider(this.hero, ground);

    this.createCoins();

    const slimes = this.physics.add.group();
    for (const point of this.objectsOfType("slime")) {
      slimes.add(new Slime(this, point.x!, point.y!, ground, hazards));
    }
    this.physics.add.collider(slimes, ground);
    this.physics.add.overlap(this.hero, slimes, (_hero, slime) => {
      this.heroMeetsSlime(slime as Slime);
    });

    // hazards only OVERLAP. Phaser checks every tile near the hero - even empty ones - so the
    // process callback decides which count: a hazard tile, with the feet well into it
    this.physics.add.overlap(this.hero, hazards, () => this.hurtHero(), (_hero, tile) => {
      return this.isDeadly(tile as Phaser.Tilemaps.Tile);
    });

    const flagPoint = this.findObject("flag");
    const flag = this.physics.add.staticImage(flagPoint.x!, flagPoint.y! - 16, TILES_KEY, FLAG_FRAME);
    this.physics.add.overlap(this.hero, flag, () => this.reachFlag());

    // --- the camera follows the hero, smoothly (lerp 0.1: move a tenth of the way each frame)
    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
    this.cameras.main.fadeIn(300);

    this.hudText = this.add.text(16, 12, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#1b1f2a",
      fontStyle: "bold",
    }).setScrollFactor(0); // part of the screen, not the world

    this.startTime = this.time.now;
  }

  override update(time: number): void {
    const seconds = (time - this.startTime) / 1000;
    this.hudText.setText(
      `Coins: ${this.coins} / ${this.totalCoins}    Time: ${seconds.toFixed(1)}    Attempt: ${this.attempt}`,
    );

    // fell down a hole?
    if (this.hero.y > this.map.heightInPixels + 100) {
      this.hurtHero();
    }
  }

  // createLayer() gives null if there is no layer with that name - say which one, clearly.
  // It can also make a GPU-drawn layer, if asked to (we do not), so its type says "one or the
  // other"; `as` tells TypeScript it is the ordinary kind
  private createLayer(name: string, tileset: Phaser.Tilemaps.Tileset): Phaser.Tilemaps.TilemapLayer {
    const layer = this.map.createLayer(name, tileset);
    if (layer === null) {
      throw new Error(`The map has no tile layer called "${name}"`);
    }
    return layer as Phaser.Tilemaps.TilemapLayer;
  }

  // every object on the Objects layer with this type
  private objectsOfType(type: string): Phaser.Types.Tilemaps.TiledObject[] {
    return this.map.getObjectLayer("Objects")!.objects.filter((o) => o.type === type);
  }

  private findObject(type: string): Phaser.Types.Tilemaps.TiledObject {
    const found = this.objectsOfType(type)[0];
    if (found === undefined) {
      throw new Error(`The map has no "${type}" object`);
    }
    return found;
  }

  private createCoins(): void {
    const coins = this.physics.add.staticGroup();
    for (const point of this.objectsOfType("coin")) {
      // a point marks the bottom of its square; a coin sits in the middle of it
      const coin: Phaser.Physics.Arcade.Sprite = coins.create(point.x!, point.y! - 16, COIN_KEY);
      coin.play(COIN_SPIN);
    }
    this.totalCoins = coins.getLength();

    this.physics.add.overlap(this.hero, coins, (_hero, coin) => {
      (coin as Phaser.Physics.Arcade.Sprite).destroy();
      this.coins = this.coins + 1;
      this.sound.play(COIN_SOUND);
    });
  }

  // landing on top of a slime squashes it; any other touch hurts the hero
  private heroMeetsSlime(slime: Slime): void {
    if (this.hero.isHurt() || slime.isSquashed()) {
      return;
    }
    const falling = this.hero.body.velocity.y > 0;
    const feetOnTop = this.hero.body.bottom <= slime.body.top + STOMP_MARGIN;

    if (falling && feetOnTop) {
      slime.squash();
      this.hero.bounce();
      this.sound.play(STOMP_SOUND);
    } else {
      this.hurtHero();
    }
  }

  private isDeadly(tile: Phaser.Tilemaps.Tile): boolean {
    return tile.properties.hazard === true && this.hero.body.bottom > tile.pixelY + HAZARD_MARGIN;
  }

  private hurtHero(): void {
    if (this.hero.isHurt() || this.finished) {
      return;
    }
    this.hero.hurt();
    this.cameras.main.stopFollow(); // watch the hero fall off the bottom of the screen

    this.time.delayedCall(RESTART_DELAY, () => {
      const data: GameData = { attempt: this.attempt + 1 };
      this.scene.restart(data);
    });
  }

  private reachFlag(): void {
    if (this.finished || this.hero.isHurt()) {
      return;
    }
    this.finished = true;

    const data: EndData = {
      coins: this.coins,
      totalCoins: this.totalCoins,
      seconds: (this.time.now - this.startTime) / 1000,
      attempts: this.attempt,
    };
    this.cameras.main.fadeOut(500);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(END_SCENE, data);
    });
  }
}
