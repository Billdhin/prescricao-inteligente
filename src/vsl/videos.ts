/**
 * Os vídeos que o player conhece, como o painel da VTurb guarda cada "vid-XXXX".
 *
 * A mídia (HLS em 4 qualidades + capa) NÃO mora na main: são ~300 MB. Ela fica no ramo
 * `vsl-midia` e o deploy a coloca em `dist/vsl/` (ver .github/workflows/deploy-cloudflare.yml).
 * Para ter o vídeo no `npm run dev`: `npm run vsl:midia`.
 *
 * Trocar o vídeo: gerar a nova pasta com `scripts/vsl-hls.mjs`, subir no ramo `vsl-midia`
 * numa pasta nova (a data da versão) e apontar `src`/`capa` para ela. Pasta nova, e não a
 * mesma, porque os pedaços do vídeo vão com cache eterno.
 */
import type { ConfigVsl } from "./tipos";

const PASTA = "/vsl/2026-09-11";

export const VSL_APRESENTACAO: ConfigVsl = {
  id: "vsl-apresentacao-2026-09",
  src: `${PASTA}/master.m3u8`,
  capa: `${PASTA}/capa.webp`,
  duracao: 466,
  // 6:34,1: o preço de fundador entra na tela. É aqui que o botão e a oferta aparecem.
  pitch: 394.1,
  autoplay: { ativo: true, aviso: "Seu vídeo já começou", chamada: "Clique para ouvir" },
  barra: { modo: "ficticia", altura: 5, forca: 1.8 },
  continuar: {
    ativo: true,
    titulo: "Você já começou a assistir este vídeo",
    continuar: "Continuar assistindo",
    inicio: "Assistir do início",
    minimo: 20,
  },
  pausaInteligente: true,
  miniPlayer: true,
  telaCheia: true,
  turbo: 1,
  // Nenhum mini-gancho ainda: eles vão nos pontos de abandono, e esses pontos saem da
  // retenção medida no /painel-vsl, não de palpite. Formato:
  // { de: 95, ate: 103, texto: "Em {mm:ss} eu te mostro a Helena no sistema", alvo: 22 }
  ganchos: [],
  // O botão desenhado no próprio vídeo vira clicável (medido no quadro do export final).
  hotspots: [
    { de: 444.3, ate: 447.0, x: 38.4, y: 83.9, w: 23.1, h: 9.2, href: "/dashboard?criar=1", rotulo: "Criar minha conta" },
    { de: 462.5, ate: 466, x: 40.3, y: 56.1, w: 19.3, h: 6.6, href: "/dashboard?criar=1", rotulo: "Criar minha conta" },
  ],
  fim: { titulo: "Pronto para criar a sua conta?", botao: "Criar minha conta", href: "/dashboard?criar=1" },
  cores: { destaque: "#E8A317", textoDestaque: "#0B1628" },
  variantes: [
    { nome: "A · clique para ouvir", patch: { autoplay: { ativo: true, aviso: "Seu vídeo já começou", chamada: "Clique para ouvir" } } },
    { nome: "B · ative o som", patch: { autoplay: { ativo: true, aviso: "O vídeo está sem som", chamada: "Toque para ativar o som" } } },
  ],
};

export const VIDEOS: Record<string, ConfigVsl> = { [VSL_APRESENTACAO.id]: VSL_APRESENTACAO };
