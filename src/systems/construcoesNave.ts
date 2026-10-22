import type { GameState } from '../engine/types'
import {
  CONSTRUCOES,
  CAPACIDADE_BUFFER_PADRAO,
  type ConstrucaoDef,
  type NivelCusto,
} from '../content/construcoesNave'
import { salaEm, BANCADA_FABRICACAO } from '../content/salasNave'
import { updateConversor } from './conversor'

export const RAIO_INTERACAO = 55
/** distância mínima entre centros de duas construções colocadas livremente */
export const RAIO_COLISAO_CONSTRUCAO = 70

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

/** construções já criadas (nível >= 1) mas ainda não instaladas num ponto da nave */
export function pendentes(state: GameState): ConstrucaoDef[] {
  return CONSTRUCOES.filter((def) => {
    const inst = state.construcoes[def.id]
    return inst && inst.nivel >= 1 && !inst.colocada
  })
}

/** só dá pra criar construções perto da bancada de fabricação da nave */
export function pertoDaBancada(state: GameState) {
  return pertoDe(state, BANCADA_FABRICACAO)
}

export function podeCriar(state: GameState, def: ConstrucaoDef) {
  const atual = state.construcoes[def.id]
  if (atual && atual.nivel >= 1) return false
  if (!pertoDaBancada(state)) return false
  return temRecursos(state, def.niveis[0])
}

/** cria uma construção nova (nível 1) na bancada, gasta o material na hora — fica pendente de posicionar */
export function criarConstrucao(state: GameState, id: string) {
  const def = construcaoPorId(id)
  if (!def || !podeCriar(state, def)) return
  for (const [item, qtd] of Object.entries(def.niveis[0])) {
    state.inventario[item] -= qtd
  }
  state.construcoes[id] = { nivel: 1, colocada: false, bufferEntrada: 0 }
}

/** item que a construção aceita no estoque próprio — do campo `insumo`, ou do conversor contínuo */
export function insumoDe(def: ConstrucaoDef): { item: string } | undefined {
  return def.insumo ?? (def.conversor?.consomeItem ? { item: def.conversor.consomeItem.item } : undefined)
}

export function capacidadeBuffer(def: ConstrucaoDef) {
  return def.capacidadeBuffer ?? CAPACIDADE_BUFFER_PADRAO
}

/** quanto dá pra depositar agora (limitado pelo que sobra de espaço e pelo que tem no inventário) */
export function quantidadeParaDepositar(state: GameState, def: ConstrucaoDef) {
  const insumo = insumoDe(def)
  if (!insumo) return 0
  const inst = state.construcoes[def.id]
  if (!inst) return 0
  const espacoLivre = capacidadeBuffer(def) - inst.bufferEntrada
  const disponivel = state.inventario[insumo.item] ?? 0
  return Math.max(0, Math.min(espacoLivre, disponivel))
}

export function podeDepositar(state: GameState, def: ConstrucaoDef) {
  return quantidadeParaDepositar(state, def) > 0
}

/** texto tipo "Ferro-Níquel: 3.0/10" pro estoque próprio, independente de ser conversor ou craft */
export function descricaoBufferDef(def: ConstrucaoDef, inst: { bufferEntrada: number }): string | null {
  const insumo = insumoDe(def)
  if (!insumo) return null
  return `${insumo.item}: ${inst.bufferEntrada.toFixed(1)}/${capacidadeBuffer(def)}`
}

export function depositar(state: GameState, defId: string) {
  const def = construcaoPorId(defId)
  const inst = state.construcoes[defId]
  const insumo = def && insumoDe(def)
  if (!def || !insumo || !inst) return
  const qtd = quantidadeParaDepositar(state, def)
  if (qtd <= 0) return
  state.inventario[insumo.item] -= qtd
  inst.bufferEntrada += qtd
}

/** fabricação sob demanda (ex: Oficina) — consome do estoque próprio, produz direto no inventário */
export function podeCraftar(state: GameState, def: ConstrucaoDef) {
  const inst = state.construcoes[def.id]
  if (!def.craft || !inst) return false
  return inst.bufferEntrada >= def.craft.custoBuffer
}

export function craftar(state: GameState, defId: string) {
  const def = construcaoPorId(defId)
  const inst = state.construcoes[defId]
  if (!def?.craft || !inst) return
  if (!podeCraftar(state, def)) return
  inst.bufferEntrada -= def.craft.custoBuffer
  const atual = state.inventario[def.craft.produzItem] ?? 0
  state.inventario[def.craft.produzItem] = atual + def.craft.produzQtd
}

/** construção colocada livremente cujo centro está a até `raio` do ponto dado */
export function construcaoNaPosicao(
  state: GameState,
  pos: { x: number; y: number },
  raio = RAIO_COLISAO_CONSTRUCAO,
): ConstrucaoDef | null {
  for (const def of CONSTRUCOES) {
    const inst = state.construcoes[def.id]
    if (!inst?.colocada || inst.posX === undefined || inst.posY === undefined) continue
    if (Math.hypot(inst.posX - pos.x, inst.posY - pos.y) < raio) return def
  }
  return null
}

/** construção livre — qualquer ponto dentro de uma sala (afastado da parede) sem colidir com outra */
export function podeColocarEm(state: GameState, pos: { x: number; y: number }) {
  if (!salaEm(pos)) return false
  if (construcaoNaPosicao(state, pos)) return false
  return true
}

export function construcaoColocadaProxima(state: GameState): ConstrucaoDef | null {
  for (const def of CONSTRUCOES) {
    const inst = state.construcoes[def.id]
    if (!inst?.colocada || inst.posX === undefined || inst.posY === undefined) continue
    if (pertoDe(state, { x: inst.posX, y: inst.posY })) return def
  }
  return null
}

export function colocarPendente(state: GameState, defId: string, pos: { x: number; y: number }) {
  const inst = state.construcoes[defId]
  if (!inst || inst.colocada) return
  if (!podeColocarEm(state, pos)) return
  inst.colocada = true
  inst.posX = pos.x
  inst.posY = pos.y
}

export function removerColocada(state: GameState, defId: string) {
  const inst = state.construcoes[defId]
  if (!inst?.colocada) return
  inst.colocada = false
  inst.posX = undefined
  inst.posY = undefined
}

/** se dá pra upar a construção (recursos + bancada), sem checar proximidade — usado pela UI de detalhe */
export function podeUpar(state: GameState, def: ConstrucaoDef) {
  const inst = state.construcoes[def.id]
  if (!inst || inst.nivel >= def.niveis.length) return false
  const podeUsarBancada = def.bancada || bancadaConstruida(state)
  if (!podeUsarBancada) return false
  return temRecursos(state, def.niveis[inst.nivel])
}

export function uparConstrucao(state: GameState, defId: string) {
  const def = construcaoPorId(defId)
  if (!def || !podeUpar(state, def)) return
  const inst = state.construcoes[defId]
  const custo = def.niveis[inst.nivel]
  for (const [item, qtd] of Object.entries(custo)) {
    state.inventario[item] -= qtd
  }
  inst.nivel += 1
}

export function updateConstrucoesNave(state: GameState, dt: number) {
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
}
