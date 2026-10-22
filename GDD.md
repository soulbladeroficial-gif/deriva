# Deriva — Documento de Design

> Documento vivo. Atualizado conforme as decisões de design são fechadas na conversa com o Claude Code.

## Lore

Planeta de origem destruído. O jogador está a bordo de uma nave rumo ao planeta habitável mais próximo.

## Loop de jogo

Dois loops conectados:

- **Nave** — gestão/construção: cuidar da saúde da nave, construir, melhorar ferramentas, consertar quando dá problema, gerenciar energia, se alimentar, beber água, investir em drones de coleta.
- **Planeta** — exploração: busca de recursos. O planeta em si é ilimitado, mas o oxigênio do traje do jogador não — isso é o que limita a exploração, não o tamanho do planeta. Pode ter fauna (passiva ou agressiva) ou não; planetas variam em habitabilidade.

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
| Fome / Sede (jogador) | Sobem com o tempo; saciados consumindo itens de comida/água do inventário. |
| Oxigênio do traje | Tanque pessoal do jogador — é o verdadeiro limite da exploração em planeta. Capacidade é um upgrade do Traje Espacial, não um item separado. |
| Vida do jogador | Reduzida por ataque de fauna agressiva. Chega a 0 = morte (a causa "pelo planeta" já prevista). Recupera descansando (Dormitório) ou consumindo **Erva Medicinal** (item de cura — ver Materiais Orgânicos). |

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
- **Estação de Drones** — os drones minerizam **asteroides soltos no espaço** durante a viagem (não precisam de planeta), consumindo energia pra operar. Também aceita **qualquer combustível como opcional** (mesma regra universal dos outros consumidores de combustível), e o Octano especificamente dá bônus de produtividade aqui (ver Materiais Energéticos). Upa por dois caminhos: (1) limite de drones (adiciona um novo), (2) melhorias **individuais** por drone — nunca "upa todos de uma vez". Algumas melhorias são gerais (velocidade, carga), outras especializam o que o drone traz (ex: focado em gelo, focado em minério raro). O painel mostra, de forma **visual/dinâmica** (não tabela), onde cada drone está, quanto tempo falta pra voltar, e quanta carga tem.
- **Propulsor** — reduz o tempo de viagem. (a nave já viaja desde o início, não tem como não ter propulsor)
- **Scanner de Longo Alcance** — prévia do que tem nos planetas próximos antes de decidir desviar. (idem — sem scanner não daria pra nem detectar os planetas no caminho). Progressão por nível:
  - N1 (base): só detecta que existe um planeta próximo, sem detalhe.
  - N2: revela a classe do planeta (bioma) e a habitabilidade.
  - N3: revela também quais classes de extração estão presentes e o tipo de fauna (sem/passiva/agressiva). Exceção: planeta **Híbrido** nunca revela a combinação exata, só o rótulo "Híbrido" — mesmo em N3.

## Construções

O jogador constrói do zero. A maioria tem **níveis de upgrade** (1, 2, 3), cada nível pedindo um ou mais materiais específicos, em quantidade definida (ver receitas completas mais abaixo).

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
- Sem automação entre bancadas — o jogador sempre carrega o item manualmente de uma construção pra outra.

### Defesa
- **Torreta Automática + Sistema de Mira Manual** — defesa híbrida contra chuva de asteroides (energia + munição); a automática cobre a maior parte, a mira manual reforça a eficácia.
- **Blindagem/Amortecedor** (construção única, não duas separadas) — upa vida máxima do casco e redução de dano recebido.

### Logística
- **Expansão do Porão de Carga** (nave) — mais armazenamento geral.
- **Expansão da Mochila** (jogador) — mais capacidade de carga durante exploração no planeta. Cria uma decisão real: mochila pequena = mais viagens de ida e volta à nave = mais risco de gastar oxigênio à toa.

## Ferramentas pessoais

Equipamento do jogador, upa via Bancada de Upgrade. Todas têm **5 níveis** (são intrínsecas ao usuário, não construções da nave).

