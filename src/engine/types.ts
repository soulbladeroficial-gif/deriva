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
  /** ponto exato da avaria ativa (rachadura visível na parede) — null quando não há pane */
  paneLocal: { x: number; y: number } | null
}

export interface JogadorState {
  fome: number
  sede: number
  vida: number
  vidaMax: number
  oxigenioTraje: number
  oxigenioTrajeMax: number
}

export interface ConstrucaoInstancia {
  /** identifica essa instância específica — pode haver várias do mesmo defId */
  id: string
  defId: string
  nivel: number
  /** true = instalada livremente em algum ponto do chão da nave (posX/posY definidos); false = criada mas ainda no inventário, esperando posicionamento */
  colocada: boolean
  posX?: number
  posY?: number
  /** estoque próprio da construção pro material de entrada — só mexe no inventário geral quando o jogador deposita */
  bufferEntrada: number
}

export type ConstrucoesState = ConstrucaoInstancia[]

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
