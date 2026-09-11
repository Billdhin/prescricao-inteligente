/**
 * Memória no navegador e métricas do VSL.
 *
 * MEMÓRIA (localStorage, só neste aparelho): onde parou ("continuar assistindo"), se já viu o
 * pitch (para o conteúdo oculto aparecer direto na volta), a variante do teste A/B e dois
 * identificadores aleatórios.
 *
 * MÉTRICAS: uma linha por sessão na tabela `vsl_sessoes` (migração 0014), gravada pela função
 * `vsl_registrar`, que só aceita os campos abaixo e só aumenta o ponto máximo assistido. Nada
 * de nome, e-mail, IP ou endereço completo de quem indicou: um identificador aleatório, o tipo
 * de aparelho, a origem da visita e o que aconteceu com o vídeo. A Política de Privacidade
 * declara isso (seção 5) e o `check:legal` cobra a declaração enquanto este envio existir.
 *
 * Quem pede para não ser rastreado (Do Not Track ou Global Privacy Control) não gera métrica.
 * Pixels de anúncio só recebem evento se já estiverem instalados na página; este módulo não
 * instala nenhum.
 */
import { origemDaVisita, tipoAparelho } from "./regras";

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

type Estado = {
  autoplay_ok: boolean;
  clicou_som: boolean;
  retomou: boolean;
  segundo_max: number;
  viu_pitch: boolean;
  clicou_cta: boolean;
  terminou: boolean;
};

/**
 * Uma sessão de métricas. Envia no máximo a cada 10 s enquanto o vídeo roda, e na hora nos
 * marcos (som, pitch, clique, fim, saída da página). Falha de rede não quebra o player.
 */
export class Sessao {
  private readonly sessao = uuid();
  private readonly base: Record<string, unknown>;
  private estado: Estado = { autoplay_ok: false, clicou_som: false, retomou: false, segundo_max: 0, viu_pitch: false, clicou_cta: false, terminou: false };
  private ultimoEnvio = 0;
  private sujo = false;
  private readonly desligado: boolean;
  private readonly url: string | undefined;
  private readonly chave: string | undefined;

  constructor(video: string, variante: string) {
    this.url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    this.chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    this.desligado = naoRastrear() || !this.url || !this.chave;
    const { origem, campanha } = origemDaVisita(location.search, document.referrer, location.hostname);
    this.base = {
      sessao: this.sessao,
      visitante: memoria.visitante(),
      video,
      variante,
      pagina: location.pathname.slice(0, 80),
      aparelho: tipoAparelho(navigator.userAgent, window.innerWidth),
      origem,
      campanha,
    };
    if (!this.desligado) {
      this.enviar(true);
      addEventListener("pagehide", () => this.enviar(true));
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.enviar(true);
      });
    }
  }

  marcar(p: Partial<Estado>) {
    for (const [k, v] of Object.entries(p) as [keyof Estado, never][]) {
      if (k === "segundo_max") {
        const s = Math.floor(v as unknown as number);
        if (s > this.estado.segundo_max) {
          this.estado.segundo_max = s;
          this.sujo = true;
        }
      } else if (v && !this.estado[k]) {
        (this.estado as Record<string, unknown>)[k] = v;
        this.sujo = true;
        this.enviar(true); // marco: vai na hora
      }
    }
    if (this.sujo && Date.now() - this.ultimoEnvio > 10_000) this.enviar(false);
  }

  private enviar(forcar: boolean) {
    if (this.desligado || (!forcar && !this.sujo)) return;
    this.ultimoEnvio = Date.now();
    this.sujo = false;
    const corpo = JSON.stringify({ p: { ...this.base, ...this.estado } });
    fetch(`${this.url}/rest/v1/rpc/vsl_registrar`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: this.chave!, Authorization: `Bearer ${this.chave}` },
      body: corpo,
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
