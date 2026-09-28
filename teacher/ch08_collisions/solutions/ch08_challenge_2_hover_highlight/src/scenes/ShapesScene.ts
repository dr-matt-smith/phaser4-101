import Phaser from "phaser";
import { contains, type DragShape, touching } from "../geometry.ts";   // CHALLENGE 2: contains

// ShapesScene - rectangles and circles to drag around; they turn red while they touch
//
// Every frame, update() tests every pair of shapes with the functions in geometry.ts. SPACE
// switches between testing the real shapes and testing only their bounding rectangles.

const IDLE_COLOUR = 0x457b9d;       // blue: touching nothing
const TOUCHING_COLOUR = 0xe63946;   // red: touching at least one other shape
const SHAPE_ALPHA = 0.85;           // slightly see-through, so overlaps show
const BOX_OUTLINE_COLOUR = 0xf4a261;
const HOVER_OUTLINE_COLOUR = 0xffffff;   // CHALLENGE 2
const HOVER_OUTLINE_WIDTH = 5;           // CHALLENGE 2

export class ShapesScene extends Phaser.Scene {
  // every shape on screen, rectangles and circles together
  private shapes: DragShape[] = [];

  // false: test the real shapes. true: test only their bounding rectangles
  private boxesOnly = false;

  // `!` promises TypeScript these are set before they are used - by create(), which Phaser always
  // runs before update()
  private outlines!: Phaser.GameObjects.Graphics;
  private info!: Phaser.GameObjects.Text;

  constructor() {
    super("ShapesScene");
  }

  create(): void {
    this.shapes = [];

    this.addBox(170, 150, 180, 90);
    this.addBox(620, 440, 90, 170);
    this.addBox(400, 500, 130, 60);
    this.addCircle(620, 170, 80);
    this.addCircle(190, 420, 55);
    this.addCircle(410, 280, 35);

    // Graphics draws lines and shapes in code - used for the bounding-box outlines
    this.outlines = this.add.graphics();

    // the input plugin tells us about EVERY drag in the scene: which object, and where the
    // pointer has dragged it to
    this.input.on("drag", (_pointer: Phaser.Input.Pointer, shape: DragShape, dragX: number, dragY: number) => {
      shape.setPosition(dragX, dragY);
    });

    // bring the shape being dragged to the front, so it is drawn on top of the others
    this.input.on("dragstart", (_pointer: Phaser.Input.Pointer, shape: DragShape) => {
      this.children.bringToTop(shape);
    });

    this.input.keyboard!.on("keydown-SPACE", () => {
      this.boxesOnly = !this.boxesOnly;
    });

    this.info = this.add.text(10, 10, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
    });
    this.info.setDepth(1);  // always drawn above the shapes
  }

  override update(): void {
    // test every PAIR once: shape 0 with 1, 2, 3...; shape 1 with 2, 3...; and so on
    const touched = new Set<DragShape>();
    let pairs = 0;

    for (let i = 0; i < this.shapes.length; i++) {
      for (let j = i + 1; j < this.shapes.length; j++) {
        const a = this.shapes[i];
        const b = this.shapes[j];
        if (touching(a, b, this.boxesOnly)) {
          touched.add(a);
          touched.add(b);
          pairs++;
        }
      }
    }

    for (const shape of this.shapes) {
      const colour = touched.has(shape) ? TOUCHING_COLOUR : IDLE_COLOUR;
      shape.setFillStyle(colour, SHAPE_ALPHA);
    }

    // in boxes-only mode, show the rectangles that are really being tested
    this.outlines.clear();
    if (this.boxesOnly) {
      this.outlines.lineStyle(2, BOX_OUTLINE_COLOUR);
      for (const shape of this.shapes) {
        this.outlines.strokeRectShape(shape.getBounds());
      }
    }
    this.children.bringToTop(this.outlines);

    this.showHover();   // CHALLENGE 2

    const mode = this.boxesOnly ? "bounding boxes only" : "real shapes";
    this.info.setText(`Drag the shapes.   Testing: ${mode} (SPACE to switch)   Touching pairs: ${pairs}`);
  }

  // CHALLENGE 2: outline the shape under the pointer. If shapes overlap, only the one drawn on top
  // (the highest index in the scene's display list) - the one a click would pick up.
  private showHover(): void {
    const pointer = this.input.activePointer;
    let hovered: DragShape | undefined = undefined;

    for (const shape of this.shapes) {
      if (contains(shape, pointer.x, pointer.y)) {
        if (hovered === undefined || this.children.getIndex(shape) > this.children.getIndex(hovered)) {
          hovered = shape;
        }
      }
    }

    for (const shape of this.shapes) {
      if (shape === hovered) {
        shape.setStrokeStyle(HOVER_OUTLINE_WIDTH, HOVER_OUTLINE_COLOUR);
      } else {
        shape.setStrokeStyle();   // no line width: no outline
      }
    }
  }

  private addBox(x: number, y: number, width: number, height: number): void {
    const box = this.add.rectangle(x, y, width, height, IDLE_COLOUR, SHAPE_ALPHA);

    // A shape's hit area is its rectangle, which is exactly right for a box
    box.setInteractive({ draggable: true, useHandCursor: true });
    this.shapes.push(box);
  }

  private addCircle(x: number, y: number, radius: number): void {
    const circle = this.add.circle(x, y, radius, IDLE_COLOUR, SHAPE_ALPHA);

    // A circle's hit area would be its rectangle too - so clicking just outside the circle, in a
    // corner of its box, would pick it up. Give it a CIRCLE hit area instead. The hit area is in
    // the object's own coordinates, where (0, 0) is its top-left corner - so the centre is at
    // (radius, radius). Circle.Contains is the test Phaser runs: is this point inside the circle?
    circle.setInteractive({
      hitArea: new Phaser.Geom.Circle(radius, radius, radius),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      draggable: true,
      useHandCursor: true,
    });
    this.shapes.push(circle);
  }
}
