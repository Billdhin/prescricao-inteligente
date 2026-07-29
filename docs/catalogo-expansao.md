# Expansão do catálogo de exercícios

Rascunho para preencher. Cada linha já vem com **nome, slug e a classificação que
não depende de medição**. O que depende de medição ou de fonte (ativação por EMG,
métricas, imagens) fica em branco de propósito: número inventado aqui contamina o
ranqueamento, o comparador e o PDF que o profissional assina.

---

## 1. O buraco real, medido no catálogo de hoje

35 exercícios. A distribuição, contada do próprio `src/data/exercises.ts`:

| Grupo | Hoje | Comentário |
|---|---:|---|
| Membros inferiores | 12 | é o único grupo com profundidade |
| Costas | 6 | quase tudo é remada; falta puxada vertical variada |
| Peitorais | 4 | |
| Ombros | 4 | |
| Braços | 4 | 3 de tríceps, **1 de bíceps** |
| Corpo todo | 3 | 2 são de piscina |
| **Core (tronco)** | **2** | prancha e dead bug, e nada mais |

Por equipamento: Peso corporal 8, Halter 7, Máquina 6, Barra 4, Polia 3, Elástico 2,
Piscina 2, Esteira 1, Bicicleta 1, Elíptico 1.

Cobertura por condição (quantos exercícios sobram depois das exclusões estruturais,
saída do `npm run check:condicao`):

| Condição | Sobram |
|---|---:|
| Obesidade grau II e III | 31 de 35 |
| Idoso frágil / destreinado | 31 de 35 |
| Demais condições com restrição estrutural | 35 de 35 |

**Os quatro gargalos que o número esconde:**

1. **Core com 2 itens.** Qualquer plano que peça core repete os mesmos dois, e
   quem tem `dificuldade_chao` perde os dois de uma vez.
2. **Elástico com 2 itens.** É o equipamento de quem treina em casa, que é
   justamente o aluno de "retorno ao treino" e o de pós-parto.
3. **Bíceps com 1 item.** Rosca direta não tem substituto no catálogo.
4. **Nada em pé ou sentado para quem não desce ao chão.** As opções de core, de
   mobilidade e de estabilização assumem solo, e é exatamente isso que exclui 4
   exercícios na obesidade grau II e III.

A expansão abaixo ataca os quatro, nessa ordem. **Não é lista de desejos: cada
entrada diz qual buraco fecha.**

---

## 2. Como preencher cada entrada

Campos de `Exercise` (`src/data/types.ts`). Divididos pelo que dá para decidir na
mesa e pelo que exige fonte:

**Decidido aqui (já preenchido nas tabelas)**
`slug` · `nome` · `grupoMuscular` · `equipamento` · `nivel` · `objetivo[]` ·
`articulacaoPredominante` · `premium: false` · `modalidade` (quando aplicável)

**A preencher com o Filipe**
`resumoPratico` (1 frase) · `anguloArticular` · `blocos` · `conteudo`
(execução, erros comuns, variações, prescrição prática) · `restricaoPerfil`

**A preencher com fonte verificada no PubMed (nunca de cabeça)**
`ativacao[]` (músculo + faixa; **`percentual` é opcional e ausência significa
"sem EMG publicado", nunca 0**) · `indiceEficiencia` · métricas do
`check:metricas` · `trustLevel`

**A produzir depois (pipeline de imagem, skill `imagens-lovable`)**
`imagem` (foto de execução) · `imagemAnalise` · boneco na posição · `hotspots` ·
`fases` · `temCena` · erros comuns em imagem

> Ordem de trabalho que já funcionou nos lotes anteriores: texto → referências
> verificadas → métricas → imagens. Inverter isso gera imagem bonita de exercício
> que depois muda de nome.

---

## 3. Lote A: Core (fecha o gargalo nº 1 e o nº 4)

Prioridade máxima. Metade é **em pé ou sentado**, para sobreviver à exclusão por
`dificuldade_chao` e `dificuldade_sentar_levantar`.

| # | Nome | slug | Equipamento | Nível | Objetivo | Articulação | Fecha |
|---|---|---|---|---|---|---|---|
| A1 | Prancha lateral | `prancha-lateral` | Peso corporal | Intermediário | Resistência muscular, Aprendizado técnico | Quadril e coluna | core anti-flexão lateral |
| A2 | Prancha com apoio no banco | `prancha-apoio-banco` | Peso corporal | Iniciante | Resistência muscular, Retorno ao treino | Quadril e coluna | **core sem descer ao chão** |
| A3 | Pallof press na polia | `pallof-press-polia` | Polia | Intermediário | Resistência muscular, Força | Coluna (antirrotação) | antirrotação, **em pé** |
| A4 | Pallof press com elástico | `pallof-press-elastico` | Elástico | Iniciante | Resistência muscular, Retorno ao treino | Coluna (antirrotação) | antirrotação em casa |
| A5 | Rotação de tronco com elástico (chop) | `chop-elastico` | Elástico | Intermediário | Resistência muscular | Coluna e quadril | rotação controlada, em pé |
| A6 | Bird dog (quatro apoios) | `bird-dog` | Peso corporal | Iniciante | Aprendizado técnico, Retorno ao treino | Coluna e quadril | par do dead bug, cadeia posterior |
| A7 | Elevação de joelhos suspenso | `elevacao-joelhos-suspenso` | Peso corporal | Avançado | Hipertrofia, Força | Quadril e coluna | progressão de core avançada |
| A8 | Abdominal na polia alta (ajoelhado) | `abdominal-polia-alta` | Polia | Intermediário | Hipertrofia | Coluna | core com carga progressiva |

