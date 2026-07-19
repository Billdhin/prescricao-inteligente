# Backlog do Aprender — 20 disciplinas

Estado e alvo de cada disciplina. `estado` sai de `disciplines.ts` + do arquivo em `mocks/`.
"Alvo de diferenciação" = o que leva a disciplina além do curso comum (o motivo de existir
neste produto). O Filipe escolhe qual criar; a skill `aprender-conteudo` executa o pipeline.

Legenda de estado: **padrão-ouro** (referência de qualidade) · **parcial** (metadados +
começo) · **stub** (só metadados/arquivo esqueleto).

## Ciências fundamentais

| Disciplina | slug / arquivo | Estado | Alvo de diferenciação |
|---|---|---|---|
| Fisiologia humana | `fisiologia-humana` | **no teto (auditada 18/07/2026)** | 11 sistemas por núcleos mecanísticos; "o que a medida informa e onde ela cala". Elevada ao teto da rubrica: 0 paredes, negrito no que decide, 11 capítulos com figura. |
| Anatomia funcional | `anatomia-funcional` | parcial | Função sobre memorização; ligar cada estrutura ao papel que muda com a posição, integrado ao mapa muscular do Lab. |
| Bioquímica e metabolismo | `bioquimica-metabolismo` | stub | Vias energéticas como decisão de dose e recuperação, não como quadro-negro; ligar substrato à intensidade e ao tempo. |
| Cinesiologia | `cinesiologia` | stub | Planos, eixos, alavancas e ações lidos dentro de exercícios reais do acervo, não em abstrato. |
| Biomecânica básica | `biomecanica-basica` | stub | Força, torque e equilíbrio que explicam por que dois exercícios "iguais" não são. |
| Neurofisiologia do movimento | `neurofisiologia-do-movimento` | stub | Recrutamento, aprendizagem motora e fadiga central aplicados à progressão e à técnica. |

## Ciências aplicadas ao treinamento

| Disciplina | slug / arquivo | Estado | Alvo de diferenciação |
|---|---|---|---|
| Biomecânica do treinamento | `biomecanica-do-treinamento` | parcial (exemplo mais autorado) | Como posição, amplitude e equipamento mudam estímulo e tolerância; casada com a análise do Lab. |
| Fisiologia do exercício | `fisiologia-do-exercicio` | parcial | Respostas agudas e crônicas por objetivo; o que limita o VO2máx e como treinar isso. |
| Treinamento de força | `treinamento-de-forca` | parcial | Volume, intensidade e progressão como faixas citadas, não dogma; ligado ao motor de prescrição. |
| Treinamento cardiorrespiratório | `treinamento-cardiorrespiratorio` | stub | Contínuo × intervalado, zonas e prescrição por FCmáx/watts/pace (casa com o bloco de cardio do plano). |
| Mobilidade e flexibilidade | `mobilidade-e-flexibilidade` | stub | Amplitude útil e tolerância a alongamento, separando moda de evidência. |
| Avaliação física e funcional | `avaliacao-fisica-e-funcional` | stub | Escolher o teste pela pergunta; interpretar antes de prescrever (casa com `/assessments`). |
| Controle de carga e recuperação | `controle-de-carga-e-recuperacao` | stub | Carga interna × externa, sRPE, monitorar sem inventar número. |
| Planejamento e periodização | `planejamento-e-periodizacao` | parcial (5 modelos autorados) | Modelos com racional e evidência declarada; casa com "Prescrever treino". |

## Integração e decisão profissional

| Disciplina | slug / arquivo | Estado | Alvo de diferenciação |
|---|---|---|---|
| Raciocínio de prescrição | `raciocinio-de-prescricao` | parcial | Do dado à conduta registrada e auditável; o coração do posicionamento. |
| Prescrição para grupos especiais | `prescricao-para-grupos-especiais` | parcial | Adaptar estímulo e cuidado por condição, com semáforo de liberação e jornada de fases. |
| Dor, limitações e adaptação | `dor-limitacoes-e-adaptacao` | stub | Dor não é dano; adaptar sem esvaziar o estímulo. |
| Leitura crítica de evidências | `leitura-critica-de-evidencias` | stub | Ler estudo, diretriz e incerteza com honestidade; ensina a própria régua do produto. |
| Comunicação e adesão | `comunicacao-e-adesao` | stub | Explicar a decisão e sustentar adesão; linguagem digna com o aluno. |
| Segurança e limites de atuação | `seguranca-e-limites-de-atuacao` | stub | Sinais de alerta, encaminhamento e o limite do CREF; a espinha de segurança do produto. |

## Ordem sugerida (o Filipe decide)

1. Fechar as **fundamentais** que sustentam tudo (Anatomia, Bioquímica, Cinesiologia,
   Biomecânica básica, Neurofisiologia) no padrão da Fisiologia.
2. **Aplicadas** que já têm motor no app (Força, Cardiorrespiratório, Avaliação,
   Periodização) para o Aprender conversar com o Atender.
3. **Integração** (Raciocínio, Grupos especiais, Segurança) que amarram o posicionamento.

Ao concluir cada uma, marcar aqui e atualizar `disciplines.ts` (`status`, contagens,
`reviewedAt`, `reviewedBy`).
