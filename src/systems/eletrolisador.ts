import type { GameState } from '../engine/types'

const CONSUMO_AGUA_POR_SEGUNDO = 0.05
const CONSUMO_ENERGIA = 3
const PRODUCAO_O2_POR_SEGUNDO = 2

export function updateEletrolisador(state: GameState, dt: number) {
  if (!state.construcoes.eletrolisador.construido) return

  const consumoAgua = CONSUMO_AGUA_POR_SEGUNDO * dt
  const aguaDisponivel = state.inventario['Água Pura'] ?? 0
  if (aguaDisponivel < consumoAgua) return

  state.inventario['Água Pura'] = aguaDisponivel - consumoAgua
  state.nave.energiaConsumida += CONSUMO_ENERGIA
  state.nave.oxigenio = Math.min(
    state.nave.oxigenioMax,
    state.nave.oxigenio + PRODUCAO_O2_POR_SEGUNDO * dt,
  )
}
