// rooms.ts - every room in the game: its files, and where its pictures go
//
// Plain data, no Phaser. The menu reads it to know what to load; the room scene reads it to know
// what to show. Adding a room is adding an entry here (and its files to public/assets/).

// a file to load, and the key to keep it under
export interface RoomFile {
  key: string;
  url: string;
}

// one of the room's pictures, placed at (x, y)
export interface RoomProp {
  key: string;
  x: number;
  y: number;
}

export interface Room {
  name: string;
  background: RoomFile;
  pictures: RoomFile[];
  props: RoomProp[];
  sound: RoomFile;          // played as you walk in
}

// Two rooms share the player's picture. It uses the same key in both, so whichever room is visited
// first loads it, and the other finds it already there.
const PLAYER: RoomFile = { key: "player", url: "assets/images/player.png" };

export const ROOMS: Room[] = [
  {
    name: "Meadow",
    background: { key: "sky", url: "assets/images/sky.png" },
    pictures: [
      { key: "cloud", url: "assets/images/cloud.png" },
      { key: "platform", url: "assets/images/platform.png" },
      { key: "coin", url: "assets/images/coin.png" },
      PLAYER,
    ],
    props: [
      { key: "cloud", x: 160, y: 100 },
      { key: "cloud", x: 590, y: 150 },
      { key: "platform", x: 400, y: 420 },
      { key: "player", x: 400, y: 380 },
      { key: "coin", x: 330, y: 360 },
      { key: "coin", x: 470, y: 360 },
    ],
    sound: { key: "powerup", url: "assets/audio/powerup.wav" },
  },
  {
    name: "Space",
    background: { key: "space", url: "assets/images/space.png" },
    pictures: [
      { key: "player_ship", url: "assets/images/player_ship.png" },
      { key: "enemy_ship", url: "assets/images/enemy_ship.png" },
      { key: "rock", url: "assets/images/rock.png" },
    ],
    props: [
      { key: "player_ship", x: 400, y: 500 },
      { key: "enemy_ship", x: 250, y: 160 },
      { key: "enemy_ship", x: 400, y: 120 },
      { key: "enemy_ship", x: 550, y: 160 },
      { key: "rock", x: 140, y: 360 },
      { key: "rock", x: 660, y: 310 },
    ],
    sound: { key: "shoot", url: "assets/audio/shoot.wav" },
  },
  {
    name: "Picnic",
    background: { key: "table", url: "assets/images/table.png" },
    pictures: [
      { key: "basket", url: "assets/images/basket.png" },
      { key: "fruit", url: "assets/images/fruit.png" },
    ],
    props: [
      { key: "basket", x: 400, y: 440 },
      { key: "fruit", x: 330, y: 300 },
      { key: "fruit", x: 400, y: 260 },
      { key: "fruit", x: 470, y: 300 },
    ],
    sound: { key: "coin_sound", url: "assets/audio/coin.wav" },
  },
  {
    name: "Arena",
    background: { key: "arena", url: "assets/images/arena.png" },
    pictures: [
      PLAYER,
      { key: "enemy", url: "assets/images/enemy.png" },
      { key: "heart", url: "assets/images/heart.png" },
    ],
    props: [
      { key: "player", x: 250, y: 446 },
      { key: "enemy", x: 550, y: 446 },
      { key: "heart", x: 400, y: 300 },
    ],
    sound: { key: "door", url: "assets/audio/door.wav" },
  },
];
