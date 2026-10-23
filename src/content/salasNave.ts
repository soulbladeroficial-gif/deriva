export type Lado = 'left' | 'right' | 'top' | 'bottom'

export interface Porta {
  lado: Lado
  /** posição da porta no meio da parede (y pras paredes left/right, x pras top/bottom) */
  centro: number
  largura: number
}

export interface SalaDef {
  id: string
  /** não é desenhado na nave (sem legendas) — serve só pra debug/referência interna */
  nome: string
  area: { x0: number; y0: number; x1: number; y1: number }
  porta: Porta
  /** lado da sala que encosta no casco por fora — é onde pode aparecer rachadura de avaria */
  paredeExterna?: Lado
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

/**
 * Layout assimétrico: corredor único em zigue-zague (sem linha de simetria), frente da nave
 * (topo) é a Sala de Comando, fundo (embaixo) fica reservado pros propulsores no futuro.
 * Portas largas (180-190px) pra nunca ficar sem achar a saída.
 */
export const SALAS: SalaDef[] = [
  {
    id: 'salaComando',
    nome: 'Sala de Comando',
    area: { x0: 540, y0: 40, x1: 900, y1: 280 },
    porta: { lado: 'bottom', centro: 720, largura: 190 },
    paredeExterna: 'top',
  },
  {
    id: 'suporteVida',
    nome: 'Suporte de Vida',
    area: { x0: 1000, y0: 340, x1: 1360, y1: 560 },
    porta: { lado: 'left', centro: 450, largura: 180 },
    paredeExterna: 'right',
  },
  {
    id: 'energia',
    nome: 'Energia',
    area: { x0: 600, y0: 620, x1: 960, y1: 840 },
    porta: { lado: 'top', centro: 780, largura: 180 },
  },
  {
    id: 'fabricacao',
    nome: 'Fabricação',
    area: { x0: 40, y0: 620, x1: 400, y1: 840 },
    porta: { lado: 'right', centro: 730, largura: 180 },
    paredeExterna: 'left',
  },
  {
    id: 'dormitorio',
    nome: 'Dormitório',
    area: { x0: 40, y0: 900, x1: 400, y1: 1140 },
    porta: { lado: 'top', centro: 220, largura: 180 },
    paredeExterna: 'bottom',
  },
]

/** saída/airlock da nave — na lateral, perto do Suporte de Vida */
export const SAIDA = { x: 1320, y: 450 }

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

interface ParedeComLado extends Retangulo {
  lado: Lado
  salaId: string
}

/** os 4 segmentos de parede de uma sala, com um vão (porta) na parede indicada */
function paredesDaSala(sala: SalaDef): ParedeComLado[] {
  const { x0, y0, x1, y1 } = sala.area
  const e = ESPESSURA_PAREDE
  const { lado, centro, largura } = sala.porta
  const metade = largura / 2

  const paredes: ParedeComLado[] = []
  const add = (r: Retangulo, ladoDessa: Lado) => paredes.push({ ...r, lado: ladoDessa, salaId: sala.id })

  // esquerda
  if (lado === 'left') {
    add({ x0: x0 - e, x1: x0 + e, y0, y1: centro - metade }, 'left')
    add({ x0: x0 - e, x1: x0 + e, y0: centro + metade, y1 }, 'left')
  } else {
    add({ x0: x0 - e, x1: x0 + e, y0, y1 }, 'left')
  }

  // direita
  if (lado === 'right') {
    add({ x0: x1 - e, x1: x1 + e, y0, y1: centro - metade }, 'right')
    add({ x0: x1 - e, x1: x1 + e, y0: centro + metade, y1 }, 'right')
  } else {
    add({ x0: x1 - e, x1: x1 + e, y0, y1 }, 'right')
  }

  // topo
  if (lado === 'top') {
    add({ x0, x1: centro - metade, y0: y0 - e, y1: y0 + e }, 'top')
    add({ x0: centro + metade, x1, y0: y0 - e, y1: y0 + e }, 'top')
  } else {
    add({ x0, x1, y0: y0 - e, y1: y0 + e }, 'top')
  }

  // baixo
  if (lado === 'bottom') {
    add({ x0, x1: centro - metade, y0: y1 - e, y1: y1 + e }, 'bottom')
    add({ x0: centro + metade, x1, y0: y1 - e, y1: y1 + e }, 'bottom')
  } else {
    add({ x0, x1, y0: y1 - e, y1: y1 + e }, 'bottom')
  }

  return paredes
}

const PAREDES_COM_LADO: ParedeComLado[] = SALAS.flatMap(paredesDaSala)
export const PAREDES: Retangulo[] = PAREDES_COM_LADO

/** só os segmentos de parede que encostam no casco por fora — onde uma avaria pode rachar */
export const PAREDES_EXTERNAS: Retangulo[] = PAREDES_COM_LADO.filter((p) => {
  const sala = salaPorId(p.salaId)
  return sala?.paredeExterna === p.lado
})

export interface Curva {
  a: { x: number; y: number }
  c: { x: number; y: number }
  b: { x: number; y: number }
}

/**
 * tubos de conexão decorativos entre as portas — cada segmento foi conferido pra passar só por
 * fora dos retângulos das salas (o corredor de verdade é o espaço aberto; isso aqui é só visual).
 */
export const TUBOS: Curva[] = [
  { a: { x: 720, y: 280 }, c: { x: 720, y: 365 }, b: { x: 720, y: 450 } },
  { a: { x: 720, y: 450 }, c: { x: 860, y: 450 }, b: { x: 1000, y: 450 } },
  { a: { x: 720, y: 450 }, c: { x: 720, y: 525 }, b: { x: 720, y: 600 } },
  { a: { x: 720, y: 600 }, c: { x: 750, y: 610 }, b: { x: 780, y: 620 } },
  { a: { x: 720, y: 600 }, c: { x: 610, y: 600 }, b: { x: 500, y: 600 } },
  { a: { x: 500, y: 600 }, c: { x: 500, y: 665 }, b: { x: 500, y: 730 } },
  { a: { x: 500, y: 730 }, c: { x: 450, y: 730 }, b: { x: 400, y: 730 } },
  { a: { x: 500, y: 730 }, c: { x: 500, y: 815 }, b: { x: 500, y: 900 } },
  { a: { x: 500, y: 900 }, c: { x: 400, y: 900 }, b: { x: 300, y: 900 } },
  { a: { x: 300, y: 900 }, c: { x: 260, y: 900 }, b: { x: 220, y: 900 } },
]
export const LARGURA_TUBO = 110

/** raio de canto bem grande pras salas renderizarem como cápsulas arredondadas, não blocos */
export const RAIO_SALA = 60
