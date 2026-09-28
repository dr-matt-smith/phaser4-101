import Phaser from "phaser";
import { BUTTON_KEY, BUTTON_OVER_KEY } from "../assets.ts";

// SoundPad - a button that plays one sound, and stays lit until the sound has finished
//
// The pad does not decide HOW its sound is played (how loud, how fast, ...) - the scene works
// that out and hands the pad a SoundConfig. The pad knows its own sound, and how to light up.

const PAD_SCALE = 0.8;             // button.png is 220 x 64: a little smaller fits four in a row
const LIT_TINT = 0x80ff80;         // green, while the pad's sound is playing

export class SoundPad extends Phaser.GameObjects.Image {
  public readonly soundKey: string;
  private label: Phaser.GameObjects.Text;
  private playing = 0;             // how many of this pad's sounds are playing right now
  private pointerOver = false;

  constructor(scene: Phaser.Scene, x: number, y: number, soundKey: string, number: number) {
    super(scene, x, y, BUTTON_KEY);
    this.soundKey = soundKey;
    this.setScale(PAD_SCALE);
    scene.add.existing(this);

    this.label = scene.add.text(x, y, `${number}  ${soundKey}`, {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.setInteractive({ useHandCursor: true });
    this.on("pointerover", () => {
      this.pointerOver = true;
      this.showState();
    });
    this.on("pointerout", () => {
      this.pointerOver = false;
      this.showState();
    });
  }

  // Plays the pad's sound with the settings in `config`.
  public play(config: Phaser.Types.Sound.SoundConfig): void {
    // add() makes a Sound object and keeps it in the sound manager until it is destroyed.
    // Unlike this.sound.play(key), it gives us the object - so we can listen for its end
    const sound = this.scene.sound.add(this.soundKey);

    sound.once(Phaser.Sound.Events.COMPLETE, () => {
      this.playing = this.playing - 1;
      this.showState();
      // a sound made with add() stays in the manager until destroyed - and we will not need
      // this one again (the next press makes a new one)
      sound.destroy();
    });

    sound.play(config);
    this.playing = this.playing + 1;
    this.showState();
  }

  // Picks the pad's picture: lit while playing, highlighted under the pointer, normal otherwise.
  private showState(): void {
    if (this.playing > 0) {
      this.setTexture(BUTTON_OVER_KEY).setTint(LIT_TINT);
      this.label.setColor("#1b1f2a");
    } else {
      this.setTexture(this.pointerOver ? BUTTON_OVER_KEY : BUTTON_KEY).clearTint();
      this.label.setColor("#ffffff");
    }
  }
}
