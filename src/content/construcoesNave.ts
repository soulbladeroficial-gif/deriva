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
    id: 'triturador',
    nome: 'Triturador',
    posicao: { x: 1000, y: 500 },
    niveis: [
      { 'Ferro-Níquel': 3, 'Osso Denso': 2 },
      { 'Aço Temperado': 2, 'Carapaça Quitinosa': 1 },
      { Tungstênio: 2, 'Escama Blindada': 1 },
    ],
    conversor: {
      // 1 Motor Velho -> 2 Ferro-Níquel + 1 Titânio Bruto (receita do GDD), em taxa contínua
      consomeItem: { item: 'Motor Velho', taxa: 0.02 },
      consomeEnergia: 2,
      produzItens: [
        { item: 'Ferro-Níquel', taxa: 0.04 },
        { item: 'Titânio Bruto', taxa: 0.02 },
      ],
    },
    cor: '#8b5cf6',
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
  {
    id: 'geradorCombustivel',
    nome: 'Gerador a Combustível',
    posicao: { x: 850, y: 180 },
    niveis: [
      { 'Ferro-Níquel': 3, 'Basalto Denso': 2 },
      { 'Prata Condutora': 2 },
      { 'Liga Supercondutora': 2 },
    ],
    conversor: {
      consomeItem: { item: 'Hidrogênio Gasoso', taxa: 0.05 },
      produzEnergia: 8,
    },
    cor: '#fb923c',
  },
  {
    id: 'painelSolar',
    nome: 'Painel Solar',
    posicao: { x: 1000, y: 300 },
    niveis: [
      { 'Cobre Nativo': 2, 'Ferro-Níquel': 2, 'Fibra Lenhosa': 1 },
      { 'Prata Condutora': 2 },
      { 'Liga Supercondutora': 2 },
    ],
    conversor: {
      produzEnergia: 3,
    },
    cor: '#38bdf8',
  },
  {
    id: 'otimizadorRede',
    nome: 'Otimizador de Rede',
    posicao: { x: 850, y: 450 },
    niveis: [
      { 'Cobre Nativo': 4 },
      { 'Prata Condutora': 2 },
      { 'Liga Supercondutora': 2 },
    ],
    conversor: {
      reduzConsumoPercent: 0.1,
    },
    cor: '#c084fc',
  },
]
