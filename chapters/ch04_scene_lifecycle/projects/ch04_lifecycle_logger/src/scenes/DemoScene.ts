import Phaser from "phaser";
import { eventLog } from "../EventLog.ts";
import { COIN_FILE, COIN_KEY, SPIN_ANIM, Spinner } from "../objects/Spinner.ts";
import { DEMO_SCENE, LEAK_MODE } from "./keys.ts";

// DemoScene - the scene being watched
//
// Every method Phaser calls on it, and every scene event it hears, is written to the log (see
// LogScene, which shows it). It does not control itself: LogScene pauses, sleeps, stops and
// restarts it when you press the keys.
//
// update() and the per-frame events happen 60 times a second - far too many to log - so the
// first frame after the scene starts, resumes or wakes is logged in full, and after that they
// are only counted.

const PANEL_COLOUR = 0x264653;
const TEXT_STYLE = { fontFamily: "Arial", fontSize: "20px", color: "#ffffff" };

export class DemoScene extends Phaser.Scene {
  // Fields given their value in create() are declared with a `!`: "trust me, this is set before
  // it is used". (The constructor runs long before create(), so TypeScript cannot see it.)
  private spinner!: Spinner;
  private infoText!: Phaser.GameObjects.Text;

  private updates = 0;        // how many times update() has been called since the scene started
  private gameSteps = 0;      // how many frames the whole GAME has run since the scene started
  private framesToLog = 0;    // how many more frames to write to the log in full

  // Runs ONCE - when Phaser makes the scene object, as the game starts. The scene has no game,
  // registry or events yet, so this is the only method that cannot use this.log().
  constructor() {
    super(DEMO_SCENE);
    eventLog.add("constructor()");
  }

  // Runs every time the scene starts: the place to reset fields
  init(): void {
    this.log("init()");
    this.updates = 0;
    this.gameSteps = 0;
    this.framesToLog = 0;
  }

