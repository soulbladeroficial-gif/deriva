import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import { CONSTRUCOES, type ConstrucaoDef, type NivelCusto } from '../content/construcoesNave'
import { updateConversor } from './conversor'

export const RAIO_INTERACAO = 55

export function pertoDe(state: GameState, pos: { x: number; y: number }, raio = RAIO_INTERACAO) {
  return Math.hypot(state.posicao.x - pos.x, state.posicao.y - pos.y) < raio
}

export function podeConstruir(state: GameState, custo: NivelCusto) {
  return Object.entries(custo).every(([item, qtd]) => (state.inventario[item] ?? 0) >= qtd)
}

export function construcaoMaisProxima(state: GameState): ConstrucaoDef | null {
  for (const def of CONSTRUCOES) {
    if (state.construcoes[def.id]?.construido) continue
    if (pertoDe(state, def.posicao)) return def
  }
  return null
}

export function updateConstrucoesNave(state: GameState, input: InputState, dt: number) {
  for (const def of CONSTRUCOES) {
    if (state.construcoes[def.id]?.construido && def.conversor) {
      updateConversor(state, dt, def.conversor)
    }
  }

  if (!input.interactRequested) return
  const alvo = construcaoMaisProxima(state)
  if (!alvo) return
  if (!podeConstruir(state, alvo.custoConstruir)) return

  for (const [item, qtd] of Object.entries(alvo.custoConstruir)) {
    state.inventario[item] -= qtd
  }
  state.construcoes[alvo.id] = { construido: true }
  input.interactRequested = false
}
