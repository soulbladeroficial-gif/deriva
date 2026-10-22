import type { GameState } from '../engine/types'

// valores altos de propósito nesse protótipo, pra dar pra testar sem esperar muito —
// balanceamento de verdade fica pra quando o jogo tiver conteúdo suficiente pra calibrar.
const CHANCE_PANE_POR_SEGUNDO = 0.02
const DANO_PANE = 15

export function updatePanes(state: GameState, dt: number) {
  if (Math.random() < CHANCE_PANE_POR_SEGUNDO * dt) {
    state.nave.casco = Math.max(0, state.nave.casco - DANO_PANE)
  }
}

export const CUSTO_REPARO: Record<string, number> = { Peças: 2 }
const REPARO_QUANTIDADE = 20

export function podeRepararCasco(state: GameState) {
  if (state.nave.casco >= state.nave.cascoMax) return false
  return Object.entries(CUSTO_REPARO).every(([item, qtd]) => (state.inventario[item] ?? 0) >= qtd)
}

export function repararCasco(state: GameState) {
  if (!podeRepararCasco(state)) return
  for (const [item, qtd] of Object.entries(CUSTO_REPARO)) {
    state.inventario[item] -= qtd
  }
  state.nave.casco = Math.min(state.nave.cascoMax, state.nave.casco + REPARO_QUANTIDADE)
}
