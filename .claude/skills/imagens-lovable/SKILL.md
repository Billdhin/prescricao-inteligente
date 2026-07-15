---
name: imagens-lovable
description: Como gerar as imagens deste projeto (erros comuns, variações, execução, análise, boneco posado) via Lovable. Use SEMPRE que precisar criar ou regerar qualquer imagem de exercício. Contém o workspace certo, o método img2img obrigatório e o pipeline de download e verificação.
---

# Imagens do Prescrição Inteligente via Lovable

Leia isto ANTES de gerar qualquer imagem. As regras aqui vieram de erro real cometido em 15/07/2026 e custaram créditos e retrabalho.

## Regra 1: o workspace é o da Ellen

| Workspace | ID | Usar? |
|---|---|---|
| **Ellen's Lovable** | `7JfKOn84nDe2t5mI6wCq` | **SIM.** Plano `ktlo_2`, tem créditos. É onde as imagens do projeto sempre foram feitas. |
| Dilton's Lovable | `EJZcc2O8LSnv5eKxGQbE` | Não. Plano free. |
| Ellen's Lovable (2) | `ecUFykZdaKLOBsg13tgH` | Não. Plano free. |

## Regra 2: img2img, NUNCA text-to-image

**Toda imagem deste projeto nasce de outra imagem que já existe e já está correta.** Anexe a imagem-semente na mensagem (`files` em `send_message`, com `file_id` de `get_file_upload_url`) e peça a variação. Nunca descreva a cena do zero.

Está escrito em `src/data/aba-imagens.ts`: *"boneco cinza 3D na posição do exercício com o ERRO postural exagerado e a região que sofre destacada em vermelho (**img2img do mesmo boneco do mapa muscular**, verificado um a um)"*.

**Por que isso não é preferência, é requisito.** Piloto de 15/07/2026 com text-to-image, 6 imagens, 0 aproveitáveis:

- Leg press 45° virou máquina de puxada e cadeira extensora (o modelo não sabe o aparelho).
- Uma saiu com texto inventado na máquina, mesmo com "sem texto" no prompt.
- Câmera ignorou "vista de perfil" e saiu de costas.
- Boneco saiu com rosto, mesmo com "sem rosto" no prompt.
- **A pior: o erro pedido era valgo (joelhos para dentro) e a imagem mostrou os joelhos para FORA**, o oposto.

O fundador é doutor em Educação Física. Imagem que ensina o contrário do texto é pior que imagem nenhuma. O projeto já tinha aprendido isso (ADENDO de 06/07/2026: *"IA alucina músculos, inaceitável p/ produto de um doutor... não determinístico"*).

## Regra 3: qual semente usar

Imagens que já existem em `public/exercises/`:

| Arquivo | O que é | Serve de semente para |
|---|---|---|
| `<slug>.webp` | foto de execução real | variações, análise |
| `<slug>-analysis.webp` | execução + camada de análise | nada (é derivada) |
| `erros/<slug>.webp` | **boneco anatômico do erro** | **todas as imagens de erro** |
| `variacoes/<slug>-<i>.webp` | foto de cada variação | novas variações |

## Regra 4: o estilo estabelecido (não invente outro)

Confira sempre `erros/agachamento-livre.webp` antes de escrever o prompt. O estilo real é:

- Figura anatômica 3D **branca / cinza bem claro**, musculatura visível, **com rosto** (não é boneco liso sem rosto).
- Fundo branco puro, figura de corpo inteiro, enquadramento retrato.
- Equipamento (barra, halter) em **contorno claro**, discreto.
- A região afetada mostra a **estrutura interna em vermelho** (coluna, articulação), não uma mancha vermelha sobre a pele.

## Pipeline completo

