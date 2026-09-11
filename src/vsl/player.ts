/**
 * <mapa-vsl video="vsl-apresentacao-2026-09"></mapa-vsl>
 *
 * O player de VSL como elemento da página, no mesmo contrato da VTurb: dispara
 * `player:ready` e aceita `displayHiddenElements(segundos, [".esconder"], { persist: true })`,
 * então o "código de delay" deles funciona aqui trocando só o seletor do elemento:
 *
 *   <style>.esconder { display: none }</style>
 *   <script>
 *     var player = document.querySelector("mapa-vsl");
 *     player.addEventListener("player:ready", function () {
 *       player.displayHiddenElements(394, [".esconder"], { persist: true });
 *     });
 *   </script>
 *
 * Tudo o que o player faz está listado em ./tipos.ts. As regras sem DOM ficam em ./regras.ts
 * (testadas pelo `check:vsl`).
 */
import type { ConfigVsl } from "./tipos";
import { VIDEOS } from "./videos";
import { aplicarVariante, barraExibida, degrauPixel, podeRetomar, textoGancho } from "./regras";
import { eventoPixel, memoria, Sessao } from "./metricas";

type Estado = "carregando" | "parado" | "autoplay" | "retomar" | "assistindo" | "pausado" | "fim" | "erro";
type Oculto = { segundos: number; seletores: string[]; persist: boolean; feito: boolean };
type HlsLike = { destroy(): void; startLoad(): void; recoverMediaError(): void };

