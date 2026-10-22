export type Lado = 'left' | 'right' | 'top' | 'bottom'

export interface Porta {
  lado: Lado
  /** posição da porta no meio da parede (y pras paredes left/right, x pras top/bottom) */
  centro: number
  largura: number
}

export interface SalaDef {
  id: string
  /** não é mais desenhado na nave (sem legendas) — serve só pra debug/referência interna */
  nome: string
  area: { x0: number; y0: number; x1: number; y1: number }
  porta: Porta
}

export interface Retangulo {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** margem mínima da parede pra uma construção poder ser colocada (centro da peça) */
export const MARGEM_PAREDE = 44
export const ESPESSURA_PAREDE = 10

export const SALAS: SalaDef[] = [
  {
    id: 'navegacao',
    nome: 'Navegação',
    area: { x0: 40, y0: 40, x1: 420, y1: 380 },
    porta: { lado: 'right', centro: 210, largura: 140 },
  },
  {
    id: 'energia',
    nome: 'Energia',
    area: { x0: 460, y0: 40, x1: 900, y1: 380 },
    porta: { lado: 'bottom', centro: 680, largura: 140 },
  },
  {
    id: 'suporteVida',
    nome: 'Suporte de Vida',
    area: { x0: 940, y0: 40, x1: 1380, y1: 380 },
    porta: { lado: 'left', centro: 210, largura: 140 },
  },
  {
    id: 'dormitorio',
    nome: 'Dormitório',
    area: { x0: 40, y0: 420, x1: 420, y1: 760 },
    porta: { lado: 'right', centro: 590, largura: 140 },
  },
  {
    id: 'fabricacao',
    nome: 'Fabricação',
    area: { x0: 460, y0: 420, x1: 900, y1: 760 },
    porta: { lado: 'top', centro: 680, largura: 140 },
  },
]

export const CAMA = { x: 230, y: 590 }

/** bancada fixa da nave (não é construída) — é onde o jogador cria construções a partir de materiais */
export const BANCADA_FABRICACAO = { x: 560, y: 480 }

export function salaPorId(id: string) {
  return SALAS.find((s) => s.id === id)
}

/** sala que contém o ponto, considerando a margem da parede — ou null se for fora de toda sala/parede */
export function salaEm(pos: { x: number; y: number }): SalaDef | null {
  for (const sala of SALAS) {
    if (
      pos.x >= sala.area.x0 + MARGEM_PAREDE &&
      pos.x <= sala.area.x1 - MARGEM_PAREDE &&
      pos.y >= sala.area.y0 + MARGEM_PAREDE &&
      pos.y <= sala.area.y1 - MARGEM_PAREDE
    ) {
      return sala
    }
  }
  return null
}

/** os 4 segmentos de parede de uma sala, com um vão (porta) na parede indicada */
function paredesDaSala(sala: SalaDef): Retangulo[] {
  const { x0, y0, x1, y1 } = sala.area
  const e = ESPESSURA_PAREDE
  const { lado, centro, largura } = sala.porta
  const metade = largura / 2

  const paredes: Retangulo[] = []

  // esquerda
  if (lado === 'left') {
    paredes.push({ x0: x0 - e, x1: x0 + e, y0, y1: centro - metade })
    paredes.push({ x0: x0 - e, x1: x0 + e, y0: centro + metade, y1 })
  } else {
    paredes.push({ x0: x0 - e, x1: x0 + e, y0, y1 })
  }

  // direita
  if (lado === 'right') {
    paredes.push({ x0: x1 - e, x1: x1 + e, y0, y1: centro - metade })
    paredes.push({ x0: x1 - e, x1: x1 + e, y0: centro + metade, y1 })
  } else {
    paredes.push({ x0: x1 - e, x1: x1 + e, y0, y1 })
  }

  // topo
  if (lado === 'top') {
    paredes.push({ x0, x1: centro - metade, y0: y0 - e, y1: y0 + e })
    paredes.push({ x0: centro + metade, x1, y0: y0 - e, y1: y0 + e })
  } else {
    paredes.push({ x0, x1, y0: y0 - e, y1: y0 + e })
  }

  // baixo
  if (lado === 'bottom') {
    paredes.push({ x0, x1: centro - metade, y0: y1 - e, y1: y1 + e })
    paredes.push({ x0: centro + metade, x1, y0: y1 - e, y1: y1 + e })
  } else {
    paredes.push({ x0, x1, y0: y1 - e, y1: y1 + e })
  }

  return paredes
}

export const PAREDES: Retangulo[] = SALAS.flatMap(paredesDaSala)