1. `list_workspaces` e confirme o ID da Ellen.
2. `get_file_upload_url` e faça upload da imagem-semente.
3. `create_project` (ou `send_message` num projeto existente) no workspace da Ellen, **anexando a semente em `files`**, pedindo a variação.
4. **`deploy_project`.** O preview de dev (`id-preview--*.lovable.app`) devolve HTML de fallback do SPA, não o arquivo. Só a URL publicada (`<nome>.lovable.app`) serve o binário.
5. Baixe com `curl` da URL publicada. **Atenção:** o Lovable salva JPEG mesmo quando o caminho pede `.webp`. Confira com `file -b`.
6. **Verifique cada imagem com os próprios olhos** (copie para o scratchpad com extensão `.jpg` e use a tool Read). O Read não abre caminho do `/tmp` do Git Bash; use o scratchpad com caminho Windows.
7. Só depois de aprovada uma a uma: converter para webp, copiar para `public/exercises/...` e registrar o índice (`ERRO_IMGS` / `VARIACAO_IMGS` em `src/data/aba-imagens.ts`).

## Formato obrigatório das imagens de erro: comparação lado a lado

**Uma figura sozinha NÃO comunica um erro.** Erro é desvio em relação ao correto. Sem a
referência, o profissional vê "um sujeito com a lombar vermelha" e não sabe se aquilo é o erro
ou só qual músculo trabalha. O vermelho vira "aqui dói", não "isto está errado". Foi exatamente
a crítica do fundador em 15/07/2026, depois que as imagens de figura única já estavam saindo
com estilo perfeito. Estilo certo e mensagem ausente.

Formato que resolveu, validado com ele:

- **Uma imagem, duas figuras** lado a lado, mesma escala, mesmo ângulo, linha cinza fina dividindo.
- **Esquerda: execução CORRETA**, sem nenhum vermelho, com a estrutura interna visível em cinza claro.
- **Direita: o MESMO exercício com o erro**, exagerado, estrutura interna da região sobrecarregada em vermelho.
- **Seta curva vermelha** na figura da direita apontando a DIREÇÃO do desvio. É a seta que diz o que está errado.
- **V verde** no canto superior esquerdo, **X vermelho** no canto superior direito. Únicas marcas gráficas.
- Sem palavra, letra ou número. A legenda do erro já vive no app.

Ou seja: a regra "nunca mostre a execução correta", que eu mesmo tinha escrito nos prompts, estava
errada. É a comparação que torna o erro legível.

## O que o img2img consegue e o que não consegue

Medido em 15/07/2026, com verificação visual imagem a imagem:

**Consegue bem** (aprovadas de primeira): erros de **flexão/extensão no plano sagital**. Lombar arredondando (butt wink), hiperextensão lombar, tronco inclinando à frente, joelho travado. São mudanças grandes de silhueta, vistas de perfil.

**NÃO consegue: valgo dinâmico de joelho.** Três tentativas, três falhas:
1. text-to-image: joelhos para FORA (invertido)
2. img2img: joelhos neutros
3. img2img com "formando um X, quase se tocando, pés afastados": joelhos neutros de novo

O modelo entende "joelho em vermelho" e ignora a rotação medial. É limite do modelo, não do prompt. Vale provavelmente para todo erro que seja **rotação sutil no plano frontal/transverso** (valgo, varo, rotação de quadril, báscula escapular).

**Para esses casos, não insista no img2img.** Use o padrão que o projeto já tem para marcação precisa: overlay SVG autorado sobre a imagem (como `analysis-overlays.ts` faz com setas e regiões em coordenadas normalizadas). É determinístico e mostra a direção do desvio com seta, que é o que o gerador não faz.

Regra prática: classifique cada erro antes de gerar. Sagital grande = img2img. Rotação sutil = overlay autorado.

## Verificação é obrigatória

O agente do Lovable **avisa sozinho** quando erra ("a imagem 0 saiu parecendo uma máquina de cabos"). Leia a resposta dele. Mas não confie só nisso: olhe as imagens. Nunca salve lote sem inspecionar item a item.

## Granularidade

- Erros: **uma imagem por erro** (`erros/<slug>-<i>.webp`, i na ordem de `errosComuns`). Uma imagem por exercício não funciona: não dá para mostrar "joelho valgo" e "lombar em flexão" na mesma figura. Foi exatamente a reclamação do fundador.
- Variações: uma por variação (`variacoes/<slug>-<i>.webp`), já funciona assim.
- Prompts prontos dos 62 erros: `docs/prompts-erros-comuns.md`.
