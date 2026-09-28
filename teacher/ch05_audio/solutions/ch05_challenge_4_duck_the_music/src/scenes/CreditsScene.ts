import Phaser from "phaser";
import { MUSIC_MENU_KEY } from "../assets.ts";
import { Music } from "../Music.ts";
import { MenuButton } from "../objects/MenuButton.ts";
import { MusicMonitor } from "../objects/MusicMonitor.ts";
import { MuteButton } from "../objects/MuteButton.ts";
import { CREDITS_SCENE, MENU_SCENE } from "./keys.ts";

// CreditsScene - who made what. It asks for the SAME music as the menu, so going from the menu
// to here and back, the music just carries on.

const CREDITS = [
  "Code: you, and this chapter",
  "Game framework: Phaser 4",
  "Pictures and sounds: the guide's asset library,",
  "every one of them made by a program",
  "Music: music_menu.wav and music_game.wav",
];

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super(CREDITS_SCENE);
  }

  create(): void {
    const centreX = this.scale.width / 2;

    // already playing (the menu started it)? Then this does nothing but keep it at full volume
    Music.play(this, MUSIC_MENU_KEY);

    this.add.text(centreX, 90, "Credits", {
      fontFamily: "Arial",
      fontSize: "56px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.add.text(centreX, 250, CREDITS, {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
      lineSpacing: 12,
    }).setOrigin(0.5);

    new MenuButton(this, centreX, 440, "Back", () => {
      this.scene.start(MENU_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(MENU_SCENE);
    });

    new MuteButton(this, 760, 40);
    new MusicMonitor(this);
  }
}
