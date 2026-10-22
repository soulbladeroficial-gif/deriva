import type { GameState } from '../engine/types'

const CONSUMO_POR_SEGUNDO = 1.2

export function updateOxigenioTraje(state: GameState, dt: number) {
  state.jogador.oxigenioTraje = Math.max(
    0,
    state.jogador.oxigenioTraje - CONSUMO_POR_SEGUNDO * dt,
  )
}
