// events.ts - the names of the events GameScene sends to HudScene
//
// GameScene emits them on its own event emitter (this.events); HudScene listens. Neither scene
// needs to know anything else about the other (Chapter 6).

export const SCORE_CHANGED = "score-changed";         // (score: number)
export const LIVES_CHANGED = "lives-changed";         // (lives: number)
export const LEVEL_CHANGED = "level-changed";         // (level: number)
export const WEAPON_CHANGED = "weapon-changed";       // (description: string) - "" for none
export const BOSS_HEALTH_CHANGED = "boss-health";     // (health: number, maxHealth: number) - 0 hides the bar
export const BOMBS_CHANGED = "bombs-changed";         // (bombs: number) - CHALLENGE 5
