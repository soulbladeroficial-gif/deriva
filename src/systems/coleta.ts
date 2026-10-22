import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import { DEPOSITO_ROCHAS, RAIO_COLETA, ITEM_COLETADO, QUANTIDADE_POR_COLETA } from '../content/rochosoArido'

export function pertoDoDeposito(state: GameState) {
  return Math.hypot(state.posicao.x - DEPOSITO_ROCHAS.x, state.posicao.y - DEPOSITO_ROCHAS.y) < RAIO_COLETA
}

export function updateColeta(state: GameState, input: InputState) {
  if (!input.interactRequested) return
  input.interactRequested = false
  if (!pertoDoDeposito(state)) return

  state.inventario[ITEM_COLETADO] = (state.inventario[ITEM_COLETADO] ?? 0) + QUANTIDADE_POR_COLETA
}
