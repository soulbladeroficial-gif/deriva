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
| Vida do jogador | Reduzida por ataque de fauna agressiva. Chega a 0 = morte (a causa "pelo planeta" já prevista). Recupera descansando ou com item de cura. |

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
- **Propulsor** — reduz o tempo de viagem. (a nave já viaja desde o início, não tem como não ter propulsor)
- **Scanner de Longo Alcance** — prévia do que tem nos planetas próximos antes de decidir desviar. (idem — sem scanner não daria pra nem detectar os planetas no caminho)

## Construções

O jogador constrói do zero. A maioria tem **níveis de upgrade** (1, 2, 3), cada nível pedindo um material específico.

### Energia
- **Gerador a Combustível** — queima combustível coletado; geração alta, limitada ao estoque.
- **Painel Solar** — passivo; eficiência varia com a proximidade de uma estrela na rota.
- **Otimizador de Rede** — não gera energia, reduz o consumo de todos os sistemas ligados.
- **Reator Auxiliar Avançado** — queima qualquer combustível, output alto; alguns combustíveis dão bônus de energia específicos dele.
- **Reator Nuclear** — único caso exclusivo do jogo: só funciona com Urânio, nenhum outro combustível serve nele.

### Suporte de Vida
- **Eletrolisador** — água + energia → O2 da nave.
- **Biorreator de Algas** — biomassa + energia → O2 da nave; mais lento, não gasta água.
- **Derretedor de Gelo** — gelo espacial + energia → água.
- **Estufa/Hidroponia** — água + energia + tempo → comida.
- **Geladeira** — reduz a velocidade de vencimento dos alimentos perecíveis armazenados; cada nível reduz mais (N1 pouco, N3 quase trava o vencimento).
- **Fornalha** — processa um alimento cru perecível + combustível em uma versão "preparada": mais saciedade e para de vencer (ou vence muito mais devagar). Funciona com qualquer um dos 3 perecíveis, não só carne.

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

## Ferramentas pessoais

Equipamento do jogador, upa via Bancada de Upgrade. Todas têm **5 níveis** (são intrínsecas ao usuário, não construções da nave).

- **Traje Espacial** — reduz consumo de O2 externo; a capacidade do tanque de O2 é um upgrade dele (não é item equipável separado). Leva dano quando o jogador é atacado por fauna agressiva — isso piora o consumo de O2 até ser reparado (Oficina/Bancada).
- **Ferramenta de Coleta** — extrai matéria-prima de Rochas, Vegetação e Gelo/Fluidos. **Não é necessária pra Fauna** — matar o animal já dá o material direto. Upgrade: velocidade de coleta vs. consumo de energia do traje.
- **Scanner Pessoal** — diferente do Scanner de Longo Alcance (que é da nave); revela depósitos escondidos e perigos próximos dentro do planeta. Upgrade: raio de detecção.
- **Extrator de Gás** — ferramenta dedicada à classe Furos, pra coletar gás com segurança.
- **Armas pessoais** (3 tipos, não precisam ser construídas no início — o jogador não começa com elas):
  - **Faca** — corpo a corpo, não gasta munição, mas precisa chegar perto (mais risco de levar dano).
  - **Arma de Choque** — não mata, só atordoa/afasta; boa contra fauna passiva ou pra evitar luta. Usa carga própria, não munição.
  - **Rifle** — arma de verdade contra fauna agressiva; usa a **mesma munição da Torreta** — gastar bala em combate é bala a menos pra defesa de asteroide (trade-off real).

**Gear inicial**: o jogador já começa com Traje Espacial, Ferramenta de Coleta, Scanner Pessoal e Extrator de Gás em nível 1. As 3 armas precisam ser construídas durante o jogo.

## Planetas

- Cada planeta nasce de uma **classe/bioma**, que define: habitabilidade, pool de recursos possíveis, e tipo de fauna (sem fauna / fauna passiva / fauna agressiva). Passiva não ataca (pode fugir ou não); agressiva ataca e reduz a Vida do jogador.
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

**Coleta por classe**

| Classe | Item usado pra coletar |
|---|---|
| Rochas | Ferramenta de Coleta |
| Vegetação | Ferramenta de Coleta |
| Fauna | Combate (Faca/Arma de Choque/Rifle) — não precisa de Ferramenta de Coleta |
| Gelo/Fluidos | Ferramenta de Coleta |
| Furos | Extrator de Gás |
| Anomalias | Nenhum item necessário — só precisa encontrar (Scanner Pessoal ajuda a localizar) |

