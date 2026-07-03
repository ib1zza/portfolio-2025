import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import s from "./SpaceInvaders.module.scss";

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 280;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 8;
const ALIEN_COLS = 11;
const ALIEN_ROWS = 5;
const ALIEN_WIDTH = 16;
const ALIEN_HEIGHT = 12;
const BULLET_WIDTH = 2;
const BULLET_HEIGHT = 6;
const BOMB_WIDTH = 3;
const BOMB_HEIGHT = 5;
const PLAYER_SPEED = 3;
const BULLET_SPEED = 4;
const BOMB_SPEED = 2;
const LIVES = 3;
const SHIELD_COUNT = 4;
const SHIELD_WIDTH = 48;
const SHIELD_HEIGHT = 20;
const UFO_WIDTH = 16;
const UFO_HEIGHT = 7;
const UFO_SPEED = 2;
const BASE_DROP_CHANCE = 0.003;
const SHIELD_GAP = Math.floor(
  (CANVAS_WIDTH - SHIELD_COUNT * SHIELD_WIDTH) / (SHIELD_COUNT + 1),
);
const SHIELD_Y = CANVAS_HEIGHT - 60;

type GameState = "menu" | "playing" | "paused" | "gameover" | "victory";

interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Alien {
  x: number;
  y: number;
  type: number;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
}

interface Bomb {
  x: number;
  y: number;
}

interface UFOType {
  x: number;
  y: number;
  active: boolean;
  dir: number;
}

const ALIEN_TYPES = [0, 0, 1, 1, 2];

const ALIEN_POINTS = [30, 20, 10];

const UFO_SPRITE: string[] = [
  "....########....",
  "..############..",
  ".##.#.##.#.##.#.",
  ".####..##..####.",
  ".####..##..####.",
  ".##..####..##...",
  "....########....",
];

const createShieldPixels = (): boolean[][] => {
  const pixels: boolean[][] = [];
  for (let row = 0; row < SHIELD_HEIGHT; row++) {
    pixels[row] = [];
    for (let col = 0; col < SHIELD_WIDTH; col++) {
      const cx = SHIELD_WIDTH / 2;
      const cy = SHIELD_HEIGHT * 1.1;
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inArch = dist < SHIELD_WIDTH * 0.42 && row >= SHIELD_HEIGHT * 0.15;
      const inBase =
        row >= SHIELD_HEIGHT * 0.55 &&
        col >= SHIELD_WIDTH * 0.1 &&
        col < SHIELD_WIDTH * 0.9;
      const inTop =
        row < SHIELD_HEIGHT * 0.15 && col >= 4 && col < SHIELD_WIDTH - 4;
      pixels[row][col] = inArch || inBase || inTop;
    }
  }
  return pixels;
};

interface SpaceInvadersProps {
  windowId: string;
}

