import type { GameState } from '../engine/types'

export function createInitialState(): GameState {
  return {
    tick: 0,
    nave: {
      energiaGerada: 0,
      energiaConsumida: 0,
      oxigenio: 800,
      oxigenioMax: 1000,
      casco: 100,
      cascoMax: 100,
    },
    jogador: {
      fome: 20,
      sede: 20,
      vida: 100,
      vidaMax: 100,
      oxigenioTraje: 100,
      oxigenioTrajeMax: 100,
    },
    inventario: {
      'Água Pura': 10,
      'Biomassa Comum': 10,
      'Ferro-Níquel': 10,
      'Cobre Nativo': 10,
      'Basalto Denso': 10,
      'Fibra Lenhosa': 10,
      'Casca Fibrosa': 10,
      'Gelo Comum': 10,
      Peças: 5,
      // materiais de upgrade (N2/N3) — quantidade só pra testar, balanceamento real vem depois
      'Alumínio Purificado': 5,
      'Resina Endurecida': 5,
      'Aço Temperado': 5,
      'Liga Anticorrosiva': 5,
      'Seiva Cristalizada': 5,
      Tungstênio: 5,
      'Prata Condutora': 5,
      'Liga Supercondutora': 5,
      'Osso Denso': 5,
      'Carapaça Quitinosa': 5,
      'Escama Blindada': 5,
    },
    construcoes: {},
    posicao: { x: 400, y: 260 },
  }
}
