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

### ADENDO de 29/07/2026: a regra vale para a FOTO DE EXECUÇÃO, não só para o erro

Piloto do manguito rotador, 4 exercícios, 2 rodadas, 8 gerações, **0 aproveitáveis**. Os quatro
são do mesmo tipo, e agora está claro que o tipo é o problema:

| Exercício | O que saiu |
|---|---|
| Rotação externa com elástico | Cotovelo descola do tronco e vira puxada horizontal |
| Rotação interna com elástico | Mesma falha, espelhada |
| Rotação externa deitado de lado | Braço quase reto: virou elevação lateral deitado |
| Scaption (plano da escápula) | Elevação lateral em T, mesmo com o ângulo pedido em 3 prompts |

**Dois vieses do modelo, medidos:** com elástico na mão ele **descola o cotovelo do tronco**;
com um halter em cada mão ele **abre os braços em T**. Nenhum prompt travou nenhum dos dois.

**Um erro que foi MEU, e vale para o próximo briefing:** pedi vista de PERFIL para rotação de
ombro. Rotação acontece no plano transverso, e de perfil ela é invisível, porque o antebraço se
move na direção da câmera. Antes de escrever o prompt, pergunte **em que plano o movimento
acontece e de que ângulo ele é visível**. Se a resposta for "de nenhum ângulo fácil", o movimento
provavelmente também não vai sair.

**O agente do Lovable errou a própria avaliação.** Ele declarou a #3 correta nas duas rodadas.
Não estava: o braço subia reto em vez de formar o L com o cotovelo preso às costelas. Ele avisa
sozinho quando erra feio, mas **não substitui a conferência olho a olho** (regra que a skill já
tinha, e que se pagou aqui).

**Classificação, agora com 3 famílias:**
- **Silhueta sagital grande** (agachar, empurrar, puxar, dobradiça, deitar): img2img funciona.
- **Rotação ou mudança de plano de poucos graus** (rotação de ombro ou de quadril, valgo, plano
  da escápula, báscula escapular): **não use img2img nem para foto de execução.** O app já cai
  no boneco anatômico e no `MuscleThumb` quando `imagem` está ausente, e ausência é melhor que
  imagem que ensina o movimento errado. Alternativa: boneco 3D anatômico esquemático (o modelo
  respeita muito melhor "cotovelo colado" em render esquemático do que em foto), ou semente real
  já na pose final.
- **Marcação de direção de desvio**: overlay SVG autorado, como antes.

### ADENDO de 23/08/2026: o LADO em exercício assimétrico, e um erro de ferramenta que quase virou lição falsa

**O lado é a informação, e o gerador erra o lado.** No `suitcase-carry` o músculo que trabalha é
o quadrado lombar do lado OPOSTO à carga, porque é ele que impede o tronco de tombar na direção
do halter. Duas gerações, dois erros: as duas pintaram o mesmo lado do peso. Antes de pedir
imagem de exercício com carga em um lado só, pergunte **se o ângulo escolhido deixa distinguir
esquerda de direita**; e depois de gerar, AMPLIE e confira o lado antes de aceitar. Imagem que
não dá para verificar não entra, e imagem com o lado trocado ensina o oposto do certo.

**AQUI A TROCA DE CÂMERA FUNCIONOU, ao contrário do que escrevi primeiro.** Pedi a mesma cena
vista DE COSTAS e o gerador entregou: mesma academia, mesmo fundo, um halter só, janela recortada
limpa. Eu tinha registrado que ele havia devolvido a imagem anterior sem mudar nada, e isso era
falso: **meu laço de download só conferia se o arquivo era uma imagem, não se era NOVO**, então
pegou o arquivo da rodada anterior que já estava em disco. Culpei o gerador por um defeito da
minha ferramenta, e quase deixei uma lição errada escrita aqui.

**Regra de download, então:** ao regerar um arquivo que você JÁ baixou antes, apague o local
primeiro e busque com `?v=<timestamp>` e `Cache-Control: no-cache`. Comparar só "é imagem?" não
distingue a nova da velha. O aviso original sobre troca de câmera segue valendo pelos casos que
de fato falharam (manguito, puxada-supinada), mas ele NÃO tem um terceiro registro.

### ADENDO de 23/08/2026: CADA VARREDURA SÓ RESPONDE A PERGUNTA QUE ELA FEZ

