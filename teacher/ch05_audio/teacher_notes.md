# Chapter 5 - Audio: teacher notes

## Overview

Students learn to play sound effects and music in Phaser, and to control them. The Phaser ideas are
**the sound manager** (`this.sound`), the difference between **fire-and-forget** `play()` and a kept
sound object from `add()`, **sound configs** (volume, rate, detune, pan, loop, delay), a sound's
**states and events**, **cross-fading with tweens**, and the browser's **autoplay rule**. The one
big idea - the one that causes the bugs - is that **the sound manager belongs to the game, not to a
scene**: sounds outlive the scene that started them, and so do listeners on the sound manager. It
connects directly to Chapter 2 (scenes are reused) and Chapter 4 (clean up listeners at `SHUTDOWN`).

The chapter is fun to teach - students like making noise - but it is also the first chapter where
the results cannot be seen, only heard. Headphones for everyone make the lab much calmer, and are
needed to hear panning at all.

## Prerequisites

- Chapter 2: scenes, `this.scene.start`, `init()` and the reused-scene trap, the registry, object
  literals, spread and union types
- Chapter 3: loading assets in `preload()`
- Chapter 4: scene events, especially `SHUTDOWN`, and removing listeners on emitters that outlive a
  scene
- Tweens are used lightly (fading a volume); Chapter 7 covers them properly. One sentence of
  explanation is enough here

## Learning outcomes

Students can:

1. load sounds and play them with `this.sound.play(key, config)`, choosing volume, rate, detune,
   pan, loop and delay
2. choose between `this.sound.play()` and `this.sound.add()`, and destroy sounds they `add()`
3. control a playing sound - pause, resume, stop, seek, change its settings - and react to its
   `"complete"` event
4. explain why music carries on across scenes, and use `this.sound.get(key)` to avoid starting a
   second copy
5. fade and cross-fade music with tweens, and explain why the tweens must belong to the scene that
   is starting
6. mute or change the volume of the whole game, and explain the browser's autoplay rule and
   `this.sound.locked`

## Suggested session plan (2 hours)

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Play `ch05_sound_board` on the projector (speakers on). Press a pad ten times: "what is wrong with that?" (it sounds like a machine). Then press R and do it again |
| 0:10 - 0:30 | Slides 3-7: loading, `play` with a config, rate and detune, the seconds trap, random pitch and pan. Students try every key on the sound board |
| 0:30 - 0:45 | Slides 8-10: `add` versus `play`, `"complete"` and `destroy`, the three states. Walk through `SoundPad.play()` and `playOrPauseMusic()`. Challenge 1 |
| 0:45 - 1:00 | **Live demo of the duplicate music bug** (below). Slides 11-12: the game-wide sound manager, `this.sound.get` |
| 1:00 - 1:15 | Slides 13-15: `Music.play`, cross-fades, whose tweens, mute. Students play `ch05_music_across_scenes` and watch the monitor line while moving between scenes |
| 1:15 - 1:25 | Slides 16-18: autoplay, `locked`, the title scene - and the listener bug it had |
| 1:25 - 2:00 | Challenges 2-6 |

## Key points to stress

- **`this.sound` is the same object in every scene.** Draw the game-wide diagram on the board. Sounds
  keep playing when a scene shuts down; that is a feature for music and a bug for everything else
- **`play()` for effects, `add()` for anything you need to control** - and `add()` means `destroy()`
  when you are done
- a scene's `create()` runs every time the scene starts, so "start the music in `create()`" means
  "start **another copy** of the music" unless it checks `this.sound.get(key)` first
- **tweens belong to a scene**; music belongs to the game. A fade made by a scene that is shutting
  down never finishes
- **listeners on the sound manager outlive the scene** - `TitleScene` shows the crash and the fix,
  exactly the Chapter 4 pattern
