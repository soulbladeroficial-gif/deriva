import type { ConstrucaoInstancia, GameState } from '../engine/types'
import {
  CONSTRUCOES,
  CAPACIDADE_BUFFER_PADRAO,
  BANCADA_FABRICACAO_ID,
  type ConstrucaoDef,
  type NivelCusto,
} from '../content/construcoesNave'
import { salaEm, type Retangulo } from '../content/salasNave'
import { updateConversor } from './conversor'

export const RAIO_INTERACAO = 55
/** distância mínima entre centros de duas construções colocadas livremente */
export const RAIO_COLISAO_CONSTRUCAO = 70
/** metade do lado da hitbox de colisão de uma construção colocada */
export const RAIO_HITBOX_CONSTRUCAO = 26

export function pertoDe(state: GameState, pos: { x: number; y: number }, raio = RAIO_INTERACAO) {
  return Math.hypot(state.posicao.x - pos.x, state.posicao.y - pos.y) < raio
}

export function construcaoPorId(defId: string) {
  return CONSTRUCOES.find((d) => d.id === defId)
}

export function instanciasDe(state: GameState, defId: string): ConstrucaoInstancia[] {
  return state.construcoes.filter((i) => i.defId === defId)
}

export function instanciaPorId(state: GameState, instId: string): ConstrucaoInstancia | undefined {
  return state.construcoes.find((i) => i.id === instId)
}

export function bancadaConstruida(state: GameState) {
  return state.construcoes.some((inst) => {
    if (!inst.colocada) return false
    const def = construcaoPorId(inst.defId)
    return Boolean(def?.bancada)
  })
}

export function temRecursos(state: GameState, custo: NivelCusto) {
  return Object.entries(custo).every(([item, qtd]) => (state.inventario[item] ?? 0) >= qtd)
}

/** construções já criadas mas ainda não instaladas num ponto da nave — pode haver várias */
export function pendentes(state: GameState): ConstrucaoInstancia[] {
  return state.construcoes.filter((i) => !i.colocada)
}

/** construções que aparecem no catálogo de "Criar" da bancada (exclui as que já vêm fixas na nave) */
export function catalogoConstruivel(): ConstrucaoDef[] {
  return CONSTRUCOES.filter((def) => !def.inicial)
}

/** só dá pra criar construções perto da bancada de fabricação — ela é uma construção como as outras */
export function pertoDaBancada(state: GameState) {
  const inst = state.construcoes.find((i) => i.defId === BANCADA_FABRICACAO_ID && i.colocada)
  if (!inst || inst.posX === undefined || inst.posY === undefined) return false
  return pertoDe(state, { x: inst.posX, y: inst.posY })
}

export function podeCriar(state: GameState, def: ConstrucaoDef) {
  if (!pertoDaBancada(state)) return false
  return temRecursos(state, def.niveis[0])
}

let contadorInstancia = 0
function gerarInstanciaId(defId: string) {
  contadorInstancia += 1
  return `${defId}_${contadorInstancia}`
}

/** cria uma construção nova (nível 1) na bancada, gasta o material na hora — fica pendente de posicionar.
 * Pode ser chamada várias vezes pro mesmo defId: cada uma vira uma instância independente. */
export function criarConstrucao(state: GameState, defId: string) {
  const def = construcaoPorId(defId)
  if (!def || !podeCriar(state, def)) return
  for (const [item, qtd] of Object.entries(def.niveis[0])) {
    state.inventario[item] -= qtd
  }
  state.construcoes.push({ id: gerarInstanciaId(defId), defId, nivel: 1, colocada: false, bufferEntrada: 0 })
}

/** item que a construção aceita no estoque próprio — do campo `insumo`, ou do conversor contínuo */
export function insumoDe(def: ConstrucaoDef): { item: string } | undefined {
  return def.insumo ?? (def.conversor?.consomeItem ? { item: def.conversor.consomeItem.item } : undefined)
}

export function capacidadeBuffer(def: ConstrucaoDef) {
  return def.capacidadeBuffer ?? CAPACIDADE_BUFFER_PADRAO
}

/** quanto dá pra depositar agora (limitado pelo que sobra de espaço e pelo que tem no inventário) */
export function quantidadeParaDepositar(state: GameState, def: ConstrucaoDef, inst: ConstrucaoInstancia) {
  const insumo = insumoDe(def)
  if (!insumo) return 0
  const espacoLivre = capacidadeBuffer(def) - inst.bufferEntrada
  const disponivel = state.inventario[insumo.item] ?? 0
  return Math.max(0, Math.min(espacoLivre, disponivel))
}

export function podeDepositar(state: GameState, def: ConstrucaoDef, inst: ConstrucaoInstancia) {
  return quantidadeParaDepositar(state, def, inst) > 0
}

/** texto tipo "Ferro-Níquel: 3.0/10" pro estoque próprio, independente de ser conversor ou craft */
export function descricaoBufferDef(def: ConstrucaoDef, inst: { bufferEntrada: number }): string | null {
  const insumo = insumoDe(def)
  if (!insumo) return null
  return `${insumo.item}: ${inst.bufferEntrada.toFixed(1)}/${capacidadeBuffer(def)}`
}

