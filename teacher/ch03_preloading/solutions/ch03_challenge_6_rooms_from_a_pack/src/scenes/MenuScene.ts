import Phaser from "phaser";
import { packKey, type Room, ROOMS, ROOMS_PACK_FILE } from "../rooms.ts";     // CHALLENGE 6
import { MENU_SCENE, ROOM_SCENE } from "./keys.ts";
import type { RoomData } from "./RoomScene.ts";

// MenuScene - a button for each room. A room's files are loaded the first time it is chosen
//
// preload() loads only what the menu itself needs. A room's pictures and sound are loaded when
// the player clicks its button - by queueing them in the middle of the game and calling
// this.load.start() - and after that they stay in the game's caches, so going back is instant.

const BUTTON_KEY = "button";
const BUTTON_FILE = "assets/images/button.png";
const BUTTON_OVER_KEY = "button_over";
const BUTTON_OVER_FILE = "assets/images/button_over.png";
const CLICK_KEY = "click";
const CLICK_FILE = "assets/audio/click.wav";

const FIRST_BUTTON_Y = 170;
const BUTTON_SPACING = 80;
const BAR_WIDTH = 400;
const BAR_HEIGHT = 16;
const BAR_Y = 520;
const BAR_COLOUR = 0x2a9d8f;

const STYLE = { fontFamily: "Arial", fontSize: "20px", color: "#e8ecf5" };

export class MenuScene extends Phaser.Scene {
  private statusTexts: Phaser.GameObjects.Text[] = [];
  private loadingText!: Phaser.GameObjects.Text;
  private memoryText!: Phaser.GameObjects.Text;
  private bar!: Phaser.GameObjects.Graphics;

  constructor() {
    super(MENU_SCENE);
  }

  init(): void {
    this.statusTexts = [];
  }

  preload(): void {
    this.load.image(BUTTON_KEY, BUTTON_FILE);
    this.load.image(BUTTON_OVER_KEY, BUTTON_OVER_FILE);
    this.load.audio(CLICK_KEY, CLICK_FILE);
  }

  create(): void {
    const centreX = this.scale.width / 2;

    this.add.text(centreX, 60, "Choose a room", { ...STYLE, fontSize: "40px", color: "#ffd166" }).setOrigin(0.5);
    this.add.text(centreX, 105, "Each room loads its files the first time you go in", STYLE).setOrigin(0.5);

    ROOMS.forEach((room, index) => {
      this.addRoomButton(room, index, centreX - 60, FIRST_BUTTON_Y + index * BUTTON_SPACING);
    });

    // the loading bar, and a line of text above it - empty until something loads
    this.loadingText = this.add.text(centreX, BAR_Y - 24, "", { ...STYLE, fontSize: "16px" }).setOrigin(0.5);
    this.bar = this.add.graphics();
    this.memoryText = this.add.text(centreX, 570, "", { ...STYLE, fontSize: "16px", color: "#9aa4bd" })
      .setOrigin(0.5);

    // The loader belongs to this scene, and can be used at any time - not just in preload().
    // Its listeners are removed when the scene shuts down, so adding them here, every time the
    // menu starts, does not pile them up.
    this.load.on("progress", (value: number) => {
      this.bar.clear();
      this.bar.fillStyle(BAR_COLOUR);
      this.bar.fillRect(centreX - BAR_WIDTH / 2, BAR_Y, BAR_WIDTH * value, BAR_HEIGHT);
    });
    this.load.on("fileprogress", (file: Phaser.Loader.File) => {
      this.loadingText.setText(`Loading ${file.src}`);
    });

    // U forgets every room's files, so the next visit has to load them again
    this.input.keyboard!.on("keydown-U", () => {
      this.unloadRooms();
    });

    this.refreshStatus();
  }

  private addRoomButton(room: Room, index: number, x: number, y: number): void {
    const button = this.add.image(x, y, BUTTON_KEY);
    this.add.text(x, y, room.name, { ...STYLE, fontSize: "26px", color: "#1b1f2a" }).setOrigin(0.5);

    const status = this.add.text(x + 130, y, "", STYLE).setOrigin(0, 0.5);
    this.statusTexts.push(status);

    button.setInteractive({ useHandCursor: true });
    button.on("pointerover", () => {
      button.setTexture(BUTTON_OVER_KEY);
    });
    button.on("pointerout", () => {
      button.setTexture(BUTTON_KEY);
    });
    button.on("pointerdown", () => {
      this.chooseRoom(index);
    });
  }

  private chooseRoom(index: number): void {
    // one load at a time: ignore clicks while a room is loading
    if (this.load.isLoading()) {
      return;
    }
    this.sound.play(CLICK_KEY);

    const room = ROOMS[index];
    if (this.isLoaded(room)) {
      this.enterRoom(index);
      return;
    }

    // queue the room's files, say what to do when they have all loaded, and start the loader
    this.queueRoom(room);
    this.load.once("complete", () => {
      this.enterRoom(index);
    });
    this.load.start();
  }

  // Is every file the room needs already in the game's caches?
  // CHALLENGE 6: the room's keys - its background and every prop - rather than a list of files
  private isLoaded(room: Room): boolean {
    const keys = [room.background, ...room.props.map((prop) => prop.key)];
    const picturesLoaded = keys.every((key) => this.textures.exists(key));
    return picturesLoaded && this.cache.audio.exists(room.sound);
  }

  // CHALLENGE 6: one line - load the pack, but only this room's section of it (the third argument).
  // Phaser loads rooms_pack.json, then queues the files in that section; any key already loaded
  // (the player, when the other room with the player has been visited) is skipped.
  private queueRoom(room: Room): void {
    this.load.pack(packKey(room), ROOMS_PACK_FILE, room.section);
  }

  private enterRoom(index: number): void {
    const data: RoomData = { index: index };
    this.scene.start(ROOM_SCENE, data);
  }

  // Remove every room's files from the caches - the memory they used can be reused
  private unloadRooms(): void {
    if (this.load.isLoading()) {
      return;
    }
    for (const room of ROOMS) {
      // CHALLENGE 6: the room's keys, not its files
      for (const key of [room.background, ...room.props.map((prop) => prop.key)]) {
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }
      }
      this.cache.audio.remove(room.sound);

      // CHALLENGE 6: the pack file itself is kept in the JSON cache, under its key. Left there,
      // the loader would skip it next time - and so load none of the room's files
      this.cache.json.remove(packKey(room));
    }
    this.bar.clear();
    this.loadingText.setText("Every room's files have been removed");
    this.refreshStatus();
  }

  // the "loaded" / "not loaded" beside each button, and the count along the bottom
  private refreshStatus(): void {
    let loadedRooms = 0;
    ROOMS.forEach((room, index) => {
      const loaded = this.isLoaded(room);
      if (loaded) {
        loadedRooms = loadedRooms + 1;
      }
      this.statusTexts[index].setText(loaded ? "loaded" : "not loaded yet");
      this.statusTexts[index].setColor(loaded ? "#2a9d8f" : "#9aa4bd");
    });
    this.memoryText.setText(`${loadedRooms} of ${ROOMS.length} rooms in memory.   U - unload them all`);
  }
}
