import Phaser from "phaser";
import { MUSIC_MENU_KEY } from "../assets.ts";
import { Music } from "../Music.ts";
import { MenuButton } from "../objects/MenuButton.ts";
import { MusicMonitor } from "../objects/MusicMonitor.ts";
import { MuteButton } from "../objects/MuteButton.ts";
import { CREDITS_SCENE, GAME_SCENE, MENU_SCENE } from "./keys.ts";

// MenuScene - two buttons (Play and Credits), the menu music, and a mute button
//
// Music.play() makes sure the menu music is playing - without starting a second copy when we
// come back from the credits, where it has been playing all along.

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(MENU_SCENE);
  }

  create(): void {
    const centreX = this.scale.width / 2;

    Music.play(this, MUSIC_MENU_KEY);

    this.add.text(centreX, 110, "Main Menu", {
      fontFamily: "Arial",
      fontSize: "56px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    new MenuButton(this, centreX, 260, "Play", () => {
      this.scene.start(GAME_SCENE);
    });
    new MenuButton(this, centreX, 350, "Credits", () => {
      this.scene.start(CREDITS_SCENE);
    });

    this.add.text(centreX, 450, "M or the speaker button: sound on / off", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    new MuteButton(this, 760, 40);
    new MusicMonitor(this);
  }
}
