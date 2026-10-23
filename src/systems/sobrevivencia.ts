import type { GameState } from '../engine/types'

const FOME_POR_SEGUNDO = 0.12
const SEDE_POR_SEGUNDO = 0.15

/** fome/sede representam o quão alimentado/hidratado o jogador está — cheio é bom, baixa com o tempo */
export function updateSobrevivencia(state: GameState, dt: number) {
  state.jogador.fome = Math.max(0, state.jogador.fome - FOME_POR_SEGUNDO * dt)
  state.jogador.sede = Math.max(0, state.jogador.sede - SEDE_POR_SEGUNDO * dt)
}
