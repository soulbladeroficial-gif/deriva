export const NOME_PLANETA = 'Rochoso Árido'
export const RAIO_COLETA = 55

export interface DepositoDef {
  id: string
  nome: string
  posicao: { x: number; y: number }
  itemColetado: string
  quantidadePorColeta: number
  cor: string
}

export const DEPOSITOS: DepositoDef[] = [
  {
    id: 'rochas',
    nome: 'Depósito de Rochas',
    posicao: { x: 900, y: 320 },
    itemColetado: 'Ferro-Níquel',
    quantidadePorColeta: 1,
    cor: '#8a7a6a',
  },
  {
    id: 'furos',
    nome: 'Fumarola de Gás',
    posicao: { x: 500, y: 650 },
    itemColetado: 'Hidrogênio Gasoso',
    quantidadePorColeta: 1,
    cor: '#d97706',
  },
]