O Filipe abriu o dead-bug e viu **os dois braços saindo do mesmo ombro**, com o ombro do outro
lado vazio. Corpo impossível, na foto de execução, herdado pela camada de análise.

O que dói é que essa imagem passou por TRÊS varreduras minhas antes: a de 19/08 (camada de
análise), a de 22/08 (boneco na posição) e a de 22 e 23/08 (par foto + análise). Nenhuma pegou,
e não por desatenção: **nenhuma delas estava perguntando isso**. A de análise olhava se o
músculo certo estava vermelho. A do par olhava se as duas metades eram a mesma cena. Nas duas o
dead-bug passou, porque nos dois critérios ele estava certo.

É a mesma lição que este projeto já aprendeu duas vezes com outra roupa: "conferir um lado não
diz nada sobre o outro" (o boneco que faltava em 24 exercícios), e depois "cada imagem sozinha
estava boa, o defeito só existe no PAR". Agora: **par certo e músculo certo não dizem nada sobre
o CORPO estar possível.**

**Então a varredura de anatomia é uma passada PRÓPRIA, com pergunta própria:** para cada figura,
os membros nascem cada um no seu lugar? O número de braços, pernas, mãos e dedos fecha? Um
membro que deveria estar escondido está escondido, ou brotou do lugar errado? Faça essa passada
em folha de contato de 2 colunas com célula grande (390 px ou mais); a 300 px o defeito do
dead-bug não aparece.

**No prompt de correção, descreva a GEOMETRIA, não o defeito.** "Conserte a anatomia" não
funciona. O que funcionou foi: "o braço mais PRÓXIMO da câmera aponta para o teto e sai do ombro
próximo; o braço mais LONGE está estendido no chão acima da cabeça, sai do ombro do OUTRO LADO
do tronco e aparece PARCIALMENTE ESCONDIDO atrás da cabeça". Saiu certo de primeira, e o braço
de baixo passou por trás da cabeça, que é exatamente onde ele tinha que passar.

**Objeto na frente do rosto também conta como estranheza.** No face-pull o mosquetão do cabo
estava por cima do nariz e da boca. A correção que funcionou também foi geométrica: "as duas
pontas da corda passam pelos LADOS do rosto, na altura das orelhas; o mosquetão fica ABAIXO da
linha do queixo".

**AS VARIAÇÕES E OS ERROS HERDAM O DEFEITO DA IMAGEM PRINCIPAL, porque nasceram no mesmo lote.**
Consertei o dead-bug principal e dei por encerrado; a variação `dead-bug-2` tinha exatamente o
mesmo defeito, os dois braços no mesmo ombro. Óbvio depois de ver: elas foram geradas juntas, do
mesmo prompt. **Achou defeito numa imagem? Olhe imediatamente as outras famílias DAQUELE slug**
(`variacoes/<slug>-*`, `erros/<slug>-*`, `mmp/<slug>`) antes de fechar o caso.

**E a passada de anatomia vale para o EQUIPAMENTO também.** No `leg-press-45-0` o aparelho não
era um leg press: sem trilho, sem plataforma, pernas soltas no ar sem empurrar nada, e texto
alucinado no encosto. É a mesma classe do defeito que abriu esta rodada (a puxada alta com barra
solta). A pergunta a fazer é: **o que empurra o quê? dá para ver a mecânica?** Se não der, a
imagem ensina um aparelho que não existe.

**Não dá para transformar isso em guardrail, e está declarado:** plausibilidade anatômica não é
medível por script. O `check:pares` mede cena e proporção porque essas têm número; anatomia não
tem. Aqui o método é o olho, e o que fica registrado é a PERGUNTA a fazer, não uma asserção.

### ADENDO de 23/08/2026: as 5 formas de corpo impossível, e o download que mente duas vezes

Varredura de anatomia fechada nas cinco famílias de imagem: 101 execuções, 100 análises, 101
bonecos, 191 variações e **283 imagens de erro**. Nas variações e nos bonecos, zero defeitos
novos. Nas imagens de erro, **9 defeitos em 283**, e eles NÃO são todos "membro no lugar errado".
São cinco formas diferentes de corpo impossível, e vale procurar as cinco:

1. **Membro solto flutuando.** Uma mão no ar, desligada de qualquer braço (`bird-dog-2`).
2. **Membro amputado.** Os dois braços terminando no deltoide, sem antebraço nem mão
   (`equilibrio-unipodal-0`); ou um vão entre o ombro e a mão (`wall-slide-1`).
