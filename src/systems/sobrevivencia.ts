import type { GameState } from '../engine/types'

const FOME_POR_SEGUNDO = 0.3
const SEDE_POR_SEGUNDO = 0.4

export function updateSobrevivencia(state: GameState, dt: number) {
  state.jogador.fome = Math.min(100, state.jogador.fome + FOME_POR_SEGUNDO * dt)
  state.jogador.sede = Math.min(100, state.jogador.sede + SEDE_POR_SEGUNDO * dt)
}
