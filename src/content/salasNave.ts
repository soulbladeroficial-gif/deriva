export interface SalaDef {
  id: string
  nome: string
  area: { x0: number; y0: number; x1: number; y1: number }
  slots: { x: number; y: number }[]
}

export const SALAS: SalaDef[] = [
  {
    id: 'navegacao',
    nome: 'Navegação',
    area: { x0: 40, y0: 40, x1: 420, y1: 380 },
    slots: [
      { x: 140, y: 210 },
      { x: 320, y: 210 },
    ],
  },
  {
    id: 'energia',
    nome: 'Energia',
    area: { x0: 460, y0: 40, x1: 900, y1: 380 },
    slots: [
      { x: 560, y: 140 },
      { x: 800, y: 140 },
      { x: 560, y: 300 },
      { x: 800, y: 300 },
    ],
  },
  {
    id: 'suporteVida',
    nome: 'Suporte de Vida',
    area: { x0: 940, y0: 40, x1: 1380, y1: 380 },
    slots: [
      { x: 1040, y: 140 },
      { x: 1280, y: 140 },
      { x: 1040, y: 300 },
      { x: 1280, y: 300 },
    ],
  },
  {
    id: 'dormitorio',
    nome: 'Dormitório',
    area: { x0: 40, y0: 420, x1: 420, y1: 760 },
    slots: [],
  },
  {
    id: 'fabricacao',
    nome: 'Fabricação',
    area: { x0: 460, y0: 420, x1: 900, y1: 760 },
    slots: [
      { x: 560, y: 520 },
      { x: 800, y: 520 },
      { x: 680, y: 680 },
    ],
  },
]

export const CAMA = { x: 230, y: 590 }

export function salaPorId(id: string) {
  return SALAS.find((s) => s.id === id)
}