3. **Corpo duplicado.** Duas cabeças e dois troncos fundidos no mesmo quadril (`dead-bug-2`).
4. **Objeto duplicado.** Três halteres para duas mãos, um deles sem braço nenhum segurando
   (`crucifixo-inverso-0`). O contador de objetos é tão importante quanto o de membros.
5. **Cabeça errada.** Crânio esquelético com órbitas e dentes no lugar do rosto
   (`puxada-supinada-0`, `elevacao-joelhos-suspenso-1`), ou esfera branca lisa sem rosto
   nenhum (`puxada-supinada-2`). Esta é a pendência de "rosto esfolado" que o projeto já
   registrava, agora com caso concreto e com correção.

**Uma família limpa não diz nada sobre a outra.** As 191 variações passaram inteiras e as 283
imagens de erro tinham 9 defeitos. São pipelines diferentes (foto de difusão contra render 3D
posado), e o erro de um não aparece no outro. Varra família por família.

**No prompt, continue descrevendo a geometria, e acrescente a CONTAGEM.** "Exatamente DOIS
halteres, um em cada mão, e cada haltere fechado dentro de uma mão que se liga a um antebraço,
a um braço e a um ombro" resolveu de primeira. "Conserte os halteres" não resolveria.

**Para a cabeça, descreva o que ela É, não o que ela não é.** O que funcionou: "cabeça humana
íntegra, coberta de pele, com testa, olhos, nariz, boca, queixo e uma orelha de cada lado",
seguido do que está proibido. Só o "não pode ser caveira" não basta.

#### O download mente de dois jeitos, e os dois aconteceram aqui

Ontem a regra virou "apague o local antes e busque com `?v=<timestamp>`". **Não basta.** Hoje:

- **`deploy_project` devolve `status: pending` e o domínio continua servindo o build ANTERIOR,
  por mais de dez minutos.** Baixei 9 arquivos e 8 vieram 404. O nono, `dead-bug-2.webp`, veio
  200 e era **o arquivo de um lote anterior**, exatamente a armadilha de ontem. Só que desta vez
  a comparação de md5 com o arquivo antigo pegou.
- **Publicar sob um NOME NOVO destrava, mas nem sempre na hora.** O primeiro nome novo serviu o
  build fresco na primeira tentativa; o segundo serviu o build velho e demorou.

**Então a verificação de frescor é por md5, sempre.** Guarde o md5 do arquivo antigo ANTES de
gerar, e só aceite o download quando o md5 mudar. Conferir "é imagem?" não distingue nada, e
conferir HTTP 200 também não.

**E não tente medir frescor por `Content-Length`:** `lovable.app` não responde HEAD com esse
cabeçalho. Montei um laço de espera baseado nele e ele rodou **840 vezes com a variável vazia**,
ou seja, nunca teve chance de ser verdadeiro. É a mesma classe de erro que a regra "verificar por
código de saída, nunca por grep" já cobre: **uma verificação que não pode falhar não verifica
nada.** Antes de confiar num laço de espera, imprima o valor que ele está comparando.

### ADENDO de 23/08/2026 (tarde): a JANELA não vaza, o overlay vaza, e nomeie o exercício

Rodada das 11 fotos de execução que o Filipe reprovou de uma vez, dizendo que não era só o
corpo, era a composição: o equipamento, as mãos, o movimento. Ele estava certo, e os defeitos
caem em quatro classes que vale procurar em qualquer foto de execução:

1. **A mão não fecha no que segura.** Punho fechado VAZIO com o haltere flutuando ao lado
   (scaption), borrão cinza no lugar da pegada (remada invertida), corda encostando no
   antebraço com a mão aberta na cabeça (abdominal na polia). É a classe mais comum.
2. **Aparelho inventado ou trocado.** A cadeira adutora era a ABdutora, com os coxins por fora
   e as pernas abrindo: a imagem ensinava o exercício OPOSTO. O leg press tinha um haltere no
   peito e o pé empurrando uma pilha de placas solta. O tríceps testa tinha anilhas em forma
   de tubo numa barra pendurada na diagonal.
3. **Movimento errado.** O y-raise estava deitado de barriga para CIMA quando o primário é o
   trapézio inferior, que só trabalha de bruços: a foto tornava o exercício impossível.
4. **Implemento sem função.** A alça elástica no chão em volta da perna PARADA, deixando a
   perna que trabalha fora dela, ou seja, resistência nenhuma.

