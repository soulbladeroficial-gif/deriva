# Deriva — Documento de Design

> Documento vivo. Atualizado conforme as decisões de design são fechadas na conversa com o Claude Code.

## Lore

Planeta de origem destruído. O jogador está a bordo de uma nave rumo ao planeta habitável mais próximo.

## Loop de jogo

Dois loops conectados:

- **Nave** — gestão/construção: cuidar da saúde da nave, construir, melhorar ferramentas, consertar quando dá problema, gerenciar energia, se alimentar, beber água, investir em drones de coleta.
- **Planeta** — exploração: busca de recursos. O planeta em si é ilimitado, mas o oxigênio do traje do jogador não — isso é o que limita a exploração, não o tamanho do planeta. Pode ter monstros ou não; planetas variam em habitabilidade.

## Sessão

- Jogador define **duração da viagem** (= distância inicial até o destino) e **dificuldade** na criação da sessão.
- **Vitória**: chegar ao planeta destino.
- **Derrota**: morte do jogador (por causa do planeta ou de uma pane da nave).
- **Dormitório/cama**: avança o tempo instantaneamente até a próxima pane da nave — evita que o jogo fique repetitivo.

## Medidores (não-coletáveis)

| Medidor | Observação |
|---|---|
| Casco | Reparo é sempre uma ação manual do jogador, sempre possível se tiver peça. Pane só mata por negligência prolongada (avisa antes), não é súbita. |
| Energia | Watts gerados vs. usados, instantâneo — não existe bateria/armazenamento de energia. |
| Oxigênio da nave | Reserva enorme, quase nunca é um problema prático — é o orçamento de longo prazo da viagem toda. |
| Fome / Sede (jogador) | Saciados consumindo itens de comida/água do inventário (não são medidores próprios, dependem de itens). |
| Oxigênio do traje | Tanque pessoal do jogador — é o verdadeiro limite da exploração em planeta. Capacidade é um upgrade do Traje Espacial, não um item separado. |

## Navegação

- Tempo/distância até o destino é fixado na criação da sessão.
- Durante a viagem podem aparecer planetas próximos pra desviar e explorar.
- **Desviar não consome esse tempo** — o relógio da rota principal fica pausado durante o desvio.
- O jogador pode **abortar o desvio a qualquer momento**, sem precisar pousar, e voltar pra rota original.
- Depois de pousar e sair do planeta, volta automaticamente pra rota original.
- O **Scanner de Longo Alcance** (upgrade) mostra uma prévia do que o planeta próximo pode conter, antes de decidir desviar.

## Sistemas de fábrica

Vêm com a nave desde o início — **não se constroem, só se melhoram**.

- **Reator Principal** — gera a energia base da nave.
- **Estação de Recarga de Traje** — enche o tanque de O2 do traje do jogador, puxando do O2 da nave.
- **Estação de Drones** — os drones minerizam **asteroides soltos no espaço** durante a viagem (não precisam de planeta), consumindo energia pra operar. Upa por dois caminhos: (1) limite de drones (adiciona um novo), (2) melhorias **individuais** por drone — nunca "upa todos de uma vez". Algumas melhorias são gerais (velocidade, carga), outras especializam o que o drone traz (ex: focado em gelo, focado em minério raro). O painel mostra, de forma **visual/dinâmica** (não tabela), onde cada drone está, quanto tempo falta pra voltar, e quanta carga tem.

## Construções

O jogador constrói do zero. A maioria tem **níveis de upgrade** (1, 2, 3), cada nível pedindo um material específico.

### Energia
- **Gerador a Combustível** — queima combustível coletado; geração alta, limitada ao estoque.
- **Painel Solar** — passivo; eficiência varia com a proximidade de uma estrela na rota.
- **Otimizador de Rede** — não gera energia, reduz o consumo de todos os sistemas ligados.
- **Reator Auxiliar Avançado** — usa cristal de energia como combustível; output alto, caro de manter.

### Suporte de Vida
- **Eletrolisador** — água + energia → O2 da nave.
- **Biorreator de Algas** — biomassa + energia → O2 da nave; mais lento, não gasta água.
- **Derretedor de Gelo** — gelo espacial + energia → água.
- **Estufa/Hidroponia** — água + energia + tempo → comida.

### Fabricação
- **Oficina** — metal bruto → peças/componentes (insumo de reparo do casco e de upgrades).
- **Bancada de Upgrade** — peças + minério raro → aplica upgrade em ferramentas/traje/drones/torretas/blindagem (não gera item, só aplica efeito).
- **Triturador** — processa **itens exóticos** (achados/objetos estranhos, não minério comum) em uma quantidade fixa de outros itens. Ex: `1 Motor Velho → 2 Ferro-Níquel + 1 Titânio Bruto`. O resultado normalmente é Estrutural, mas pode ocasionalmente ser Energético ou Orgânico.
- *Em aberto*: automação entre bancadas (conectar output de uma direto no input de outra) — primeira ideia foi rejeitada, revisar depois.