- **Traje Espacial** — reduz consumo de O2 externo; a capacidade do tanque de O2 é um upgrade dele (não é item equipável separado). Leva dano quando o jogador é atacado por fauna agressiva — isso piora o consumo de O2 até ser reparado. Reparo usa os mesmos materiais do nível atual do Traje (a linha Fauna da tabela de receitas), não é uma receita separada.
- **Ferramenta de Coleta** — extrai matéria-prima de Rochas, Vegetação e Gelo/Fluidos. **Não é necessária pra Fauna** — matar o animal já dá o material direto. Upgrade: velocidade de coleta vs. consumo de energia do traje.
- **Scanner Pessoal** — diferente do Scanner de Longo Alcance (que é da nave); revela depósitos escondidos e perigos próximos dentro do planeta. Progressão por nível:
  - N1: detecta depósitos de recurso em alcance curto.
  - N2: aumenta o alcance de detecção de recurso.
  - N3: passa a detectar também fauna próxima (perigo) dentro do alcance.
  - N4: aumenta ainda mais o alcance e passa a detectar Anomalias (mais raras/escondidas).
  - N5: alcance máximo; mostra densidade aproximada do que foi detectado.
- **Extrator de Gás** — ferramenta dedicada à classe Furos, pra coletar gás com segurança.
- **Armas pessoais** (3 tipos, não precisam ser construídas no início — o jogador não começa com elas):
  - **Faca** — corpo a corpo, não gasta munição, mas precisa chegar perto (mais risco de levar dano).
  - **Arma de Choque** — não mata, só atordoa/afasta; boa contra fauna passiva ou pra evitar luta. Usa carga própria, não munição.
  - **Rifle** — arma de verdade contra fauna agressiva; usa a **mesma munição da Torreta** — gastar bala em combate é bala a menos pra defesa de asteroide (trade-off real).

**Gear inicial**: o jogador já começa com Traje Espacial, Ferramenta de Coleta, Scanner Pessoal e Extrator de Gás em nível 1. As 3 armas precisam ser construídas durante o jogo.

## Planetas

- Cada planeta nasce de uma **classe/bioma**, que define: habitabilidade, pool de recursos possíveis, tipo de fauna, estilo de geração de terreno e estruturas típicas.
- Fauna: sem fauna / passiva (não ataca, pode fugir ou não) / agressiva (ataca, reduz a Vida do jogador).
- **Fauna agressiva** segue um modelo base de 3 stats: **Vida** (quanto aguenta até morrer), **Dano** (quanto tira da Vida do jogador por ataque) e **Comportamento** (persegue ao avistar / emboscada quando o jogador se aproxima demais / territorial, só ataca se o jogador entrar numa área). Os números específicos de cada espécie ficam pra quando formos balancear o combate de verdade.
- Assim como o planeta, a fauna tem **design visual e cor próprios por classe**, com a cor variando por instância (mesma lógica da seed dos planetas) pra nenhum encontro parecer repetido.
- Jogo é **2D com movimentação livre**. Terreno gerado em malha de blocos: **Obstáculo** (impede passagem — montanha, construção), **Chão** (livre acesso), **Nado** (água — rio, lago), **Abismo** (morte — queda, lava).
- Cada planeta tem sua própria **seed**, gerando terreno único mesmo entre planetas da mesma classe. Cada classe tem textura/design próprios; a cor varia por instância pra reforçar a sensação de novidade a cada visita.

### Fauna por classe de planeta

Das 15 classes, 14 têm algum tipo de fauna — só Deserto de Gelo Seco não tem nenhuma. Dessas 14, 12 dão material ao abater (fauna passiva sempre dá; a agressiva geralmente também, exceto Glacial e Vulcânico/Tóxico, que são perigo puro sem loot). Habitabilidade ruim → fauna mais forte (reforça o risco do ambiente); habitabilidade boa → fauna mais fraca ou majoritariamente passiva (compensa o ambiente amigável). Comportamento reflete o terreno: campo aberto = persegue, água/escuro = emboscada, território de recurso raro = territorial.

