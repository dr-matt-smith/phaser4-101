import type { Card } from "./Card.ts";

// rules.ts - the rules of higher or lower, and its scoring, as plain functions
//
// No Phaser here: given cards and a guess, say what happened, how risky it was, and what it is
// worth. The scene asks, and then decides what to show and play.

export type Guess = "higher" | "lower";
export type Outcome = "right" | "wrong" | "tie";

const BASE_POINTS = 10;

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

// Of the 13 ranks, how many would make this guess right? "Higher" on a 4 is won by 5 to king: 9.
// (This treats every rank as equally likely - it does not look at which cards are left in the deck.)
export function winningRanks(guess: Guess, current: Card): number {
  if (guess === "higher") {
    return 13 - current.value;
  }
  return current.value - 1;
}

// The riskier the guess, the more it pays: x1 if most ranks win, x2 for about half, x3 for a long
// shot. 0 means the guess cannot win at all ("higher" on a king).
export function riskMultiplier(guess: Guess, current: Card): number {
  const wins = winningRanks(guess, current);
  if (wins === 0) {
    return 0;
  }
  if (wins >= 7) {
    return 1;
  }
  if (wins >= 4) {
    return 2;
  }
  return 3;
}

// What a right guess adds to the pot: more for a risky guess, and more the longer the run.
export function pointsFor(multiplier: number, inARow: number): number {
  return BASE_POINTS * multiplier * inARow;
}
