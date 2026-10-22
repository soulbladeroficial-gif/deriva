import type { ConversorSpec } from '../systems/conversor'

export interface NivelCusto {
  [item: string]: number
}

export interface ConstrucaoDef {
  id: string
  nome: string
  posicao: { x: number; y: number }
  /** niveis[0] = custo pra construir (nível 1), niveis[1] = custo pra upar pra nível 2, niveis[2] = custo pra upar pra nível 3 */
  niveis: NivelCusto[]
  conversor?: ConversorSpec
  cor: string
  /** se true, não precisa de Bancada de Upgrade construída pra evoluir de nível (caso da própria Bancada) */
  bancada?: boolean
}

export const CONSTRUCOES: ConstrucaoDef[] = [
  {
    id: 'eletrolisador',
    nome: 'Eletrolisador',
    posicao: { x: 220, y: 180 },
    niveis: [
      { 'Ferro-Níquel': 3, 'Cobre Nativo': 2 },
      { 'Alumínio Purificado': 2, 'Resina Endurecida': 1 },
      { 'Liga Anticorrosiva': 2 },
    ],
    conversor: {
      consomeItem: { item: 'Água Pura', taxa: 0.05 },
      consomeEnergia: 3,
      produzO2Nave: 2,
    },
    cor: '#4fd1c5',
  },
  {
    id: 'derretedorGelo',
    nome: 'Derretedor de Gelo',
    posicao: { x: 420, y: 150 },
    niveis: [
      { 'Ferro-Níquel': 3, 'Basalto Denso': 2 },
      { 'Alumínio Purificado': 2 },
      { 'Liga Anticorrosiva': 2 },
    ],
    conversor: {
      consomeItem: { item: 'Gelo Comum', taxa: 0.05 },
      consomeEnergia: 2,
      produzItem: { item: 'Água Pura', taxa: 0.05 },
    },
    cor: '#60a5fa',
  },
  {
    id: 'biorreator',
    nome: 'Biorreator de Algas',
    posicao: { x: 620, y: 180 },
    niveis: [
      { 'Fibra Lenhosa': 3, 'Casca Fibrosa': 2 },
      { 'Resina Endurecida': 2 },
      { 'Seiva Cristalizada': 2 },
    ],
    conversor: {
      consomeItem: { item: 'Biomassa Comum', taxa: 0.03 },
      consomeEnergia: 2,
      produzO2Nave: 1,
    },
    cor: '#4ade80',
  },
  {
    id: 'estufa',
    nome: 'Estufa/Hidroponia',
    posicao: { x: 420, y: 400 },
    niveis: [
      { 'Fibra Lenhosa': 4, 'Casca Fibrosa': 2 },
      { 'Resina Endurecida': 2, 'Fibra Lenhosa': 1 },
      { 'Seiva Cristalizada': 2 },
    ],
    conversor: {
      consomeItem: { item: 'Água Pura', taxa: 0.03 },
      consomeEnergia: 2,
      produzItem: { item: 'Biomassa Comum', taxa: 0.02 },
    },
    cor: '#facc15',
  },
  {
    id: 'oficina',
    nome: 'Oficina',
    posicao: { x: 620, y: 400 },
    niveis: [
      { 'Ferro-Níquel': 4, 'Basalto Denso': 2 },
      { 'Aço Temperado': 2 },
      { Tungstênio: 2 },
    ],
    conversor: {
      consomeItem: { item: 'Ferro-Níquel', taxa: 0.05 },
      consomeEnergia: 3,
      produzItem: { item: 'Peças', taxa: 0.03 },
    },
    cor: '#f97316',
  },
  {
    id: 'bancadaUpgrade',
    nome: 'Bancada de Upgrade',
    posicao: { x: 150, y: 400 },
    niveis: [
      { 'Ferro-Níquel': 3, 'Cobre Nativo': 2 },
      { 'Aço Temperado': 2 },
      { Tungstênio: 2 },
    ],
    cor: '#a3a3a3',
    bancada: true,
  },
]