---

## 4. Lote B: Elástico e peso corporal (gargalo nº 2)

O aluno que treina em casa hoje tem 2 opções de elástico. Este lote leva a 8.

| # | Nome | slug | Equipamento | Nível | Objetivo | Articulação | Fecha |
|---|---|---|---|---|---|---|---|
| B1 | Agachamento com elástico | `agachamento-elastico` | Elástico | Iniciante | Emagrecimento, Retorno ao treino | Joelho e quadril | membros inferiores em casa |
| B2 | Puxada alta com elástico | `puxada-elastico` | Elástico | Iniciante | Hipertrofia, Retorno ao treino | Ombro e cotovelo | **puxada vertical em casa** |
| B3 | Rosca direta com elástico | `rosca-elastico` | Elástico | Iniciante | Hipertrofia | Cotovelo | segundo item de bíceps |
| B4 | Abdução de quadril com elástico | `abducao-quadril-elastico` | Elástico | Iniciante | Retorno ao treino, Resistência muscular | Quadril | glúteo médio, em pé |
| B5 | Extensão de quadril em pé com elástico | `extensao-quadril-elastico` | Elástico | Iniciante | Retorno ao treino | Quadril | **glúteo sem deitar** |
| B6 | Remada unilateral com elástico | `remada-unilateral-elastico` | Elástico | Iniciante | Hipertrofia | Ombro e cotovelo | assimetria em casa |
| B7 | Elevação de panturrilha sentado | `panturrilha-sentado` | Máquina | Iniciante | Hipertrofia | Tornozelo | sóleo (o de hoje é em pé) |
| B8 | Subida no step | `subida-step` | Peso corporal | Iniciante | Emagrecimento, Retorno ao treino | Joelho e quadril | unilateral com carga baixa |

---

## 5. Lote C: Braços e ombros (gargalo nº 3)

| # | Nome | slug | Equipamento | Nível | Objetivo | Articulação | Fecha |
|---|---|---|---|---|---|---|---|
| C1 | Rosca martelo com halteres | `rosca-martelo` | Halter | Iniciante | Hipertrofia | Cotovelo | braquiorradial e braquial |
| C2 | Rosca no banco inclinado | `rosca-banco-inclinado` | Halter | Intermediário | Hipertrofia | Cotovelo | bíceps em alongamento |
| C3 | Rosca scott na máquina | `rosca-scott-maquina` | Máquina | Iniciante | Hipertrofia | Cotovelo | bíceps com apoio |
| C4 | Tríceps testa com barra | `triceps-testa-barra` | Barra | Intermediário | Hipertrofia | Cotovelo | cabeça longa do tríceps |
| C5 | Elevação frontal com halteres | `elevacao-frontal` | Halter | Iniciante | Hipertrofia | Ombro | deltoide anterior isolado |
| C6 | Crucifixo inverso (posterior) | `crucifixo-inverso` | Halter | Iniciante | Hipertrofia, Aprendizado técnico | Ombro | **deltoide posterior: não existe hoje** |
| C7 | Face pull na polia | `face-pull-polia` | Polia | Iniciante | Aprendizado técnico, Retorno ao treino | Ombro e escápula | saúde do ombro |
| C8 | Encolhimento de ombros com halteres | `encolhimento-halteres` | Halter | Iniciante | Hipertrofia | Escápula | trapézio superior |

---

## 6. Lote D: Peitorais e costas (profundidade)

