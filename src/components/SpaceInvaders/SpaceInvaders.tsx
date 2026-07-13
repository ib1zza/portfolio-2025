import clsx from "clsx";
import { memo } from "react";
import s from "./SpaceInvaders.module.scss";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { useSpaceInvadersGame } from "./useSpaceInvadersGame";

interface SpaceInvadersProps {
  windowId: string;
}

export const SpaceInvaders = memo(function SpaceInvaders({
  windowId,
}: SpaceInvadersProps) {
  void windowId;

  const {
    canvasRef,
    gameState,
    hudScore,
    hudLives,
    hudLevel,
    handleTouchStartLeft,
    handleTouchEndLeft,
    handleTouchStartRight,
    handleTouchEndRight,
    handleTouchStartFire,
    handleTouchEndFire,
  } = useSpaceInvadersGame();

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
