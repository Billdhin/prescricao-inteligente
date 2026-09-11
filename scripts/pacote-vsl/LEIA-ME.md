# Player de VSL (modelo VTurb) · versão 1.0.0

Um player de vídeo de vendas com a lógica da VTurb, para usar em qualquer site, com o vídeo
hospedado onde você quiser e as métricas no seu próprio banco (Supabase, plano gratuito serve
para começar).

## 1. O que vem nesta pasta

| Pasta | O que é |
| --- | --- |
| `player/mapa-vsl.min.js` | O player inteiro em um arquivo só. É ele que vai no site. |
| `player/mapa-vsl.js` | O mesmo arquivo sem compactar, para ler e estudar. |
| `exemplo/pagina-de-vendas.html` | Página de VSL pronta: título, player, código de delay e oferta escondida. Abra no navegador e o vídeo de demonstração toca. |
| `painel/painel.html` | O "Analytics": visitas, play rate, engajamento, retenção, conversão, origem, horários e exportação em planilha. |
| `banco/supabase-completo.sql` | O banco das métricas (tabelas e funções). Roda uma vez no Supabase. |
| `ferramentas/gerar-hls.mjs` | Converte o seu vídeo no formato de streaming (HLS) em 4 qualidades, como a VTurb faz no upload. |
| `codigo-fonte/` | Todo o código em TypeScript, com o componente para React, a página e o painel usados no Mapa da Prescrição e o script de construção. |

## 2. Os recursos, com o nome que a VTurb usa

| VTurb | Aqui | Como liga ou desliga |
| --- | --- | --- |
| Smart Autoplay | O vídeo começa sem som com o aviso "Seu vídeo já começou / Clique para ouvir". O clique recomeça do zero com som. | `autoplay: { ativo, aviso, chamada }` |
| Barra de progresso fictícia | Anda rápido no começo e desacelera. | `barra: { modo: "ficticia" \| "real" \| "oculta", forca, altura }` |
| Continuar assistindo | Quem volta escolhe entre continuar de onde parou ou recomeçar. | `continuar: { ativo, titulo, continuar, inicio, minimo }` |
| Sem barra de busca | Não dá para pular para o preço. Clique pausa e retoma. | sempre |
| Pausa inteligente | Pausa quando a aba sai de foco e retoma na volta. | `pausaInteligente` |
| Código de delay / Mostrar conteúdo oculto | Elementos com a classe `esconder` aparecem no pitch, e direto em visitas futuras. | `displayHiddenElements` (seção 4) |
| Botão de ação | Área clicável por cima do vídeo, sincronizada com o tempo. | `hotspots: [{ de, ate, x, y, w, h, href, rotulo }]` (posição em % do quadro) |
| Mini-ganchos | Frase curta por cima do vídeo num intervalo, com contagem `{mm:ss}`. | `ganchos: [{ de, ate, texto, alvo }]` |
| Turbo | Velocidade fixa para todos (1,0 a 1,5). O pitch e os botões seguem o tempo real do vídeo. | `turbo` |
| Picture-in-picture | Ao rolar a página, o vídeo segue num mini player no canto. | `miniPlayer` |
| Experiência fullscreen | Tela cheia desenhada pela página (a nativa do iPhone traz barra de busca). | `telaCheia` |
| Teste A/B | Variantes sorteadas por visitante e guardadas junto das métricas. | `variantes: [{ nome, patch }]` |
| Pixels | Evento a cada 5% (`View5%`, `View10%`...), `VSL_Pitch` e `VSL_CTA`, para o Pixel da Meta, o gtag e o dataLayer que JÁ estiverem na página. | automático |
| Analytics | Tudo da seção 6, no seu Supabase. | `metricas: { url, chave }` |
| Código de velocidade | `<link rel="preconnect">` para o servidor do vídeo (está no exemplo). | na página |

## 3. Passo a passo para colocar o seu VSL no ar

### 3.1 Converter o vídeo

