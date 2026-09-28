import Phaser from "phaser";
import { MUSIC_GAME_KEY, MUSIC_MENU_KEY } from "../assets.ts";

// MusicMonitor - a line of small text that shows, every frame, what each music track is doing
//
// Not something a real game would show - it is here so you can SEE the cross-fades, and see
// that the music carries on from scene to scene. It is a Text with its own preUpdate(), which
// Phaser calls every frame (as the moving ball did in Chapter 1).

const TRACKS = [MUSIC_MENU_KEY, MUSIC_GAME_KEY];

export class MusicMonitor extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 400, 580, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#9aa4bd",
    });
    this.setOrigin(0.5);
    scene.add.existing(this);
  }

  // called by Phaser every frame
  preUpdate(): void {
    const parts: string[] = [];
    for (const key of TRACKS) {
      const music: Phaser.Sound.BaseSound | null = this.scene.sound.get(key);
      if (music === null) {
        parts.push(`${key}: not made yet`);
      } else {
        const state = music.isPlaying ? "playing" : music.isPaused ? "paused" : "stopped";
        // BaseSound's type leaves out volume, although every kind of sound has one. "as" tells
        // TypeScript what we know: this is a Web Audio sound (the kind every modern browser uses)
        const volume = (music as Phaser.Sound.WebAudioSound).volume;
        parts.push(`${key}: ${state}, volume ${volume.toFixed(2)}`);
      }
    }
    const mute = this.scene.sound.mute ? "    (muted)" : "";
    this.setText(parts.join("    ") + mute);
  }
}