  // Runs after init(). create() waits until everything queued here has loaded.
  preload(): void {
    this.log("preload()");
    this.load.spritesheet(COIN_KEY, COIN_FILE, { frameWidth: 32, frameHeight: 32 });

    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.log("  loader: complete");
    });
  }

  create(): void {
    this.log("create()");

    // Animations belong to the whole game, like loaded pictures - but create() runs every time
    // the scene starts, so only make it the first time. (Chapter 7 is all about animations.)
    if (!this.anims.exists(SPIN_ANIM)) {
      this.anims.create({
        key: SPIN_ANIM,
        frames: this.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // an opaque panel: while this scene is drawn, it hides the words LogScene has put underneath
    this.add.rectangle(10, 10, 380, 450, PANEL_COLOUR).setOrigin(0, 0);
    this.add.text(200, 36, "DemoScene", { ...TEXT_STYLE, fontSize: "30px", fontStyle: "bold" }).setOrigin(0.5);
    this.infoText = this.add.text(40, 80, "", { ...TEXT_STYLE, lineSpacing: 8 });

    this.spinner = new Spinner(this, 200, 360);

    this.listen();
    this.framesToLog = 1;
  }

  // Runs every frame while the scene is RUNNING - not while it is paused, asleep or stopped
  override update(time: number, delta: number): void {
    this.updates = this.updates + 1;
    if (this.framesToLog > 0) {
      this.log("  update()");
    }

    this.infoText.setText([
      `update() calls: ${this.updates}`,
      `game steps seen: ${this.gameSteps}`,
      `time: ${Math.round(time)} ms`,
      `this.time.now: ${Math.round(this.time.now)} ms`,
      `delta: ${delta.toFixed(1)} ms`,
    ]);
  }

  // Sign up for the scene's events, and one of the game's.
  //
  // `this.events` is the scene's own event emitter. Phaser does NOT remove the listeners on it
  // when the scene shuts down - the scene object is reused, and so is its emitter - so every
  // listener added here must be taken off again in onShutdown(). The third argument, `this`, is
  // the "context": the object the method is called on.
  private listen(): void {
    this.events.on(Phaser.Scenes.Events.CREATE, this.onCreate, this);
    this.events.on(Phaser.Scenes.Events.PRE_UPDATE, this.onPreUpdate, this);
    this.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate, this);
    this.events.on(Phaser.Scenes.Events.RENDER, this.onRender, this);
    this.events.on(Phaser.Scenes.Events.PAUSE, this.onPause, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.on(Phaser.Scenes.Events.SLEEP, this.onSleep, this);
    this.events.on(Phaser.Scenes.Events.WAKE, this.onWake, this);

    // The GAME's emitter lasts as long as the game. STEP happens once a frame, whatever state
    // this scene is in - so gameSteps keeps counting while update() does not.
    this.game.events.on(Phaser.Core.Events.STEP, this.onGameStep, this);

    // `once`: these two remove themselves after they have run
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
  }

  private onCreate(): void {
    this.log("CREATE event");
  }

  private onPreUpdate(): void {
    if (this.framesToLog > 0) {
      this.log("PRE_UPDATE event");
      this.spinner.logNextFrame = true;
    }
  }

  private onUpdate(): void {
    if (this.framesToLog > 0) {
      this.log("  UPDATE event");
    }
  }

  private onPostUpdate(): void {
    if (this.framesToLog > 0) {
      this.log("  POST_UPDATE event");
    }
  }

  private onRender(): void {
    if (this.framesToLog > 0) {
      this.log("  RENDER event");
      this.framesToLog = this.framesToLog - 1;
    }
  }

  private onPause(): void {
    this.log("PAUSE event");
  }

  private onResume(): void {
    this.log("RESUME event");
    this.framesToLog = 1;
  }

  private onSleep(): void {
    this.log("SLEEP event");
  }

  private onWake(): void {
    this.log("WAKE event");
    this.framesToLog = 1;
  }

  private onGameStep(): void {
    this.gameSteps = this.gameSteps + 1;
  }

  // The scene is stopping (stop, restart, or start of another scene). Its game objects, timers,
  // tweens and input listeners are cleared up by Phaser - but not listeners WE added to an
  // emitter that lives on: this scene's own `this.events`, and the game's `this.game.events`.
  private onShutdown(): void {
    this.log("SHUTDOWN event");

    if (this.registry.get(LEAK_MODE) === true) {
      this.log("  leak mode: listeners left behind!");
      return;
    }

    this.events.off(Phaser.Scenes.Events.CREATE, this.onCreate, this);
    this.events.off(Phaser.Scenes.Events.PRE_UPDATE, this.onPreUpdate, this);
    this.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate, this);
    this.events.off(Phaser.Scenes.Events.RENDER, this.onRender, this);
    this.events.off(Phaser.Scenes.Events.PAUSE, this.onPause, this);
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.off(Phaser.Scenes.Events.SLEEP, this.onSleep, this);
    this.events.off(Phaser.Scenes.Events.WAKE, this.onWake, this);
    this.game.events.off(Phaser.Core.Events.STEP, this.onGameStep, this);

    // the DESTROY listener was for this run of the scene too
    this.events.off(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
    this.log("  listeners removed");
  }

  // The scene is being removed from the game for good (this.scene.remove). A running scene that
  // is removed does NOT get a SHUTDOWN event first - only this. Phaser empties this.events for
  // us, but the game's emitter is still ours to tidy.
  private onDestroy(): void {
    this.log("DESTROY event");

    if (this.registry.get(LEAK_MODE) !== true) {
      this.game.events.off(Phaser.Core.Events.STEP, this.onGameStep, this);
    }
  }

  // write a message to the log, with the number of the frame it happened in
  private log(message: string): void {
    eventLog.add(message, this.game.loop.frame);
  }
}
