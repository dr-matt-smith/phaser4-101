import Phaser from "phaser";
import { MUTED, MUTED_STORAGE, SOUND_OFF_KEY, SOUND_ON_KEY } from "../assets.ts";

// MuteButton - a speaker button that turns ALL the game's sound off and on (so does the M key)
//
// Every scene that wants one makes its own MuteButton - a game object belongs to one scene. But
// the setting is the game's: the registry remembers it, and this.sound.mute mutes the game-wide
// sound manager. So a button in any scene shows, and changes, the same setting.

export class MuteButton extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SOUND_ON_KEY);
    scene.add.existing(this);
    this.showState();

    this.setInteractive({ useHandCursor: true });
    this.on("pointerdown", () => {
      this.toggle();
    });
    scene.input.keyboard!.on("keydown-M", () => {
      this.toggle();
    });
  }

  // The registry holds the setting; until someone presses the button there is nothing in it
  // (undefined), which counts as "not muted".
  private isMuted(): boolean {
    return this.scene.registry.get(MUTED) === true;
  }

  private toggle(): void {
    const muted = !this.isMuted();
    this.scene.registry.set(MUTED, muted);
    // this.sound.mute silences every sound in the game - playing ones, and ones not yet started
    this.scene.sound.mute = muted;
    // CHALLENGE 3: save it in the browser too. localStorage only holds strings: "true" or "false"
    localStorage.setItem(MUTED_STORAGE, String(muted));
    this.showState();
  }

  private showState(): void {
    this.setTexture(this.isMuted() ? SOUND_OFF_KEY : SOUND_ON_KEY);
  }
}
