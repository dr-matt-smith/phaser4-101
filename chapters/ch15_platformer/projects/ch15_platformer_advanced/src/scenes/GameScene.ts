import Phaser from "phaser";
import {
  CHECKPOINT_SOUND,
  CLOUD_KEY,
  COIN_KEY,
  COIN_SOUND,
  COINS,
  FLAG_FRAME,
  LEVEL_NAME,
  LIVES,
  SKY_KEY,
  STOMP_SOUND,
  TILES_KEY,
  TILESET_NAME,
  TOTAL_COINS,
} from "../assets.ts";
import { LEVELS } from "../config/levels.ts";
import { Bat } from "../objects/Bat.ts";
import { Checkpoint } from "../objects/Checkpoint.ts";
import type { Enemy } from "../objects/Enemy.ts";
import { Hero } from "../objects/Hero.ts";
import { MovingPlatform } from "../objects/MovingPlatform.ts";
import { Slime } from "../objects/Slime.ts";
import { getNumberProperty } from "../tiled.ts";
import { GAME_SCENE, HUD_SCENE, MENU_SCENE, RESULT_SCENE } from "./keys.ts";
import { COIN_SPIN } from "./PreloadScene.ts";
import type { ResultData } from "./ResultScene.ts";

// GameScene - plays ONE level; which one is passed in init(data)
//
// Every level is a Tiled map with the same layers:
//   Background, Ground (collides), Hazards (hazard), Ladders (ladder), and Objects - points for
//   the player, coins, slimes, bats, checkpoints and the flag, and rectangles for platforms.
// So this one scene can play any of them.

export interface GameData {
  level: number; // index into LEVELS
}

const STOMP_MARGIN = 12;
const HAZARD_MARGIN = 12;
const RESPAWN_DELAY = 1200; // ms from being hurt to coming back at the checkpoint

export class GameScene extends Phaser.Scene {
  private level = 0;
  private map!: Phaser.Tilemaps.Tilemap;
  private ladders!: Phaser.Tilemaps.TilemapLayer;
  private hero!: Hero;
  private respawnPoint!: Phaser.Math.Vector2;
  private coins = 0;
  private startTime = 0;
  private finished = false;

  constructor() {
    super(GAME_SCENE);
  }

  init(data: GameData): void {
    this.level = data.level;
    this.coins = 0;
    this.finished = false;
  }

  create(): void {
    const info = LEVELS[this.level];

    this.add.image(0, 0, SKY_KEY).setOrigin(0).setScrollFactor(0).setTint(info.skyTint);
    for (let i = 0; i < 8; i++) {
      this.add.image(120 + i * 260, 60 + (i % 3) * 50, CLOUD_KEY).setScrollFactor(0.3).setTint(info.skyTint);
    }

    // --- the map and its layers
    this.map = this.make.tilemap({ key: info.key });
    const tileset = this.map.addTilesetImage(TILESET_NAME, TILES_KEY);
    if (tileset === null) {
      throw new Error(`The map ${info.key} has no tileset called "${TILESET_NAME}"`);
    }
    this.map.createLayer("Background", tileset);
    this.ladders = this.createLayer("Ladders", tileset);
    const ground = this.createLayer("Ground", tileset);
    const hazards = this.createLayer("Hazards", tileset);
    ground.setCollisionByProperty({ collides: true });
    this.makeLadderTopsSolid();

    const width = this.map.widthInPixels;
    const height = this.map.heightInPixels;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, width, height);

    // --- the hero
    const start = this.findObject("player");
    this.respawnPoint = new Phaser.Math.Vector2(start.x, start.y);
    this.hero = new Hero(this, start.x!, start.y!, (x, y) => this.findLadder(x, y));
    this.physics.add.collider(this.hero, ground);
    // ladder tops are solid - except while climbing, when the hero must pass through them
    this.physics.add.collider(this.hero, this.ladders, undefined, () => !this.hero.isClimbing());
    this.physics.add.overlap(this.hero, hazards, () => this.hurtHero(), (_hero, tile) => {
      return this.isDeadly(tile as Phaser.Tilemaps.Tile);
    });

    // --- everything on the Objects layer
    this.createCoins();
    this.createPlatforms();
    this.createEnemies(ground, hazards);
    this.createCheckpoints();
    const flagPoint = this.findObject("flag");
    const flag = this.physics.add.staticImage(flagPoint.x!, flagPoint.y! - 16, TILES_KEY, FLAG_FRAME);
    this.physics.add.overlap(this.hero, flag, () => this.reachFlag());

    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
    this.cameras.main.fadeIn(300);

