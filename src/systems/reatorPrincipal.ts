import type { GameState } from '../engine/types'

const ENERGIA_BASE = 10

export function updateReatorPrincipal(state: GameState) {
  state.nave.energiaGerada = ENERGIA_BASE
}
