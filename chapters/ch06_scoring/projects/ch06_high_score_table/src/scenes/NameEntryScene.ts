import Phaser from "phaser";
import { CLICK_SOUND_KEY, WIN_SOUND_KEY } from "../assets.ts";
import { HighScoreTable, MAX_INITIALS } from "../HighScoreTable.ts";
import type { GameOverData } from "./GameOverScene.ts";
import { NAME_ENTRY_SCENE, TITLE_SCENE } from "./keys.ts";
import type { TitleData } from "./TitleScene.ts";

// NameEntryScene - "NEW HIGH SCORE!": type up to three initials, then ENTER to save them
//
// Instead of listening for particular keys (keydown-A, keydown-B, ...), it listens for EVERY key
// press, and looks at the browser's KeyboardEvent to see which key it was.

const SLOT_SPACING = 80;
const SLOT_Y = 330;
const LETTER = /^[a-z]$/i;   // one letter, a to z, upper or lower case (the i)

export class NameEntryScene extends Phaser.Scene {
  private result!: GameOverData;
  private initials = "";
  private slots: Phaser.GameObjects.Text[] = [];
  private cursor!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(NAME_ENTRY_SCENE);
  }

  init(data: GameOverData): void {
    this.result = data;
    this.initials = "";
    this.slots = [];
  }

  create(): void {
    this.sound.play(WIN_SOUND_KEY);

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff", align: "center" };

    this.add.text(centreX, 110, "NEW HIGH SCORE!", { ...style, fontSize: "60px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(centreX, 190, `Score: ${this.result.score}`, { ...style, fontSize: "40px" }).setOrigin(0.5);
    this.add.text(centreX, 250, "Type your initials", { ...style, color: "#a8dadc" }).setOrigin(0.5);

    // three letter slots, each with a line under it
    for (let i = 0; i < MAX_INITIALS; i++) {
      const x = centreX + (i - 1) * SLOT_SPACING;
      this.slots.push(this.add.text(x, SLOT_Y, "", { ...style, fontSize: "64px", fontStyle: "bold" }).setOrigin(0.5));
      this.add.rectangle(x, SLOT_Y + 42, 56, 4, 0x9aa4bd);
    }

    // a bar under the slot the next letter will go in, blinking
    this.cursor = this.add.rectangle(0, SLOT_Y + 42, 56, 6, 0xffd166);
    this.tweens.add({ targets: this.cursor, alpha: 0.2, duration: 350, yoyo: true, repeat: -1 });

    this.add.text(centreX, 470, "BACKSPACE to change a letter, ENTER to save", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    // every key press, whichever key it is; Phaser passes the browser's own KeyboardEvent
    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      this.handleKey(event);
    });

    this.showInitials();
  }

  // event.key is what the key TYPES: "a", "A", "Enter", "Backspace", "7" ... (so it follows the
  // player's keyboard layout, where event.code would give the key's position: "KeyA")
  private handleKey(event: KeyboardEvent): void {
    if (LETTER.test(event.key) && this.initials.length < MAX_INITIALS) {
      this.initials = this.initials + event.key.toUpperCase();
      this.sound.play(CLICK_SOUND_KEY);
    } else if (event.key === "Backspace") {
      this.initials = this.initials.slice(0, -1);   // everything but the last letter
    } else if (event.key === "Enter" && this.initials.length > 0) {
      this.save();
      return;
    }
    this.showInitials();
  }

  private showInitials(): void {
    this.slots.forEach((slot, index) => {
      slot.setText(this.initials.charAt(index));   // "" past the end of the string
    });

    // the cursor sits under the next empty slot, and hides when all three are full
    const next = this.initials.length;
    this.cursor.setVisible(next < MAX_INITIALS);
    this.cursor.x = this.slots[Math.min(next, MAX_INITIALS - 1)].x;
  }

  // Load the table, add this score, save it - then show the table with the new row highlighted.
  private save(): void {
    const table = HighScoreTable.load();
    const place = table.add({ initials: this.initials, score: this.result.score, level: this.result.level });
    table.save();

    const data: TitleData = { highlight: place };
    this.scene.start(TITLE_SCENE, data);
  }
}
