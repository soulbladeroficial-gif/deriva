export interface Inventory {
  [itemName: string]: number
}

export interface NaveState {
  energiaGerada: number
  energiaConsumida: number
  oxigenio: number
  oxigenioMax: number
  casco: number
  cascoMax: number
}

export interface JogadorState {
  fome: number
  sede: number
  vida: number
  vidaMax: number
  oxigenioTraje: number
  oxigenioTrajeMax: number
}

export interface ConstrucaoState {
  nivel: number
}

export type ConstrucoesState = Record<string, ConstrucaoState>

export interface PosicaoState {
  x: number
  y: number
}

export interface GameState {
  tick: number
  nave: NaveState
  jogador: JogadorState
  inventario: Inventory
  construcoes: ConstrucoesState
  posicao: PosicaoState
}
