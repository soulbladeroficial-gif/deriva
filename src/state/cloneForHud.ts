import type { GameState } from '../engine/types'

export function cloneForHud(state: GameState): GameState {
  const construcoes: GameState['construcoes'] = {}
  for (const [id, valor] of Object.entries(state.construcoes)) {
    construcoes[id] = { ...valor }
  }

  return {
    ...state,
    nave: { ...state.nave },
    jogador: { ...state.jogador },
    inventario: { ...state.inventario },
    construcoes,
    posicao: { ...state.posicao },
  }
}
