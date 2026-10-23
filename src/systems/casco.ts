import type { GameState } from '../engine/types'
import { PAREDES_EXTERNAS } from '../content/salasNave'

// valores altos de propósito nesse protótipo, pra dar pra testar sem esperar muito —
// balanceamento de verdade fica pra quando o jogo tiver conteúdo suficiente pra calibrar.
const CHANCE_PANE_POR_SEGUNDO = 0.006
const DANO_PANE = 15
const DANO_VIDA_PANE = 8
const VAZAMENTO_O2_POR_SEGUNDO = 6

export const RAIO_REPARO = 60

/** escolhe um ponto no meio de uma parede externa aleatória (que encosta no casco) pra rachar */
function escolherLocalDaAvaria(): { x: number; y: number } {
  const parede = PAREDES_EXTERNAS[Math.floor(Math.random() * PAREDES_EXTERNAS.length)]
  return { x: (parede.x0 + parede.x1) / 2, y: (parede.y0 + parede.y1) / 2 }
}

export function updatePanes(state: GameState, dt: number) {
  if (!state.nave.paneLocal && Math.random() < CHANCE_PANE_POR_SEGUNDO * dt) {
    state.nave.paneLocal = escolherLocalDaAvaria()
    state.nave.casco = Math.max(0, state.nave.casco - DANO_PANE)
    state.jogador.vida = Math.max(0, state.jogador.vida - DANO_VIDA_PANE)
  }

  // com uma avaria ativa, o oxigênio da nave vaza mais rápido até alguém consertar
  if (state.nave.paneLocal) {
    state.nave.oxigenio = Math.max(0, state.nave.oxigenio - VAZAMENTO_O2_POR_SEGUNDO * dt)
  }
}

export const CUSTO_REPARO: Record<string, number> = { Peças: 2 }
const REPARO_QUANTIDADE = 20

export function pertoDaAvaria(state: GameState) {
  if (!state.nave.paneLocal) return false
  return Math.hypot(state.posicao.x - state.nave.paneLocal.x, state.posicao.y - state.nave.paneLocal.y) < RAIO_REPARO
}

export function podeRepararCasco(state: GameState) {
  if (!state.nave.paneLocal) return false
  if (!pertoDaAvaria(state)) return false
  return Object.entries(CUSTO_REPARO).every(([item, qtd]) => (state.inventario[item] ?? 0) >= qtd)
}

export function repararCasco(state: GameState) {
  if (!podeRepararCasco(state)) return
  for (const [item, qtd] of Object.entries(CUSTO_REPARO)) {
    state.inventario[item] -= qtd
  }
  state.nave.casco = Math.min(state.nave.cascoMax, state.nave.casco + REPARO_QUANTIDADE)
  state.nave.paneLocal = null
}
