import Phaser from "phaser";
import { GAME_MUSIC, MENU_MUSIC } from "./assets.ts";

// music.ts - start and stop the background music from any scene
//
// The sound manager belongs to the whole GAME, not to a scene, so music carries on playing when
// scenes change (Chapter 5). That is why playMusic() checks before starting a track: starting it
// again every time the menu opened would pile up copies of it.

const MUSIC_VOLUME = 0.4;

export function playMusic(scene: Phaser.Scene, key: string): void {
  stopMusic(scene, key);
  // get() is typed as always finding a sound, but it gives back null if there is none yet
  const existing = scene.sound.get(key) as Phaser.Sound.BaseSound | null;
  const music = existing ?? scene.sound.add(key, { loop: true, volume: MUSIC_VOLUME });
  if (!music.isPlaying) {
    music.play();
  }
}

// stop every music track except `keep` (leave it out to stop them all)
export function stopMusic(scene: Phaser.Scene, keep = ""): void {
  for (const key of [MENU_MUSIC, GAME_MUSIC]) {
    if (key !== keep) {
      scene.sound.stopByKey(key);
    }
  }
}
