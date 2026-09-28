# Chapter 5 - Audio: challenge solutions

Each solution is a complete project in [solutions/](solutions/), made from the chapter project the
challenge starts from. Every change is marked with a `// CHALLENGE n` comment.

---

## 1. More pads

**Project:** [solutions/ch05_challenge_1_more_pads](solutions/ch05_challenge_1_more_pads/)
(from `ch05_sound_board`)

**Goal:** see that a list of sounds kept as data means adding a sound is adding a line.

`src/assets.ts`
```ts
  { key: "win", file: "assets/audio/win.wav" },
  // CHALLENGE 1: four more pads - a third row. Nothing else needs to know how many there are:
  // preload() and makePads() loop over this array
  { key: "door", file: "assets/audio/door.wav" },
  { key: "whoosh", file: "assets/audio/whoosh.wav" },
  { key: "correct", file: "assets/audio/correct.wav" },
  { key: "wrong", file: "assets/audio/wrong.wav" },
];
```

`src/scenes/SoundBoardScene.ts`
```ts
this.pads.forEach((pad, index) => {
  // CHALLENGE 1: there are only nine number keys - pads 10, 11 and 12 are click-only
  if (index < NUMBER_KEYS.length) {
    keyboard.on(`keydown-${NUMBER_KEYS[index]}`, () => {
      this.playPad(pad);
    });
  }
});
```

plus the four WAV files copied into `public/assets/audio/`, and the settings text moved down to
make room for the third row. Tested with the harness: key 9 plays `door`; clicking pad 12 plays
`wrong`.

**Look for:** the files really copied into `public/` (a missing file shows no error until the pad is
pressed: `Audio key "door" not found in cache`); `makePads()` left alone - the layout maths already
wraps into a third row. Without the `if`, pads 10-12 would listen for `"keydown-undefined"`, which
never fires - harmless, but worth asking students what `NUMBER_KEYS[9]` is.

---

## 2. Turn it down

**Project:** [solutions/ch05_challenge_2_turn_it_down](solutions/ch05_challenge_2_turn_it_down/)
(from `ch05_music_across_scenes`)

**Goal:** use the sound manager's master volume, and make something work in every scene - the same
pattern as the mute button.

A new game object, made in each scene next to the mute button:

`src/objects/VolumeKey.ts`
```ts
const LEVELS = [1, 0.6, 0.3];
...
  // nothing in the registry yet (undefined) means the first level, 100%
  private level(): number {
    return this.scene.registry.get(VOLUME_LEVEL) ?? 0;
  }

  private nextLevel(): void {
    const level = (this.level() + 1) % LEVELS.length;
    this.scene.registry.set(VOLUME_LEVEL, level);
    this.scene.sound.volume = LEVELS[level];
    this.showLevel();
  }
```

`src/scenes/MenuScene.ts` (and `CreditsScene.ts`, `GameScene.ts`)
```ts
new MuteButton(this, 760, 40);
// CHALLENGE 2: the master volume, next to the mute button (V changes it)
new VolumeKey(this, 725, 40);
```

**Why the registry, when `this.sound.volume` is game-wide?** Because reading it back does not give
exactly what was set: Web Audio stores volumes as 32-bit floats, so after `this.sound.volume = 0.6`,
`this.sound.volume` is `0.6000000238418579` (checked with the harness), and `LEVELS.indexOf(...)`
returns -1. Keeping the *level number* in the registry avoids comparing floats - a good discussion
point.

**Look for:** `this.sound.volume` (the master volume), not each sound's volume; the level shown in
every scene; `% LEVELS.length` to go round. Accept a solution that keeps the level in a `static`
field, or that reads `this.sound.volume` and picks the nearest level. A solution that loops over
`this.sound.getAllPlaying()` setting each volume is wrong: sounds started later are loud again.

---

## 3. Remember the mute

**Project:** [solutions/ch05_challenge_3_remember_the_mute](solutions/ch05_challenge_3_remember_the_mute/)
(from `ch05_music_across_scenes`)

**Goal:** save a setting in the browser, and restore it when the game starts.

