import Phaser from "phaser";
import { type Room, ROOMS } from "../rooms.ts";
import { MENU_SCENE, ROOM_SCENE } from "./keys.ts";

// RoomScene - shows one room, whichever the menu chose
//
// It has no preload(): the menu has already loaded this room's files. One scene class serves every
// room - the data it is started with says which.

export interface RoomData {
  index: number;      // which room, in ROOMS
}

export class RoomScene extends Phaser.Scene {
  private room!: Room;

  constructor() {
    super(ROOM_SCENE);
  }

  init(data: RoomData): void {
    this.room = ROOMS[data.index];
  }

  create(): void {
    this.add.image(0, 0, this.room.background).setOrigin(0);     // CHALLENGE 6: a key now

    for (const prop of this.room.props) {
      this.add.image(prop.x, prop.y, prop.key);
    }

    this.sound.play(this.room.sound);     // CHALLENGE 6: a key now

    const style = {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffffff",
      stroke: "#1b1f2a",
      strokeThickness: 6,
    };
    this.add.text(this.scale.width / 2, 40, this.room.name, style).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 575, "ESC - back to the menu", { ...style, fontSize: "20px", strokeThickness: 4 })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(MENU_SCENE);
    });
  }
}
