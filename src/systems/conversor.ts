import type { ConstrucaoInstancia, GameState } from '../engine/types'

export interface ConversorSpec {
  consomeItem?: { item: string; taxa: number }
  consomeEnergia?: number
  produzItem?: { item: string; taxa: number }
  /** igual produzItem, mas pra quando sai mais de um item (ex: Triturador) */
  produzItens?: { item: string; taxa: number }[]
  produzO2Nave?: number
  /** adiciona à energia GERADA da nave (ex: Gerador a Combustível, Painel Solar) */
  produzEnergia?: number
  /** reduz o consumo total de energia da nave em X% (0.1 = 10%) — aplicado à parte, ver construcoesNave.ts */
  reduzConsumoPercent?: number
}

/**
 * produção (saída) escala cheio com o nível — nível 2 rende 2x, nível 3 rende 3x.
 * consumo (entrada) escala mais devagar — nível 2 custa 1.5x, nível 3 custa 2x — senão upar
 * nunca compensa mais do que construir outra igual do zero.
 */
function multiplicadorProducao(nivel: number) {
  return nivel
}

function multiplicadorConsumo(nivel: number) {
  return 1 + (nivel - 1) * 0.5
}

/**
 * O material de entrada sai do BUFFER PRÓPRIO da construção (inst.bufferEntrada), não do
 * inventário geral — o jogador precisa depositar manualmente pra reabastecer.
 */
export function updateConversor(
  state: GameState,
  dt: number,
  spec: ConversorSpec,
  nivel = 1,
  inst?: ConstrucaoInstancia,
) {
  if (spec.consomeItem) {
    const consumo = spec.consomeItem.taxa * multiplicadorConsumo(nivel) * dt
    const bufferAtual = inst?.bufferEntrada ?? 0
    if (bufferAtual < consumo) return
    if (inst) inst.bufferEntrada = bufferAtual - consumo
  }

  if (spec.consomeEnergia) {
    state.nave.energiaConsumida += spec.consomeEnergia * multiplicadorConsumo(nivel)
  }

  if (spec.produzItem) {
    const atual = state.inventario[spec.produzItem.item] ?? 0
    state.inventario[spec.produzItem.item] = atual + spec.produzItem.taxa * multiplicadorProducao(nivel) * dt
  }

  if (spec.produzItens) {
    for (const saida of spec.produzItens) {
      const atual = state.inventario[saida.item] ?? 0
      state.inventario[saida.item] = atual + saida.taxa * multiplicadorProducao(nivel) * dt
    }
  }

  if (spec.produzO2Nave) {
    state.nave.oxigenio = Math.min(
      state.nave.oxigenioMax,
      state.nave.oxigenio + spec.produzO2Nave * multiplicadorProducao(nivel) * dt,
    )
  }

  if (spec.produzEnergia) {
    state.nave.energiaGerada += spec.produzEnergia * multiplicadorProducao(nivel)
  }
}

/** um efeito do conversor, pronto pra virar um "chip" visual na UI (sem texto técnico cru) */
export interface Efeito {
  /** sigla curta pra servir de selo provisório — ícone de verdade entra na parte de design */
  icone: string
  cor: string
  rotulo: string
  valor: string
}

const POSITIVO = '#4ade80'
const NEGATIVO = '#f87171'

/** quebra o conversor em efeitos estruturados (consumo, produção, energia, O2...) pra UI montar chips */
export function efeitosConversor(spec: ConversorSpec, nivel: number): Efeito[] {
  const efeitos: Efeito[] = []
  if (spec.consomeItem) {
    efeitos.push({
      icone: spec.consomeItem.item.slice(0, 2).toUpperCase(),
      cor: NEGATIVO,
      rotulo: spec.consomeItem.item,
      valor: `-${(spec.consomeItem.taxa * multiplicadorConsumo(nivel)).toFixed(2)}/s`,
    })
  }
  if (spec.produzItem) {
    efeitos.push({
      icone: spec.produzItem.item.slice(0, 2).toUpperCase(),
      cor: POSITIVO,
      rotulo: spec.produzItem.item,
      valor: `+${(spec.produzItem.taxa * multiplicadorProducao(nivel)).toFixed(2)}/s`,
    })
  }
  if (spec.produzItens) {
    for (const s of spec.produzItens) {
      efeitos.push({
        icone: s.item.slice(0, 2).toUpperCase(),
        cor: POSITIVO,
        rotulo: s.item,
        valor: `+${(s.taxa * multiplicadorProducao(nivel)).toFixed(2)}/s`,
      })
    }
  }
  if (spec.consomeEnergia) {
    efeitos.push({
      icone: '⚡',
      cor: NEGATIVO,
      rotulo: 'Energia',
      valor: `-${(spec.consomeEnergia * multiplicadorConsumo(nivel)).toFixed(1)}W`,
    })
  }
  if (spec.produzEnergia) {
    efeitos.push({
      icone: '⚡',
      cor: POSITIVO,
      rotulo: 'Energia',
      valor: `+${(spec.produzEnergia * multiplicadorProducao(nivel)).toFixed(1)}W`,
    })
  }
  if (spec.produzO2Nave) {
    efeitos.push({
      icone: 'O2',
      cor: POSITIVO,
      rotulo: 'Oxigênio',
      valor: `+${(spec.produzO2Nave * multiplicadorProducao(nivel)).toFixed(1)}/s`,
    })
  }
  if (spec.reduzConsumoPercent) {
    efeitos.push({
      icone: '%',
      cor: '#c084fc',
      rotulo: 'Consumo',
      valor: `-${(spec.reduzConsumoPercent * nivel * 100).toFixed(0)}%`,
    })
  }
  return efeitos
}
