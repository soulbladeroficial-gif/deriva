import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import { DEPOSITOS, RAIO_COLETA, type DepositoDef } from '../content/rochosoArido'

export function pertoDe(state: GameState, pos: { x: number; y: number }) {
  return Math.hypot(state.posicao.x - pos.x, state.posicao.y - pos.y) < RAIO_COLETA
}

export function depositoMaisProximo(state: GameState): DepositoDef | null {
  for (const d of DEPOSITOS) {
    if (pertoDe(state, d.posicao)) return d
  }
  return null
}

export function updateColeta(state: GameState, input: InputState) {
  if (!input.interactRequested) return
  const deposito = depositoMaisProximo(state)
  if (!deposito) return
  input.interactRequested = false

  state.inventario[deposito.itemColetado] =
    (state.inventario[deposito.itemColetado] ?? 0) + deposito.quantidadePorColeta
}
