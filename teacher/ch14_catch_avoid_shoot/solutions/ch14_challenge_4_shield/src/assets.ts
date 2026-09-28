// assets.ts - the key and file of every picture and sound, and the names of things made in code
//
// PreloadScene loads them all; the other scenes and the game objects use the keys.

export const SPACE_KEY = "space";
export const SPACE_FILE = "assets/images/space.png";
export const SHIP_KEY = "playerShip";
export const SHIP_FILE = "assets/images/player_ship.png";
export const ENEMY_KEY = "enemyShip";
export const ENEMY_FILE = "assets/images/enemy_ship.png";
export const BULLET_KEY = "bullet";
export const BULLET_FILE = "assets/images/bullet.png";
export const ENEMY_BULLET_KEY = "enemyBullet";
export const ENEMY_BULLET_FILE = "assets/images/enemy_bullet.png";
export const PARTICLE_KEY = "particle";
export const PARTICLE_FILE = "assets/images/particle.png";
export const HEART_KEY = "heart";
export const HEART_FILE = "assets/images/heart.png";
export const GEM_KEY = "gem";
export const GEM_FILE = "assets/images/gem.png";
export const STAR_KEY = "star";
export const STAR_FILE = "assets/images/star.png";
export const EXPLOSION_KEY = "explosion";
export const EXPLOSION_FILE = "assets/spritesheets/explosion.png";
export const EXPLOSION_FRAME_SIZE = 64;

export const SHOOT_SOUND = "shoot";
export const SHOOT_SOUND_FILE = "assets/audio/shoot.wav";
export const EXPLOSION_SOUND = "explosion";
export const EXPLOSION_SOUND_FILE = "assets/audio/explosion.wav";
export const HURT_SOUND = "hurt";
export const HURT_SOUND_FILE = "assets/audio/hurt.wav";
export const HIT_SOUND = "hit";
export const HIT_SOUND_FILE = "assets/audio/hit.wav";
export const POWERUP_SOUND = "powerup";
export const POWERUP_SOUND_FILE = "assets/audio/powerup.wav";
export const LOSE_SOUND = "lose";
export const LOSE_SOUND_FILE = "assets/audio/lose.wav";
export const WIN_SOUND = "win";
export const WIN_SOUND_FILE = "assets/audio/win.wav";
export const CLICK_SOUND = "click";
export const CLICK_SOUND_FILE = "assets/audio/click.wav";
export const MENU_MUSIC = "musicMenu";
export const MENU_MUSIC_FILE = "assets/audio/music_menu.wav";
export const GAME_MUSIC = "musicGame";
export const GAME_MUSIC_FILE = "assets/audio/music_action.wav";

// made in code, not loaded (see PreloadScene)
export const EXPLODE_ANIM = "explode";
export const STARS_FAR_KEY = "starsFar";
export const STARS_NEAR_KEY = "starsNear";
export const SHIELD_KEY = "shieldIcon";            // CHALLENGE 4: the power-up's picture
export const SHIELD_BUBBLE_KEY = "shieldBubble";   // CHALLENGE 4: the bubble round the ship