const ICONE_SOM = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M16 9l5 6M21 9l-5 6"/></svg>`;
const ICONE_PLAY = `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>`;
const ICONE_CHEIA = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`;

const CSS = `
:host{display:block;position:relative;aspect-ratio:16/9;width:100%;border-radius:var(--vsl-raio,16px);background:#05080f;color:#fff;
  font-family:"Instrument Sans",system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
/* Sem contain/transform no :host: eles viram o bloco de referência do position:fixed e o mini
   player e a tela cheia abririam presos ao player, e não à janela. */
[hidden]{display:none!important}
.palco{position:absolute;inset:0;overflow:hidden;border-radius:inherit;background:#05080f;isolation:isolate}
video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#05080f;display:block}
.clique{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0;margin:0;z-index:1}
.clique:focus-visible{outline:3px solid var(--vsl-destaque,#E8A317);outline-offset:-3px}
.sobre{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:5%}
.escuro{background:rgba(5,8,15,.62);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
/* no fim, o vídeo mostra o próprio cartão de marca: a camada cobre para os dois textos não se misturarem */
.fim.escuro{background:rgba(5,8,15,.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.cartao{appearance:none;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;
  background:var(--vsl-destaque,#E8A317);color:var(--vsl-texto-destaque,#0B1628);border-radius:18px;padding:18px 30px 20px;
  box-shadow:0 24px 60px -18px rgba(0,0,0,.8),0 0 0 8px rgba(255,255,255,.08);animation:pulso 1.8s ease-in-out infinite;font:inherit}
.cartao .aviso{font-size:clamp(12px,1.6vw,15px);font-weight:600;letter-spacing:.02em;opacity:.85}
.cartao strong{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:clamp(18px,3vw,30px);line-height:1.05;font-weight:700}
.cartao:focus-visible,.bt:focus-visible,.play:focus-visible,.icone:focus-visible{outline:3px solid #fff;outline-offset:3px}
@keyframes pulso{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
@media (prefers-reduced-motion:reduce){.cartao{animation:none}}
.titulo{margin:0;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;font-size:clamp(17px,2.6vw,28px);line-height:1.15;max-width:22em;text-wrap:balance}
.botoes{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.bt{appearance:none;border:0;cursor:pointer;font:inherit;font-weight:700;font-size:clamp(14px,1.6vw,17px);border-radius:12px;padding:13px 22px;text-decoration:none;display:inline-flex;align-items:center;min-height:48px}
.bt.primario{background:var(--vsl-destaque,#E8A317);color:var(--vsl-texto-destaque,#0B1628)}
.bt.fantasma{background:rgba(255,255,255,.1);color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.45)}
.play{appearance:none;border:0;cursor:pointer;width:clamp(64px,10vw,92px);height:clamp(64px,10vw,92px);border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--vsl-destaque,#E8A317);color:var(--vsl-texto-destaque,#0B1628);box-shadow:0 0 0 12px rgba(255,255,255,.12),0 18px 40px -12px rgba(0,0,0,.8)}
.play svg{margin-left:5px}
.legenda-pausa{font-size:clamp(13px,1.6vw,16px);font-weight:600;color:#E6EBF2}
.gancho{position:absolute;left:50%;top:5%;transform:translateX(-50%);z-index:2;max-width:86%;pointer-events:none;
  background:rgba(5,8,15,.82);color:#fff;border-radius:999px;padding:10px 20px;font-weight:600;font-size:clamp(13px,1.7vw,18px);text-align:center;
  box-shadow:0 10px 30px -10px rgba(0,0,0,.7),inset 0 0 0 1.5px var(--vsl-destaque,#E8A317)}
.hotspot{position:absolute;z-index:2;border-radius:999px;cursor:pointer;display:block}
.hotspot:focus-visible{outline:3px solid #fff;outline-offset:3px}
.barra{position:absolute;left:0;right:0;bottom:0;z-index:2;height:var(--altura,5px);background:rgba(255,255,255,.18);pointer-events:none}
.barra i{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--vsl-destaque,#E8A317);transition:transform .25s linear}
.icone{appearance:none;border:0;cursor:pointer;position:absolute;z-index:4;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  background:rgba(5,8,15,.55);color:#fff}
.icone.cheia{right:10px;bottom:14px}
.icone.fechar{right:8px;top:8px;font-size:22px;line-height:1}
.carregando{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;pointer-events:none}
.carregando i{width:44px;height:44px;border-radius:50%;border:4px solid rgba(255,255,255,.25);border-top-color:var(--vsl-destaque,#E8A317);animation:gira .8s linear infinite}
@keyframes gira{to{transform:rotate(360deg)}}
.erro{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:8%;text-align:center;background:#05080f;font-weight:600}
:host(.flutuante) .palco{position:fixed;inset:auto;right:16px;bottom:16px;width:min(360px,46vw);aspect-ratio:16/9;height:auto;z-index:2147482000;
  border-radius:14px;box-shadow:0 20px 60px -10px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.12)}
:host(.flutuante) .icone.cheia,:host(.flutuante) .gancho,:host(.flutuante) .hotspot{display:none}
:host(.cheia) .palco{position:fixed;inset:0;z-index:2147483000;border-radius:0;background:#000}
`;

export class MapaVsl extends HTMLElement {
  cfg!: ConfigVsl;
  variante = "base";
  private externo: ConfigVsl | null = null;
  private montado = false;
  private raiz!: ShadowRoot;
  private video!: HTMLVideoElement;
  private el: Record<string, HTMLElement> = {};
  private estado: Estado = "carregando";
  private hls: HlsLike | null = null;
  private sessao: Sessao | null = null;
  private pixel = 0;
  private pitchFeito = false;
  private ultimoSalvo = 0;
  private ultimoT = 0;
  private assistido = 0;
  private ocultos: Oculto[] = [];
  private porAba = false;
  private miniFechado = false;
  private observador: IntersectionObserver | null = null;
  private vigia = { t: 0, quadros: -1, desde: 0 };
  private ultimaRecuperacao = 0;
  private limpar: (() => void)[] = [];

  /** Configuração direta (sem passar pelo registro de vídeos). */
  set config(c: ConfigVsl) {
    this.externo = c;
    if (this.isConnected && !this.montado) this.montar();
  }

  get currentTime() {
    return this.video?.currentTime ?? 0;
  }

  connectedCallback() {
    if (!this.montado) this.montar();
    else this.observar();
  }

  disconnectedCallback() {
    // A landing re-injeta o HTML e devolve este mesmo nó ao novo lugar na mesma tarefa.
    // Só desmonta se ele continuar fora da página depois disso.
    queueMicrotask(() => {
      if (!this.isConnected) this.desmontar();
    });
  }

  /** Contrato da VTurb: revela os seletores quando o vídeo chega em `segundos`. */
  displayHiddenElements(segundos: number, seletores: string[] = [".esconder"], opcoes: { persist?: boolean } = {}) {
    const o: Oculto = { segundos, seletores, persist: !!opcoes.persist, feito: false };
    this.ocultos.push(o);
    if (o.persist && this.cfg && memoria.jaRevelou(this.cfg.id, segundos)) this.revelar(o);
    else if (this.estado === "assistindo" && this.video.currentTime >= segundos) this.revelar(o);
  }

  play() {
    this.assistir(this.video.currentTime);
  }
  pause() {
    this.pausar();
  }

  // ------------------------------------------------------------------ montagem

  private montar() {
    const base = this.externo ?? VIDEOS[this.getAttribute("video") ?? ""];
    // Sem configuração ainda: espera. MapaVsl.configurar (ou a propriedade `config`) monta depois.
    if (!base) return;
    this.montado = true;
    const { cfg, variante } = aplicarVariante(base, memoria.sorteio(base.id));
    this.cfg = cfg;
    this.variante = variante;

    this.raiz = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    this.raiz.innerHTML = `<style>${CSS}</style>
<div class="palco" part="palco">
  <video playsinline webkit-playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noplaybackrate" poster="${cfg.capa}"></video>
  <button class="clique" aria-label="Pausar ou continuar o vídeo"></button>
  <div class="gancho" hidden></div>
  <div class="hotspots"></div>
  <div class="carregando" hidden><i></i></div>
  <div class="sobre autoplay" hidden><button class="cartao">${ICONE_SOM}<span class="aviso"></span><strong class="chamada"></strong></button></div>
  <div class="sobre escuro retomar" hidden><p class="titulo"></p><div class="botoes"><button class="bt primario continuar"></button><button class="bt fantasma inicio"></button></div></div>
  <div class="sobre pausado" hidden><button class="play" aria-label="Continuar o vídeo">${ICONE_PLAY}</button><span class="legenda-pausa">Clique para continuar</span></div>
  <div class="sobre escuro fim" hidden><p class="titulo"></p><div class="botoes"><a class="bt primario cta"></a><button class="bt fantasma denovo">Assistir de novo</button></div></div>
  <div class="erro" hidden>Não foi possível carregar o vídeo. Recarregue a página para tentar de novo.</div>
  <div class="barra"><i></i></div>
  <button class="icone cheia" aria-label="Tela cheia" hidden>${ICONE_CHEIA}</button>
  <button class="icone fechar" aria-label="Fechar o mini player" hidden>×</button>
</div>`;
    const q = <T extends HTMLElement>(s: string) => this.raiz.querySelector(s) as T;
    this.video = q<HTMLVideoElement>("video");
    for (const n of ["clique", "gancho", "hotspots", "carregando", "autoplay", "retomar", "pausado", "fim", "erro", "barra", "cheia", "fechar"])
      this.el[n] = q(`.${n}`);
    this.el.barraI = q(".barra i");
    q(".aviso").textContent = cfg.autoplay.aviso;
    q(".chamada").textContent = cfg.autoplay.chamada;
    q(".retomar .titulo").textContent = cfg.continuar.titulo;
    q(".continuar").textContent = cfg.continuar.continuar;
    q(".inicio").textContent = cfg.continuar.inicio;
    q(".fim .titulo").textContent = cfg.fim.titulo;
    const cta = q<HTMLAnchorElement>(".cta");
    cta.textContent = cfg.fim.botao;
    cta.href = cfg.fim.href;
    this.style.setProperty("--altura", `${cfg.barra.altura}px`);
    this.el.barra.hidden = cfg.barra.modo === "oculta";
    this.style.setProperty("--vsl-destaque", cfg.cores.destaque);
    this.style.setProperty("--vsl-texto-destaque", cfg.cores.textoDestaque);
    for (const h of cfg.hotspots) {
      const a = document.createElement("a");
      a.className = "hotspot";
      a.href = h.href;
      a.setAttribute("aria-label", h.rotulo);
      Object.assign(a.style, { left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` });
      a.hidden = true;
      a.addEventListener("click", () => this.cliqueCta());
      this.el.hotspots.appendChild(a);
    }

    this.sessao = new Sessao(cfg.id, variante, cfg.turbo || 1, cfg.metricas);
    this.ligarEventos();
    void this.carregarFonte().then(() => this.decidirInicio());
    this.observar();
  }

  private desmontar() {
    this.hls?.destroy();
    this.hls = null;
    this.observador?.disconnect();
    for (const f of this.limpar.splice(0)) f();
    this.video?.removeAttribute("src");
    this.montado = false;
  }

  /**
   * Quem toca o HLS. O Chrome e o Edge de computador passaram a responder "maybe" para HLS
   * nativo, mas esse tocador perde a imagem ao retomar depois de uma pausa longa: o áudio
   * segue e o quadro congela (medido em 11/09/2026, Chrome 152, pausa de 25 s). O nativo fica
   * só na Apple, onde é o padrão e o sólido; no resto, hls.js pelo Media Source. Sem nenhum
   * dos dois, o nativo ainda é melhor que tela de erro.
   */
  private async carregarFonte() {
    const v = this.video;
    const nativo = !!v.canPlayType("application/vnd.apple.mpegurl");
    if (nativo && ehApple()) {
      v.src = this.cfg.src;
      return;
    }
    try {
      const { default: Hls } = await import("hls.js/light");
      if (!Hls.isSupported()) throw new Error("sem MSE");
      const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 24, startFragPrefetch: true });
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (!d.fatal) return;
        if (d.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
        else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else this.mudar("erro");
      });
      hls.loadSource(this.cfg.src);
      hls.attachMedia(v);
      this.hls = hls;
    } catch {
      if (nativo) v.src = this.cfg.src;
      else this.mudar("erro");
    }
  }

  /**
   * Vigia da imagem: se o tempo anda (o áudio toca) e quase nenhum quadro novo é mostrado,
   * o decodificador de vídeo travou. Recupera sem tirar a pessoa do ponto em que está. Só com
   * a aba visível: em aba escondida o próprio navegador desliga a imagem de propósito.
   */
  private vigiarImagem(t: number) {
    const agora = performance.now();
    if (agora - this.vigia.desde < 1500) return;
    const quadros = this.video.getVideoPlaybackQuality?.().totalVideoFrames ?? -1;
    const travou =
      quadros >= 0 && document.visibilityState === "visible" && !this.video.paused &&
      t - this.vigia.t > 1 && quadros - this.vigia.quadros < 3 && agora - this.ultimaRecuperacao > 5000;
    if (travou) {
      this.ultimaRecuperacao = agora;
      if (this.hls) this.hls.recoverMediaError();
      else this.video.currentTime = t; // obriga o decodificador a buscar o quadro de novo
    }
    this.vigia = { t, quadros, desde: agora };
  }

  private zerarVigia() {
    this.vigia = { t: this.video.currentTime, quadros: this.video.getVideoPlaybackQuality?.().totalVideoFrames ?? -1, desde: performance.now() };
  }

  private decidirInicio() {
    if (this.estado === "erro") return;
    const salvo = memoria.ponto(this.cfg.id);
    if (podeRetomar(salvo, this.cfg)) this.mudar("retomar");
    else if (this.cfg.autoplay.ativo) this.autoplay();
    else this.mudar("parado");
    for (const o of this.ocultos) if (o.persist && memoria.jaRevelou(this.cfg.id, o.segundos)) this.revelar(o);
    setTimeout(() => this.emitir("player:ready"), 0);
  }

  // ------------------------------------------------------------------ estados

  private mudar(e: Estado) {
    this.estado = e;
    const el = this.el;
    el.autoplay.hidden = e !== "autoplay";
    el.retomar.hidden = e !== "retomar";
    el.pausado.hidden = !(e === "pausado" || e === "parado");
    el.fim.hidden = e !== "fim";
    el.erro.hidden = e !== "erro";
    el.cheia.hidden = !this.cfg.telaCheia || !(e === "assistindo" || e === "pausado");
    el.clique.setAttribute("aria-label", e === "autoplay" ? this.cfg.autoplay.chamada : e === "assistindo" ? "Pausar o vídeo" : "Continuar o vídeo");
    el.clique.hidden = e === "retomar" || e === "fim" || e === "erro";
    if (e !== "assistindo") this.soltarMini();
    this.atualizarHotspots();
  }

  /** "Smart Autoplay": começa sem som, com o convite para ouvir. */
  private autoplay() {
    const v = this.video;
    v.muted = true;
    v.currentTime = 0;
    this.mudar("autoplay");
    v.play()
      .then(() => this.sessao?.marcar({ autoplay_ok: true }))
      .catch(() => {
        /* o navegador segurou até sem som (economia de bateria): o cartão vira o botão de play */
      });
  }

  /** O clique para ouvir RECOMEÇA do zero, com som: ninguém perde o começo. */
  private ativarSom() {
    this.sessao?.marcar({ clicou_som: true });
    this.assistir(0);
  }

  private assistir(de: number) {
    const v = this.video;
    if (Math.abs(v.currentTime - de) > 0.3) v.currentTime = de;
    v.muted = false;
    v.playbackRate = this.cfg.turbo || 1;
    this.porAba = false;
    this.zerarVigia();
    this.ultimoT = de;
    this.sessao?.marcar({ segundo_inicio: de });
    this.mudar("assistindo");
    void v.play().catch(() => this.mudar("pausado"));
    this.emitir("player:play");
  }

  private pausar() {
    if (this.estado !== "assistindo") return;
    if (this.sessao) this.sessao.marcar({ pausas: this.sessao.atual.pausas + 1 });
    this.video.pause();
    this.mudar("pausado");
    this.emitir("player:pause");
  }

  private cliqueNoPalco() {
    switch (this.estado) {
      case "autoplay":
        return this.ativarSom();
      case "assistindo":
        return this.pausar();
      case "pausado":
      case "parado":
        return this.assistir(this.video.currentTime);
    }
  }

  private cliqueCta() {
    this.sessao?.marcar({ clicou_cta: true, cta_em: this.video.currentTime });
    eventoPixel("VSL_CTA", { video: this.cfg.id, tempo: Math.floor(this.video.currentTime) });
  }

  // ------------------------------------------------------------------ tempo

  private tick() {
    const v = this.video, cfg = this.cfg, t = v.currentTime;
    if (this.estado !== "retomar") this.el.barraI.style.transform = `scaleX(${barraExibida(t / cfg.duracao, cfg.barra.modo, cfg.barra.forca).toFixed(4)})`;
    if (this.estado !== "assistindo") return;
    this.vigiarImagem(t);

    if (Math.abs(t - this.ultimoSalvo) >= 2) {
      memoria.salvarPonto(cfg.id, t);
      this.ultimoSalvo = t;
    }
    // Tempo de fato assistido: soma só avanços normais entre dois ticks (pausa, busca e aba
    // escondida não entram), então retomar não conta o mesmo trecho duas vezes.
    const passo = t - this.ultimoT;
    if (passo > 0 && passo < 2) this.assistido += passo;
    this.ultimoT = t;
    this.sessao?.marcar({ segundo_max: t, tempo_assistido: this.assistido });

    const d = degrauPixel(t, cfg.duracao);
    for (let p = this.pixel + 5; p <= d; p += 5) eventoPixel(`View${p}%`, { video: cfg.id });
    if (d > this.pixel) this.pixel = d;

    if (!this.pitchFeito && t >= cfg.pitch) {
      this.pitchFeito = true;
      memoria.marcarRevelado(cfg.id, cfg.pitch);
      this.sessao?.marcar({ viu_pitch: true });
      eventoPixel("VSL_Pitch", { video: cfg.id });
      this.emitir("player:pitch");
    }
    for (const o of this.ocultos) if (!o.feito && t >= o.segundos) this.revelar(o);

    const g = cfg.ganchos.find((x) => t >= x.de && t < x.ate);
    this.el.gancho.hidden = !g;
    if (g) this.el.gancho.textContent = textoGancho(g.texto, t, g.alvo);
    this.atualizarHotspots();
    this.emitir("player:timeupdate", { tempo: t });
  }

  private atualizarHotspots() {
    const t = this.video?.currentTime ?? 0;
    const ativo = this.estado === "assistindo" || this.estado === "pausado";
    this.cfg.hotspots.forEach((h, i) => {
      const a = this.el.hotspots.children[i] as HTMLAnchorElement | undefined;
      if (a) a.hidden = !(ativo && t >= h.de && t < h.ate);
    });
  }

  private revelar(o: Oculto) {
    o.feito = true;
    if (o.persist) memoria.marcarRevelado(this.cfg.id, o.segundos);
    for (const sel of o.seletores)
      document.querySelectorAll<HTMLElement>(sel).forEach((n) => {
        n.classList.remove("esconder");
        n.classList.add("vsl-revelado");
      });
    this.emitir("player:revelou", { segundos: o.segundos });
  }

  private fim() {
    // Autoplay sem som que chega ao fim não é "assistiu tudo": volta ao começo, em loop.
    if (this.estado === "autoplay") {
      this.video.currentTime = 0;
      void this.video.play().catch(() => {});
      return;
    }
    memoria.esquecerPonto(this.cfg.id);
    this.sessao?.marcar({ terminou: true, segundo_max: this.cfg.duracao });
    if (this.pixel < 100) eventoPixel("View100%", { video: this.cfg.id });
    this.pixel = 100;
    this.mudar("fim");
    this.emitir("player:ended");
  }

  // ------------------------------------------------------------------ eventos

  private ligarEventos() {
    const v = this.video, el = this.el;
    const on = (alvo: EventTarget, ev: string, f: (e: Event) => void) => {
      alvo.addEventListener(ev, f);
      this.limpar.push(() => alvo.removeEventListener(ev, f));
    };
    on(v, "timeupdate", () => this.tick());
    on(v, "ended", () => this.fim());
    on(v, "waiting", () => {
      el.carregando.hidden = this.estado !== "assistindo";
      // travamento = parar para carregar no meio de quem já estava assistindo com som
      if (this.estado === "assistindo" && this.assistido > 1 && this.sessao) this.sessao.marcar({ travamentos: this.sessao.atual.travamentos + 1 });
    });
    on(v, "playing", () => {
      el.carregando.hidden = true;
      this.sessao?.marcar({ carregamento_ms: performance.now() }); // só o primeiro fica
    });
    on(v, "contextmenu", (e) => e.preventDefault());
    on(el.clique, "click", () => this.cliqueNoPalco());
    on(this.raiz.querySelector(".cartao")!, "click", () => this.ativarSom());
    on(this.raiz.querySelector(".play")!, "click", () => this.assistir(this.video.currentTime));
    on(this.raiz.querySelector(".continuar")!, "click", () => {
      this.sessao?.marcar({ retomou: true, clicou_som: true });
      this.assistir(memoria.ponto(this.cfg.id) ?? 0);
    });
    on(this.raiz.querySelector(".inicio")!, "click", () => {
      this.sessao?.marcar({ clicou_som: true });
      this.assistir(0);
    });
    on(this.raiz.querySelector(".cta")!, "click", () => this.cliqueCta());
    on(this.raiz.querySelector(".denovo")!, "click", () => this.assistir(0));
    on(el.cheia, "click", () => this.alternarCheia());
    on(el.fechar, "click", () => {
      this.miniFechado = true;
      this.pausar();
    });
    on(this, "keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      if ((k === " " || k === "k") && (this.estado === "assistindo" || this.estado === "pausado")) {
        e.preventDefault();
        this.cliqueNoPalco();
      }
      if (k === "Escape" && this.classList.contains("cheia")) this.alternarCheia();
    });
    // "Pausa inteligente": sai da aba, pausa; volta, continua.
    on(document, "visibilitychange", () => {
      if (!this.cfg.pausaInteligente) return;
      if (document.visibilityState === "hidden" && this.estado === "assistindo") {
        this.porAba = true;
        this.pausar();
      } else if (document.visibilityState === "visible" && this.porAba && this.estado === "pausado") {
        this.assistir(this.video.currentTime);
      }
    });
    on(document, "fullscreenchange", () => {
      if (!document.fullscreenElement) this.classList.remove("cheia");
    });
  }

  /** "Experiência fullscreen": a tela cheia do navegador, ou a da página no iPhone. */
  private alternarCheia() {
    const palco = this.raiz.querySelector(".palco") as HTMLElement;
    if (this.classList.contains("cheia")) {
      this.classList.remove("cheia");
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      return;
    }
    this.classList.add("cheia");
    this.sessao?.marcar({ tela_cheia: true });
    if (palco.requestFullscreen) void palco.requestFullscreen().catch(() => {});
  }

  // ------------------------------------------------------------------ mini player

  private observar() {
    if (!this.cfg?.miniPlayer || typeof IntersectionObserver === "undefined") return;
    this.observador?.disconnect();
    this.observador = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.35) this.soltarMini();
        else if (this.estado === "assistindo" && !this.miniFechado) {
          this.classList.add("flutuante");
          this.sessao?.marcar({ mini_player: true });
          this.el.fechar.hidden = false;
        }
      },
      { threshold: [0, 0.35, 1] },
    );
    this.observador.observe(this);
  }

  private soltarMini() {
    this.classList.remove("flutuante");
    if (this.el.fechar) this.el.fechar.hidden = true;
  }

  private emitir(nome: string, detail: Record<string, unknown> = {}) {
    this.dispatchEvent(new CustomEvent(nome, { detail: { video: this.cfg.id, variante: this.variante, ...detail } }));
  }
}

/** iPhone, iPad e Safari (inclusive o Chrome do iPhone, que é Safari por dentro). */
function ehApple(): boolean {
  const ua = navigator.userAgent;
  if (/iP(hone|ad|od)/.test(ua)) return true;
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true; // iPad em modo computador
  return /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Android|Firefox/.test(ua);
}

/** Registra <mapa-vsl> uma vez (idempotente: a landing e a página de apresentação chamam). */
export function registrarVsl() {
  if (typeof customElements !== "undefined" && !customElements.get("mapa-vsl")) customElements.define("mapa-vsl", MapaVsl);
}
