import Phaser from "phaser";
import { BOOT_SCENE, ERROR_SCENE, MENU_SCENE } from "./keys.ts";
import type { MenuData } from "./MenuScene.ts";

// CHALLENGE 5: this whole file is new
//
// ErrorScene - shown instead of the menu when one or more files failed to load
//
// It says which files, and where Phaser looked for them (usually the clue: a spelling mistake,
// or a file not copied into public/). R tries again; SPACE carries on without them.

export interface ErrorData {
  failed: string[];     // "key  -  url" for each file that failed
  menu: MenuData;       // what to pass on to the menu, if the player carries on
}

export class ErrorScene extends Phaser.Scene {
  private error!: ErrorData;

  constructor() {
    super(ERROR_SCENE);
  }

  init(data: ErrorData): void {
    this.error = data;
  }

  create(): void {
    const centreX = this.scale.width / 2;
    const style = { fontFamily: "Arial", fontSize: "22px", color: "#e8ecf5", align: "center" };

    this.add.text(centreX, 110, "Some files could not be loaded", {
      ...style,
      fontSize: "36px",
      color: "#e63946",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(centreX, 250, this.error.failed.join("\n"), { ...style, color: "#ffd166" }).setOrigin(0.5);

    this.add.text(
      centreX,
      450,
      "Check each file is in public/assets/, and that its name\nis spelled exactly the same in the code - capitals too.",
      style,
    ).setOrigin(0.5);

    this.add.text(centreX, 540, "R - try again        SPACE - carry on without them", { ...style, color: "#a8dadc" })
      .setOrigin(0.5);

    // Files that failed are not in any cache, so starting from the boot scene again tries just
    // those - everything that did load is skipped
    this.input.keyboard!.once("keydown-R", () => {
      this.scene.start(BOOT_SCENE);
    });
    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(MENU_SCENE, this.error.menu);
    });
  }
}
