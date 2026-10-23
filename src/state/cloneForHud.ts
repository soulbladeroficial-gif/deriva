import type { GameState } from '../engine/types'

export function cloneForHud(state: GameState): GameState {
  return {
    ...state,
    nave: { ...state.nave, paneLocal: state.nave.paneLocal ? { ...state.nave.paneLocal } : null },
    jogador: { ...state.jogador },
    inventario: { ...state.inventario },
    construcoes: state.construcoes.map((inst) => ({ ...inst })),
    posicao: { ...state.posicao },
  }
}
