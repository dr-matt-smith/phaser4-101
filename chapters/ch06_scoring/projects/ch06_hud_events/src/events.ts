// events.ts - the names of the events the game scene sends, and the registry key it uses
//
// An event name is just a string, and a misspelt string is a listener that never hears anything -
// with no error. As constants, a typo is a build error instead (the same reason scene keys are
// constants).

// route 1 - sent on the GAME SCENE's own emitter: this.events.emit(COINS_CHANGED, coins)
export const COINS_CHANGED = "coins-changed";

// route 2 - sent on the GAME's emitter, which every scene shares: this.game.events.emit(...)
export const GEMS_CHANGED = "gems-changed";

// route 3 - a value kept in the REGISTRY; changing it makes the registry send "changedata-stars"
export const STARS = "stars";
