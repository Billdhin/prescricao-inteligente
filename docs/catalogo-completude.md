# Completude do catálogo de exercícios

O que existe hoje, o que falta para cobrir o corpo inteiro, e em que ordem.

Este documento é a **visão por músculo**. O `catalogo-expansao.md` já existia e é a
visão **por gargalo de prescrição** (core raso, elástico raso, bíceps com um item).
Os dois se somam: os 45 daquele documento continuam válidos, e este acrescenta os
que faltam quando a pergunta muda de "o que trava a prescrição" para "o que do
corpo humano este catálogo sabe treinar".

Foi essa a pergunta do Filipe ao buscar **manguito rotador** e não achar nada.

---

## 1. A medição de hoje

35 exercícios, contados de `src/data/exercises.ts`.

| Grupo | Hoje |
|---|---:|
| Membros inferiores | 12 |
| Costas | 6 |
| Peitorais | 4 |
| Ombros | 4 |
| Braços | 4 |
| Corpo todo | 3 |
| Core (tronco) | 2 |

Por nível: Iniciante 25, Intermediário 8, **Avançado 2**.
Por equipamento: Peso corporal 8, Halter 7, Máquina 6, Barra 4, Polia 3, Elástico 2,
Piscina 2, Esteira 1, Bicicleta 1, Elíptico 1. **Kettlebell 0, Bola 0, TRX 0.**

---

## 2. A matriz: cada músculo, o que o catálogo sabe hoje

Coluna "Hoje" = quantos exercícios citam aquele músculo em `ativacao[]`.
**Zero significa que o motor nunca vai escolher um exercício por causa dele.**

### Ombro e manguito rotador

| Músculo | Hoje | Situação |
|---|---:|---|
| Deltoide anterior | 7 | coberto |
| Deltoide médio | 2 | raso |
| **Deltoide posterior** | **0** | **descoberto** |
| **Supraespinal** | **0** | **descoberto** |
| **Infraespinal** | **0** | **descoberto** |
| **Redondo menor** | **0** | **descoberto** |
| **Subescapular** | **0** | **descoberto** |

O catálogo tem quatro exercícios de ombro e nenhum de manguito. Um aluno com dor de
ombro, ou em retorno de lesão, não tem o que receber.

### Escápula

| Músculo | Hoje | Situação |
|---|---:|---|
| Trapézio superior | 4 | coberto (sempre como sinergista) |
| Trapézio médio | 2 | raso |
| **Trapézio inferior** | **0** | **descoberto** |
| Romboides | 5 | só como sinergista de remada |
| Serrátil anterior | 2 | raso, nunca como alvo |
| **Levantador da escápula** | **0** | descoberto (baixa prioridade) |
| **Peitoral menor** | **0** | descoberto (baixa prioridade) |

### Tronco e core

| Músculo | Hoje | Situação |
|---|---:|---|
| "Core" (rótulo genérico) | 6 | **o rótulo esconde a lacuna** |
| Transverso do abdome | 5 | coberto |
| Reto abdominal | 2 | raso |
| Oblíquos | 2 | raso |
| Eretores da espinha | 4 | coberto |
| **Quadrado lombar** | **0** | descoberto (anti-flexão lateral) |
| **Multífidos** | **0** | descoberto |
| **Diafragma** | **0** | descoberto |
| **Assoalho pélvico** | **0** | ver a ressalva na seção 5 |

### Quadril

| Músculo | Hoje | Situação |
|---|---:|---|
| Glúteo máximo | 11 | bem coberto |
| **Glúteo médio** | **0** | **descoberto** |
| **Glúteo mínimo** | **0** | **descoberto** |
| "Estabilizadores do quadril" | 1 | rótulo genérico, um único item |
| **Rotadores profundos** | **0** | descoberto |
| **Iliopsoas / flexores** | **0** | descoberto |
| Adutores | 1 | raso |
| **Abdutores** | **0** | descoberto |
| **Tensor da fáscia lata** | **0** | descoberto (baixa prioridade) |

Glúteo médio é o estabilizador que aparece em quase toda dor de joelho e de lombar.
Zero exercícios.

### Coxa e perna

