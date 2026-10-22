import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import { CONSTRUCOES, type ConstrucaoDef, type NivelCusto } from '../content/construcoesNave'
import { updateConversor } from './conversor'

export const RAIO_INTERACAO = 55

export function pertoDe(state: GameState, pos: { x: number; y: number }, raio = RAIO_INTERACAO) {
  return Math.hypot(state.posicao.x - pos.x, state.posicao.y - pos.y) < raio
}

export function nivelAtual(state: GameState, id: string) {
  return state.construcoes[id]?.nivel ?? 0
}

export function bancadaConstruida(state: GameState) {
  return CONSTRUCOES.some((def) => def.bancada && nivelAtual(state, def.id) >= 1)
}

export function temRecursos(state: GameState, custo: NivelCusto) {
  return Object.entries(custo).every(([item, qtd]) => (state.inventario[item] ?? 0) >= qtd)
}

/** retorna a construção mais próxima e o que daria pra fazer nela agora (construir, upar ou nada) */
export function acaoDisponivel(
  state: GameState,
): { def: ConstrucaoDef; tipo: 'construir' | 'upar' } | null {
  for (const def of CONSTRUCOES) {
    if (!pertoDe(state, def.posicao)) continue
    const nivel = nivelAtual(state, def.id)

    if (nivel === 0) {
      if (temRecursos(state, def.niveis[0])) return { def, tipo: 'construir' }
      continue
    }

    if (nivel < def.niveis.length) {
      const podeUpar = def.bancada || bancadaConstruida(state)
      if (podeUpar && temRecursos(state, def.niveis[nivel])) return { def, tipo: 'upar' }
    }
  }
  return null
}

export function updateConstrucoesNave(state: GameState, input: InputState, dt: number) {
  for (const def of CONSTRUCOES) {
    const nivel = nivelAtual(state, def.id)
    if (nivel >= 1 && def.conversor) {
      updateConversor(state, dt, def.conversor, nivel)
    }
  }

  if (!input.interactRequested) return
  input.interactRequested = false

  const acao = acaoDisponivel(state)
  if (!acao) return

  const nivel = nivelAtual(state, acao.def.id)
  const custo = acao.def.niveis[nivel]
  for (const [item, qtd] of Object.entries(custo)) {
    state.inventario[item] -= qtd
  }
  state.construcoes[acao.def.id] = { nivel: nivel + 1 }
}
