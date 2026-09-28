// assets.ts - the key and file of every picture and sound, and the names of things made in code
//
// StartScene loads them all; the other scenes and the game objects use the keys.

export const SPACE_KEY = "space";
export const SPACE_FILE = "assets/images/space.png";
export const SHIP_KEY = "playerShip";
export const SHIP_FILE = "assets/images/player_ship.png";
export const ENEMY_KEY = "enemyShip";
export const ENEMY_FILE = "assets/images/enemy_ship.png";
export const BULLET_KEY = "bullet";
export const BULLET_FILE = "assets/images/bullet.png";
export const PARTICLE_KEY = "particle";
export const PARTICLE_FILE = "assets/images/particle.png";
export const EXPLOSION_KEY = "explosion";
export const EXPLOSION_FILE = "assets/spritesheets/explosion.png";
export const EXPLOSION_FRAME_SIZE = 64;

export const SHOOT_SOUND = "shoot";
export const SHOOT_SOUND_FILE = "assets/audio/shoot.wav";
export const EXPLOSION_SOUND = "explosion";
export const EXPLOSION_SOUND_FILE = "assets/audio/explosion.wav";
export const HURT_SOUND = "hurt";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
export const LOSE_SOUND = "lose";
export const LOSE_SOUND_FILE = "assets/audio/lose.wav";

// made in code, not loaded (see StartScene)
export const EXPLODE_ANIM = "explode";
export const STARS_FAR_KEY = "starsFar";
export const STARS_NEAR_KEY = "starsNear";
