import Phaser from "phaser";
import {
  BUTTON_FILE,
  BUTTON_KEY,
  BUTTON_OVER_FILE,
  BUTTON_OVER_KEY,
  CLICK_FILE,
  CLICK_KEY,
  COIN_FILE,
  COIN_KEY,
  LOGO_FILE,
  LOGO_KEY,
  MUSIC_GAME_FILE,
  MUSIC_GAME_KEY,
  MUSIC_MENU_FILE,
  MUSIC_MENU_KEY,
  MUTED,
  MUTED_STORAGE,
  POWERUP_FILE,
  POWERUP_KEY,
  SOUND_OFF_FILE,
  SOUND_OFF_KEY,
  SOUND_ON_FILE,
  SOUND_ON_KEY,
  STAR_FILE,
  STAR_KEY,
} from "../assets.ts";
import { MENU_SCENE, TITLE_SCENE } from "./keys.ts";

// TitleScene - loads everything, then waits for a click
//
// Browsers do not let a page make any sound until the player has clicked, tapped or pressed a
// key on it (the "autoplay" rule). Until then, Phaser's sound manager is LOCKED. A "click to
// start" screen means the first click happens here - so by the time the menu starts its music,
// the sound is unlocked.

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(TITLE_SCENE);
  }

  preload(): void {
    // two music tracks - big files, so they take longest to load (and to decode)
    this.load.audio(MUSIC_MENU_KEY, MUSIC_MENU_FILE);
    this.load.audio(MUSIC_GAME_KEY, MUSIC_GAME_FILE);
    this.load.audio(CLICK_KEY, CLICK_FILE);
    this.load.audio(COIN_KEY, COIN_FILE);
    this.load.audio(POWERUP_KEY, POWERUP_FILE);

    this.load.image(LOGO_KEY, LOGO_FILE);
    this.load.image(STAR_KEY, STAR_FILE);
    this.load.image(BUTTON_KEY, BUTTON_FILE);
    this.load.image(BUTTON_OVER_KEY, BUTTON_OVER_FILE);
    this.load.image(SOUND_ON_KEY, SOUND_ON_FILE);
    this.load.image(SOUND_OFF_KEY, SOUND_OFF_FILE);
  }

  create(): void {
    // CHALLENGE 3: the game starts here, so this is where the saved setting is read back.
    // getItem gives the string that was saved - or null if nothing was, which counts as "not muted"
    const muted = localStorage.getItem(MUTED_STORAGE) === "true";
    this.registry.set(MUTED, muted);
    this.sound.mute = muted;

    const centreX = this.scale.width / 2;

    this.add.image(centreX, 170, LOGO_KEY);

    this.add.text(centreX, 330, "Click to start", {
      fontFamily: "Arial",
      fontSize: "40px",
      color: "#ffd166",
    }).setOrigin(0.5);

    // this.sound.locked is true until the browser allows sound; the "unlocked" event says when
    const status = this.add.text(centreX, 420, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#a8dadc",
    }).setOrigin(0.5);

    if (this.sound.locked) {
      status.setText("Sound is locked - the browser is waiting for a click or a key press");

      // The sound manager belongs to the game, so a listener on it outlives this scene. The
      // click that unlocks the sound also starts the menu - and "unlocked" arrives a frame
      // later, when this scene and its text are gone. So take the listener off at SHUTDOWN.
      const onUnlocked = (): void => {
        status.setText("Sound is unlocked");
      };
      this.sound.once(Phaser.Sound.Events.UNLOCKED, onUnlocked);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.sound.off(Phaser.Sound.Events.UNLOCKED, onUnlocked);
      });
    } else {
      status.setText("Sound is ready");
    }

    // the click unlocks the sound (if it was locked), and starts the menu
    this.input.once("pointerdown", () => {
      this.scene.start(MENU_SCENE);
    });
  }
}
