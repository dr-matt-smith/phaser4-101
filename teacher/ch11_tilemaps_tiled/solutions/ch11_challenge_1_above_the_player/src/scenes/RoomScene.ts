import Phaser from "phaser";
import {
  ABOVE_LAYER, // CHALLENGE 1
  DOOR_SOUND,
  DOOR_SOUND_FILE,
  FLOOR_LAYER,
  HERO_FILE,
  HERO_KEY,
  MAP_EXTENSION,
  MAPS_FOLDER,
  OBJECTS_LAYER,
  TILES_FILE,
  TILES_KEY,
  TILESET_NAME,
  WALLS_LAYER,
} from "../assets.ts";
import { Door } from "../objects/Door.ts";
import { Player } from "../objects/Player.ts";
import { getTiledProperty } from "../tiled.ts";

// RoomScene - one room of a small dungeon, made in Tiled
//
// Which room it shows, and where the player appears, is passed in when the scene starts. Going
// through a door restarts this same scene with the door's target map and entrance - so every room
// is drawn by the same code, and a new room needs a new map, not new code.

// which map to show, and the name of the point object in it where the player appears
export interface RoomData {
  map: string;
  entrance: string;
}

const FIRST_ROOM: RoomData = { map: "hall", entrance: "start" };
const FADE_TIME = 250; // milliseconds
const ABOVE_DEPTH = 10; // CHALLENGE 1 - higher than the player (0), so drawn over them

export class RoomScene extends Phaser.Scene {
  private room: RoomData = FIRST_ROOM;
  private leaving = false;

  // Fields set in create() are declared with "!": it tells TypeScript "this will have a value
  // before it is used", as it cannot see that create() always runs first.
  private player!: Player;

  constructor() {
    super("RoomScene");
  }

  // The first time the game starts, Phaser passes no data - an empty object - so each value falls back
  // to the first room. Partial<RoomData> is RoomData with every field optional.
  init(data: Partial<RoomData>): void {
    this.room = {
      map: data.map ?? FIRST_ROOM.map,
      entrance: data.entrance ?? FIRST_ROOM.entrance,
    };
    this.leaving = false;
  }

  preload(): void {
    this.load.image(TILES_KEY, TILES_FILE);
    this.load.spritesheet(HERO_KEY, HERO_FILE, { frameWidth: 32, frameHeight: 32 });
    this.load.audio(DOOR_SOUND, DOOR_SOUND_FILE);

    // Only the map for THIS room. The map's name is also its key. The first visit to a room loads
    // its file; after that it is already in the cache, and the loader does not load it again.
    this.load.tilemapTiledJSON(this.room.map, MAPS_FOLDER + this.room.map + MAP_EXTENSION);
  }

  create(): void {
    const map = this.make.tilemap({ key: this.room.map });
    const tiles = map.addTilesetImage(TILESET_NAME, TILES_KEY);
    if (tiles === null) {
      throw new Error(`No tileset "${TILESET_NAME}" in map "${this.room.map}", or no picture "${TILES_KEY}" loaded`);
    }

    map.createLayer(FLOOR_LAYER, tiles);
    // an ordinary TilemapLayer (createLayer only makes the GPU kind when asked to)
    const walls = map.createLayer(WALLS_LAYER, tiles) as Phaser.Tilemaps.TilemapLayer;
    walls.setCollisionByProperty({ collides: true });

    this.createPlayer(map);
    this.physics.add.collider(this.player, walls);

    // CHALLENGE 1 - the "Above" layer, drawn over the player. No collision is set on it, so the
    // player walks underneath. Not every room has one: getLayer gives null for a layer that is not
    // in the map (createLayer would warn in the console, and give null too).
    if (map.getLayer(ABOVE_LAYER) !== null) {
      map.createLayer(ABOVE_LAYER, tiles).setDepth(ABOVE_DEPTH);
    }
    this.createDoors(map);
    this.createCameraAndTitle(map);
  }

  private createPlayer(map: Phaser.Tilemaps.Tilemap): void {
    // the entrance is a point object whose NAME is the one we were given
    const entrance = map.findObject(OBJECTS_LAYER, (obj) => obj.name === this.room.entrance);
    if (entrance === null) {
      throw new Error(`Map "${this.room.map}" has no object called "${this.room.entrance}"`);
    }
    Player.createAnimations(this.anims);
    this.player = new Player(this, entrance.x ?? 0, entrance.y ?? 0);
  }

  private createDoors(map: Phaser.Tilemaps.Tilemap): void {
    // filterObjects: every object in the layer that the function says yes to
    const doorObjects = map.filterObjects(OBJECTS_LAYER, (obj) => obj.name === "door") ?? [];
    for (const obj of doorObjects) {
      const door = new Door(this, obj);
      this.physics.add.overlap(this.player, door, () => {
        this.goThrough(door);
      });
    }
  }

  private createCameraAndTitle(map: Phaser.Tilemaps.Tilemap): void {
    // the rooms are smaller than the screen, so point the camera at the middle of the room
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
    this.cameras.main.fadeIn(FADE_TIME);

    // the room's name is a custom property of the MAP (Map > Map Properties in Tiled)
    const name = getTiledProperty(map.properties, "name", this.room.map);
    this.add.text(400, 4, name, { fontFamily: "Arial", fontSize: "20px", color: "#f1faee" })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
  }

  private goThrough(door: Door): void {
    // overlap fires every frame the player is in the doorway: only act on the first
    if (this.leaving || !door.isOpen()) {
      return;
    }
    this.leaving = true;
    this.player.freeze();
    this.sound.play(DOOR_SOUND);

    // fade to black, THEN start this scene again with the next room (see Chapter 4 for camera fades)
    this.cameras.main.fadeOut(FADE_TIME);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const next: RoomData = { map: door.target, entrance: door.entrance };
      this.scene.restart(next);
    });
  }
}