| Classe | Comportamento (agressiva) | Força | Design visual | Nota |
|---|---|---|---|---|
| Rochoso Árido | — | — | Pequenos répteis/insetos cor de terra, camuflados nas pedras | Só passiva, ocasional |
| Montanhas Metálicas | — | — | Aves/cabras de montanha adaptadas à altitude, pelagem clara | Só passiva |
| Glacial | Persegue | Alta | Predador branco de grande porte, adaptado ao gelo | Agressiva sem loot — perigo puro |
| Vulcânico/Tóxico | Território/Persegue | Alta | Criatura de pele escamosa/resistente a calor, tons escuros | Agressiva sem loot — perigo puro |
| Tundra Ventosa | Persegue | Média-alta | Pelagem grossa, corpo robusto e baixo (resiste ao vento) | — |
| Savana Radioativa | Territorial/Persegue | Alta | Mutações visíveis: manchas luminescentes, deformidades leves | Guarda a área contaminada |
| Floresta Bioluminescente | Emboscada | Média | Padrões bioluminescentes na pele, camuflagem na vegetação | Passiva não percebe até perto |
| Planície Fúngica | — | — | Textura esponjosa/coberta de esporo, cores suaves | Passiva majoritária |
| Oceânico/Pântano | Emboscada | Alta | Pele viscosa/escamosa, cores escuras (camuflagem na água/lama) | — |
| Arquipélago Tempestuoso | Persegue | Média | Plumagem adaptada a vento/água, cores vibrantes | Passiva são aves calmas |
| Caverna Subterrânea | Territorial/Emboscada | Alta | Sem olhos (ou atrofiados), pele pálida/translúcida | Adaptado ao escuro total |
| Recife Flutuante | Persegue | Média | Corpo leve/aerodinâmico, membranas pra planar, cores vivas | Passiva são voadores pacíficos |
| Deserto de Cristal | — | — | Criatura pequena, corpo semi-translúcido (camuflagem com o cristal) | Só passiva, rara |
| Ruínas Ancestrais | — | — | Pequenos animais que colonizaram as ruínas, pelagem acinzentada | Só passiva, rara |

### 15 classes de planeta

Nota: fauna **passiva** sempre dá material ao ser abatida. Só fauna **agressiva** pode não entrar na lista de "Extração presente" — é proposital, nesses casos o bicho é perigo puro, sem recompensa (Glacial e Vulcânico/Tóxico).

| # | Classe | Habitabilidade | Extração presente | Fauna |
|---|---|---|---|---|
| 1 | Rochoso Árido | Média | Rochas (abundante), Furos (ocasional), Anomalias (raro), Fauna (rara) | Passiva ocasional |
| 2 | Montanhas Metálicas | Média | Rochas (muito abundante), Furos (raro), Anomalias (incomum), Fauna (incomum) | Passiva |
| 3 | Glacial | Baixa | Gelo/Fluidos (abundante), Rochas (comum), Anomalias (raro) | Agressiva |
| 4 | Deserto de Gelo Seco | Péssima | Gelo/Fluidos (abundante), Rochas (raro), Anomalias (raro) | Sem fauna |
| 5 | Tundra Ventosa | Média-baixa | Gelo/Fluidos (comum), Vegetação (incomum), Fauna | Agressiva |
| 6 | Vulcânico/Tóxico | Péssima | Furos (abundante), Rochas densas (incomum), Anomalias (incomum) | Agressiva |
| 7 | Savana Radioativa | Baixa | Rochas radioativas (incomum), Vegetação mutada (incomum), Fauna | Agressiva |
| 8 | Deserto de Cristal | Média-baixa | Rochas cristalinas (raras), Anomalias (comum), Fauna (rara) | Sem fauna/passiva rara |
| 9 | Floresta Bioluminescente | Alta | Vegetação (abundante), Fauna (abundante), Gelo/Fluidos (comum) | Mista |
| 10 | Planície Fúngica | Alta | Vegetação (abundante), Fauna (comum), Furos (ocasional) | Passiva majoritária |
| 11 | Oceânico/Pântano | Média | Gelo/Fluidos (abundante), Vegetação (comum), Fauna (comum) | Agressiva |
| 12 | Arquipélago Tempestuoso | Média | Gelo/Fluidos (abundante), Furos (comum), Fauna | Mista |
| 13 | Caverna Subterrânea | Baixa | Rochas (abundante), Anomalias (comum), Fauna | Agressiva |
| 14 | Ruínas Ancestrais | Média | Anomalias (muito abundante), Rochas (comum), Vegetação (rara), Fauna (rara) | Passiva rara |
| 15 | Recife Flutuante | Alta | Vegetação (abundante), Fauna (abundante), Furos (raro) | Mista |

### Distribuição por classe de extração

