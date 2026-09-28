import Phaser from "phaser";
import { eventLog } from "../EventLog.ts";
import { DemoScene } from "./DemoScene.ts";
import { DEMO_SCENE, LEAK_MODE, LOG_SCENE, SKIP_SUPER } from "./keys.ts";

// LogScene - the control panel. It shows the log, reports DemoScene's state, and reads the keys.
//
// It is the first scene in the config, so Phaser starts it; it LAUNCHES DemoScene, so the two
// run side by side. The keys live here, not in DemoScene, because a paused, sleeping or stopped
// scene does not hear the keyboard - DemoScene could never wake itself up.

const LOG_LINES = 25;       // how many lines of the log fit on screen
const MONO = { fontFamily: "Courier New, monospace", fontSize: "13px", color: "#a8dadc" };
const TEXT = { fontFamily: "Arial", fontSize: "15px", color: "#ffffff" };

// the names of Phaser's scene states, in number order (Phaser.Scenes.PENDING is 0, and so on)
const STATUS_NAMES = [
  "PENDING", "INIT", "START", "LOADING", "CREATING", "RUNNING", "PAUSED", "SLEEPING", "SHUTDOWN", "DESTROYED",
];

export class LogScene extends Phaser.Scene {
  private logText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private shownVersion = -1;       // the log's version when it was last put on screen

  constructor() {
    super(LOG_SCENE);
  }

  create(): void {
    this.registry.set(LEAK_MODE, false);
    this.registry.set(SKIP_SUPER, false);

    // Underneath DemoScene's panel. DemoScene is later in the scene list, so it is drawn on top
    // and hides this - until it is asleep or stopped, and not drawn at all.
    this.add.text(200, 235, "DemoScene is\nnot being drawn", { ...TEXT, fontSize: "26px", color: "#6c7a96", align: "center" })
      .setOrigin(0.5);

    this.add.rectangle(400, 10, 390, 450, 0x11151f).setOrigin(0, 0);
    this.logText = this.add.text(406, 16, "", MONO);

    this.statusText = this.add.text(16, 472, "", { ...TEXT, lineSpacing: 4 });
    this.add.text(16, 548, [
      "1 pause   2 resume   3 sleep   4 wake   5 restart   6 stop   7 launch   8 remove",
      "L leak mode on/off     S skip super.preUpdate() on/off     C clear the log",
    ], { ...TEXT, color: "#ffd166", lineSpacing: 4 });

    this.addKeys();

    // run DemoScene alongside this one - launch() does not stop this scene, start() would
    this.scene.launch(DEMO_SCENE);
  }

  override update(): void {
    // only rebuild the log's text when something has been added to it
    if (eventLog.getVersion() !== this.shownVersion) {
      this.shownVersion = eventLog.getVersion();
      this.logText.setText(eventLog.getLast(LOG_LINES));
    }
    this.showStatus();
  }

  private addKeys(): void {
    const keyboard = this.input.keyboard!;

    keyboard.on("keydown-ONE", () => {
      this.logCommand("scene.pause(DEMO_SCENE)");
      this.scene.pause(DEMO_SCENE);
    });
    keyboard.on("keydown-TWO", () => {
      this.logCommand("scene.resume(DEMO_SCENE)");
      this.scene.resume(DEMO_SCENE);
    });
    keyboard.on("keydown-THREE", () => {
      this.logCommand("scene.sleep(DEMO_SCENE)");
      this.scene.sleep(DEMO_SCENE);
    });
    keyboard.on("keydown-FOUR", () => {
      this.logCommand("scene.wake(DEMO_SCENE)");
      this.scene.wake(DEMO_SCENE);
    });
    keyboard.on("keydown-FIVE", () => {
      // restart() always restarts the scene it belongs to - so ask DemoScene's own scene plugin
      const demo = this.getDemo();
      if (demo !== null) {
        this.logCommand("demo.scene.restart()");
        demo.scene.restart();
      }
    });
    keyboard.on("keydown-SIX", () => {
      this.logCommand("scene.stop(DEMO_SCENE)");
      this.scene.stop(DEMO_SCENE);
    });
    keyboard.on("keydown-SEVEN", () => {
      if (this.getDemo() === null) {
        // it was removed: make a brand new DemoScene object, and start it (true)
        this.logCommand("scene.add(DEMO_SCENE, DemoScene, true)");
        this.scene.add(DEMO_SCENE, DemoScene, true);
      } else {
        this.logCommand("scene.launch(DEMO_SCENE)");
        this.scene.launch(DEMO_SCENE);
      }
    });
    keyboard.on("keydown-EIGHT", () => {
      // remove() is not queued like the others: called from a key press, it happens there and
      // then - in the middle of Phaser handing that key to every scene, including the one being
      // removed, and Phaser trips over it. A 0 ms timer puts it off until the next frame.
      this.logCommand("scene.remove(DEMO_SCENE)");
      this.time.delayedCall(0, () => {
        this.scene.remove(DEMO_SCENE);
      });
    });

    keyboard.on("keydown-L", () => {
      this.registry.set(LEAK_MODE, !this.registry.get(LEAK_MODE));
    });
    keyboard.on("keydown-S", () => {
      this.registry.set(SKIP_SUPER, !this.registry.get(SKIP_SUPER));
    });
    keyboard.on("keydown-C", () => {
      eventLog.clear();
    });
  }

  // DemoScene, or null once it has been removed. (get() returns null for a key it does not know,
  // but its type does not say so - hence the `as`.)
  private getDemo(): DemoScene | null {
    return this.scene.get(DEMO_SCENE) as DemoScene | null;
  }

  private showStatus(): void {
    const demo = this.getDemo();
    const yesNo = (value: boolean): string => value ? "yes" : "no";

    let state = "removed - press 7 to add a new one";
    let listeners = "-";
    let counts = "";     // CHALLENGE 1
    if (demo !== null) {
      state = `${STATUS_NAMES[this.scene.getStatus(DEMO_SCENE)]}    ` +
        `isActive: ${yesNo(this.scene.isActive(DEMO_SCENE))}   ` +
        `isPaused: ${yesNo(this.scene.isPaused(DEMO_SCENE))}   ` +
        `isSleeping: ${yesNo(this.scene.isSleeping(DEMO_SCENE))}   ` +
        `isVisible: ${yesNo(this.scene.isVisible(DEMO_SCENE))}`;
      listeners = String(demo.events.listenerCount(Phaser.Scenes.Events.CREATE));
      // CHALLENGE 1: ask DemoScene for its counts
      counts = `     updates: ${demo.getUpdates()}   renders: ${demo.getRenders()}`;
    }

    const leak = this.registry.get(LEAK_MODE) ? "ON" : "off";
    const skip = this.registry.get(SKIP_SUPER) ? "SKIPPED" : "called";
    this.statusText.setText([
      `DemoScene: ${state}`,
      `fps: ${this.game.loop.actualFps.toFixed(1)}${counts}`,     // CHALLENGE 1
      `listeners for CREATE: ${listeners}     ` +
      `for the game's STEP: ${this.game.events.listenerCount(Phaser.Core.Events.STEP)}     ` +
      `leak mode: ${leak}     super.preUpdate(): ${skip}`,
    ]);
  }

  // write a command to the log, marked with >> so it stands out from DemoScene's own messages
  // (the commands are all this.scene.something - the `this.` is left out to fit the panel)
  private logCommand(command: string): void {
    eventLog.add(`>> ${command}`, this.game.loop.frame);
  }
}
