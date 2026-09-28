import Phaser from "phaser";
import { MUSIC_GAME_KEY, MUSIC_MENU_KEY } from "./assets.ts";

// Music - plays one music track at a time, cross-fading from whatever was playing before
//
// Every scene calls Music.play(this, key) in its create(), naming the track it wants. Then:
//   - if that track is already playing (the menu and the credits share one), it carries on -
//     it is NOT started again
//   - any other track that is playing fades out, and is paused (so it can carry on later from
//     where it was)
//   - the wanted track fades in: from where it was paused, or from the start
//
// Why is this not in a scene? Because the sound manager, this.sound, belongs to the GAME, not to
// a scene: music keeps playing when the scene that started it shuts down. So the music needs a
// home that is not one scene. The fades are tweens, and tweens DO belong to a scene - so they are
// always made in the scene that is starting, which will be around to finish them.
//
// Every method is static - it is called on the class (Music.play), as a static method is in Java.

const MUSIC_TRACKS = [MUSIC_MENU_KEY, MUSIC_GAME_KEY];
const MUSIC_VOLUME = 0.6;          // music a little quieter than the effects
const FADE_TIME = 1000;            // milliseconds to fade in or out

export class Music {
  public static play(scene: Phaser.Scene, key: string): void {
    // fade out every OTHER track that is playing
    for (const otherKey of MUSIC_TRACKS) {
      if (otherKey !== key) {
        Music.fadeOut(scene, otherKey);
      }
    }

    // Is this track in the sound manager already? Phaser's types say get() always returns a
    // sound, but it returns null when there is no sound with that key - so we say so ourselves.
    let music: Phaser.Sound.BaseSound | null = scene.sound.get(key);

    if (music === null) {
      // the first time: make it (silent), and start it
      music = scene.sound.add(key, { loop: true, volume: 0 });
      music.play();
    } else if (music.isPaused) {
      // faded out earlier: carry on from where it was
      music.resume();
    } else if (!music.isPlaying) {
      music.play();
    }
    // (and if it is already playing, leave it alone - it just gets faded up to full volume)

    // stop any fade that is still running on it (it might be fading OUT), then fade it in
    scene.tweens.killTweensOf(music);
    scene.tweens.add({
      targets: music,
      volume: MUSIC_VOLUME,
      duration: FADE_TIME,
    });
  }

  // Fades a track out and pauses it - if it is playing.
  private static fadeOut(scene: Phaser.Scene, key: string): void {
    const music: Phaser.Sound.BaseSound | null = scene.sound.get(key);
    if (music === null || !music.isPlaying) {
      return;
    }

    scene.tweens.killTweensOf(music);
    scene.tweens.add({
      targets: music,
      volume: 0,
      duration: FADE_TIME,
      onComplete: () => {
        music.pause();
      },
    });
  }
}