Em quantas das 15 classes de planeta cada classe de extração aparece:

| Classe de extração | Aparece em |
|---|---|
| Rochas | 9 |
| Fauna | 12 |
| Anomalias | 8 |
| Vegetação | 7 |
| Gelo/Fluidos | 6 |
| Furos | 6 |

### Padrão espacial por classe de extração (dentro de um planeta)

| Classe de extração | Padrão espacial |
|---|---|
| Rochas | Em veios/clusters concentrados em formações específicas (paredes, afloramentos) |
| Vegetação | Em manchas de densidade média, cobre regiões do mapa, não o mapa inteiro |
| Fauna | Móvel, não é um nó fixo — aparece perto de área compatível (água/vegetação) |
| Gelo/Fluidos | Concentrado em corpos (lagos, geleiras, rios) — precisa achar a fonte |
| Furos | Pontos isolados espalhados pelo mapa, raramente agrupados |
| Anomalias | Pontos fixos espalhados pelo planeta, nunca dois próximos — distância mínima obrigatória entre eles |

### Estilo de geração e estruturas típicas

| # | Classe | Obstáculo | Chão | Nado | Abismo | Estruturas típicas |
|---|---|---|---|---|---|---|
| 1 | Rochoso Árido | Médio | Alto | — | Raro | Cânions, arcos de pedra, crateras |
| 2 | Montanhas Metálicas | Alto | Médio | — | Ocasional | Picos afiados, vetas expostas, desfiladeiros |
| 3 | Glacial | Médio | Médio | Sim | Ocasional | Fiordes, cavernas de gelo, icebergs encalhados |
| 4 | Deserto de Gelo Seco | Baixo | Muito alto | — | Raríssimo | Dunas de gelo seco, rachaduras longas |
| 5 | Tundra Ventosa | Baixo | Alto | Ocasional | Raro | Afloramentos isolados, vales rasos |
| 6 | Vulcânico/Tóxico | Alto | Baixo | — | Alto (lava) | Respiradouros ativos, lagos de lava, obsidiana |
| 7 | Savana Radioativa | Médio | Alto | — | Raro | Rachaduras luminescentes, crateras antigas |
| 8 | Deserto de Cristal | Médio | Médio | — | Raro | Dunas de cristal, campos de ressonância |
| 9 | Floresta Bioluminescente | Alto | Médio | Sim | Raro | Clareiras luminosas, raízes gigantes |
| 10 | Planície Fúngica | Médio | Alto | Ocasional | Raríssimo | Colônias de fungo gigante, nuvens de esporo |
| 11 | Oceânico/Pântano | Baixo | Baixo | Muito alto | Raro | Manguezais, ilhotas alagadas |
| 12 | Arquipélago Tempestuoso | Baixo | Médio | Muito alto | — | Ilhas dispersas, gêiseres marinhos |
| 13 | Caverna Subterrânea | Alto | Médio | Ocasional | Alto | Salões de cristal, poços, lagos subterrâneos |
| 14 | Ruínas Ancestrais | Médio-alto | Médio | Raro | Ocasional | Torres caídas, portais quebrados, câmaras seladas |
| 15 | Recife Flutuante | Baixo | Médio | — | Muito alto | Ilhas flutuantes, abismos, pontes naturais |

### Variedade dentro da mesma classe

- **Paleta variável** — cor/clima leve sorteado por planeta, mesma classe nunca parece idêntica visualmente.
- **Evento único por visita** — cada planeta sorteia 1-2 eventos que não fazem parte da classe (tempestade passageira, migração de fauna, anomalia temporária).
- **Densidade variável** — dois planetas da mesma classe têm proporções diferentes das classes de extração presentes.
- **Escala variável** — o mesmo bioma pode gerar compacto ou vasto, mudando quanto O2 é preciso pra explorar fundo.

### Planetas Híbridos

Classificação própria (não uma das 15), ~3-5% de chance em qualquer planeta gerado durante a viagem.

