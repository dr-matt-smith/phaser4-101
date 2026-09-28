import Phaser from "phaser";
import { type Room, ROOMS } from "../rooms.ts";
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
  private isLoaded(room: Room): boolean {
    const pictures = [room.background, ...room.pictures];
    const picturesLoaded = pictures.every((picture) => this.textures.exists(picture.key));
    return picturesLoaded && this.cache.audio.exists(room.sound.key);
  }

  // Queue only the files that are not loaded yet. (The loader would skip a key that is already in
  // its cache anyway - checking first makes it plain what is going on.)
  private queueRoom(room: Room): void {
    const pictures = [room.background, ...room.pictures];
    for (const picture of pictures) {
      if (!this.textures.exists(picture.key)) {
        this.load.image(picture.key, picture.url);
      }
    }
    if (!this.cache.audio.exists(room.sound.key)) {
      this.load.audio(room.sound.key, room.sound.url);
    }
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
      for (const picture of [room.background, ...room.pictures]) {
        if (this.textures.exists(picture.key)) {
          this.textures.remove(picture.key);
        }
      }
      this.cache.audio.remove(room.sound.key);
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
