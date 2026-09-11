/**
 * PLAYER DE VSL, no modelo da VTurb.
 *
 * O que um player de vídeo de vendas faz de diferente de um <video> comum, e que este módulo
 * recria (nomes entre aspas são os da VTurb, para quem vier da documentação deles):
 *
 * - "Smart Autoplay": o vídeo começa sozinho, sem som, com um aviso "Seu vídeo já começou /
 *   Clique para ouvir". O clique RECOMEÇA do zero com som, então ninguém perde o gancho.
 * - "Barra de progresso fictícia": anda rápido no começo e desacelera, para o vídeo não
 *   parecer longo. Liga e desliga em `barra.modo`.
 * - "Continuar assistindo": quem sai e volta escolhe entre continuar de onde parou ou
 *   recomeçar.
 * - Sem barra de busca: não dá para pular para o preço. Clique pausa e retoma.
 * - "Pausa inteligente": pausa quando a aba sai de foco e retoma quando volta.
 * - "Código de delay" / "Mostrar conteúdo oculto": elementos da página com a classe
 *   `esconder` só aparecem no momento do pitch, e continuam aparecendo em visitas futuras
 *   (`persist`).
 * - "Botão de ação" dentro do vídeo, sincronizado com o tempo da fala.
 * - "Mini-ganchos": frases curtas por cima do vídeo nos pontos de abandono.
 * - "Turbo": velocidade fixa (1,0 a 1,5), sem mexer nos tempos do pitch e do botão.
 * - "Picture-in-picture": ao rolar a página, o vídeo segue num mini player no canto.
 * - "Experiência fullscreen": tela cheia desenhada pela página (o nativo do iPhone traz barra
 *   de busca, que o VSL não quer).
 * - "Pixels": eventos a cada 5% assistido e no pitch, para o Pixel da Meta, o gtag e o
 *   dataLayer, SE algum deles estiver instalado na página (hoje nenhum está).
 * - "Teste A/B": variantes sorteadas por visitante e gravadas junto das métricas.
 * - "Analytics": sessões anônimas com retenção, play rate, pitch e clique no botão, lidas no
 *   painel /painel-vsl.
 */

export type ModoBarra = "ficticia" | "real" | "oculta";

/** Área clicável por cima do vídeo, em % do quadro (o botão desenhado no próprio vídeo). */
export type Hotspot = { de: number; ate: number; x: number; y: number; w: number; h: number; href: string; rotulo: string };

export type Gancho = {
  de: number;
  ate: number;
  /** Aceita {mm:ss}: contagem regressiva até `alvo` (segundos do vídeo). */
  texto: string;
  alvo?: number;
};

export type ConfigVsl = {
  /** Identificador estável: chave da memória no navegador e das métricas. */
  id: string;
  /** Playlist HLS mestre (várias qualidades; o player escolhe pela internet de quem assiste). */
  src: string;
  /** Capa ("ThumbSniper"): aparece antes de o vídeo carregar e atrás do "continuar". */
  capa: string;
  /** Duração real, em segundos. */
  duracao: number;
  /** Momento do pitch (preço na tela), em segundos: libera os elementos ocultos e o pixel de pitch. */
  pitch: number;
  autoplay: { ativo: boolean; aviso: string; chamada: string };
  barra: { modo: ModoBarra; altura: number; forca: number };
  continuar: { ativo: boolean; titulo: string; continuar: string; inicio: string; minimo: number };
  pausaInteligente: boolean;
  miniPlayer: boolean;
  telaCheia: boolean;
  /** Velocidade para todos ("Turbo"). 1 = normal. */
  turbo: number;
  ganchos: Gancho[];
  hotspots: Hotspot[];
  /** Onde o fim do vídeo leva: botão na tela final. */
  fim: { titulo: string; botao: string; href: string };
  cores: { destaque: string; textoDestaque: string };
  /** Variantes do teste A/B: cada uma sobrescreve parte da configuração. */
  variantes?: { nome: string; patch: Partial<Pick<ConfigVsl, "autoplay" | "turbo" | "barra">> }[];
};

/** Eventos que o elemento dispara (mesmos nomes da VTurb). */
export type EventoPlayer = "player:ready" | "player:play" | "player:pause" | "player:pitch" | "player:ended" | "player:timeupdate";