- **`delay` and `seek` are in seconds**, while nearly everything else in Phaser is milliseconds
- detune is in **cents** (100 = a semitone); rate is a multiplier; both change speed as well as pitch
- sound cannot start until the player interacts with the page: design for it with a "click to
  start" screen, rather than hoping

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| Music gets louder and louder, and sounds "phased", after going back and forth between menus | the music is added and played in `create()` every time the scene starts. (With that change to `Music.play`, menu - credits - menu - credits - menu leaves five `music_menu` sounds playing) | check `this.sound.get(key)` first, or keep the music in one place like `Music` |
| Game music still playing on the game-over screen | sounds are not stopped when their scene shuts down | stop or fade the music on purpose |
| `Error: Audio key "music_menu" not found in cache` (in the browser console), and the game stops | the sound was not loaded under that key: a misspelled key, a wrong path, or a file not copied into `public/assets/audio/`. (The loader's 404 appears as a red network error just above) | check the key, the path, and that the file is in `public/` |
| `Property 'setVolume' does not exist on type 'BaseSound'.` | the result of `this.sound.get(key)` is typed as `BaseSound`, which leaves out volume and the `set...` methods | keep the object from `add()` in a field, or tween `volume` (tweens take any object), or cast with a comment |
| `Expected 1 arguments, but got 0.` on `this.sound.getAll()` | the type definitions make the key compulsory on one of the three sound managers | pass a key, or use `this.sound.getAllPlaying()` |
| `TypeError: Cannot read properties of null (reading 'drawImage')` a frame after changing scene | a listener on the sound manager (e.g. `"unlocked"`) changed a Text belonging to a scene that has shut down | remove the listener in a `SHUTDOWN` handler |
| A sound with `delay: 500` never plays | `delay` is in seconds - that is eight minutes | `delay: 0.5` |
| A fade that stops half-way; music stuck quiet | the tween was made in a scene that then shut down | make fades in the scene that is starting (as `Music.play` does) |
| No sound at all in the Celbridge webview or the browser, but no error | the sound is locked until the page is clicked or a key is pressed | click the game first; add a "click to start" screen |
| Every effect plays at once on the first click | effects were "played" while the sound was locked; Phaser holds them until it unlocks (tested: three effects played a second apart while locked all started on the click) | do not play sound before the first interaction |
| `pan` does nothing | the student is not wearing headphones - or the browser (Safari on iOS) has no stereo panner | headphones; never depend on pan |
| `this.sound.volume === 0.6` is false straight after setting it to 0.6 | Web Audio stores volumes as 32-bit floats: it reads back as `0.6000000238418579` | never compare volumes with `===`; keep your own setting (challenge 2) |

## Suggested demos

- **The duplicate music bug.** In `ch05_music_across_scenes/src/Music.ts`, change
  `let music: Phaser.Sound.BaseSound | null = scene.sound.get(key);` to `... = null;`. Build, and go
  menu - credits - menu - credits - menu. Ask the class what they hear (louder, slightly smeared
  music). The monitor line still shows one track, because `get` returns the *first* sound with that
  key - a nice lesson in itself. To count the copies, add `this.scene.sound.getAll(key).length` to
  the monitor's text: five. Put the line back
- **The listener leak.** In `TitleScene.ts`, remove the `this.events.once(Phaser.Scenes.Events.SHUTDOWN, ...)`
  block, build, open the page in a **fresh** browser window (so the sound is locked), open the console,
  and click. The error appears a frame after the menu starts
- **Seconds, not milliseconds.** In the sound board, change `ECHO_DELAY` to `250`. The echo
  "disappears". Ask why before revealing it
- **Rate vs detune.** On the sound board, press RIGHT ten times (rate 2), play a pad; press Z, then
  W twelve times (detune 1200), play the same pad. They sound the same: an octave is a doubling

## Discussion questions

- Why does Phaser make the sound manager game-wide, rather than giving each scene its own? (Music
  across scenes; one mute; one unlock.) What would be harder if it were per-scene?
- `Music` is a class with only static methods. In Java terms, what is it? Is that good OO? What
  would a `MusicPlayer` object stored in the registry look like instead?
- The mute setting lives in the registry *and* in `this.sound.mute`. Is that duplication? When could
  the two disagree? (Challenge 3 is exactly that question.)
- Why is it wrong to keep the rhythm of challenge 5 with `this.time.addEvent`?
- What makes a sound effect "feel" right? Try the random pitch with 50 cents and with 600 cents

## Extension ideas

- **Audio sprites**: one file holding several sounds, with markers - `sound.addMarker({ name, start,
  duration })` and `sound.play(name)`. Make a marker for each half of `music_game.wav`
- **Spatial sound**: `this.sound.add(key, { source: { x, y, follow: sprite } })` and
  `this.sound.setListenerPosition(x, y)` - a sound that gets quieter as the player walks away
- a **settings scene** with sliders (drag a knob with the pointer) for music and effects volume,
  kept separate: two master volumes, one for each kind of sound
- an **analyser** that draws the music's waveform (`this.sound.context.createAnalyser()`) - see the
  Phaser "audio-and-sound" notes; Web Audio only
- add sound to the Chapter 2 game: a click on start, a pop on each hit, music during play, a
  fanfare on the win screen, with the music stopped on the win screen

## Assessment ideas

- Practical: "add a pause scene (Chapter 4) that pauses the game music while it is shown and
  resumes it when it closes - and plays its own quiet music meanwhile"
- Code reading: show a `create()` that does `this.sound.add("music", { loop: true }).play();` and ask
  what happens on the third visit to the scene, and how to fix it
- Short answer: the difference between `this.sound.play(key)` and `this.sound.add(key)`, and when to
  use each
- Short answer: why does `TitleScene` remove its `"unlocked"` listener at `SHUTDOWN`, when it does not
  remove its `"pointerdown"` listener?

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
