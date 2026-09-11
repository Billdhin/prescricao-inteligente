/**
 * Memória no navegador e métricas do VSL.
 *
 * MEMÓRIA (localStorage, só neste aparelho): onde parou ("continuar assistindo"), se já viu o
 * pitch (para o conteúdo oculto aparecer direto na volta), a variante do teste A/B e dois
 * identificadores aleatórios.
 *
 * MÉTRICAS: uma linha por sessão na tabela `vsl_sessoes` (migrações 0014 e 0015), gravada pela
 * função `vsl_registrar`, que só aceita os campos de `Estado` e da base abaixo, e só deixa cada
 * número subir. Nada de nome, e-mail, IP, user-agent completo ou endereço de quem indicou: um
 * identificador aleatório, aparelho, sistema e navegador (só o nome), fuso, UTMs e o que
 * aconteceu com o vídeo. A Política de Privacidade declara a lista (seção 5) e o `check:legal`
 * cobra a declaração enquanto este envio existir.
 *
 * Quem pede para não ser rastreado (Do Not Track ou Global Privacy Control) não gera métrica.
 * Pixels de anúncio só recebem evento se já estiverem instalados na página; este módulo não
 * instala nenhum.
 */
import { navegadorDe, origemDaVisita, sistemaOperacional, tipoAparelho } from "./regras";

const ler = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const gravar = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* navegador sem armazenamento (aba privada restrita): o player segue sem memória */
  }
};
const apagar = (k: string) => {
  try {
    localStorage.removeItem(k);
  } catch {
    /* idem */
  }
};

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

export const memoria = {
  ponto: (id: string): number | null => {
    const v = ler(`vsl:${id}:ponto`);
    return v == null ? null : Number(v);
  },
  salvarPonto: (id: string, t: number) => gravar(`vsl:${id}:ponto`, String(Math.floor(t))),
  esquecerPonto: (id: string) => apagar(`vsl:${id}:ponto`),
  /** `persist` do código de delay: quem já chegou a este tempo vê o conteúdo direto. */
  jaRevelou: (id: string, segundos: number) => ler(`vsl:${id}:revelado:${Math.round(segundos)}`) === "1",
  marcarRevelado: (id: string, segundos: number) => gravar(`vsl:${id}:revelado:${Math.round(segundos)}`, "1"),
  /** Número 0..1 sorteado uma vez por visitante: decide a variante do teste A/B. */
  sorteio: (id: string): number => {
    const k = `vsl:${id}:sorteio`;
    const v = ler(k);
    if (v != null && Number.isFinite(Number(v))) return Number(v);
    const n = Math.random();
    gravar(k, String(n));
    return n;
  },
  visitante: (): string => {
    const v = ler("vsl:visitante");
    if (v) return v;
    const n = uuid();
    gravar("vsl:visitante", n);
    return n;
  },
};

export function naoRastrear(): boolean {
  if (typeof navigator === "undefined") return true;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  return n.doNotTrack === "1" || n.msDoNotTrack === "1" || n.globalPrivacyControl === true;
}

/**
 * O que a sessão acumula, cada campo com a regra de como ele se atualiza (a mesma que a
 * função `vsl_registrar` aplica no banco, para um envio atrasado nunca desfazer um mais novo):
 * - marcos (sim/não): uma vez "sim", sempre "sim";
 * - contadores e máximos: só sobem;
 * - "primeiro valor": o primeiro que chegar fica.
 */
export type Estado = {
  autoplay_ok: boolean;
  clicou_som: boolean;
  retomou: boolean;
  viu_pitch: boolean;
  clicou_cta: boolean;
  terminou: boolean;
  tela_cheia: boolean;
  mini_player: boolean;
  /** Onde a pessoa passou a assistir de verdade (0, ou o ponto do "continuar assistindo"). */
  segundo_inicio: number | null;
  segundo_max: number;
  /** Segundos de fato assistidos com som (não é o ponto máximo: pausa e retomada não contam duas vezes). */
  tempo_assistido: number;
  pausas: number;
  /** Quantas vezes o vídeo parou para carregar no meio da reprodução. */
  travamentos: number;
  /** Da abertura da página até o primeiro quadro na tela. */
  carregamento_ms: number | null;
  /** Em que segundo do vídeo o botão foi clicado. */
  cta_em: number | null;
};

const MARCOS = ["autoplay_ok", "clicou_som", "retomou", "viu_pitch", "clicou_cta", "terminou", "tela_cheia", "mini_player"] as const;
const SOBEM = ["segundo_max", "tempo_assistido", "pausas", "travamentos"] as const;
const PRIMEIRO = ["segundo_inicio", "carregamento_ms", "cta_em"] as const;

