import Phaser from "phaser";
import { BEST_TIMES, TABLE_SIZE, WIN_KEY } from "../assets.ts";
import { PLAY_SCENE, START_SCENE, WIN_SCENE } from "./keys.ts";

// WinScene - the result: time, misses, penalty, total - and whether it is a new best
//
// The best time has to outlive this scene (the start scene shows it), so it goes in the game's
// REGISTRY: a store of named values shared by every scene in the game.

export interface WinData {
  seconds: number;
  misses: number;
  penalty: number;
}

export class WinScene extends Phaser.Scene {
  private result!: WinData;

  constructor() {
    super(WIN_SCENE);
  }

  init(data: WinData): void {
    this.result = data;
  }

  create(): void {
    this.sound.play(WIN_KEY);

    const total = this.result.seconds + this.result.penalty;

    // CHALLENGE 6: add this total to the table, sort it best first, and keep the top five
    const times: number[] = this.registry.get(BEST_TIMES) ?? [];
    times.push(total);
    times.sort((a, b) => a - b);
    const top = times.slice(0, TABLE_SIZE);
    this.registry.set(BEST_TIMES, top);

    // which place did it take? indexOf is -1 if it did not make the table
    const place = top.indexOf(total) + 1;

    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "28px", color: "#ffffff" };

    this.add.text(centreX, 130, "You did it!", { ...style, fontSize: "64px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.add.text(centreX, 230, `Time: ${this.result.seconds.toFixed(2)} s`, style).setOrigin(0.5);
    this.add.text(centreX, 275, `Misses: ${this.result.misses}  (+${this.result.penalty} s)`, style).setOrigin(0.5);
    this.add.text(centreX, 330, `Total: ${total.toFixed(2)} s`, { ...style, fontSize: "36px" }).setOrigin(0.5);

    // CHALLENGE 6: say where it came
    const placeMessage = place > 0 ? `That is number ${place} in the top ${TABLE_SIZE}!` : `Not in the top ${TABLE_SIZE} this time`;
    this.add.text(centreX, 390, placeMessage, { ...style, color: place > 0 ? "#e63946" : "#a8dadc", fontStyle: "bold" })
      .setOrigin(0.5);

    this.add.text(centreX, 470, "SPACE to play again, ESC for the title screen", { ...style, fontSize: "22px" })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(PLAY_SCENE);
    });
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start(START_SCENE);
    });
  }
}
