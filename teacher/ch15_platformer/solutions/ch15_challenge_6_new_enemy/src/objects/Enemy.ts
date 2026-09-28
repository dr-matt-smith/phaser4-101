import Phaser from "phaser";

// Enemy - what the game scene needs from anything the hero can stomp on
//
// Slime and Bat are different classes with different behaviour, but the scene treats them the
// same way when the hero touches one: stomped from above, or hurt. An interface says what they
// have in common, like a Java interface - and TypeScript checks that each class really has it.

export interface Enemy {
  body: Phaser.Physics.Arcade.Body;
  isSquashed(): boolean;
  squash(): void;
  canBeStomped(): boolean; // CHALLENGE 6: false for an enemy that hurts even from above
}