### Itens definidos até agora

**Estrutural** (fechado)

| Material | Classe | Raridade |
|---|---|---|
| Ferro-Níquel | Rochas | comum |
| Cobre Nativo | Rochas | comum |
| Basalto Denso | Rochas | comum |
| Prata Condutora | Rochas | incomum |
| Alumínio Purificado | Rochas | incomum |
| Aço Temperado | Rochas | incomum |
| Titânio Bruto | Rochas | incomum |
| Liga de Impulso | Rochas | incomum |
| Liga Supercondutora | Rochas | raro |
| Liga Anticorrosiva | Rochas | raro |
| Tungstênio | Rochas | raro |
| Liga Blindada | Rochas | raro |
| Núcleo de Impulso Avançado | Rochas | raro |
| Fibra Lenhosa | Vegetação | comum |
| Casca Fibrosa | Vegetação | comum |
| Resina Endurecida | Vegetação | incomum |
| Seiva Cristalizada | Vegetação | raro |
| Osso Denso | Fauna | comum |
| Couro Reforçado | Fauna | comum |
| Carapaça Quitinosa | Fauna | incomum |
| Escama Blindada | Fauna | raro |

**Orgânico** (fechado)

| Material | Classe | Perecível? | Uso |
|---|---|---|---|
| Biomassa Comum | Vegetação | não | comida básica; alimenta o Biorreator de Algas |
| Fruta Silvestre | Vegetação | sim | comida, mais saciedade que Raiz Fibrosa |
| Raiz Fibrosa | Vegetação | não | comida, sacia menos |
| Esporo Nutritivo | Vegetação | não | comida de alto valor |
| Proteína de Caça | Fauna (só planeta c/ fauna) | sim | comida de alto valor |
| Gordura Animal | Fauna | não | comida de reserva |
| Ovo/Ninhada | Fauna | sim | raro, alto valor nutricional |
| Água Pura | Gelo/Fluidos | não | sacia sede; alimenta Eletrolisador e Estufa |
| Gelo Comum | Gelo/Fluidos | não | derrete no Derretedor de Gelo → Água Pura |
| Água Mineral | Gelo/Fluidos | não | sacia mais sede por unidade |

**Processados na Fornalha** (perecível + combustível → versão preparada, sem vencimento/vence bem mais devagar, mais saciedade):
- Proteína de Caça → Proteína Preparada
- Ovo/Ninhada → Ovo Cozido
- Fruta Silvestre → Fruta Desidratada

**Energético** (fechado)

Regra geral: qualquer combustível funciona em qualquer construção que precise de combustível (Gerador a Combustível, Reator Auxiliar Avançado, Fornalha, Estação de Drones). A única exceção do jogo é o **Urânio, exclusivo do Reator Nuclear**. Fora isso, o que muda de um combustível pro outro é a duração (estoque próprio do item) e, em alguns casos, um bônus de energia específico pra um local.

| Material | Classe | Raridade | Duração | Bônus |
|---|---|---|---|---|
| Metano Bruto | Furos | comum | 6 | — |
| Hidrogênio Gasoso | Furos | comum | 10 | — |
| Minério Fissionável | Rochas | incomum | 20 | — |
| Hidrogênio Pressurizado | Furos | incomum | 14 | — |
| Nitrogênio Comprimido | Furos | incomum | 12 | +15% energia no Gerador a Combustível |
| Cristal de Energia | Rochas | raro | 26 | +20% energia no Reator Auxiliar Avançado |
| Plasma Condensado | Furos | raro | 18 | +20% energia no Gerador a Combustível |
| Octano | Furos | raro | 16 | +20% de produtividade na Estação de Drones |
| Urânio | Rochas | raro | 30 | **exclusivo do Reator Nuclear** — não funciona em mais nada |
| Pó de Tório | Rochas | muito raro | 32 | +35% energia no Reator Auxiliar Avançado |

**Exótico** (fechado)

Achados/objetos estranhos da classe Anomalias, só servem de input pro Triturador. Saída normalmente Estrutural, às vezes Energético ou Orgânico (marcado como exceção).