**Confira sempre contra o que o PRÓPRIO PRODUTO define.** As `fases` e o `resumoPratico` de
cada exercício dizem a posição, o ângulo e o implemento. Foi lendo `fases` que descobri que o
y-raise é de bruços, e a foto estava contra a definição do catálogo.

#### A descoberta que mais rende: JANELA RECORTADA em vez de overlay

Ao refazer as 11 camadas de análise, pedir "o músculo em vermelho translúcido por cima da
região" falhou em 5 de forma sistemática: **o vermelho VAZA e acaba cobrindo o segmento
inteiro do membro.** O adutor virou quadríceps, o glúteo médio desceu até o joelho, o tibial
anterior engoliu a panturrilha. E duas foram além, transformando a pessoa numa figura
anatômica sem roupa.

**Pedir JANELA RECORTADA acertou as cinco.** A foto continua foto, a pessoa continua vestida
com pele normal, e só um pedaço bem delimitado parece aberto, com borda de corte visível, com
o músculo em vermelho LÁ DENTRO. **A janela tem borda por construção, então o vermelho não tem
para onde escorrer.** Já era a convenção para músculo PROFUNDO (supraespinal, diafragma);
agora é a convenção para QUALQUER músculo que o overlay não consiga conter.

E acrescente sempre onde o vermelho PARA, com marco visível: "para onde começa a coxa", "para
exatamente no cotovelo", "a panturrilha atrás continua com pele normal".

#### Quando o detalhe teimar, NOMEIE o exercício em vez de descrever a anatomia

A `puxada-supinada` saiu pronada pela oitava vez entre sessões. Descrever palma, polegar,
nós dos dedos e rotação de antebraço nunca funcionou. **O que funcionou foi nomear:** "gere um
REVERSE-GRIP LAT PULLDOWN, também chamado underhand ou supinated lat pulldown; a mão é a mesma
de quem segura a barra para fazer ROSCA DIRETA, e a mesma da barra fixa supinada". O gerador
conhece o exercício pelo nome e acerta a mão inteira de uma vez.

Vale o par: dê o **nome do exercício** e um **exercício-âncora com a mesma mão**. E dê um
critério de conferência que não dependa da mão: "se os cotovelos estiverem abertos para os
LADOS, está errado; na supinada eles apontam para o chão, rentes ao tronco".

#### Trocar a foto de execução ÓRFA a camada de análise

Isso não é opcional e não é sutil: a camada de análise É a foto com o músculo desenhado, e o
produto a revela com um divisor deslizante por cima da foto. Trocada a foto, a análise passa a
mostrar outra cena por baixo. O `check:pares` cobrou em 8 pontos assim que instalei as fotos
novas, com a mensagem certa. **Refazer uma foto de execução é sempre um trabalho de PAR.**

Corolário que também apareceu: uma declaração de `analiseOutraVista` pode deixar de ser
VERDADE quando a foto muda. `puxada-supinada` e `scaption` diziam que a análise era de costas
por causa de músculo posterior ou profundo; com a foto nova em três quartos e com a janela no
próprio ombro, as duas passaram a ser a mesma tomada, e as declarações saíram.

**Limite medido do `check:pares`, para não confiar demais:** ele mede divergência de cena na
BORDA do quadro. Quando eu troquei só o ângulo dos braços do scaption, mantendo a mesma
academia, a borda não mudou e ele NÃO acusou o par desatualizado. Ele pega troca de cena, não
troca de pose. Pose continua sendo olho.

## Verificação é obrigatória

O agente do Lovable **avisa sozinho** quando erra ("a imagem 0 saiu parecendo uma máquina de cabos"). Leia a resposta dele. Mas não confie só nisso: olhe as imagens. Nunca salve lote sem inspecionar item a item.

## Granularidade

- Erros: **uma imagem por erro** (`erros/<slug>-<i>.webp`, i na ordem de `errosComuns`). Uma imagem por exercício não funciona: não dá para mostrar "joelho valgo" e "lombar em flexão" na mesma figura. Foi exatamente a reclamação do fundador.
- Variações: uma por variação (`variacoes/<slug>-<i>.webp`), já funciona assim.
- Prompts prontos dos 62 erros: `docs/prompts-erros-comuns.md`.

## ADENDO de 07/08/2026: a receita do boneco posado, medida em 28 rodadas

