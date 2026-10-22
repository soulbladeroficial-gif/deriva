import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'

export const ELETROLISADOR_SLOT = { x: 220, y: 180 }
export const RAIO_INTERACAO = 55

export const CUSTO_ELETROLISADOR: Record<string, number> = {
  'Ferro-Níquel': 3,
  'Cobre Nativo': 2,
}

export function distanciaAte(state: GameState, ponto: { x: number; y: number }) {
  return Math.hypot(state.posicao.x - ponto.x, state.posicao.y - ponto.y)
}

export function pertoDoEletrolisador(state: GameState) {
  return distanciaAte(state, ELETROLISADOR_SLOT) < RAIO_INTERACAO
}

export function podeConstruirEletrolisador(state: GameState) {
  return Object.entries(CUSTO_ELETROLISADOR).every(
    ([item, qtd]) => (state.inventario[item] ?? 0) >= qtd,
  )
}

export function updateInteracao(state: GameState, input: InputState) {
  if (!input.interactRequested) return
  input.interactRequested = false

  if (state.construcoes.eletrolisador.construido) return
  if (!pertoDoEletrolisador(state)) return
  if (!podeConstruirEletrolisador(state)) return

  for (const [item, qtd] of Object.entries(CUSTO_ELETROLISADOR)) {
    state.inventario[item] -= qtd
  }
  state.construcoes.eletrolisador.construido = true
}