| Item exótico | Raridade | Vira no Triturador |
|---|---|---|
| Motor Velho | comum | 2 Ferro-Níquel + 1 Titânio Bruto |
| Caixa de Ferramentas Enferrujada | comum | 3 Ferro-Níquel + 1 Aço Temperado |
| Painel de Casco Amassado | comum | 2 Basalto Denso + 1 Ferro-Níquel |
| Cabo Elétrico Emaranhado | comum | 2 Cobre Nativo |
| Suporte Metálico Quebrado | comum | 2 Ferro-Níquel |
| Carcaça de Equipamento | comum | 2 Basalto Denso + 1 Cobre Nativo |
| Tanque Vazio Amassado | comum | 2 Ferro-Níquel + 1 Basalto Denso |
| Engrenagem Enferrujada | comum | 1 Aço Temperado + 1 Ferro-Níquel |
| Tubulação Entortada | comum | 2 Cobre Nativo + 1 Ferro-Níquel |
| Placa de Revestimento Rachada | comum | 2 Basalto Denso |
| Núcleo de Drone Abandonado | incomum | 1 Liga de Impulso + 1 Carapaça Quitinosa |
| Gerador Portátil Danificado | incomum | 1 Prata Condutora + 1 Ferro-Níquel |
| Filtro de Ar Entupido | incomum | 1 Alumínio Purificado |
| Caixa de Ferramentas Avançada | incomum | 1 Aço Temperado + 1 Titânio Bruto |
| Capacete de Traje Rasgado | incomum | 1 Carapaça Quitinosa + 1 Couro Reforçado |
| Sensor Quebrado | incomum | 1 Liga de Impulso |
| Compartimento Selado | incomum | 1 Resina Endurecida + 1 Titânio Bruto |
| Recipiente Pressurizado | incomum | 1 Nitrogênio Comprimido *(exceção: Energético)* |
| Contêiner Biológico Vazado | incomum | 1 Biomassa Comum + 1 Água Pura *(exceção: Orgânico)* |
| Antena Dessincronizada | incomum | 1 Prata Condutora + 1 Cobre Nativo |
| Fragmento de Casco Blindado | raro | 1 Liga Blindada + 1 Escama Blindada |
| Bateria Alienígena | raro | 2 Cristal de Energia *(exceção: Energético)* |
| Cápsula Criogênica | raro | 2 Água Pura + 1 Biomassa Comum *(exceção: Orgânico)* |
| Núcleo de Reator Fragmentado | raro | 1 Liga Supercondutora |
| Casco de Sonda Estranha | raro | 1 Liga de Impulso + 1 Núcleo de Impulso Avançado |
| Amostra de Liga Desconhecida | raro | 2 Titânio Bruto + 1 Liga Anticorrosiva |
| Tanque de Combustível Intacto | raro | 1 Plasma Condensado *(exceção: Energético)* |
| Artefato Anômalo Pulsante | muito raro | 1 Pó de Tório *(exceção: Energético)* |
| Núcleo de Máquina Desconhecida | muito raro | 2 Liga Supercondutora + 1 Liga Blindada |
| Casulo Biológico Selado | muito raro | 2 Esporo Nutritivo + 1 Seiva Cristalizada *(exceção: Orgânico)* |

## Receitas de construção (Estrutural)

Cada categoria de construção tem sua própria "linha" de material incomum/raro, pra não convergir tudo nos mesmos 2 itens. Construções que vêm de fábrica (sem "Construir") só têm custo de upgrade.