| Músculo | Hoje | Situação |
|---|---:|---|
| Quadríceps | 12 | bem coberto |
| Isquiotibiais | 11 | bem coberto |
| Reto femoral | 1 | citado uma vez |
| "Panturrilha" (rótulo) | 4 | **não distingue gastrocnêmio de sóleo** |
| **Sóleo** | **0** | descoberto como alvo |
| **Tibial anterior** | **0** | **descoberto** |
| Fibulares | 1 | um item |
| **Intrínsecos do pé** | **0** | descoberto (baixa prioridade) |

### Braço, antebraço e pegada

| Músculo | Hoje | Situação |
|---|---:|---|
| Tríceps braquial | 10 | bem coberto |
| Bíceps braquial | 7 | coberto como sinergista, **1 exercício-alvo** |
| Braquial | 1 | raso |
| **Braquiorradial** | **0** | descoberto |
| **Flexores/extensores de punho** | **0** | **descoberto** |
| **Pegada (preensão)** | **0** | **descoberto** |
| Ancôneo | 2 | ok |

### Peito e costas

| Músculo | Hoje | Situação |
|---|---:|---|
| Peitoral maior | 6 | coberto (sem separar clavicular de esternal) |
| Latíssimo do dorso | 7 | coberto |
| **Redondo maior** | **0** | descoberto (baixa prioridade) |

### Pescoço

| Músculo | Hoje | Situação |
|---|---:|---|
| **Flexores profundos cervicais** | **0** | descoberto |
| **Extensores cervicais** | **0** | descoberto |

---

## 3. O que falta, em lotes

Os lotes **A a F** são os 45 já rascunhados em `catalogo-expansao.md` (gargalos de
prescrição). Os lotes **G a M** são novos e vêm desta matriz: musculatura de apoio.

### Lote G. Manguito rotador e ombro completo (4 novos)

| # | Nome | slug | Equip. | Nível | Cobre |
|---|---|---|---|---|---|
| G1 | Rotação externa com elástico (cotovelo junto ao tronco) | `rotacao-externa-elastico` | Elástico | Iniciante | infraespinal, redondo menor |
| G2 | Rotação externa deitado de lado com halter | `rotacao-externa-deitado` | Halter | Iniciante | infraespinal isolado |
| G3 | Rotação interna com elástico | `rotacao-interna-elastico` | Elástico | Iniciante | subescapular |
| G4 | Elevação no plano da escápula (scaption) | `scaption` | Halter | Iniciante | supraespinal, deltoide médio |

Somam com `face-pull-polia` (C7) e `crucifixo-inverso` (C6), que já cobrem deltoide
posterior e rotadores externos com carga.

### Lote H. Escápula (4 novos)

| # | Nome | slug | Equip. | Nível | Cobre |
|---|---|---|---|---|---|
| H1 | Protração escapular (serratus punch) com elástico | `serratus-punch` | Elástico | Iniciante | serrátil anterior |
| H2 | Deslizamento na parede (wall slide) | `wall-slide` | Peso corporal | Iniciante | serrátil, trapézio inferior |
| H3 | Elevação em Y no banco inclinado | `y-raise-banco` | Halter | Intermediário | trapézio inferior |
| H4 | Retração escapular na polia | `retracao-escapular-polia` | Polia | Iniciante | romboides, trapézio médio como alvo |

### Lote I. Estabilizadores do quadril (2 novos)

| # | Nome | slug | Equip. | Nível | Cobre |
|---|---|---|---|---|---|
| I1 | Concha (clam shell) com elástico | `clam-shell` | Elástico | Iniciante | glúteo médio, rotadores externos |
| I2 | Caminhada lateral com elástico | `caminhada-lateral-elastico` | Elástico | Iniciante | glúteo médio em pé, com carga |

Somam com `abducao-quadril-elastico` (B4), `cadeira-abdutora` (E4) e
`hip-thrust-unilateral` (E6).

### Lote J. Tornozelo e pé (2 novos)

| # | Nome | slug | Equip. | Nível | Cobre |
|---|---|---|---|---|---|
| J1 | Dorsiflexão com elástico | `dorsiflexao-elastico` | Elástico | Iniciante | tibial anterior |
| J2 | Equilíbrio em um pé (progressivo) | `equilibrio-unipodal` | Peso corporal | Iniciante | estabilizadores do tornozelo, propriocepção |

Soma com `panturrilha-sentado` (B7), que cobre sóleo.

### Lote K. Antebraço, pegada e carregamento (3 novos)