A fila do boneco na posição (`public/anatomy/mmp/<slug>.webp`) fechou em **77 exercícios**,
com **20 excluídos por regra**. O que segue não é preferência, é o que 8 rodadas seguidas de
conferência olho a olho mostraram. As três partes juntas renderam 5 aprovadas seguidas de
primeira; separadas, não rendiam.

### A receita

1. **Semente que já tem a POSTURA, não o exercício parecido.** Para a bicicleta reclinada,
   `leg-press-horizontal` (sentado recostado, pernas à frente) funciona e a bicicleta vertical
   não. Para o remo, `remada-baixa`. Para o pullover, `elevacao-frontal`, porque nela o braço
   já está reto e elevado.
2. **Aparelho descrito pelas PEÇAS**, nunca pela postura que ele impõe. Remo: trilho no chão,
   assento sem encosto sobre o trilho, tambor redondo na ponta, corrente, alça reta, pés em
   placas inclinadas.
3. **O negativo explícito.** Escrever o que NÃO desenhar. Sem "sem parede, sem corrimão curvo,
   sem piso de degrau largo", a escada ergométrica tinha tudo para virar escada de casa.

### Apagar antes de desenhar

Apagar equipamento funciona (2 de 2), **desde que o substituto seja declarado**: "no lugar da
esteira, só uma linha horizontal fina". Sem substituto, o gerador preenche o vazio com cenário.

Mas há um limiar de tamanho. Quando a máquina da semente é **grande e envolve a figura**,
dizer "troque o aparelho por" faz o gerador **somar em vez de trocar**: a bicicleta reclinada
saiu como o leg press inteiro com um volante parafusado na frente. Nesse caso, escrever em
**dois passos numerados**: passo 1, apagar, com a lista do que não pode sobrar (trilho,
carrinho, placa, torre, cabo); passo 2, desenhar do zero. Resolveu na segunda tentativa.

### Nunca semear com o vizinho do qual você precisa diferenciar

O levantamento terra semeado com o terra romeno saiu **igual ao romeno**, duas vezes. A postura
da semente é justamente a que tinha de mudar, e o gerador se ancora nela. Publicar seria dar a
mesma figura a dois exercícios diferentes, que é a reclamação que o fundador já fez uma vez.

### LATERALIDADE é uma família de limite, não um caso isolado

O gerador **não coloca destaque na metade distante do tronco quando há um objeto do lado
próximo**: ele puxa o destaque para o lado do objeto. Mediu-se 2 de 2 no suitcase carry, em que
o oblíquo tem de ficar do lado SEM peso, e nomear o lado pela posição na tela não adiantou.
Some-se ao valgo e às rotações já medidas.

**Regra de triagem, antes de gastar crédito:** a afirmação depende de QUAL LADO está pintado?
Se depender, é provável exclusão.

### Fase de extremidade: o limite existe, mas a regra de exclusão estava errada

A fase de extremidade falha, agora 4 de 4: cotovelo na rosca, calcanhar na panturrilha,
tornozelo na dorsiflexão, punho na flexão de punho. Todos saíram parados no meio.

**Mas isso sozinho não justifica excluir.** A dorsiflexão e a flexão de punho ficaram
utilizáveis porque a **identidade** desses exercícios não mora na fase, mora no ARRANJO:
elástico por cima do pé indo a um ponto fixo à frente, com o tibial anterior em azul; antebraço
deitado na coxa com a mão passando do joelho e o halter na mão. Quem lê reconhece o exercício
com o ângulo articular parado.

Fase de extremidade só vira exclusão quando **a fase É a identidade**, como no valgo e na
pegada supinada. Fora disso, gere e registre a fase como ressalva.

### Critério de aceite

Músculo errado reprova. Equipamento ilegível reprova. Equipamento imperfeito mas legível passa
com a ressalva registrada no commit.

### Duas armadilhas que são do operador, não do gerador

- **Confira a sua própria descrição antes de culpar o gerador.** Pedi o halter como "barra
  vertical com um disco em cima e outro embaixo", o que não é um halter. O gerador desenhou o
  objeto certo apesar do pedido. No abdominal na polia pedi a figura de costas para a coluna e
  ela saiu de frente, que é a execução mais comum: o pedido atípico era o meu.
- **A avaliação do agente do Lovable erra nos dois sentidos.** Ele deu "parcial" em imagens
  aprováveis e "✅" em imagens reprovadas. Continua valendo: olhe você mesmo, uma a uma.
