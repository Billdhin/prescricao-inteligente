/**
 * Ponto de entrada do player para QUALQUER site (sem React, sem este projeto): vira o arquivo
 * único `mapa-vsl.min.js` do pacote (scripts/vsl-pacote.mjs). Uso:
 *
 *   <mapa-vsl video="meu-vsl"></mapa-vsl>
 *   <script src="mapa-vsl.min.js"></script>
 *   <script>
 *     MapaVsl.configurar({ id: "meu-vsl", src: "https://.../master.m3u8", capa: "https://.../capa.webp",
 *                          duracao: 466, pitch: 394 });
 *   </script>
 *
 * Tudo o que não for informado vem de `PADRAO` (textos da VTurb, barra fictícia, continuar
 * assistindo, pausa inteligente, mini player, tela cheia). Métricas só com `metricas: {url, chave}`.
 */
import { registrarVsl, type MapaVsl } from "./player";
import { VIDEOS } from "./videos";
import type { ConfigVsl } from "./tipos";

export const PADRAO: Omit<ConfigVsl, "id" | "src" | "capa" | "duracao" | "pitch"> = {
  autoplay: { ativo: true, aviso: "Seu vídeo já começou", chamada: "Clique para ouvir" },
  barra: { modo: "ficticia", altura: 5, forca: 1.8 },
  continuar: { ativo: true, titulo: "Você já começou a assistir este vídeo", continuar: "Continuar assistindo", inicio: "Assistir do início", minimo: 20 },
  pausaInteligente: true,
  miniPlayer: true,
  telaCheia: true,
  turbo: 1,
  ganchos: [],
  hotspots: [],
  fim: { titulo: "Obrigado por assistir", botao: "Quero saber mais", href: "#" },
  cores: { destaque: "#E8A317", textoDestaque: "#0B1628" },
  metricas: false,
};

type Parcial = Pick<ConfigVsl, "id" | "src" | "capa" | "duracao" | "pitch"> &
  Partial<Omit<ConfigVsl, "autoplay" | "barra" | "continuar" | "fim" | "cores">> & {
    autoplay?: Partial<ConfigVsl["autoplay"]>;
    barra?: Partial<ConfigVsl["barra"]>;
    continuar?: Partial<ConfigVsl["continuar"]>;
    fim?: Partial<ConfigVsl["fim"]>;
    cores?: Partial<ConfigVsl["cores"]>;
  };

/** Completa a configuração com o padrão e liga os <mapa-vsl video="id"> que já estão na página. */
export function configurar(p: Parcial): ConfigVsl {
  for (const k of ["id", "src", "capa", "duracao", "pitch"] as const)
    if (p[k] == null || p[k] === "") throw new Error(`[mapa-vsl] falta "${k}" na configuração`);
  const cfg: ConfigVsl = {
    ...PADRAO,
    ...p,
    autoplay: { ...PADRAO.autoplay, ...p.autoplay },
    barra: { ...PADRAO.barra, ...p.barra },
    continuar: { ...PADRAO.continuar, ...p.continuar },
    fim: { ...PADRAO.fim, ...p.fim },
    cores: { ...PADRAO.cores, ...p.cores },
  };
  VIDEOS[cfg.id] = cfg;
  registrarVsl();
  document.querySelectorAll<MapaVsl>(`mapa-vsl[video="${CSS.escape(cfg.id)}"]`).forEach((el) => (el.config = cfg));
  return cfg;
}

const api = { configurar, PADRAO, versao: "1.0.0" };
(window as unknown as { MapaVsl: typeof api }).MapaVsl = api;
registrarVsl();
