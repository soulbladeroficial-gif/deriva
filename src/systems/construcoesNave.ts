import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import {
  CONSTRUCOES,
  CAPACIDADE_BUFFER_PADRAO,
  type ConstrucaoDef,
  type NivelCusto,
} from '../content/construcoesNave'
import { SALAS, type SalaDef } from '../content/salasNave'
import { updateConversor } from './conversor'

export const RAIO_INTERACAO = 55

export function pertoDe(state: GameState, pos: { x: number; y: number }, raio = RAIO_INTERACAO) {
  return Math.hypot(state.posicao.x - pos.x, state.posicao.y - pos.y) < raio
}

export function construcaoPorId(id: string) {
  return CONSTRUCOES.find((d) => d.id === id)
}

export function nivelAtual(state: GameState, id: string) {
  return state.construcoes[id]?.nivel ?? 0
}

export function estaColocada(state: GameState, id: string) {
  return Boolean(state.construcoes[id]?.colocada)
}

export function bancadaConstruida(state: GameState) {
  return CONSTRUCOES.some((def) => {
    const inst = state.construcoes[def.id]
    return def.bancada && inst && inst.nivel >= 1 && inst.colocada
  })
}

export function temRecursos(state: GameState, custo: NivelCusto) {
  return Object.entries(custo).every(([item, qtd]) => (state.inventario[item] ?? 0) >= qtd)
}

/** construções já criadas (nível >= 1) mas ainda não instaladas numa sala */
export function pendentes(state: GameState): ConstrucaoDef[] {
  return CONSTRUCOES.filter((def) => {
    const inst = state.construcoes[def.id]
    return inst && inst.nivel >= 1 && !inst.colocada
  })
}

/** cria uma construção nova (nível 1), gasta o material na hora — fica pendente de posicionar */
export function criarConstrucao(state: GameState, id: string) {
  const def = construcaoPorId(id)
  if (!def) return
  const atual = state.construcoes[id]
  if (atual && atual.nivel >= 1) return
  if (!temRecursos(state, def.niveis[0])) return
  for (const [item, qtd] of Object.entries(def.niveis[0])) {
    state.inventario[item] -= qtd
  }
  state.construcoes[id] = { nivel: 1, colocada: false, bufferEntrada: 0 }
}

export function capacidadeBuffer(def: ConstrucaoDef) {
  return def.capacidadeBuffer ?? CAPACIDADE_BUFFER_PADRAO
}

/** quanto dá pra depositar agora (limitado pelo que sobra de espaço e pelo que tem no inventário) */
export function quantidadeParaDepositar(state: GameState, def: ConstrucaoDef) {
  if (!def.conversor?.consomeItem) return 0
  const inst = state.construcoes[def.id]
  if (!inst) return 0
  const espacoLivre = capacidadeBuffer(def) - inst.bufferEntrada
  const disponivel = state.inventario[def.conversor.consomeItem.item] ?? 0
  return Math.max(0, Math.min(espacoLivre, disponivel))
}

export function podeDepositar(state: GameState, def: ConstrucaoDef) {
  return quantidadeParaDepositar(state, def) > 0
}

export function depositar(state: GameState, defId: string) {
  const def = construcaoPorId(defId)
  const inst = state.construcoes[defId]
  if (!def?.conversor?.consomeItem || !inst) return
  const qtd = quantidadeParaDepositar(state, def)
  if (qtd <= 0) return
  state.inventario[def.conversor.consomeItem.item] -= qtd
  inst.bufferEntrada += qtd
}

export function construcaoNoSlot(state: GameState, salaId: string, slotIndex: number) {
  return CONSTRUCOES.find((def) => {
    const inst = state.construcoes[def.id]
    return inst?.colocada && inst.salaId === salaId && inst.slotIndex === slotIndex
  })
}

export function slotVazioProximo(state: GameState): { sala: SalaDef; slotIndex: number } | null {
  for (const sala of SALAS) {
    for (let i = 0; i < sala.slots.length; i++) {
      if (construcaoNoSlot(state, sala.id, i)) continue
      if (pertoDe(state, sala.slots[i])) return { sala, slotIndex: i }
    }
  }
  return null
}

export function construcaoColocadaProxima(state: GameState): ConstrucaoDef | null {
  for (const def of CONSTRUCOES) {
    const inst = state.construcoes[def.id]
    if (!inst?.colocada || inst.salaId === undefined || inst.slotIndex === undefined) continue
    const sala = SALAS.find((s) => s.id === inst.salaId)
    const slot = sala?.slots[inst.slotIndex]
    if (slot && pertoDe(state, slot)) return def
  }
  return null
}

export function colocarPendente(state: GameState, defId: string, salaId: string, slotIndex: number) {
  const inst = state.construcoes[defId]
  if (!inst || inst.colocada) return
  if (construcaoNoSlot(state, salaId, slotIndex)) return
  inst.colocada = true
  inst.salaId = salaId
  inst.slotIndex = slotIndex
}

export function removerColocada(state: GameState, defId: string) {
  const inst = state.construcoes[defId]
  if (!inst?.colocada) return
  inst.colocada = false
  inst.salaId = undefined
  inst.slotIndex = undefined
}

/** o que dá pra upar na construção colocada mais próxima agora, se houver */
export function acaoUparDisponivel(state: GameState): ConstrucaoDef | null {
  const def = construcaoColocadaProxima(state)
  if (!def) return null
  const inst = state.construcoes[def.id]
  if (!inst || inst.nivel >= def.niveis.length) return null
  const podeUpar = def.bancada || bancadaConstruida(state)
  if (!podeUpar) return null
  if (!temRecursos(state, def.niveis[inst.nivel])) return null
  return def
}

export function updateConstrucoesNave(state: GameState, input: InputState, dt: number) {
  for (const def of CONSTRUCOES) {
    const inst = state.construcoes[def.id]
    if (inst?.colocada && inst.nivel >= 1 && def.conversor) {
      updateConversor(state, dt, def.conversor, inst.nivel, inst)
    }
  }

  const otimizador = CONSTRUCOES.find((def) => def.conversor?.reduzConsumoPercent)
  if (otimizador) {
    const inst = state.construcoes[otimizador.id]
    if (inst?.colocada && inst.nivel >= 1) {
      const reducao = (otimizador.conversor?.reduzConsumoPercent ?? 0) * inst.nivel
      state.nave.energiaConsumida *= Math.max(0, 1 - reducao)
    }
  }

  if (!input.interactRequested) return
  input.interactRequested = false

  // 1) upar a construção colocada mais próxima, se der
  const upar = acaoUparDisponivel(state)
  if (upar) {
    const inst = state.construcoes[upar.id]
    const custo = upar.niveis[inst.nivel]
    for (const [item, qtd] of Object.entries(custo)) {
      state.inventario[item] -= qtd
    }
    inst.nivel += 1
    return
  }

  // 2) senão, tenta colocar uma construção pendente no slot vazio mais próximo
  const slot = slotVazioProximo(state)
  if (slot) {
    const pend = pendentes(state)[0]
    if (pend) {
      colocarPendente(state, pend.id, slot.sala.id, slot.slotIndex)
    }
  }
}