### Defesa
- **Torreta Automática + Sistema de Mira Manual** — defesa híbrida contra chuva de asteroides (energia + munição); a automática cobre a maior parte, a mira manual reforça a eficácia.
- **Blindagem/Amortecedor** (construção única, não duas separadas) — upa vida máxima do casco e redução de dano recebido.

### Logística
- **Expansão do Porão de Carga** (nave) — mais armazenamento geral.
- **Expansão da Mochila** (jogador) — mais capacidade de carga durante exploração no planeta. Cria uma decisão real: mochila pequena = mais viagens de ida e volta à nave = mais risco de gastar oxigênio à toa.

### Propulsão/Navegação
- **Propulsor** — reduz o tempo de viagem.
- **Scanner de Longo Alcance** — prévia do que tem nos planetas próximos.

## Ferramentas pessoais

Equipamento do jogador, upa via Bancada de Upgrade.

- **Traje Espacial** — reduz consumo de O2 externo; a capacidade do tanque de O2 é um upgrade dele (não é item equipável separado).
- **Ferramenta de Coleta** — extrai matéria-prima no planeta. Upgrade: velocidade de coleta vs. consumo de energia do traje.
- **Scanner Pessoal** — diferente do Scanner de Longo Alcance (que é da nave); revela depósitos escondidos e perigos próximos dentro do planeta. Upgrade: raio de detecção.
- **Arma Pessoal** — combate contra monstros "de luta". Usa a **mesma munição da Torreta** — gastar bala em monstro é bala a menos pra defesa de asteroide (trade-off real).

## Planetas

- Cada planeta nasce de uma **classe/bioma**, que define: habitabilidade, pool de recursos possíveis, e tipo de perigo (sem monstro / monstro de fuga / monstro de combate).
- *Em aberto* — rascunho inicial de classes de planeta (não confirmado, só exemplo pra ilustrar a variedade pretendida): Rochoso Árido, Glacial, Vulcânico/Tóxico, Floresta Bioluminescente, Oceânico/Pântano, Deserto de Cristal.

## Materiais

### Estrutura (fechada)

- **4 categorias** (o que o material faz):
  - **Estrutural** — serve pra construir, melhorar ou criar coisa física.
  - **Orgânico** — mantém o jogador vivo (comida, água, biomassa).
  - **Energético** — vira combustível pras construções que geram energia.
  - **Exótico** — serve exclusivamente de input pro Triturador; são achados/objetos estranhos, não minério genérico.
- **6 classes de extração** (onde se encontra no planeta):
  - **Rochas** — depósitos minerais, minerados com a Ferramenta de Coleta.
  - **Vegetação** — plantas, fungos, esporos, colhidos.
  - **Fauna** — obtido de criaturas (caça ou coleta de restos).
  - **Gelo/Fluidos** — geleiras, poças, lagos congelados.
  - **Anomalias** — estruturas estranhas, destroços, fenômenos — fonte exclusiva do Exótico.
  - **Furos** — aberturas/fumarolas no chão que soltam gás continuamente; mais comuns em planetas de atmosfera densa.
- **Classes válidas por categoria**:
  - Estrutural → Rochas, Vegetação, Fauna
  - Orgânico → Vegetação, Fauna, Gelo/Fluidos
  - Energético → Rochas, Furos
  - Exótico → Anomalias (exclusivamente)
- Regra geral: um item pode servir pra mais de uma coisa; uma construção pode pedir mais de um tipo de item ao mesmo tempo.

### Itens definidos até agora

**Estrutural**

| Item | Classe | Raridade |
|---|---|---|
| Ferro-Níquel | Rochas | comum |
| Cobre Nativo | Rochas | comum |
| Titânio Bruto | Rochas | incomum |
| Tungstênio | Rochas | raro |
| Basalto Denso | Rochas | comum |
| Fibra Lenhosa | Vegetação | comum |
| Casca Fibrosa | Vegetação | comum |
| Resina Endurecida | Vegetação | incomum |
| Osso Denso | Fauna | comum |
| Couro Reforçado | Fauna | comum |
| Carapaça Quitinosa | Fauna | incomum |

**Orgânico, Energético, Exótico**: ainda não definidos — Estrutural foi a primeira categoria a ser detalhada.

## Pendências

- Mecânica de automação entre bancadas (ideia inicial rejeitada, revisar).
- Classes de planeta/bioma (só rascunho inicial, não confirmado).
- Itens Orgânicos, Energéticos e Exóticos específicos.
- Nomes e receitas específicas do Triturador (ex: quais itens exóticos existem e o que cada um gera).
