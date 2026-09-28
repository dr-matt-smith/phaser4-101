import type { MedalTimes } from "./levels.ts";

// medals.ts - CHALLENGE 5: which medal a time earns, and how medals compare

export type Medal = "gold" | "silver" | "bronze" | "none";

// better medals have bigger numbers, so two medals can be compared with > and <
export const MEDAL_RANK: Record<Medal, number> = { none: 0, bronze: 1, silver: 2, gold: 3 };

export const MEDAL_COLOUR: Record<Medal, string> = {
  gold: "#ffd166",
  silver: "#ced4da",
  bronze: "#cd7f32",
  none: "#ffffff",
};

export function medalFor(seconds: number, times: MedalTimes): Medal {
  if (seconds <= times.gold) {
    return "gold";
  }
  if (seconds <= times.silver) {
    return "silver";
  }
  if (seconds <= times.bronze) {
    return "bronze";
  }
  return "none";
}

// is this a Medal? For checking what comes back from localStorage
export function isMedal(value: unknown): value is Medal {
  return value === "gold" || value === "silver" || value === "bronze" || value === "none";
}
