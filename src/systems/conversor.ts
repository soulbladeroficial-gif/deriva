import type { GameState } from '../engine/types'

export interface ConversorSpec {
  consomeItem?: { item: string; taxa: number }
  consomeEnergia?: number
  produzItem?: { item: string; taxa: number }
  produzO2Nave?: number
}

export function updateConversor(state: GameState, dt: number, spec: ConversorSpec) {
  if (spec.consomeItem) {
    const consumo = spec.consomeItem.taxa * dt
    const disponivel = state.inventario[spec.consomeItem.item] ?? 0
    if (disponivel < consumo) return
    state.inventario[spec.consomeItem.item] = disponivel - consumo
  }

  if (spec.consomeEnergia) {
    state.nave.energiaConsumida += spec.consomeEnergia
  }

  if (spec.produzItem) {
    const atual = state.inventario[spec.produzItem.item] ?? 0
    state.inventario[spec.produzItem.item] = atual + spec.produzItem.taxa * dt
  }

  if (spec.produzO2Nave) {
    state.nave.oxigenio = Math.min(
      state.nave.oxigenioMax,
      state.nave.oxigenio + spec.produzO2Nave * dt,
    )
  }
}