`src/objects/MuteButton.ts`
```ts
this.scene.sound.mute = muted;
// CHALLENGE 3: save it in the browser too. localStorage only holds strings: "true" or "false"
localStorage.setItem(MUTED_STORAGE, String(muted));
```

`src/scenes/TitleScene.ts`
```ts
create(): void {
  // CHALLENGE 3: the game starts here, so this is where the saved setting is read back.
  // getItem gives the string that was saved - or null if nothing was, which counts as "not muted"
  const muted = localStorage.getItem(MUTED_STORAGE) === "true";
  this.registry.set(MUTED, muted);
  this.sound.mute = muted;
```

Tested with the harness: mute in the menu, `location.reload()`, and the game starts with
`game.sound.mute` true and the menu's button showing `sound_off`.

**Look for:**
- the setting restored in **both** places - the registry (for the button's picture) and
  `this.sound.mute` (for the sound). Restoring only the registry gives a button that says "muted"
  over music that plays
- comparing with the **string** `"true"`. `Boolean(localStorage.getItem(...))` is a classic bug:
  the string `"false"` is truthy, so the game is always muted once anything is saved
- a specific storage name: every page from `http://127.0.0.1:8000/` shares one localStorage, so
  `"muted"` would be shared by every project students serve on that port

---

## 4. Duck the music

**Project:** [solutions/ch05_challenge_4_duck_the_music](solutions/ch05_challenge_4_duck_the_music/)
(from `ch05_music_across_scenes`)

**Goal:** `add()` plus `"complete"` to know when an effect ends; tweening a sound's volume from
outside the `Music` class without fighting its fades.

A new method in `Music`, so the class that owns the music's volume stays the only one that tweens it:

`src/Music.ts`
```ts
public static fadeTo(scene: Phaser.Scene, key: string, fraction: number, duration: number): void {
  const music: Phaser.Sound.BaseSound | null = scene.sound.get(key);
  if (music === null || !music.isPlaying) {
    return;
  }

  // stop the fade-in (or an earlier duck) first, so only this tween moves the volume
  scene.tweens.killTweensOf(music);
  scene.tweens.add({
    targets: music,
    volume: MUSIC_VOLUME * fraction,
    duration: duration,
  });
}
```

`src/scenes/GameScene.ts`
```ts
private playPowerup(): void {
  const powerup = this.sound.add(POWERUP_KEY);
  powerup.once(Phaser.Sound.Events.COMPLETE, () => {
    powerup.destroy();
    // The sound belongs to the game, so it can finish after the player has pressed ESC and
    // this scene has shut down. Only bring the music back up if the game is still running -
    // otherwise the menu is already fading this music out, with its own tweens.
    if (this.scene.isActive()) {
      Music.fadeTo(this, MUSIC_GAME_KEY, 1, DUCK_TIME);
    }
  });

  Music.fadeTo(this, MUSIC_GAME_KEY, DUCK_LEVEL, DUCK_TIME);
  powerup.play();
}
```

Tested with the harness: after ten stars the music's volume is 0.12 (a fifth of 0.6) while
`powerup` plays, and 0.6 again after it ends; pressing ESC during the power-up leaves the menu music
at 0.6 and the game music paused.

**Look for:**
- `add()` and a `"complete"` listener - the hint rules out `this.sound.play()`
- `destroy()` on the power-up sound
- `killTweensOf` before the duck: ten quick stars in the first second collide with `Music.play`'s
  fade-in otherwise, and the fade-in wins
- the "has the scene gone?" question. Many students will not think of it; ask what happens if ESC
  is pressed during the power-up. (Without the check, nothing visibly goes wrong in this project -
  tested with the harness - but the listener adds a tween to a scene that has shut down, which is
  working by luck, not by design.) Removing the listener in a `SHUTDOWN` handler, as
  `TitleScene` does, is an equally good answer

---

## 5. On the beat

**Project:** [solutions/ch05_challenge_5_on_the_beat](solutions/ch05_challenge_5_on_the_beat/)
(from `ch05_music_across_scenes`)

**Goal:** drive the game from the music's own clock (`seek`), not from a separate timer.

`src/scenes/GameScene.ts`
```ts
const BEATS_PER_MINUTE = 128;
const BEAT_LENGTH = 60000 / BEATS_PER_MINUTE;
...
override update(): void {
  const music: Phaser.Sound.BaseSound | null = this.sound.get(MUSIC_GAME_KEY);
  if (music === null || !music.isPlaying) {
    return;
  }

  // BaseSound's type has no seek, although every sound has one - as in MusicMonitor
  const seek = (music as Phaser.Sound.WebAudioSound).seek;       // seconds
  const beat = Math.floor(seek * 1000 / BEAT_LENGTH);

  // a new beat (including going from the last beat back to beat 0 when the music loops)
  if (beat !== this.lastBeat) {
    this.lastBeat = beat;
    this.pulse();
  }
}
```

`pulse()` is a short `yoyo` tween on the circle's scale. `lastBeat` is reset to -1 in `init()`
(the scene is reused - Chapter 2's trap again).

Tested with the harness: after 5.04 seconds of music the circle had pulsed 11 times (beats 0 to 10:
5.04 s / 0.46875 s = 10.75). After leaving the game for two seconds and coming back, the beat number
still matched `Math.floor(seek * 1000 / 468.75)` - because it is worked out from `seek`, it cannot
drift.

**Look for:**
- the beat worked out from `seek`, not counted. A `this.time.addEvent({ delay: 468.75, loop: true })`
  pulses happily - until the music pauses, the tab loses focus, or the scene restarts, when it falls
  out of step. Ask students who did that to test with ESC and back
- seconds versus milliseconds: `seek` is in seconds, `BEAT_LENGTH` in milliseconds
- nothing happens while the music is not playing (for example during the first frame, before
  `Music.play` has made it)
- `music_game.wav` is exactly 15 seconds, which is exactly 32 beats, so the loop does not break the
  rhythm. A sharp student will ask what would happen if it were not

---

## 6. Jukebox

**Project:** [solutions/ch05_challenge_6_jukebox](solutions/ch05_challenge_6_jukebox/)
(from `ch05_sound_board`)

**Goal:** several sound objects, `"complete"` to chain them, and knowing that `stop()` does not fire
`"complete"`.

`src/scenes/SoundBoardScene.ts`
```ts
// CHALLENGE 6: one sound object per track, NOT looping - so each one fires "complete" when
// it reaches its end, and that starts the next. ("complete" does not fire when a sound is
// stopped with stop(), so skipping with K cannot set off a second skip.)
this.tracks = MUSIC_TRACKS.map((track) => {
  const sound = this.sound.add(track.key, { loop: false, volume: MUSIC_VOLUME });
  sound.on(Phaser.Sound.Events.COMPLETE, () => {
    this.nextTrack();
  });
  return sound;
});
```

```ts
private get music(): GameSound {
  return this.tracks[this.trackIndex];
}
...
private nextTrack(): void {
  this.music.stop();
  this.trackIndex = (this.trackIndex + 1) % this.tracks.length;
  this.music.setVolume(this.volume * MUSIC_VOLUME).setRate(this.rate).setDetune(this.detune);
  this.music.play();
}
```

The **getter** (`get music()`) is the neat trick: every existing line that says `this.music` - play,
pause, stop, loop, skip, the progress bar - now means "the current track", with no other change. It
is TypeScript's version of a Java `getMusic()` method, used without brackets.

Tested with the harness: K moves `music_menu` to `music_game`; seeking to 0.3 seconds before the end
moves on to `music_action`, then round to `music_menu`; only one track is ever playing.

**Look for:**
- `on` (not `once`) for `"complete"` - each track completes every time round the playlist
- the settings copied onto the next track (each track is a separate sound object that has not seen
  the volume, rate or detune keys)
- one track playing at a time: a common bug is starting the next track without stopping the current
  one on K, so two play at once
- a solution that uses a single sound object and `this.sound.add` again for each track (destroying
  the old one) is also fine - check it destroys
