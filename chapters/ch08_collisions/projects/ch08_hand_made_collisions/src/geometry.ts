import Phaser from "phaser";

// geometry.ts - do two shapes touch? Worked out with Phaser's geometry classes, by hand.
//
// The shapes on screen are Phaser's own Shape game objects: a Rectangle, or an Arc (a circle).
// Neither knows anything about collisions. For each test we make a GEOMETRY object - a
// Phaser.Geom.Rectangle or Phaser.Geom.Circle, which is just numbers, never drawn - and ask
// Phaser.Geom.Intersects whether the two overlap.

// a union type: a shape on screen is a rectangle OR a circle
export type DragShape = Phaser.GameObjects.Rectangle | Phaser.GameObjects.Arc;

// the circle a round shape covers, in game coordinates
export function circleOf(shape: Phaser.GameObjects.Arc): Phaser.Geom.Circle {
  return new Phaser.Geom.Circle(shape.x, shape.y, shape.radius);
}

// true if the two shapes overlap.
// boxesOnly = true tests every shape as its BOUNDING RECTANGLE - even the circles - which is
// quick, but unfair to round things: their empty corners count as touching.
export function touching(a: DragShape, b: DragShape, boxesOnly: boolean): boolean {
  const intersects = Phaser.Geom.Intersects;

  // getBounds() gives the smallest rectangle, lined up with the screen, that holds the whole shape
  if (boxesOnly) {
    return intersects.RectangleToRectangle(a.getBounds(), b.getBounds());
  }

  // instanceof checks the class of an object while the game runs, as in Java - and TypeScript
  // then knows that `a` is an Arc inside the if, so a.radius is allowed
  if (a instanceof Phaser.GameObjects.Arc && b instanceof Phaser.GameObjects.Arc) {
    return intersects.CircleToCircle(circleOf(a), circleOf(b));
  }
  if (a instanceof Phaser.GameObjects.Arc) {
    return intersects.CircleToRectangle(circleOf(a), b.getBounds());
  }
  if (b instanceof Phaser.GameObjects.Arc) {
    return intersects.CircleToRectangle(circleOf(b), a.getBounds());
  }
  return intersects.RectangleToRectangle(a.getBounds(), b.getBounds());
}
