export interface SalaDef {
  id: string
  /** não é mais desenhado na nave (sem legendas) — serve só pra debug/referência interna */
  nome: string
  area: { x0: number; y0: number; x1: number; y1: number }
}

/** margem mínima da parede pra uma construção poder ser colocada (centro da peça) */
export const MARGEM_PAREDE = 44

export const SALAS: SalaDef[] = [
  { id: 'navegacao', nome: 'Navegação', area: { x0: 40, y0: 40, x1: 420, y1: 380 } },
  { id: 'energia', nome: 'Energia', area: { x0: 460, y0: 40, x1: 900, y1: 380 } },
  { id: 'suporteVida', nome: 'Suporte de Vida', area: { x0: 940, y0: 40, x1: 1380, y1: 380 } },
  { id: 'dormitorio', nome: 'Dormitório', area: { x0: 40, y0: 420, x1: 420, y1: 760 } },
  { id: 'fabricacao', nome: 'Fabricação', area: { x0: 460, y0: 420, x1: 900, y1: 760 } },
]

export const CAMA = { x: 230, y: 590 }

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
