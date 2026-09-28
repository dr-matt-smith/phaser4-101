import Phaser from "phaser";
import { LOGO_FILE, LOGO_KEY, SPINNER_FILE, SPINNER_KEY } from "../assets.ts";
import { BOOT_SCENE, PRELOAD_SCENE } from "./keys.ts";

// BootScene - the first scene: loads ONLY what the loading screen itself shows
//
// A loading screen cannot show a picture it is still loading. So a tiny scene runs first and loads
// the few small files the loading screen needs - here, just the logo - and then hands over.
// It shows nothing, and is over in a moment.

export class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE);
  }

  preload(): void {
    this.load.image(LOGO_KEY, LOGO_FILE);
    this.load.image(SPINNER_KEY, SPINNER_FILE);    // CHALLENGE 4
  }

  // create() only runs once everything queued in preload() has loaded
  create(): void {
    this.scene.start(PRELOAD_SCENE);
  }
}
