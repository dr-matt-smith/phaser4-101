import Phaser from "phaser";

// HelloScene - the game's only scene
//
// A SCENE is one screen of a game: a title screen, a level, a game over screen. Our scene EXTENDS
// Phaser.Scene, so it inherits everything a scene can do (this.add, this.load, this.input, ...)
// and fills in the methods Phaser calls at the right moments:
//   preload()  load the pictures and sounds the scene needs
//   create()   build the scene, once everything has loaded
//   update()   run every frame - about 60 times a second (not needed here)

// the names ("keys") the loaded pictures are known by, and the files they come from
const LOGO_KEY = "logo";
const LOGO_FILE = "assets/images/logo.png";
const STAR_KEY = "star";
const STAR_FILE = "assets/images/star.png";

// colours for the background, picked at random when SPACE is pressed
const COLOURS = ["#1d2433", "#3a0ca3", "#2a9d8f", "#9d0208", "#264653", "#6a4c93"];

export class HelloScene extends Phaser.Scene {
  // the text that tells the player what to do
  // - the ! says "this is set later (in create), so do not insist on a value here"
  private message!: Phaser.GameObjects.Text;

  // how many times SPACE has been pressed
  private presses = 0;

  constructor() {
    // every scene has a unique KEY - its name
    super("HelloScene");
  }

  preload(): void {
    this.load.image(LOGO_KEY, LOGO_FILE);
    this.load.image(STAR_KEY, STAR_FILE);
  }

  create(): void {
    // this.scale knows the size of the game
    const centreX = this.scale.width / 2;

    // an IMAGE game object, from a loaded picture - (x, y) is its MIDDLE
    this.add.image(centreX, 200, LOGO_KEY);

    // a TEXT game object; setOrigin(0.5) makes (x, y) its middle too, so it is centred
    this.message = this.add.text(centreX, 380, "Press SPACE", {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffffff",
    });
    this.message.setOrigin(0.5);

    // a star in each corner, to show where the corners are
    // - setOrigin(0, 0) makes (x, y) the picture's TOP LEFT corner instead of its middle
    this.add.image(0, 0, STAR_KEY).setOrigin(0, 0);
    this.add.image(this.scale.width, 0, STAR_KEY).setOrigin(1, 0);
    this.add.image(0, this.scale.height, STAR_KEY).setOrigin(0, 1);
    this.add.image(this.scale.width, this.scale.height, STAR_KEY).setOrigin(1, 1);

    // when SPACE goes down, run changeColour()
    // - the => is an ARROW FUNCTION, and inside it `this` is still the scene
    this.input.keyboard!.on("keydown-SPACE", () => {
      this.changeColour();
    });
  }

  // paint the background a random colour, and count the press
  private changeColour(): void {
    const colour = Phaser.Utils.Array.GetRandom(COLOURS);
    this.cameras.main.setBackgroundColor(colour);

    this.presses = this.presses + 1;
    this.message.setText(`Presses: ${this.presses}`);
  }
}
