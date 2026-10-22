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

function circuloColideComRetangulo(
  cx: number,
  cy: number,
  raio: number,
  rect: { x0: number; y0: number; x1: number; y1: number },
) {
  const px = clamp(cx, rect.x0, rect.x1)
  const py = clamp(cy, rect.y0, rect.y1)
  const dx = cx - px
  const dy = cy - py
  return dx * dx + dy * dy < raio * raio
}

export function updateMovimento(
  state: GameState,
  input: InputState,
  dt: number,
  bounds: Bounds,
  paredes: { x0: number; y0: number; x1: number; y1: number }[] = [],
  raio = 12,
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

  const nx = clamp(state.posicao.x + dx * VELOCIDADE * dt, bounds.x0, bounds.x1)
  const ny = clamp(state.posicao.y + dy * VELOCIDADE * dt, bounds.y0, bounds.y1)

  const colide = (x: number, y: number) =>
    paredes.some((p) => circuloColideComRetangulo(x, y, raio, p))

  if (!colide(nx, ny)) {
    state.posicao.x = nx
    state.posicao.y = ny
    return
  }

  if (!colide(nx, state.posicao.y)) {
    state.posicao.x = nx
    return
  }

  if (!colide(state.posicao.x, ny)) {
    state.posicao.y = ny
  }
}