| # | Nome | slug | Equip. | Nível | Cobre |
|---|---|---|---|---|---|
| K1 | Flexão e extensão de punho com halter | `punho-halter` | Halter | Iniciante | flexores e extensores do antebraço |
| K2 | Caminhada do fazendeiro (farmer walk) | `farmer-walk` | Halter | Intermediário | pegada, trapézio, core |
| K3 | Carregamento unilateral (suitcase carry) | `suitcase-carry` | Halter | Intermediário | quadrado lombar, anti-flexão lateral |

### Lote L. Cervical e respiração (2 novos)

| # | Nome | slug | Equip. | Nível | Cobre |
|---|---|---|---|---|---|
| L1 | Retração cervical (chin tuck) | `chin-tuck` | Peso corporal | Iniciante | flexores profundos do pescoço |
| L2 | Respiração diafragmática 360° | `respiracao-360` | Peso corporal | Iniciante | diafragma, transverso |

---

## 4. Contagem

| | Exercícios |
|---|---:|
| Hoje | 35 |
| Lotes A a F (`catalogo-expansao.md`, gargalos) | +45 |
| **Lotes G a M (musculatura de apoio, este documento)** | **+17** |
| **Total no fim** | **97** |

Depois disso, **nenhum músculo da matriz fica em zero**, salvo os quatro de baixa
prioridade marcados na seção 5.

Distribuição de grupo no fim (estimada):

| Grupo | Hoje | Depois |
|---|---:|---:|
| Membros inferiores | 12 | 23 |
| Costas | 6 | 12 |
| Ombros | 4 | 16 |
| Core (tronco) | 2 | 13 |
| Braços | 4 | 12 |
| Peitorais | 4 | 8 |
| Corpo todo | 3 | 9 |
| Tornozelo e pé | 0 | 4 |

---

## 5. O que fica de fora, e por quê

- **Assoalho pélvico.** Não entra como exercício prescrito por este produto. É área
  de sobreposição direta com fisioterapia pélvica, e prescrever contração sem
  avaliação específica pode piorar quadro de hipertonia. Cabe como CONTEÚDO no
  Aprender e como encaminhamento, não como item de catálogo.
- **Levantador da escápula, peitoral menor, redondo maior, TFL, intrínsecos do pé.**
  Ficam em zero de propósito nesta rodada: raramente são alvo isolado de prescrição
  e já recebem estímulo como sinergistas. Entram se houver demanda real.
- **Treino de pescoço com carga.** Só `chin-tuck`, que é controle motor. Carga
  cervical direta pede avaliação que o produto não faz.

---

## 6. Ordem de trabalho sugerida

Por valor de prescrição, não por região anatômica:

1. **P1, destrava caso clínico hoje:** G (manguito), I (glúteo médio), A1 a A4 (core
   anti-rotação e sem descer ao chão). São os que o profissional procura quando o
   aluno tem dor de ombro, de joelho ou de lombar. **13 exercícios.**
2. **P2, tira a repetição do plano:** B (elástico), C (braços e ombros), E (membros
   inferiores). **24 exercícios.**
3. **P3, profundidade e completude:** D, F, H, J, K, L. **25 exercícios.**

---

## 7. Custo real por exercício

Para o Filipe calibrar o ritmo. Cada item exige, na ordem:

1. **Texto** (nome, resumo, execução, erros comuns, variações, prescrição prática)
2. **Referência verificada no PubMed**, uma a uma. Sem DOI verificado, o exercício
   não entra citando ciência.
3. **Ativação muscular** com a regra dura: `percentual` só existe com EMG publicado;
   ausente significa "não medido", nunca 0.
4. **Métricas** do índice de eficiência, que passam pelo `check:metricas`.
5. **`restricaoPerfil`**, senão o `check:condicao` fica verde mentindo.
6. **Imagens pelo pipeline do Lovable** (skill `imagens-lovable`): semente img2img,
   deploy, download, conferência visual olho a olho, conversão para webp. Execução,
   análise, boneco na posição e erros comuns.

O passo 6 é o mais caro e consome créditos do Lovable. O passo 2 é o que mais
costuma travar: exercício de estabilizador tem menos EMG publicado que agachamento,
e nesse caso a resposta certa é **deixar o percentual ausente**, não inventar.

Ordem que já funcionou nos lotes anteriores: **texto → referências → métricas →
imagens.** Inverter gera imagem bonita de exercício que depois muda de nome.