Precisa do [ffmpeg](https://ffmpeg.org) e do [Node.js](https://nodejs.org) instalados.

```bash
node ferramentas/gerar-hls.mjs "meu-vsl.mp4" vsl-2026-09-20 5
```

O último número é o segundo usado para a capa. Sai uma pasta com `master.m3u8`, as quatro
qualidades (`v1080`, `v720`, `v480`, `v360`) e `capa.webp`. Um VSL de 8 minutos fica entre
250 e 350 MB, porque as cenas paradas gastam pouco.

### 3.2 Hospedar a pasta

Qualquer hospedagem de arquivos estáticos serve: Cloudflare Pages ou R2, Bunny, S3, a própria
hospedagem do site. Três cuidados:

1. **Pasta nova a cada versão do vídeo** (a data no nome), e cache longo nela
   (`Cache-Control: public, max-age=31536000, immutable`).
2. **Se o vídeo ficar em outro domínio que a página**, o servidor precisa mandar
   `Access-Control-Allow-Origin: *` (ou o domínio da página) nos arquivos do vídeo.
3. Os tipos de arquivo: `.m3u8` como `application/vnd.apple.mpegurl` e `.m4s` como
   `video/iso.segment` (a maioria das hospedagens já faz isso sozinha).

Os pedaços são `.m4s` e não `.ts` de propósito: em projetos com TypeScript, arquivo `.ts` é lido
como código.

### 3.3 Colar o player na página

Como o código de incorporação da VTurb:

```html
<mapa-vsl video="meu-vsl"></mapa-vsl>
<script src="mapa-vsl.min.js"></script>
<script>
  MapaVsl.configurar({
    id: "meu-vsl",
    src: "https://seu-servidor.com/vsl-2026-09-20/master.m3u8",
    capa: "https://seu-servidor.com/vsl-2026-09-20/capa.webp",
    duracao: 466,   // em segundos
    pitch: 394,     // o segundo em que o preço aparece
    fim: { titulo: "Pronto?", botao: "Quero garantir", href: "https://seu-checkout.com" },
    metricas: { url: "https://xxxx.supabase.co", chave: "sua-chave-publica" }
  });
</script>
```

O resto vem do padrão (ver `MapaVsl.PADRAO` no console, ou a tabela da seção 7).

## 4. Código de delay (conteúdo que aparece no pitch)

Igual ao da VTurb, trocando só o seletor do player:

```html
<style>.esconder { display: none !important; }</style>

<section class="esconder"> ... preço, garantia, botão ... </section>

<script>
  var delaySeconds = 394; // 6:34 → (6 × 60) + 34
  var player = document.querySelector("mapa-vsl");
  player.addEventListener("player:ready", function () {
    player.displayHiddenElements(delaySeconds, [".esconder"], { persist: true });
  });
</script>
```

Com `persist: true`, quem já chegou ao pitch numa visita anterior vê o conteúdo na hora. Os
elementos revelados ganham a classe `vsl-revelado`, para você animar a entrada.

Para repassar os UTMs da página ao link do checkout (a VTurb recomenda, para saber qual anúncio
vendeu), copie o trecho "OPCIONAL" do final de `exemplo/pagina-de-vendas.html`.

## 5. Métricas: ligar o analytics

1. Crie um projeto em [supabase.com](https://supabase.com) (o gratuito serve para começar).
2. Em **SQL Editor**, cole e rode `banco/supabase-completo.sql`.
3. Crie um usuário para você em **Authentication > Users** e cadastre o e-mail dele como
   administrador, no mesmo SQL Editor:
   ```sql
   insert into public.vsl_admins (email) values ('seu-email@exemplo.com');
   ```
4. Em **Project Settings > API**, copie o **Project URL** e a chave **anon / publishable** e
   coloque em `metricas: { url, chave }` na configuração do player.
5. Abra `painel/painel.html`, preencha a conexão e entre com o usuário do passo 3.

Segurança: a chave pública só consegue GRAVAR sessões pela função `vsl_registrar`, que valida
cada campo e só deixa os números subirem. Ninguém lê a tabela direto; o painel lê pela função
`vsl_painel`, que só responde para os e-mails em `vsl_admins`.

## 6. O que é medido, e como cada número é calculado

Uma linha por visita (sessão) em `vsl_sessoes`:

| Métrica | Definição |
| --- | --- |
| Visitas | Sessões abertas na página do vídeo. |
| Play rate | Quem ativou o som, sobre as visitas. |
| Engajamento | A fração média do vídeo assistida por quem deu play. |
| Tempo médio / horas assistidas | Segundos de fato assistidos com som (pausa e retomada não contam duas vezes). |
| Retenção | Dos que deram play, quantos estavam assistindo em cada ponto do vídeo (101 pontos). Quem voltou pelo "continuar assistindo" conta a partir de onde retomou. |
| Retenção no pitch | Quem chegou ao segundo do pitch, sobre os plays. |
| Conversão | Clique no botão (a VTurb também conta o clique como o momento da conversão), sobre os plays. Inclui o segundo mediano do clique. |
| Até o fim / retomadas | Quem terminou; quem voltou pelo "continuar assistindo". |
| Carregamento | Mediana do tempo da abertura da página até o primeiro quadro. |
| Travamentos e pausas | Médias por play. |
| Ao vivo | Quem estava assistindo nos últimos 2 minutos. |
| Por dia, hora e dia da semana | "Melhores horários", no horário de Brasília. |
| Por grupo | Origem (`utm_source` ou o domínio de quem indicou), mídia (`utm_medium`), campanha (`utm_campaign`), criativo (`utm_content`), termo (`utm_term`), variante do teste A/B, aparelho, sistema, navegador (os internos do Instagram, Facebook e TikTok separados) e fuso horário. |

O painel exporta todas as sessões do período em planilha (`;` como separador, abre direto no
Excel).

## 7. Referência da configuração

| Campo | Padrão | O que faz |
| --- | --- | --- |
| `id` | obrigatório | Identificador do vídeo (o mesmo do atributo `video=""`). Também é a chave da memória e das métricas. |
| `src` | obrigatório | O `master.m3u8`. |
| `capa` | obrigatório | Imagem de capa. |
| `duracao` | obrigatório | Duração real, em segundos. |
| `pitch` | obrigatório | Segundo do pitch: dispara `player:pitch`, o pixel `VSL_Pitch` e marca a sessão. |
| `autoplay` | ativo, "Seu vídeo já começou", "Clique para ouvir" | Smart Autoplay. |
| `barra` | fictícia, força 1,8, altura 5 px | Barra de progresso. Força maior = começo mais rápido. |
| `continuar` | ativo, mínimo 20 s | Continuar assistindo (só oferece depois do mínimo e antes dos 15 s finais). |
| `pausaInteligente` | `true` | Pausa ao trocar de aba. |
| `miniPlayer` | `true` | Mini player ao rolar. |
| `telaCheia` | `true` | Botão de tela cheia. |
| `turbo` | `1` | Velocidade para todos. |
| `ganchos` | nenhum | Mini-ganchos. Ponha nos pontos em que a retenção cai. |
| `hotspots` | nenhum | Botões clicáveis por cima do vídeo. |
| `fim` | "Obrigado por assistir" | Tela final com botão. |
| `cores` | âmbar `#E8A317` | Cor de destaque e do texto sobre ela. |
| `variantes` | nenhuma | Teste A/B: `[{ nome: "B", patch: { autoplay: { chamada: "Toque para ouvir" } } }]`. |
| `metricas` | desligado | `{ url, chave, funcao? }` do seu Supabase. |

## 8. Eventos e métodos do elemento

```js
var p = document.querySelector("mapa-vsl");
p.addEventListener("player:ready", ...);      // pronto
p.addEventListener("player:play", ...);       // começou a assistir com som
p.addEventListener("player:pause", ...);
p.addEventListener("player:timeupdate", e => e.detail.tempo);
p.addEventListener("player:pitch", ...);      // chegou ao pitch
p.addEventListener("player:revelou", ...);    // revelou conteúdo oculto
p.addEventListener("player:ended", ...);

p.displayHiddenElements(segundos, [".esconder"], { persist: true });
p.play(); p.pause(); p.currentTime;
```

Todo evento traz `detail.video` e `detail.variante`.

## 9. Em React

Use `codigo-fonte/react/VslPlayer.tsx`: ele cria o `<mapa-vsl>` uma vez só e nunca o recria
(recriar reinicia o vídeo). A página `Apresentacao.tsx` e o painel `PainelVsl.tsx` são os do
Mapa da Prescrição, como referência.

## 10. Privacidade (LGPD)

A medição não guarda nome, e-mail, endereço IP, user-agent completo nem o endereço completo de
quem indicou: um código aleatório criado no navegador, tipo de aparelho, nome do sistema e do
navegador, fuso horário, os UTMs do link e o que aconteceu com o vídeo. Quem pede para não ser
rastreado (Do Not Track ou Global Privacy Control) não gera métrica. Mesmo assim, **declare a
medição na sua Política de Privacidade**, com a lista acima e a base legal (legítimo interesse).
O navegador de quem assiste guarda, só nele, o ponto em que parou e se já viu o pitch.

## 11. Problemas conhecidos, e o que o player já faz com eles

- **Chrome e Edge de computador congelavam a imagem ao retomar depois de uma pausa longa**
  quando tocavam HLS pelo tocador próprio. O player usa o tocador nativo só na Apple (iPhone,
  iPad, Safari) e a biblioteca hls.js no resto, e tem um vigia que recupera a imagem se ela
  parar enquanto o áudio segue.
- **Autoplay com som não existe em nenhum navegador moderno**: por isso o Smart Autoplay começa
  sem som e pede o clique. Em modo de economia de bateria o iPhone segura até o autoplay sem som;
  aí o cartão vira o botão de play.
- **Navegadores internos (Instagram, Facebook)** às vezes bloqueiam a tela cheia; o player cai na
  tela cheia desenhada pela página.

## 12. Construir o player a partir do código-fonte

```bash
cd codigo-fonte
npm install hls.js@1 esbuild
node construir.mjs
```

Sai `mapa-vsl.js` e `mapa-vsl.min.js`. A entrada é `vsl/independente.ts`.

Licenças de terceiros: [hls.js](https://github.com/video-dev/hls.js) (Apache 2.0), embutido no
arquivo do player; [supabase-js](https://github.com/supabase/supabase-js) (MIT), carregado pelo
painel.
