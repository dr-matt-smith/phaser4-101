// gameEvents.ts - the names of the events GameScene emits, for the HUD to listen to
//
// Event names are strings, like scene keys - so they are constants too: a misspelt constant is
// a build error, a misspelt string is an event nobody ever hears.

export const SCORE_CHANGED = "score-changed";   // sent with the new score
export const LIVES_CHANGED = "lives-changed";   // sent with the lives left
export const TIME_CHANGED = "time-changed";     // sent with the whole seconds left