- Sorteia **2 das 15 classes**, aleatoriamente, sem restrição de vizinhança.
- Recursos: união das classes de extração dos 2 sorteados, cada uma com metade da densidade normal.
- Fauna: a mais perigosa entre as duas.
- Habitabilidade: a pior entre as duas.
- Terreno: mistura dos dois perfis de blocos (Obstáculo/Chão/Nado/Abismo).
- Estruturas típicas: pool combinado dos dois.
- **Elemento surpresa**: o jogo só identifica o planeta como "Híbrido" — nem o Scanner de Longo Alcance revela quais 2 classes foram combinadas. Só se descobre pousando e explorando.

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
  - **Furos** — aberturas/fumarolas no chão que soltam gás continuamente.
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
| Erva Medicinal | Vegetação | não | item de cura — consumida diretamente, recupera Vida do jogador |

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
| Gerador a Combustível | 3 Ferro-Níquel + 2 Basalto Denso | 2 Prata Condutora | 2 Liga Supercondutora |
| Painel Solar | 2 Cobre Nativo + 2 Ferro-Níquel + 1 Fibra Lenhosa | 2 Prata Condutora | 2 Liga Supercondutora |
| Otimizador de Rede | 4 Cobre Nativo | 2 Prata Condutora | 2 Liga Supercondutora |
| Reator Auxiliar Avançado | 3 Ferro-Níquel + 2 Prata Condutora | 2 Liga Supercondutora | 2 Liga Supercondutora + 1 Seiva Cristalizada |
| Reator Principal (fábrica) | — | 2 Prata Condutora | 2 Liga Supercondutora |
| Reator Nuclear | 3 Ferro-Níquel + 2 Prata Condutora | 2 Liga Supercondutora | 2 Liga Supercondutora |
| Eletrolisador | 3 Ferro-Níquel + 2 Cobre Nativo | 2 Alumínio Purificado + 1 Resina Endurecida | 2 Liga Anticorrosiva |
| Derretedor de Gelo | 3 Ferro-Níquel + 2 Basalto Denso | 2 Alumínio Purificado | 2 Liga Anticorrosiva |
| Estação de Recarga de Traje (fábrica) | — | 2 Alumínio Purificado | 2 Liga Anticorrosiva |
| Oficina | 4 Ferro-Níquel + 2 Basalto Denso | 2 Aço Temperado | 2 Tungstênio |
| Bancada de Upgrade | 3 Ferro-Níquel + 2 Cobre Nativo | 2 Aço Temperado | 2 Tungstênio |
| Triturador | 3 Ferro-Níquel + 2 Osso Denso | 2 Aço Temperado + 1 Carapaça Quitinosa | 2 Tungstênio + 1 Escama Blindada |
| Torreta (Auto + Mira Manual) | 3 Ferro-Níquel + 2 Titânio Bruto | 2 Titânio Bruto | 2 Liga Blindada |
| Blindagem/Amortecedor | 4 Couro Reforçado + 2 Osso Denso | 2 Carapaça Quitinosa | 2 Escama Blindada |
| Expansão do Porão | 4 Basalto Denso + 2 Ferro-Níquel + 1 Casca Fibrosa | 2 Titânio Bruto | 2 Liga Blindada |
| Expansão da Mochila | 2 Couro Reforçado + 1 Osso Denso | 1 Carapaça Quitinosa | 1 Escama Blindada |
| Propulsor (fábrica) | — | 2 Liga de Impulso | 2 Núcleo de Impulso Avançado |
| Scanner de Longo Alcance (fábrica) | — | 2 Liga de Impulso + 1 Couro Reforçado | 2 Núcleo de Impulso Avançado |
| Estação de Drones (limite, fábrica) | — | 2 Liga de Impulso + 1 Carapaça Quitinosa | 2 Núcleo de Impulso Avançado + 1 Escama Blindada + 1 Liga Blindada |
| Biorreator de Algas | 3 Fibra Lenhosa + 2 Casca Fibrosa | 2 Resina Endurecida | 2 Seiva Cristalizada |
| Estufa/Hidroponia | 4 Fibra Lenhosa + 2 Casca Fibrosa | 2 Resina Endurecida + 1 Fibra Lenhosa | 2 Seiva Cristalizada |
| Geladeira | 3 Ferro-Níquel + 2 Cobre Nativo | 2 Alumínio Purificado | 2 Liga Anticorrosiva |
| Fornalha | 3 Ferro-Níquel + 2 Basalto Denso | 2 Alumínio Purificado | 2 Liga Anticorrosiva |

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

(nenhuma no momento — todas as seções fechadas)