| Construção | Construir | N2 | N3 |
|---|---|---|---|
| Gerador a Combustível | Ferro-Níquel + Basalto Denso | Prata Condutora | Liga Supercondutora |
| Painel Solar | Cobre Nativo + Ferro-Níquel + Fibra Lenhosa | Prata Condutora | Liga Supercondutora |
| Otimizador de Rede | Cobre Nativo | Prata Condutora | Liga Supercondutora |
| Reator Auxiliar Avançado | Ferro-Níquel + Prata Condutora | Liga Supercondutora | 2x Liga Supercondutora + Seiva Cristalizada |
| Reator Principal (fábrica) | — | Prata Condutora | Liga Supercondutora |
| Reator Nuclear | Ferro-Níquel + Prata Condutora | Liga Supercondutora | 2x Liga Supercondutora |
| Eletrolisador | Ferro-Níquel + Cobre Nativo | Alumínio Purificado + Resina Endurecida | Liga Anticorrosiva |
| Derretedor de Gelo | Ferro-Níquel + Basalto Denso | Alumínio Purificado | Liga Anticorrosiva |
| Estação de Recarga de Traje (fábrica) | — | Alumínio Purificado | Liga Anticorrosiva |
| Oficina | Ferro-Níquel + Basalto Denso | Aço Temperado | Tungstênio |
| Bancada de Upgrade | Ferro-Níquel + Cobre Nativo | Aço Temperado | Tungstênio |
| Triturador | Ferro-Níquel + Osso Denso | Aço Temperado + Carapaça Quitinosa | Tungstênio + Escama Blindada |
| Torreta (Auto + Mira Manual) | Ferro-Níquel + Titânio Bruto | Titânio Bruto | Liga Blindada |
| Blindagem/Amortecedor | Couro Reforçado + Osso Denso | Carapaça Quitinosa | Escama Blindada |
| Expansão do Porão | Basalto Denso + Ferro-Níquel + Casca Fibrosa | Titânio Bruto | Liga Blindada |
| Expansão da Mochila | Couro Reforçado + Osso Denso | Carapaça Quitinosa | Escama Blindada |
| Propulsor (fábrica) | — | Liga de Impulso | Núcleo de Impulso Avançado |
| Scanner de Longo Alcance (fábrica) | — | Liga de Impulso + Couro Reforçado | Núcleo de Impulso Avançado |
| Estação de Drones (limite, fábrica) | — | Liga de Impulso + Carapaça Quitinosa | Núcleo de Impulso Avançado + Escama Blindada + Liga Blindada |
| Biorreator de Algas | Fibra Lenhosa + Casca Fibrosa | Resina Endurecida | Seiva Cristalizada |
| Estufa/Hidroponia | Fibra Lenhosa + Casca Fibrosa | Resina Endurecida + Fibra Lenhosa | Seiva Cristalizada |
| Geladeira | Ferro-Níquel + Cobre Nativo | Alumínio Purificado | Liga Anticorrosiva |
| Fornalha | Ferro-Níquel + Basalto Denso | Alumínio Purificado | Liga Anticorrosiva |

## Receitas de ferramentas pessoais (Estrutural)

5 níveis (Construir + N2 a N5), sem item novo — N2/N3 usam 1x/2x do incomum da linha, N4/N5 usam 1x/2x do raro.

| Ferramenta | Construir | N2 | N3 | N4 | N5 |
|---|---|---|---|---|---|
| Traje Espacial | 3 Couro Reforçado + 2 Osso Denso | 1 Carapaça Quitinosa | 2 Carapaça Quitinosa | 1 Escama Blindada | 2 Escama Blindada |
| Ferramenta de Coleta | 3 Ferro-Níquel + 2 Basalto Denso | 1 Aço Temperado | 2 Aço Temperado | 1 Tungstênio | 2 Tungstênio |
| Scanner Pessoal | 2 Cobre Nativo + 2 Ferro-Níquel | 1 Liga de Impulso | 2 Liga de Impulso | 1 Núcleo de Impulso Avançado | 2 Núcleo de Impulso Avançado |
| Extrator de Gás | 3 Ferro-Níquel + 2 Cobre Nativo | 1 Alumínio Purificado | 2 Alumínio Purificado | 1 Liga Anticorrosiva | 2 Liga Anticorrosiva |
| Faca | 2 Ferro-Níquel + 1 Osso Denso | 1 Titânio Bruto | 2 Titânio Bruto | 1 Liga Blindada | 2 Liga Blindada |
| Arma de Choque | 2 Cobre Nativo + 2 Ferro-Níquel | 1 Prata Condutora | 2 Prata Condutora | 1 Liga Supercondutora | 2 Liga Supercondutora |
| Rifle | 3 Ferro-Níquel + 2 Titânio Bruto | 1 Titânio Bruto | 2 Titânio Bruto | 1 Liga Blindada | 2 Liga Blindada |

## Pendências

- Mecânica de automação entre bancadas (ideia inicial rejeitada, revisar).
- Classes de planeta/bioma (só rascunho inicial, não confirmado).
