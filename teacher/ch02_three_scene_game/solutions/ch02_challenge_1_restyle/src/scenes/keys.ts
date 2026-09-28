// keys.ts - the name of every scene, in one place
//
// A scene starts another by its KEY (its name). If the names were typed out wherever they are
// used, one typo - "Playscene" - would mean a game that silently does nothing. As constants, a
// typo is a build error instead.

export const START_SCENE = "StartScene";
export const PLAY_SCENE = "PlayScene";
export const WIN_SCENE = "WinScene";
