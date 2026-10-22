import type { GameState } from '../engine/types'

export interface ItemAction {
  label: string
  apply: (state: GameState) => void
}

export const ITEM_ACTIONS: Record<string, ItemAction[]> = {
  'Água Pura': [
    {
      label: 'Beber',
      apply: (state) => {
        state.jogador.sede = Math.min(100, state.jogador.sede + 20)
      },
    },
  ],
  'Biomassa Comum': [
    {
      label: 'Comer',
      apply: (state) => {
        state.jogador.fome = Math.min(100, state.jogador.fome + 20)
      },
    },
  ],
}

export function usarItem(state: GameState, item: string, action: ItemAction) {
  const quantidade = state.inventario[item] ?? 0
  if (quantidade < 1) return
  state.inventario[item] = quantidade - 1
  action.apply(state)
}