/** Para onde as métricas vão. Sem destino, o player funciona igual e só não mede. */
export type DestinoMetricas = { url: string; chave: string; funcao?: string };

function destinoPadrao(): DestinoMetricas | null {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  const url = env?.VITE_SUPABASE_URL, chave = env?.VITE_SUPABASE_ANON_KEY;
  return url && chave ? { url, chave } : null;
}

/**
 * Uma sessão de métricas. Envia no máximo a cada 10 s enquanto o vídeo roda, e na hora nos
 * marcos (som, pitch, clique, fim, saída da página). Falha de rede não quebra o player.
 */
export class Sessao {
  private readonly sessao = uuid();
  private readonly base: Record<string, unknown>;
  private estado: Estado = {
    autoplay_ok: false, clicou_som: false, retomou: false, viu_pitch: false, clicou_cta: false, terminou: false,
    tela_cheia: false, mini_player: false, segundo_inicio: null, segundo_max: 0, tempo_assistido: 0, pausas: 0,
    travamentos: 0, carregamento_ms: null, cta_em: null,
  };
  private ultimoEnvio = 0;
  private sujo = false;
  private readonly destino: DestinoMetricas | null;

  constructor(video: string, variante: string, velocidade: number, destino?: DestinoMetricas | false) {
    this.destino = naoRastrear() || destino === false ? null : destino ?? destinoPadrao();
    const ua = navigator.userAgent;
    let fuso: string | null = null;
    try {
      fuso = Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 60) ?? null;
    } catch {
      /* navegador sem Intl: fica sem fuso */
    }
    this.base = {
      sessao: this.sessao,
      visitante: memoria.visitante(),
      video,
      variante,
      velocidade,
      pagina: location.pathname.slice(0, 80),
      aparelho: tipoAparelho(ua, window.innerWidth),
      sistema: sistemaOperacional(ua),
      navegador: navegadorDe(ua),
      fuso,
      ...origemDaVisita(location.search, document.referrer, location.hostname),
    };
    if (this.destino) {
      this.enviar(true);
      addEventListener("pagehide", () => this.enviar(true));
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.enviar(true);
      });
    }
  }

  marcar(p: Partial<Estado>) {
    let marco = false;
    const e = this.estado as Record<string, unknown>;
    for (const k of MARCOS)
      if (p[k] && !e[k]) {
        e[k] = true;
        marco = true;
      }
    for (const k of SOBEM) {
      const v = p[k];
      if (typeof v === "number" && Number.isFinite(v) && Math.floor(v) > (e[k] as number)) {
        e[k] = Math.floor(v);
        this.sujo = true;
      }
    }
    for (const k of PRIMEIRO) {
      const v = p[k];
      if (typeof v === "number" && Number.isFinite(v) && e[k] == null) {
        e[k] = Math.max(0, Math.floor(v));
        marco = true;
      }
    }
    if (marco) {
      this.sujo = true;
      this.enviar(true); // marco: vai na hora
    } else if (this.sujo && Date.now() - this.ultimoEnvio > 10_000) this.enviar(false);
  }

  /** Leitura do que já foi acumulado (o player usa para somar contadores). */
  get atual(): Readonly<Estado> {
    return this.estado;
  }

  private enviar(forcar: boolean) {
    if (!this.destino || (!forcar && !this.sujo)) return;
    this.ultimoEnvio = Date.now();
    this.sujo = false;
    const { url, chave, funcao = "vsl_registrar" } = this.destino;
    fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${funcao}`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: chave, Authorization: `Bearer ${chave}` },
      body: JSON.stringify({ p: { ...this.base, ...this.estado } }),
    }).catch(() => {
      /* métrica perdida não pode virar erro na tela de quem assiste */
    });
  }
}


type JanelaComPixels = Window & {
  fbq?: (...a: unknown[]) => void;
  gtag?: (...a: unknown[]) => void;
  dataLayer?: unknown[];
};

/** Evento para os pixels que JÁ estiverem na página ("View5%", "View10%" ... e o pitch). */
export function eventoPixel(nome: string, dados: Record<string, unknown> = {}) {
  const w = window as JanelaComPixels;
  try {
    w.fbq?.("trackCustom", nome, dados);
    w.gtag?.("event", nome, dados);
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: nome, ...dados });
  } catch {
    /* pixel quebrado de terceiro não derruba o vídeo */
  }
}
