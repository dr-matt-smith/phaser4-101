import type { Card } from "./Card.ts";

// rules.ts - the rules of higher or lower, as plain functions
//
// No Phaser here either: given two cards and a guess, say what happened. The scene asks, and then
// decides what to show and play.

export type Guess = "higher" | "lower";
export type Outcome = "right" | "wrong" | "tie";

export function judge(guess: Guess, current: Card, next: Card): Outcome {
  if (next.value === current.value) {
    return "tie"; // same rank: neither higher nor lower, so it does not count either way
  }
  const wentHigher = next.value > current.value;
  if ((guess === "higher" && wentHigher) || (guess === "lower" && !wentHigher)) {
    return "right";
  }
  return "wrong";
}