export const SpaceInvaders = memo(function SpaceInvaders({
  windowId,
}: SpaceInvadersProps) {
  void windowId;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>("menu");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [hudScore, setHudScore] = useState(0);
  const [hudLives, setHudLives] = useState(3);
  const [hudLevel, setHudLevel] = useState(1);

  const playerRef = useRef<Player>({
    x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 2,
    w: PLAYER_WIDTH,
    h: PLAYER_HEIGHT,
  });

  const aliensRef = useRef<Alien[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const bombsRef = useRef<Bomb[]>([]);
  const shieldsRef = useRef<boolean[][][]>([]);
  const ufoRef = useRef<UFOType>({ x: 0, y: 6, active: false, dir: 1 });
  const scoreRef = useRef(0);
  const livesRef = useRef(LIVES);
  const levelRef = useRef(1);
  const lastSyncScoreRef = useRef(-1);
  const lastSyncLivesRef = useRef(-1);
  const lastSyncLevelRef = useRef(-1);
  const alienDirRef = useRef(1);
  const alienMoveCounterRef = useRef(0);
  const alienMoveIntervalRef = useRef(20);
  const alienBottomReachedRef = useRef(false);
  const ufoTimerRef = useRef(0);
  const alienAnimFrameRef = useRef(0);

  const alienImagesRef = useRef<(HTMLImageElement | null)[][]>(
    Array.from({ length: 3 }, () => [null, null]),
  );

  const keysRef = useRef({
    left: false,
    right: false,
    fire: false,
  });

  useEffect(() => {
    const paths = [
      "/icons/space-invaders/alien0-a.svg",
      "/icons/space-invaders/alien0-b.svg",
      "/icons/space-invaders/alien1-a.svg",
      "/icons/space-invaders/alien1-b.svg",
      "/icons/space-invaders/alien2-a.svg",
      "/icons/space-invaders/alien2-b.svg",
    ];
    paths.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      const type = Math.floor(i / 2);
      const frame = i % 2;
      const arr = alienImagesRef.current[type];
      if (arr) arr[frame] = img;
      else alienImagesRef.current[type] = [img, null];
    });
  }, []);

  const syncDOMState = useCallback(() => {
    setGameState(gameStateRef.current);
    if (scoreRef.current !== lastSyncScoreRef.current) {
      lastSyncScoreRef.current = scoreRef.current;
      setHudScore(scoreRef.current);
    }
    if (livesRef.current !== lastSyncLivesRef.current) {
      lastSyncLivesRef.current = livesRef.current;
      setHudLives(livesRef.current);
    }
    if (levelRef.current !== lastSyncLevelRef.current) {
      lastSyncLevelRef.current = levelRef.current;
      setHudLevel(levelRef.current);
    }
  }, []);

  const drawSprite = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      sprite: string[],
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      ctx.fillStyle = "black";
      for (let row = 0; row < sprite.length; row++) {
        const line = sprite[row];
        for (let col = 0; col < line.length; col++) {
          if (line[col] === "#") {
            const px = x + Math.floor((col / line.length) * w);
            const py = y + Math.floor((row / sprite.length) * h);
            const pw = Math.ceil(((col + 1) / line.length) * w) - px;
            const ph = Math.ceil(((row + 1) / sprite.length) * h) - py;
            ctx.fillRect(px, py, Math.max(1, pw), Math.max(1, ph));
          }
        }
      }
    },
    [],
  );

  const initAliens = useCallback(() => {
    const aliens: Alien[] = [];
    const startX = Math.floor((CANVAS_WIDTH - ALIEN_COLS * (ALIEN_WIDTH + 4)) / 2);
    const startY = 20;

    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        aliens.push({
          x: startX + col * (ALIEN_WIDTH + 4),
          y: startY + row * (ALIEN_HEIGHT + 4),
          type: ALIEN_TYPES[row],
          alive: true,
        });
      }
    }

    aliensRef.current = aliens;
  }, []);

  const initShields = useCallback(() => {
    const shields: boolean[][][] = [];

    for (let i = 0; i < SHIELD_COUNT; i++) {
      shields.push(createShieldPixels());
    }

    shieldsRef.current = shields;
  }, []);

  const startGame = useCallback(() => {
    playerRef.current = {
      x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 2,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
    };
    scoreRef.current = 0;
    livesRef.current = LIVES;
    levelRef.current = 1;
    alienDirRef.current = 1;
    alienMoveCounterRef.current = 0;
    alienMoveIntervalRef.current = 20;
    alienBottomReachedRef.current = false;
    alienAnimFrameRef.current = 0;
    ufoRef.current = { x: 0, y: 6, active: false, dir: 1 };
    ufoTimerRef.current = 0;
    bulletsRef.current = [];
    bombsRef.current = [];

    initAliens();
    initShields();

    gameStateRef.current = "playing";
    syncDOMState();
  }, [initAliens, initShields, syncDOMState]);

  const resetLevel = useCallback(() => {
    playerRef.current = {
      x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 2,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
    };
    alienDirRef.current = 1;
    alienMoveCounterRef.current = 0;
    alienBottomReachedRef.current = false;
    alienAnimFrameRef.current = 0;
    ufoRef.current = { x: 0, y: 6, active: false, dir: 1 };
    ufoTimerRef.current = 0;
    bulletsRef.current = [];
    bombsRef.current = [];

    initAliens();

    gameStateRef.current = "playing";
    syncDOMState();
  }, [initAliens, syncDOMState]);

  const update = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    const player = playerRef.current;
    const aliens = aliensRef.current;
    const bullets = bulletsRef.current;
    const bombs = bombsRef.current;
    const shields = shieldsRef.current;
    const ufo = ufoRef.current;

    if (keysRef.current.left) {
      player.x = Math.max(0, player.x - PLAYER_SPEED);
    }
    if (keysRef.current.right) {
      player.x = Math.min(CANVAS_WIDTH - player.w, player.x + PLAYER_SPEED);
    }

    if (keysRef.current.fire && bullets.length < 1) {
      bullets.push({
        x: player.x + player.w / 2 - BULLET_WIDTH / 2,
        y: player.y - BULLET_HEIGHT,
      });
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= BULLET_SPEED;
      if (bullets[i].y + BULLET_HEIGHT < 0) {
        bullets.splice(i, 1);
      }
    }

    alienMoveCounterRef.current++;

    const moveSpeed = Math.max(4, alienMoveIntervalRef.current - levelRef.current * 2);

    if (alienMoveCounterRef.current >= moveSpeed) {
      alienMoveCounterRef.current = 0;
      alienAnimFrameRef.current = 1 - alienAnimFrameRef.current;

      let hitEdge = false;
      for (const alien of aliens) {
        if (!alien.alive) continue;
        if (
          (alienDirRef.current === 1 && alien.x + ALIEN_WIDTH >= CANVAS_WIDTH - 2) ||
          (alienDirRef.current === -1 && alien.x <= 2)
        ) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        alienDirRef.current *= -1;
        for (const alien of aliens) {
          if (!alien.alive) continue;
          alien.y += ALIEN_HEIGHT;
          if (alien.y + ALIEN_HEIGHT >= player.y) {
            alienBottomReachedRef.current = true;
          }
        }
      } else {
        for (const alien of aliens) {
          if (!alien.alive) continue;
          alien.x += alienDirRef.current * 4;
        }
      }
    }

    if (alienBottomReachedRef.current) {
      gameStateRef.current = "gameover";
      syncDOMState();
      return;
    }

    const aliveAliens = aliens.filter((a) => a.alive);
    if (aliveAliens.length === 0) {
      levelRef.current++;
      if (levelRef.current > 9) {
        gameStateRef.current = "victory";
        syncDOMState();
        return;
      }
      resetLevel();
      return;
    }

    const bottomAliens: Alien[] = [];
    const colsInGrid = ALIEN_COLS;
    const firstX = aliens.length > 0 ? aliens[0].x : 0;
    for (let ci = 0; ci < colsInGrid; ci++) {
      let bottomAlien: Alien | null = null;
      for (const alien of aliens) {
        if (!alien.alive) continue;
        const col = Math.round((alien.x - firstX) / (ALIEN_WIDTH + 4));
        if (col === ci && (!bottomAlien || alien.y > bottomAlien.y)) {
          bottomAlien = alien;
        }
      }
      if (bottomAlien) {
        bottomAliens.push(bottomAlien);
      }
    }

    for (const alien of bottomAliens) {
      if (Math.random() < BASE_DROP_CHANCE + levelRef.current * 0.001) {
        bombs.push({
          x: alien.x + ALIEN_WIDTH / 2 - BOMB_WIDTH / 2,
          y: alien.y + ALIEN_HEIGHT,
        });
      }
    }

    for (let i = bombs.length - 1; i >= 0; i--) {
      bombs[i].y += BOMB_SPEED;
      if (bombs[i].y > CANVAS_HEIGHT) {
        bombs.splice(i, 1);
      }
    }

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const bullet = bullets[bi];
      let hit = false;

      for (let ai = aliens.length - 1; ai >= 0; ai--) {
        const alien = aliens[ai];
        if (!alien.alive) continue;
        if (
          bullet.x < alien.x + ALIEN_WIDTH &&
          bullet.x + BULLET_WIDTH > alien.x &&
          bullet.y < alien.y + ALIEN_HEIGHT &&
          bullet.y + BULLET_HEIGHT > alien.y
        ) {
          alien.alive = false;
          scoreRef.current += ALIEN_POINTS[alien.type];
          hit = true;
          break;
        }
      }

      if (ufo.active) {
        if (
          bullet.x < ufo.x + UFO_WIDTH &&
          bullet.x + BULLET_WIDTH > ufo.x &&
          bullet.y < ufo.y + UFO_HEIGHT &&
          bullet.y + BULLET_HEIGHT > ufo.y
        ) {
          ufo.active = false;
          scoreRef.current += 100 + Math.floor(Math.random() * 201);
          hit = true;
        }
      }

      if (!hit) {
        for (let si = 0; si < shields.length; si++) {
          const shieldPixels = shields[si];
          if (!shieldPixels) continue;
          const shieldX = (si + 1) * SHIELD_GAP + si * SHIELD_WIDTH;

          if (
            bullet.x + BULLET_WIDTH > shieldX &&
            bullet.x < shieldX + SHIELD_WIDTH &&
            bullet.y + BULLET_HEIGHT > SHIELD_Y &&
            bullet.y < SHIELD_Y + SHIELD_HEIGHT
          ) {
            const localX = bullet.x + BULLET_WIDTH / 2 - shieldX;
            const localY = bullet.y + BULLET_HEIGHT / 2 - SHIELD_Y;
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                const px = Math.floor(localX) + dx;
                const py = Math.floor(localY) + dy;
                if (
                  py >= 0 &&
                  py < SHIELD_HEIGHT &&
                  px >= 0 &&
                  px < SHIELD_WIDTH &&
                  shieldPixels[py] &&
                  shieldPixels[py][px]
                ) {
                  shieldPixels[py][px] = false;
                }
              }
            }
            hit = true;
          }
        }
      }

      if (hit) {
        bullets.splice(bi, 1);
      }
    }

    for (let bi = bombs.length - 1; bi >= 0; bi--) {
      const bomb = bombs[bi];
      let hit = false;

      if (
        bomb.x < player.x + player.w &&
        bomb.x + BOMB_WIDTH > player.x &&
        bomb.y < player.y + player.h &&
        bomb.y + BOMB_HEIGHT > player.y
      ) {
        livesRef.current--;
        hit = true;
        bombs.splice(bi, 1);
        if (livesRef.current <= 0) {
          gameStateRef.current = "gameover";
          syncDOMState();
          return;
        } else {
          playerRef.current.x = (CANVAS_WIDTH - PLAYER_WIDTH) / 2;
          bulletsRef.current = [];
          syncDOMState();
        }
        continue;
      }

      for (let si = 0; si < shields.length; si++) {
        const shieldPixels = shields[si];
        if (!shieldPixels) continue;
        const shieldX = (si + 1) * SHIELD_GAP + si * SHIELD_WIDTH;

        if (
          bomb.x + BOMB_WIDTH > shieldX &&
          bomb.x < shieldX + SHIELD_WIDTH &&
          bomb.y + BOMB_HEIGHT > SHIELD_Y &&
          bomb.y < SHIELD_Y + SHIELD_HEIGHT
        ) {
          const localX = bomb.x + BOMB_WIDTH / 2 - shieldX;
          const localY = bomb.y + BOMB_HEIGHT / 2 - SHIELD_Y;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const px = Math.floor(localX) + dx;
              const py = Math.floor(localY) + dy;
              if (
                py >= 0 &&
                py < SHIELD_HEIGHT &&
                px >= 0 &&
                px < SHIELD_WIDTH &&
                shieldPixels[py] &&
                shieldPixels[py][px]
              ) {
                shieldPixels[py][px] = false;
              }
            }
          }
          hit = true;
          break;
        }
      }

      if (hit) {
        bombs.splice(bi, 1);
      }
    }

    ufoTimerRef.current++;
    if (!ufo.active && ufoTimerRef.current > 300 + Math.random() * 200) {
      ufo.active = true;
      ufo.dir = Math.random() < 0.5 ? 1 : -1;
      ufo.x = ufo.dir === 1 ? -UFO_WIDTH : CANVAS_WIDTH;
      ufoTimerRef.current = 0;
    }

    if (ufo.active) {
      ufo.x += ufo.dir * UFO_SPEED;
      if (
        (ufo.dir === 1 && ufo.x > CANVAS_WIDTH) ||
        (ufo.dir === -1 && ufo.x + UFO_WIDTH < 0)
      ) {
        ufo.active = false;
      }
    }

    syncDOMState();
  }, [resetLevel, syncDOMState]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "black";

      if (gameStateRef.current !== "playing") return;

      const player = playerRef.current;

      ctx.fillStyle = "black";
      ctx.fillRect(player.x, player.y, player.w, player.h);

      for (const alien of aliensRef.current) {
        if (!alien.alive) continue;
        const imgs = alienImagesRef.current[alien.type];
        const img = imgs[alienAnimFrameRef.current];
        if (img?.complete) {
          ctx.drawImage(img, alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);
        }
      }

      ctx.fillStyle = "black";
      for (const bullet of bulletsRef.current) {
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
      }

      for (const bomb of bombsRef.current) {
        ctx.fillRect(bomb.x, bomb.y, BOMB_WIDTH, BOMB_HEIGHT);
      }

      ctx.fillStyle = "black";
      for (let si = 0; si < shieldsRef.current.length; si++) {
        const shieldPixels = shieldsRef.current[si];
        if (!shieldPixels) continue;
        const shieldX = (si + 1) * SHIELD_GAP + si * SHIELD_WIDTH;
        for (let row = 0; row < SHIELD_HEIGHT; row++) {
          for (let col = 0; col < SHIELD_WIDTH; col++) {
            if (shieldPixels[row]?.[col]) {
              ctx.fillRect(shieldX + col, SHIELD_Y + row, 1, 1);
            }
          }
        }
      }

      const ufo = ufoRef.current;
      if (ufo.active) {
        drawSprite(ctx, UFO_SPRITE, ufo.x, ufo.y, UFO_WIDTH, UFO_HEIGHT);
      }
    },
    [drawSprite],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animId: number;

    const loop = () => {
      update();
      draw(ctx);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [update, draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        if (
          gameStateRef.current === "menu" ||
          gameStateRef.current === "gameover" ||
          gameStateRef.current === "victory"
        ) {
          startGame();
          return;
        }
      }

      if (e.code === "KeyP") {
        e.preventDefault();
        if (gameStateRef.current === "playing") {
          gameStateRef.current = "paused";
          syncDOMState();
        } else if (gameStateRef.current === "paused") {
          gameStateRef.current = "playing";
          syncDOMState();
        }
        return;
      }

      if (gameStateRef.current !== "playing") return;

      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        keysRef.current.left = true;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        keysRef.current.right = true;
      }
      if (e.code === "Space") {
        e.preventDefault();
        keysRef.current.fire = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        keysRef.current.left = false;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        keysRef.current.right = false;
      }
      if (e.code === "Space") {
        keysRef.current.fire = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startGame, syncDOMState]);

  const handleTouchStartLeft = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    keysRef.current.left = true;
  }, []);

  const handleTouchEndLeft = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    keysRef.current.left = false;
  }, []);

  const handleTouchStartRight = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    keysRef.current.right = true;
  }, []);

  const handleTouchEndRight = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    keysRef.current.right = false;
  }, []);

  const handleTouchStartFire = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (gameStateRef.current === "playing") {
        keysRef.current.fire = true;
      } else if (
        gameStateRef.current === "menu" ||
        gameStateRef.current === "gameover" ||
        gameStateRef.current === "victory"
      ) {
        startGame();
      }
    },
    [startGame],
  );

  const handleTouchEndFire = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    keysRef.current.fire = false;
  }, []);

  return (
    <div className={s.container}>
      <div className={s.gameWrap}>
        <div className={s.canvasWrap}>
          <canvas
            ref={canvasRef}
            className={s.canvas}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />

          {gameState === "menu" && (
            <div className={s.overlay}>
              <span className={s.title}>SPACE INVADERS</span>
              <span className={s.subtitle}>PRESS ENTER TO START</span>
              <span className={s.hint}>ARROWS / A,D &bull; SPACE</span>
            </div>
          )}

          {gameState === "paused" && (
            <div className={s.overlay}>
              <span className={s.pausedText}>PAUSED</span>
            </div>
          )}

          {(gameState === "gameover" || gameState === "victory") && (
            <div className={s.overlay}>
              <span className={s.resultText}>
                {gameState === "gameover" ? "GAME OVER" : "YOU WIN!"}
              </span>
              <span className={s.scoreText}>SCORE: {hudScore}</span>
              <span className={s.hint}>PRESS ENTER TO RESTART</span>
            </div>
          )}
        </div>

        <div className={s.hud}>
          <span>SCORE: {hudScore}</span>
          <span>LVL: {hudLevel}</span>
          <span>LIVES: {hudLives}</span>
        </div>

        <div className={s.controls}>
          <button
            type="button"
            className={s.btn}
            onTouchStart={handleTouchStartLeft}
            onTouchEnd={handleTouchEndLeft}
            onTouchCancel={handleTouchEndLeft}
          >
            &larr;
          </button>
          <button
            type="button"
            className={s.btn}
            onTouchStart={handleTouchStartRight}
            onTouchEnd={handleTouchEndRight}
            onTouchCancel={handleTouchEndRight}
          >
            &rarr;
          </button>
          <button
            type="button"
            className={clsx(s.btn, s.btnFire)}
            onTouchStart={handleTouchStartFire}
            onTouchEnd={handleTouchEndFire}
            onTouchCancel={handleTouchEndFire}
          >
            FIRE
          </button>
        </div>
      </div>
    </div>
  );
});