| # | Nome | slug | Equipamento | Nível | Objetivo | Articulação | Fecha |
|---|---|---|---|---|---|---|---|
| D1 | Supino inclinado com halteres | `supino-inclinado-halteres` | Halter | Intermediário | Hipertrofia | Ombro e cotovelo | porção clavicular |
| D2 | Crucifixo na máquina (peck deck) | `crucifixo-maquina` | Máquina | Iniciante | Hipertrofia | Ombro | peitoral isolado |
| D3 | Crossover na polia | `crossover-polia` | Polia | Intermediário | Hipertrofia | Ombro | peitoral com tensão constante |
| D4 | Flexão de braço com apoio elevado | `flexao-apoio-elevado` | Peso corporal | Iniciante | Retorno ao treino | Ombro e cotovelo | **empurrar sem descer ao chão** |
| D5 | Puxada supinada (pegada inversa) | `puxada-supinada` | Máquina | Iniciante | Hipertrofia | Ombro e cotovelo | dorsal com mais bíceps |
| D6 | Pullover na polia | `pullover-polia` | Polia | Intermediário | Hipertrofia | Ombro | dorsal em ombro estendido |
| D7 | Remada cavalinho | `remada-cavalinho` | Barra | Intermediário | Hipertrofia, Força | Ombro e cotovelo | remada com apoio de tronco |
| D8 | Levantamento terra convencional | `levantamento-terra` | Barra | Avançado | Força | Quadril e coluna | padrão de dobradiça pesado |

---

## 7. Lote E: Membros inferiores (padrões que faltam)

| # | Nome | slug | Equipamento | Nível | Objetivo | Articulação | Fecha |
|---|---|---|---|---|---|---|---|
| E1 | Agachamento búlgaro | `agachamento-bulgaro` | Halter | Intermediário | Hipertrofia, Força | Joelho e quadril | unilateral com carga |
| E2 | Agachamento goblet | `agachamento-goblet` | Halter | Iniciante | Emagrecimento, Aprendizado técnico | Joelho e quadril | agachamento fácil de ensinar |
| E3 | Cadeira adutora | `cadeira-adutora` | Máquina | Iniciante | Hipertrofia | Quadril | adutores |
| E4 | Cadeira abdutora | `cadeira-abdutora` | Máquina | Iniciante | Hipertrofia | Quadril | glúteo médio com carga |
| E5 | Flexora em pé (unilateral) | `flexora-em-pe` | Máquina | Iniciante | Hipertrofia | Joelho | isquiotibiais **sem deitar** |
| E6 | Elevação pélvica unilateral | `hip-thrust-unilateral` | Peso corporal | Intermediário | Hipertrofia | Quadril | assimetria de glúteo |
| E7 | Good morning com barra | `good-morning` | Barra | Avançado | Força | Quadril e coluna | dobradiça com barra nas costas |
| E8 | Leg press horizontal | `leg-press-horizontal` | Máquina | Iniciante | Hipertrofia, Retorno ao treino | Joelho e quadril | **entrada e saída mais fáceis** |

---

## 8. Lote F: Aeróbio e corpo todo

| # | Nome | slug | Equipamento | Nível | Objetivo | Modalidade | Fecha |
|---|---|---|---|---|---|---|---|
| F1 | Remo ergômetro | `remo-ergometro` | Máquina | Intermediário | Emagrecimento | aeróbio | aeróbio de corpo todo, baixo impacto |
| F2 | Escada ergométrica | `escada-ergometrica` | Máquina | Intermediário | Emagrecimento | aeróbio | gasto alto sem correr |
| F3 | Caminhada em piso plano | `caminhada-plana` | Peso corporal | Iniciante | Emagrecimento, Retorno ao treino | aeróbio | **aeróbio sem academia** |
| F4 | Hidroginástica: corrida estacionária | `corrida-aquatica` | Piscina | Iniciante | Emagrecimento | aquático | terceiro item aquático |
| F5 | Bicicleta reclinada | `bicicleta-reclinada` | Bicicleta ergométrica | Iniciante | Emagrecimento, Retorno ao treino | aeróbio | **apoio de tronco** |

---

## 9. Contagem e efeito esperado

45 exercícios novos, catálogo de 35 para **80**. Distribuição resultante:

| Grupo | Hoje | Depois |
|---|---:|---:|
| Membros inferiores | 12 | 21 |
| Costas | 6 | 11 |
| Peitorais | 4 | 8 |
| Ombros | 4 | 8 |
| Braços | 4 | 9 |
| Core (tronco) | 2 | 10 |
| Corpo todo | 3 | 8 |
| Elástico (equipamento) | 2 | 8 |

O que muda na prática: um plano de 12 semanas para de repetir o mesmo exercício,
o "Trocar" passa a ter alternativa de verdade em todo grupo, e o aluno com
`dificuldade_chao` deixa de perder o core inteiro.

---

## 10. O que NÃO fazer neste lote

- **Não gerar imagem antes do texto aprovado.** Já custou retrabalho.
- **Não preencher `percentual` de ativação sem EMG publicado.** Ausente é o valor
  correto para "não medido"; 0 é uma afirmação falsa (ver `check:metricas`).
- **Não copiar nome comercial de aparelho.** O catálogo nomeia o movimento.
- **Não criar exercício que o motor não saiba excluir.** Todo item novo precisa de
  `restricaoPerfil`, senão ele passa por qualquer condição e o `check:condicao`
  fica verde mentindo.
