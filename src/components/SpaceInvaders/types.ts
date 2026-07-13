export type GameState = "menu" | "playing" | "paused" | "gameover" | "victory";

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Alien {
  x: number;
  y: number;
  type: number;
  alive: boolean;
}

export interface Bullet {
  x: number;
  y: number;
}

export interface Bomb {
  x: number;
  y: number;
}

export interface UFOType {
  x: number;
  y: number;
  active: boolean;
  dir: number;
}
