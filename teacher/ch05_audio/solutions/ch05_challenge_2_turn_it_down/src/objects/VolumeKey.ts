import Phaser from "phaser";
import { VOLUME_LEVEL } from "../assets.ts";

// CHALLENGE 2: VolumeKey - the V key steps the whole game's volume down: 100%, 60%, 30%, and
// round again. The text shows the level.
//
// Like the MuteButton, every scene makes its own - but the level is the game's. this.sound.volume
// is the master volume (every sound's volume is multiplied by it); the registry remembers WHICH
// level we are on. (Reading this.sound.volume back would not do: Web Audio stores 0.6 as
// 0.6000000238..., so it is not === 0.6, and LEVELS.indexOf() would not find it.)

const LEVELS = [1, 0.6, 0.3];

export class VolumeKey extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#a8dadc",
    });
    this.setOrigin(1, 0.5);
    scene.add.existing(this);
    this.showLevel();

    scene.input.keyboard!.on("keydown-V", () => {
      this.nextLevel();
    });
  }

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

  private showLevel(): void {
    this.setText(`${Math.round(LEVELS[this.level()] * 100)}%`);
  }
}