export function depositar(state: GameState, instId: string) {
  const inst = instanciaPorId(state, instId)
  const def = inst && construcaoPorId(inst.defId)
  const insumo = def && insumoDe(def)
  if (!def || !insumo || !inst) return
  const qtd = quantidadeParaDepositar(state, def, inst)
  if (qtd <= 0) return
  state.inventario[insumo.item] -= qtd
  inst.bufferEntrada += qtd
}

/** fabricação sob demanda (ex: Oficina) — consome do estoque próprio, produz direto no inventário */
export function podeCraftar(def: ConstrucaoDef, inst: ConstrucaoInstancia) {
  if (!def.craft) return false
  return inst.bufferEntrada >= def.craft.custoBuffer
}

export function craftar(state: GameState, instId: string) {
  const inst = instanciaPorId(state, instId)
  const def = inst && construcaoPorId(inst.defId)
  if (!def?.craft || !inst) return
  if (!podeCraftar(def, inst)) return
  inst.bufferEntrada -= def.craft.custoBuffer
  const atual = state.inventario[def.craft.produzItem] ?? 0
  state.inventario[def.craft.produzItem] = atual + def.craft.produzQtd
}

/** construção colocada livremente cujo centro está a até `raio` do ponto dado */
export function construcaoNaPosicao(
  state: GameState,
  pos: { x: number; y: number },
  raio = RAIO_COLISAO_CONSTRUCAO,
): ConstrucaoInstancia | null {
  for (const inst of state.construcoes) {
    if (!inst.colocada || inst.posX === undefined || inst.posY === undefined) continue
    if (Math.hypot(inst.posX - pos.x, inst.posY - pos.y) < raio) return inst
  }
  return null
}

/** construção livre — qualquer ponto dentro de uma sala (afastado da parede) sem colidir com outra */
export function podeColocarEm(state: GameState, pos: { x: number; y: number }) {
  if (!salaEm(pos)) return false
  if (construcaoNaPosicao(state, pos)) return false
  return true
}

/** retângulos de colisão de todas as construções colocadas — o jogador não anda por cima delas */
export function hitboxesConstrucoes(state: GameState): Retangulo[] {
  const caixas: Retangulo[] = []
  for (const inst of state.construcoes) {
    if (!inst.colocada || inst.posX === undefined || inst.posY === undefined) continue
    caixas.push({
      x0: inst.posX - RAIO_HITBOX_CONSTRUCAO,
      y0: inst.posY - RAIO_HITBOX_CONSTRUCAO,
      x1: inst.posX + RAIO_HITBOX_CONSTRUCAO,
      y1: inst.posY + RAIO_HITBOX_CONSTRUCAO,
    })
  }
  return caixas
}

export function construcaoColocadaProxima(state: GameState): ConstrucaoInstancia | null {
  for (const inst of state.construcoes) {
    if (!inst.colocada || inst.posX === undefined || inst.posY === undefined) continue
    if (pertoDe(state, { x: inst.posX, y: inst.posY })) return inst
  }
  return null
}

export function colocarPendente(state: GameState, instId: string, pos: { x: number; y: number }) {
  const inst = instanciaPorId(state, instId)
  if (!inst || inst.colocada) return
  if (!podeColocarEm(state, pos)) return
  inst.colocada = true
  inst.posX = pos.x
  inst.posY = pos.y
}

export function removerColocada(state: GameState, instId: string) {
  const inst = instanciaPorId(state, instId)
  if (!inst?.colocada) return
  inst.colocada = false
  inst.posX = undefined
  inst.posY = undefined
}

/** se dá pra upar a construção (recursos + bancada), sem checar proximidade — usado pela UI de detalhe */
export function podeUpar(state: GameState, def: ConstrucaoDef, inst: ConstrucaoInstancia) {
  if (inst.nivel >= def.niveis.length) return false
  const podeUsarBancada = def.bancada || bancadaConstruida(state)
  if (!podeUsarBancada) return false
  return temRecursos(state, def.niveis[inst.nivel])
}

export function uparConstrucao(state: GameState, instId: string) {
  const inst = instanciaPorId(state, instId)
  const def = inst && construcaoPorId(inst.defId)
  if (!def || !inst || !podeUpar(state, def, inst)) return
  const custo = def.niveis[inst.nivel]
  for (const [item, qtd] of Object.entries(custo)) {
    state.inventario[item] -= qtd
  }
  inst.nivel += 1
}

export function updateConstrucoesNave(state: GameState, dt: number) {
  for (const inst of state.construcoes) {
    if (!inst.colocada) continue
    const def = construcaoPorId(inst.defId)
    if (def?.conversor) updateConversor(state, dt, def.conversor, inst.nivel, inst)
  }

  for (const inst of state.construcoes) {
    if (!inst.colocada) continue
    const def = construcaoPorId(inst.defId)
    const reduz = def?.conversor?.reduzConsumoPercent
    if (reduz) {
      state.nave.energiaConsumida *= Math.max(0, 1 - reduz * inst.nivel)
    }
  }
}
