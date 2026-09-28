---
marp: true
theme: default
paginate: true
title: "Chapter 5 - Audio"
---

# Chapter 5
## Audio

Sound effects, music, and the rules of the browser

![bg right:45% 90%](../../chapters/ch05_audio/images/sound_board.png)

---

## Today

- loading sounds; playing them with a **config**
- `play()` - fire and forget - or `add()` - keep hold
- a sound's states, and its `"complete"` event
- the sound manager belongs to the **game**
- cross-fading music with tweens; mute everywhere
- the browser's **autoplay** rule

---

## Loading sounds

```ts
preload(): void {
  for (const pad of PAD_SOUNDS) {
    this.load.audio(pad.key, pad.file);
  }
  this.load.audio(MUSIC_KEY, MUSIC_FILE);
}
```

- like pictures: a key and a file; loaded once, for every scene
- an **array** of files lets the browser pick a format it can play:
  `["theme.ogg", "theme.mp3"]`

---

## Fire and forget

```ts
this.sound.play(COIN_KEY, {
  detune: Phaser.Math.Between(-RANDOM_DETUNE, RANDOM_DETUNE),
  pan: (star.x - centreX) / centreX * MAX_PAN,
});
```

- makes a sound, plays it, **destroys** it when it ends
- config: `volume` `rate` `detune` `pan` `loop` `delay` `seek` `mute`
- leave a setting out and it keeps its default

---

## Rate, detune - and seconds

- `rate: 2` - twice as fast, an octave higher
- `detune: 1200` - also an octave higher (cents: 100 = a semitone)
- both change speed **and** pitch; Phaser multiplies them

```ts
const ECHO_DELAY = 0.25;           // seconds (SoundConfig delays are in seconds, not milliseconds)
```

`delay` and `seek` are in **seconds**. `delay: 250` waits four minutes.

---

## Less mechanical

The same sound, again and again, sounds like a machine.

- a small **random detune** each time
- **pan** by position: -1 left, 0 middle, 1 right (headphones!)

```ts
pan: this.panByPosition ? this.panFor(pad.x) : 0,
```

Pan is ignored where there is no stereo panner (iPhones, iPads): a finishing touch only.

---

## Try it: Sound Board

- 1-8 play; arrows change volume and rate; W/S detune
- R random pitch, P pan, E echo
- M / N / L / J: the music - play and pause, stop, loop, skip
- find where each setting goes into a `SoundConfig`

![bg right:45% 90%](../../chapters/ch05_audio/images/sound_board.png)

---

## Keep hold: `add`

```ts
const sound = this.scene.sound.add(this.soundKey);

sound.once(Phaser.Sound.Events.COMPLETE, () => {
  this.playing = this.playing - 1;
  this.showState();
  sound.destroy();
});

sound.play(config);
```

- `add()` gives you the sound object - and does **not** start it
- it stays in the sound manager until **you** `destroy()` it

---

## Three states

![w:1000](../../chapters/ch05_audio/images/sound_states.svg)

`play()` on a playing or paused sound starts it **again from the beginning**

---

## Changing a playing sound

```ts
if (this.music.isPlaying) {
  this.music.pause();
} else if (this.music.isPaused) {
  this.music.resume();
} else {
  this.music.play();
}
```

```ts
this.music.setVolume(MUSIC_VOLUME).setRate(1).setDetune(0);
```

`setLoop` `setPan` `setSeek` - and `seek`, `duration` to read back

---

## One sound manager

![w:900](../../chapters/ch05_audio/images/game_wide_sound.svg)

Sounds **keep playing** when their scene shuts down.

---

## The duplicate music bug

```ts
// in create() - runs EVERY time the scene starts
this.sound.add(MUSIC_MENU_KEY, { loop: true }).play();
```

menu - credits - menu - credits - menu: **five** copies playing

Ask first:

```ts
let music: Phaser.Sound.BaseSound | null = scene.sound.get(key);
```

`null` if there is no sound with that key

---

## `Music.play(this, key)`

```ts
if (music === null) {
  music = scene.sound.add(key, { loop: true, volume: 0 });
  music.play();
} else if (music.isPaused) {
  music.resume();
} else if (!music.isPlaying) {
  music.play();
}
```

- every scene names the music it wants, in `create()`
- already playing? leave it alone
- every **other** track fades out, and is paused

---

## Cross-fading - whose tweens?

```ts
scene.tweens.add({
  targets: music,
  volume: MUSIC_VOLUME,
  duration: FADE_TIME,
});
```

![w:600](../../chapters/ch05_audio/images/crossfade.svg)

Tweens belong to a **scene**, and die with it: make fades in the scene that is **starting**

---

## Mute, everywhere

```ts
private toggle(): void {
  const muted = !this.isMuted();
  this.scene.registry.set(MUTED, muted);
  this.scene.sound.mute = muted;
  this.showState();
}
```

- `this.sound.mute`, `this.sound.volume` - the whole game
- a `MuteButton` in every scene; one setting in the registry

---

## The autoplay rule

![bg right:45% 90%](../../chapters/ch05_audio/images/title_locked.png)

- no sound until the player clicks, taps or presses a key
- `this.sound.locked`; the `"unlocked"` event
- sounds played while locked wait - then all start at once
- so: a **"click to start"** screen

---

## A listener that outlived its scene

```ts
const onUnlocked = (): void => {
  status.setText("Sound is unlocked");
};
this.sound.once(Phaser.Sound.Events.UNLOCKED, onUnlocked);
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.sound.off(Phaser.Sound.Events.UNLOCKED, onUnlocked);
});
```

Without the `SHUTDOWN` part: `TypeError: Cannot read properties of null (reading 'drawImage')`

---

## Try it: Music Across Scenes

- menu - credits - menu: the music carries on
- menu - game: watch the cross-fade on the bottom line
- M in any scene; then change scene
- leave the game quickly: does anything get stuck?

![bg right:45% 90%](../../chapters/ch05_audio/images/game_crossfade.png)

---

## Summary

- `this.load.audio(key, file)`; `this.sound.play(key, config)` - fire and forget
- `this.sound.add(key, config)` - keep it; `play` `pause` `resume` `stop` `set...`; `destroy()`
- `"complete"` when a sound ends; `delay` and `seek` in seconds
- one sound manager for the game: check `this.sound.get(key)` before starting music
- tween `volume` to fade - in the scene that is starting
- `this.sound.mute`, `this.sound.volume`; `locked` until the first click

---

## Challenges

1. **More pads** - a third row of four
2. **Turn it down** - V: 100%, 60%, 30%, in every scene
3. **Remember the mute** - survives a refresh (`localStorage`)
4. **Duck the music** - quieter under the power-up
5. **On the beat** - a circle that pulses at 128 bpm, in time after pauses
6. **Jukebox** - three tracks in turn; K for the next

Next: **Chapter 6 - Scoring**