    // --- the HUD: a scene of its own, drawn on top, reading the registry
    this.registry.set(LEVEL_NAME, info.name);
    this.registry.set(COINS, 0);
    this.scene.launch(HUD_SCENE);

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.stop(HUD_SCENE);
      this.scene.start(MENU_SCENE);
    });

    this.startTime = this.time.now;
  }

  override update(): void {
    if (this.hero.y > this.map.heightInPixels + 100) {
      this.hurtHero();
    }
  }

  private createLayer(name: string, tileset: Phaser.Tilemaps.Tileset): Phaser.Tilemaps.TilemapLayer {
    const layer = this.map.createLayer(name, tileset);
    if (layer === null) {
      throw new Error(`The map has no tile layer called "${name}"`);
    }
    return layer as Phaser.Tilemaps.TilemapLayer; // an ordinary layer, not a GPU one
  }

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

  // --- ladders ------------------------------------------------------------------------------

  // The top square of each ladder is solid on its top face only - (left, right, up, down) - so
  // the hero can stand on top of a ladder, and step off it onto the platform beside
  private makeLadderTopsSolid(): void {
    this.ladders.forEachTile((tile) => {
      const above = this.ladders.getTileAt(tile.x, tile.y - 1);
      if (tile.index !== -1 && above === null) {
        tile.setCollision(false, false, true, false);
      }
    });
  }

  // the function the hero is given: the middle of the ladder at (x, y), or null
  private findLadder(x: number, y: number): number | null {
    const tile = this.ladders.getTileAtWorldXY(x, y);
    if (tile === null) {
      return null;
    }
    return tile.getCenterX();
  }

  // --- the objects --------------------------------------------------------------------------

  private createCoins(): void {
    const coins = this.physics.add.staticGroup();
    for (const point of this.objectsOfType("coin")) {
      const coin: Phaser.Physics.Arcade.Sprite = coins.create(point.x!, point.y! - 16, COIN_KEY);
      coin.play(COIN_SPIN);
    }
    this.registry.set(TOTAL_COINS, coins.getLength());

    this.physics.add.overlap(this.hero, coins, (_hero, coin) => {
      (coin as Phaser.Physics.Arcade.Sprite).destroy();
      this.coins = this.coins + 1;
      this.registry.set(COINS, this.coins); // the HUD hears about this
      this.sound.play(COIN_SOUND);
    });
  }

  // rectangles on the Objects layer, with custom properties moveX, moveY and duration
  private createPlatforms(): void {
    const platforms: MovingPlatform[] = [];
    for (const rect of this.objectsOfType("platform")) {
      platforms.push(
        new MovingPlatform(
          this,
          rect.x!,
          rect.y!,
          rect.width!,
          getNumberProperty(rect, "moveX", 0),
          getNumberProperty(rect, "moveY", 0),
          getNumberProperty(rect, "duration", 0),
        ),
      );
    }
    // a collider takes a game object, a group, or an array of them
    this.physics.add.collider(this.hero, platforms);
  }

  private createEnemies(ground: Phaser.Tilemaps.TilemapLayer, hazards: Phaser.Tilemaps.TilemapLayer): void {
    const slimes: Slime[] = [];
    for (const point of this.objectsOfType("slime")) {
      slimes.push(new Slime(this, point.x!, point.y!, ground, hazards));
    }
    this.physics.add.collider(slimes, ground);

    // bats fly through walls: no collider with the ground at all
    const bats: Bat[] = [];
    for (const point of this.objectsOfType("bat")) {
      bats.push(new Bat(this, point.x!, point.y! - 16, this.hero));
    }

    // one overlap, and one handler, for both kinds: Slime and Bat both implement Enemy, and
    // that is all heroMeetsEnemy() needs to know
    this.physics.add.overlap(this.hero, [...slimes, ...bats], (_hero, enemy) => {
      this.heroMeetsEnemy(enemy as Slime | Bat);
    });
  }

  private createCheckpoints(): void {
    const checkpoints: Checkpoint[] = [];
    for (const point of this.objectsOfType("checkpoint")) {
      checkpoints.push(new Checkpoint(this, point.x!, point.y!));
    }
    this.physics.add.overlap(this.hero, checkpoints, (_hero, checkpoint) => {
      const reached = checkpoint as Checkpoint;
      if (reached.reach()) {
        this.respawnPoint.set(reached.x, reached.y);
        this.sound.play(CHECKPOINT_SOUND);
        this.showMessage("Checkpoint!", reached.x, reached.y - 60);
      }
    });
  }

  // --- what happens -------------------------------------------------------------------------

  private heroMeetsEnemy(enemy: Enemy): void {
    if (!this.hero.canBeHurt() || enemy.isSquashed()) {
      return;
    }
    const falling = this.hero.body.velocity.y > 0;
    const feetOnTop = this.hero.body.bottom <= enemy.body.top + STOMP_MARGIN;

    if (falling && feetOnTop) {
      enemy.squash();
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
    if (!this.hero.canBeHurt() || this.finished) {
      return;
    }
    this.hero.hurt();
    this.cameras.main.stopFollow();

    const lives: number = this.registry.get(LIVES) - 1;
    this.registry.set(LIVES, lives);

    this.time.delayedCall(RESPAWN_DELAY, () => {
      if (lives > 0) {
        this.hero.respawn(this.respawnPoint.x, this.respawnPoint.y);
        this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
      } else {
        this.endLevel("gameOver");
      }
    });
  }

  private reachFlag(): void {
    if (this.finished || this.hero.isHurt()) {
      return;
    }
    this.endLevel("complete");
  }

  private endLevel(outcome: ResultData["outcome"]): void {
    this.finished = true;
    const data: ResultData = {
      outcome,
      level: this.level,
      coins: this.coins,
      totalCoins: this.registry.get(TOTAL_COINS),
      seconds: (this.time.now - this.startTime) / 1000,
    };
    this.cameras.main.fadeOut(500);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(HUD_SCENE);
      this.scene.start(RESULT_SCENE, data);
    });
  }

  // a word that floats up and fades away (Chapter 7)
  private showMessage(text: string, x: number, y: number): void {
    const message = this.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5).setStroke("#1b1f2a", 5);
    this.tweens.add({
      targets: message,
      y: y - 50,
      alpha: 0,
      duration: 1200,
      onComplete: () => message.destroy(),
    });
  }
}
