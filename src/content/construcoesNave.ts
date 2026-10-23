import type { ConversorSpec } from '../systems/conversor'

export interface NivelCusto {
  [item: string]: number
}

/** receita de fabricação: ação discreta (botão "Criar"), diferente do conversor contínuo */
export interface CraftRecipe {
  custoBuffer: number
  produzItem: string
  produzQtd: number
}

export interface ConstrucaoDef {
  id: string
  nome: string
  /** niveis[0] = custo pra criar (nível 1), niveis[1] = custo pra upar pra nível 2, niveis[2] = custo pra upar pra nível 3 */
  niveis: NivelCusto[]
  conversor?: ConversorSpec
  cor: string
  /** se true, não precisa de Bancada de Upgrade instalada pra evoluir de nível (caso da própria Bancada) */
  bancada?: boolean
  /** capacidade do estoque próprio pro material de entrada (só relevante se tiver insumo, via conversor ou craft) */
  capacidadeBuffer?: number
  /** item que essa construção aceita no estoque próprio, quando não é o mesmo do conversor (ex: Oficina) */
  insumo?: { item: string }
  /** receita de fabricação sob demanda (ex: Oficina: deposita Ferro-Níquel, clica "Criar Peças") */
  craft?: CraftRecipe
  /** já vem colocada na nave desde o início, não entra no catálogo de "Criar" (caso da Bancada de Fabricação) */
  inicial?: boolean
}

export const CAPACIDADE_BUFFER_PADRAO = 10
export const BANCADA_FABRICACAO_ID = 'bancadaFabricacao'

export const CONSTRUCOES: ConstrucaoDef[] = [
  {
    id: BANCADA_FABRICACAO_ID,
    nome: 'Bancada de Fabricação',
    niveis: [{}],
    cor: '#92400e',
    inicial: true,
  },
  // Suporte de Vida
  {
    id: 'eletrolisador',
    nome: 'Eletrolisador',
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
  // Fabricação
  {
    id: 'oficina',
    nome: 'Oficina',
    niveis: [
      { 'Ferro-Níquel': 4, 'Basalto Denso': 2 },
      { 'Aço Temperado': 2 },
      { Tungstênio: 2 },
    ],
    insumo: { item: 'Ferro-Níquel' },
    craft: { custoBuffer: 2, produzItem: 'Peças', produzQtd: 1 },
    cor: '#f97316',
  },
  {
    id: 'triturador',
    nome: 'Triturador',
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
    niveis: [
      { 'Ferro-Níquel': 3, 'Cobre Nativo': 2 },
      { 'Aço Temperado': 2 },
      { Tungstênio: 2 },
    ],
    cor: '#a3a3a3',
    bancada: true,
  },
  // Energia
  {
    id: 'geradorCombustivel',
    nome: 'Gerador a Combustível',
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
