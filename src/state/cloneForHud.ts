import type { GameState } from '../engine/types'

export function cloneForHud(state: GameState): GameState {
  return {
    ...state,
    nave: { ...state.nave },
    jogador: { ...state.jogador },
    inventario: { ...state.inventario },
    construcoes: { eletrolisador: { ...state.construcoes.eletrolisador } },
    posicao: { ...state.posicao },
  }
}
