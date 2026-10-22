import type { GameState } from '../engine/types'

export interface ConversorSpec {
  consomeItem?: { item: string; taxa: number }
  consomeEnergia?: number
  produzItem?: { item: string; taxa: number }
  produzO2Nave?: number
}

/** nivel multiplica consumo e produção — nível 2 e 3 rendem mais, consistente com o upgrade. */
export function updateConversor(state: GameState, dt: number, spec: ConversorSpec, nivel = 1) {
  if (spec.consomeItem) {
    const consumo = spec.consomeItem.taxa * nivel * dt
    const disponivel = state.inventario[spec.consomeItem.item] ?? 0
    if (disponivel < consumo) return
    state.inventario[spec.consomeItem.item] = disponivel - consumo
  }

  if (spec.consomeEnergia) {
    state.nave.energiaConsumida += spec.consomeEnergia * nivel
  }

  if (spec.produzItem) {
    const atual = state.inventario[spec.produzItem.item] ?? 0
    state.inventario[spec.produzItem.item] = atual + spec.produzItem.taxa * nivel * dt
  }

  if (spec.produzO2Nave) {
    state.nave.oxigenio = Math.min(
      state.nave.oxigenioMax,
      state.nave.oxigenio + spec.produzO2Nave * nivel * dt,
    )
  }
}
