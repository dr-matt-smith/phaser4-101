// rooms.ts - every room in the game: which section of the pack holds its files, and where its
// pictures go
//
// CHALLENGE 6: the files themselves are no longer listed here - they are in
// public/assets/rooms_pack.json, one section per room. This file only says what to DO with them.

export const ROOMS_PACK_FILE = "assets/rooms_pack.json";     // CHALLENGE 6

// one of the room's pictures, placed at (x, y)
export interface RoomProp {
  key: string;
  x: number;
  y: number;
}

export interface Room {
  name: string;
  section: string;          // CHALLENGE 6: this room's section in rooms_pack.json
  background: string;       // CHALLENGE 6: keys, not files - the pack says which file each key is
  props: RoomProp[];
  sound: string;            // played as you walk in
}

export const ROOMS: Room[] = [
  {
    name: "Meadow",
    section: "meadow",
    background: "sky",
    props: [
      { key: "cloud", x: 160, y: 100 },
      { key: "cloud", x: 590, y: 150 },
      { key: "platform", x: 400, y: 420 },
      { key: "player", x: 400, y: 380 },
      { key: "coin", x: 330, y: 360 },
      { key: "coin", x: 470, y: 360 },
    ],
    sound: "powerup",
  },
  {
    name: "Space",
    section: "space",
    background: "space",
    props: [
      { key: "player_ship", x: 400, y: 500 },
      { key: "enemy_ship", x: 250, y: 160 },
      { key: "enemy_ship", x: 400, y: 120 },
      { key: "enemy_ship", x: 550, y: 160 },
      { key: "rock", x: 140, y: 360 },
      { key: "rock", x: 660, y: 310 },
    ],
    sound: "shoot",
  },
  {
    name: "Picnic",
    section: "picnic",
    background: "table",
    props: [
      { key: "basket", x: 400, y: 440 },
      { key: "fruit", x: 330, y: 300 },
      { key: "fruit", x: 400, y: 260 },
      { key: "fruit", x: 470, y: 300 },
    ],
    sound: "coin_sound",
  },
  {
    name: "Arena",
    section: "arena",
    background: "arena",
    props: [
      { key: "player", x: 250, y: 446 },
      { key: "enemy", x: 550, y: 446 },
      { key: "heart", x: 400, y: 300 },
    ],
    sound: "door",
  },
];

// CHALLENGE 6: the key the pack file itself is kept under, once loaded for this room
export function packKey(room: Room): string {
  return `pack_${room.section}`;
}
