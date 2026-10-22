import { useEffect, type MutableRefObject } from 'react'
import type { GameState } from './types'

const TICK_RATE = 1 / 20

export function useGameLoop(
  stateRef: MutableRefObject<GameState>,
  update: (state: GameState, dt: number) => void,
  render: (state: GameState) => void,
) {
  useEffect(() => {
    let rafId: number
    let last = performance.now()
    let accumulator = 0

    function frame(now: number) {
      const frameDt = (now - last) / 1000
      last = now
      accumulator += frameDt

      while (accumulator >= TICK_RATE) {
        update(stateRef.current, TICK_RATE)
        stateRef.current.tick += 1
        accumulator -= TICK_RATE
      }

      render(stateRef.current)
      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafId)
  }, [stateRef, update, render])
}
