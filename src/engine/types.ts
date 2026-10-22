export interface Inventory {
  [itemName: string]: number
}

export interface NaveState {
  energiaGerada: number
  energiaConsumida: number
  oxigenio: number
  oxigenioMax: number
}

export interface JogadorState {
  fome: number
  sede: number
  vida: number
  vidaMax: number
}

export interface ConstrucoesState {
  eletrolisador: { construido: boolean }
}

export interface GameState {
  tick: number
  nave: NaveState
  jogador: JogadorState
  inventario: Inventory
  construcoes: ConstrucoesState
}
