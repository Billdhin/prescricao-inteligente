/**
 * Regras puras do player (sem DOM): testáveis em Node pelo `check:vsl`.
 */
import type { ConfigVsl, ModoBarra } from "./tipos";

/**
 * Fração da barra exibida para uma fração real assistida.
 *
 * "fictícia": 1 − (1 − x)^força. Com força 1,8, 10% do vídeo mostram 17% de barra e metade
 * mostra 71%: começa rápido e desacelera, que é o que faz um vídeo longo não parecer longo.
 * A curva é crescente e termina exatamente em 100%, então a barra nunca volta nem estoura.
 */
export function barraExibida(fracao: number, modo: ModoBarra, forca = 1.8): number {
  const x = Math.min(1, Math.max(0, fracao));
  if (modo === "real") return x;
  if (modo === "oculta") return 0;
  return 1 - Math.pow(1 - x, Math.max(1, forca));
}

/** Oferece "continuar assistindo" quando há um ponto salvo que valha a pena e o vídeo não acabou. */
export function podeRetomar(salvo: number | null, cfg: Pick<ConfigVsl, "duracao" | "continuar">): boolean {
  if (!cfg.continuar.ativo || salvo == null || !Number.isFinite(salvo)) return false;
  return salvo >= cfg.continuar.minimo && salvo < cfg.duracao - 15;
}

/** Texto do mini-gancho com a contagem regressiva {mm:ss} resolvida. */
export function textoGancho(texto: string, agora: number, alvo?: number): string {
  if (alvo == null || !texto.includes("{mm:ss}")) return texto;
  const falta = Math.max(0, Math.ceil(alvo - agora));
  const mm = String(Math.floor(falta / 60)).padStart(2, "0");
  const ss = String(falta % 60).padStart(2, "0");
  return texto.replace("{mm:ss}", `${mm}:${ss}`);
}

/** Degrau de 5% já cruzado (0, 5, 10 ... 100): cada degrau dispara o pixel uma vez só. */
export function degrauPixel(tempo: number, duracao: number, passo = 5): number {
  if (duracao <= 0) return 0;
  const pct = Math.min(100, (tempo / duracao) * 100);
  return Math.floor(pct / passo) * passo;
}

/** Sorteio estável da variante do teste A/B a partir de um número 0..1 guardado por visitante. */
export function escolherVariante<T extends { nome: string }>(variantes: T[] | undefined, sorteio: number): T | null {
  if (!variantes?.length) return null;
  const i = Math.min(variantes.length - 1, Math.floor(Math.min(0.999999, Math.max(0, sorteio)) * variantes.length));
  return variantes[i];
}

/** A configuração que vale para este visitante (a base com o patch da variante sorteada). */
export function aplicarVariante(cfg: ConfigVsl, sorteio: number): { cfg: ConfigVsl; variante: string } {
  const v = escolherVariante(cfg.variantes, sorteio);
  if (!v) return { cfg, variante: "base" };
  return {
    cfg: {
      ...cfg,
      ...(v.patch.turbo != null ? { turbo: v.patch.turbo } : {}),
      autoplay: { ...cfg.autoplay, ...v.patch.autoplay },
      barra: { ...cfg.barra, ...v.patch.barra },
    },
    variante: v.nome,
  };
}

/** Classifica o aparelho para o analytics (sem guardar o user-agent). */
export function tipoAparelho(ua: string, largura: number): "celular" | "tablet" | "computador" {
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua) || largura < 700) return "celular";
  return "computador";
}

/**
 * De onde veio a visita, como a VTurb separa: o `utm_source` do link quando existe, senão o
 * domínio de quem indicou, senão "direto" (só o domínio, nunca o endereço inteiro de quem
 * indicou, que pode carregar dado da pessoa). Os outros UTMs vão junto para separar mídia,
 * campanha, criativo (`utm_content`) e termo.
 */
export type Origem = { origem: string; midia: string | null; campanha: string | null; conteudo: string | null; termo: string | null };
export function origemDaVisita(busca: string, referrer: string, host: string): Origem {
  const q = new URLSearchParams(busca);
  const corta = (k: string, n: number) => q.get(k)?.trim().slice(0, n) || null;
  const utms = { midia: corta("utm_medium", 60), campanha: corta("utm_campaign", 80), conteudo: corta("utm_content", 80), termo: corta("utm_term", 80) };
  const utm = corta("utm_source", 60);
  if (utm) return { origem: utm, ...utms };
  try {
    const r = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
    if (r && r !== host.replace(/^www\./, "")) return { origem: r.slice(0, 60), ...utms };
  } catch {
    /* referrer inválido: trata como direto */
  }
  return { origem: "direto", ...utms };
}

/** Sistema do aparelho, só o nome (sem versão: não serve para medir o vídeo e ajuda a identificar). */
export function sistemaOperacional(ua: string): string {
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "outro";
}

/**
 * Navegador, só o nome. Os navegadores internos do Instagram, do Facebook e do TikTok vêm
 * separados de propósito: é por eles que chega quase todo o tráfego de anúncio, e o vídeo se
 * comporta diferente lá (autoplay, som, tela cheia).
 */
export function navegadorDe(ua: string): string {
  if (/Instagram/.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) return "Facebook";
  if (/musical_ly|TikTok|BytedanceWebview/.test(ua)) return "TikTok";
  if (/SamsungBrowser/.test(ua)) return "Samsung";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox|FxiOS/.test(ua)) return "Firefox";
  if (/CriOS|Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "outro";
}
