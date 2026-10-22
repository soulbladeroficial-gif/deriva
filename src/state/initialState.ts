import type { GameState } from '../engine/types'

export function createInitialState(): GameState {
  return {
    tick: 0,
    nave: {
      energiaGerada: 0,
      energiaConsumida: 0,
      oxigenio: 800,
      oxigenioMax: 1000,
    },
    jogador: {
      fome: 20,
      sede: 20,
      vida: 100,
      vidaMax: 100,
    },
    inventario: {
      'Água Pura': 10,
      'Biomassa Comum': 10,
      'Ferro-Níquel': 10,
      'Cobre Nativo': 10,
    },
    construcoes: {
      eletrolisador: { construido: false },
    },
    posicao: { x: 400, y: 260 },
  }
}
