import type { GameState } from '../engine/types'
import { updateReatorPrincipal } from './reatorPrincipal'
import { updateConstrucoesNave } from './construcoesNave'
import { updateSobrevivencia } from './sobrevivencia'
import { updatePanes } from './casco'

const PASSO_SEGUNDOS = 2
const MAX_PASSOS = 300 // trava de segurança (~10 min simulados de uma vez)

export interface ResultadoDormir {
  segundosPassados: number
  teveAvaria: boolean
}

/** avança o tempo rapidamente até acontecer uma pane na nave (ou até a trava de segurança) */
export function dormir(state: GameState): ResultadoDormir {
  const cascoAntes = state.nave.casco
  let segundos = 0

  for (let i = 0; i < MAX_PASSOS; i++) {
    state.nave.energiaConsumida = 0
    updateReatorPrincipal(state)
    updateConstrucoesNave(state, PASSO_SEGUNDOS)
    updateSobrevivencia(state, PASSO_SEGUNDOS)
    updatePanes(state, PASSO_SEGUNDOS)
    segundos += PASSO_SEGUNDOS
    if (state.nave.casco < cascoAntes) break
  }

  return { segundosPassados: segundos, teveAvaria: state.nave.casco < cascoAntes }
}
