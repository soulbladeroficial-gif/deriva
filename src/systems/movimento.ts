import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'

const VELOCIDADE = 140

export interface Bounds {
  x0: number
  y0: number
  x1: number
  y1: number
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function updateMovimento(
  state: GameState,
  input: InputState,
  dt: number,
  bounds: Bounds,
) {
  let dx = 0
  let dy = 0
  if (input.up) dy -= 1
  if (input.down) dy += 1
  if (input.left) dx -= 1
  if (input.right) dx += 1

  if (dx === 0 && dy === 0) return

  const len = Math.hypot(dx, dy)
  dx /= len
  dy /= len

  state.posicao.x = clamp(state.posicao.x + dx * VELOCIDADE * dt, bounds.x0, bounds.x1)
  state.posicao.y = clamp(state.posicao.y + dy * VELOCIDADE * dt, bounds.y0, bounds.y1)
}
