import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  PRECO_MENSAL,
  PRECO_TABELA,
  PRECO_ANUAL,
  ECONOMIA_ANUAL,
  PRECO_ESTUDIO,
  fmtBRL,
} from "@/data/planos";
import { renderizarComEstados, cssDosEstados, ATTR_ACAO, type Valores } from "./landing/renderizar";
import "./landing/prototipo.css";
import template from "./landing/prototipo.html?raw";

// O CSS dos hovers/focus autorados no template depende SÓ do template: uma vez por módulo.
const CSS_ESTADOS = cssDosEstados(template);

/**
 * LANDING: PORTE DO PROTÓTIPO DO ARTIFACT.
 *
 * Duas versões anteriores desta página divergiram do protótipo, e a segunda divergiu por
 * um motivo que vale registrar: eu portei `docs/nova-landing-mapa-da-prescricao.html`
 * supondo que fosse o artifact do link, e nunca conferi. Não era. O artifact tem 14
 * seções, 91 KB de marcação e blocos que aquele arquivo não tinha ("Por que eu fiz isso",
 * o guia dos 23 semáforos). A fonte agora é `docs/prototipo-artifact.html`, extraída do
 * pacote do próprio artifact.
 *
 * A marcação fica INTACTA em `landing/prototipo.html` e o `renderizar` interpreta a
 * linguagem de template do artifact. Trocar o protótipo por um novo é trocar dois
 * arquivos, e qualquer divergência vira diff.
 *
 * ## O que foi alterado, e por quê
 *
 * O protótipo afirma coisas que o sistema não faz, e essas não sobem:
 *
 * - "43 das 100 vagas preenchidas" conta vendas que não existem.
 * - "R$ 690 por ano" na barra do topo contradiz o R$ 1.164 da seção de planos do MESMO
 *   arquivo. Preço passa a vir da fonte única.
 * - O formulário do guia em PDF coletava e-mail e mostrava "enviado" sem enviar nada, sem
 *   PDF existir e sem declarar tratamento de dado pessoal. A seção virou um convite direto
 *   ao suporte, sem campo de e-mail, que é o que de fato acontece hoje.
 * - A faixa de credibilidade anunciava "82 referências científicas conferidas no PubMed".
 *   O número era literal, não vinha de `referencias.length`, e a palavra "conferidas" não
 *   se sustentava: 12 das 82 não têm DOI nem PMID. Contagem exposta é contagem contestável,
 *   e ela também quebraria em silêncio na referência seguinte. As três afirmações da faixa
 *   passaram a ser qualitativas, e `check:legal` agora reprova quem reintroduzir um número.
 */

/** Vagas de fundador exibidas. Zero enquanto não houver contagem real de assinaturas. */
const VAGAS_REAIS = 0;

export function Landing() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [st, setSt] = React.useState({
    sticky: false,
    mobile: false,
    menu: false,
    anual: true,
    tab: 0,
    a: "8",
    v: "120",
    s: "2",
    p: "20",
  });
  const mudar = React.useCallback((p: Partial<typeof st>) => setSt((s) => ({ ...s, ...p })), []);

  useJanela(mudar);

  const vals = React.useMemo<Valores>(() => construirValores(st, mudar), [st, mudar]);
  const html = React.useMemo(() => renderizarComEstados(template, vals), [vals]);

  useDelegacao(ref, vals);
  useNavegacaoInterna(ref);
  useRevelarPorScroll(ref, html);
  usePreservarFaq(ref, html);

  // Porta das animações de load (hero, brilho do H1): depois do primeiro segundo, a raiz
  // ganha `lp-carregada` e as entradas não replayam quando o DOM for recriado por estado
  // (abrir o menu mobile no topo era o caso visível). A classe vai na RAIZ porque ela é o
  // único nó que o dangerouslySetInnerHTML não destrói.
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const t = window.setTimeout(() => raiz.classList.add("lp-carregada"), 1100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <style>{CSS_ESTADOS}</style>
      <div ref={ref} className="landing-prototipo" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

/**
 * REVEAL POR SCROLL QUE SOBREVIVE À RECRIAÇÃO DO DOM.
 *
 * Cada mudança de estado (tecla na calculadora, aba, limiar da barra fixa) re-injeta o
 * HTML inteiro e destrói o DOM anterior, então o observer não pode guardar estado em nó
 * nenhum. O que já foi revelado vive num Set de rótulos (`data-screen-label`) num ref, e
 * a cada render: seção já vista recebe `lp-visto` direto (sem re-animar, sem piscar);
 * seção nova entra oculta e é observada. Quem esconde é o JS, não o CSS: se nada disto
 * rodar, a página fica inteira visível, que é o fallback certo.
 *
 * Header, barra de anúncio e hero ficam fora: os dois primeiros são a casca, e o hero
 * está acima da dobra com entrada própria no load (ver `lp-entrada` no CSS).
 */
const SEM_REVEAL = new Set(["Barra de anúncio", "Header", "Hero"]);
function useRevelarPorScroll(ref: React.RefObject<HTMLDivElement | null>, html: string) {
  const vistos = React.useRef(new Set<string>());
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const ent of entradas) {
          if (!ent.isIntersecting) continue;
          const rotulo = (ent.target as HTMLElement).dataset.screenLabel ?? "";
          vistos.current.add(rotulo);
          ent.target.classList.remove("lp-oculto");
          ent.target.classList.add("lp-visto");
          obs.unobserve(ent.target);
        }
      },
      // 0.05 e não mais: o rodapé é alto e divide a última dobra com a barra fixa, então
      // exigir 12% dele visível deixava os links legais invisíveis numa rolagem rápida.
      { threshold: 0.05 },
    );
    const alvos: HTMLElement[] = [];
    for (const sec of raiz.querySelectorAll<HTMLElement>("[data-screen-label]")) {
      const rotulo = sec.dataset.screenLabel ?? "";
      if (SEM_REVEAL.has(rotulo)) continue;
      if (vistos.current.has(rotulo)) sec.classList.add("lp-visto");
      else alvos.push(sec);
    }

    const revelarTudo = () => {
      for (const sec of alvos) {
        sec.classList.remove("lp-oculto");
        sec.classList.add("lp-visto");
        vistos.current.add(sec.dataset.screenLabel ?? "");
      }
      obs.disconnect();
    };

    // Só esconde no PRÓXIMO QUADRO. Numa aba que não compõe, o quadro não vem, e a página
    // simplesmente nunca some. Esconder de forma síncrona era o que criava a janela em que
    // "invisível" virava estado final.
    let socorro = 0;
    const quadro = requestAnimationFrame(() => {
      for (const sec of alvos) {
        sec.classList.add("lp-oculto");
        obs.observe(sec);
      }
      // Rede de segurança: sem nenhuma entrega em 2 s, a animação é abandonada e o
      // conteúdo aparece. Página legível vale mais que fade.
      socorro = window.setTimeout(() => {
        if (!raiz.querySelector(".lp-visto")) revelarTudo();
      }, 2000);
    });

    return () => {
      cancelAnimationFrame(quadro);
      if (socorro) clearTimeout(socorro);
      obs.disconnect();
    };
  }, [ref, html]);
}

/**
 * Mantém abertas as respostas do FAQ que o visitante abriu, através das recriações do DOM.
 *
 * A chave é o texto da pergunta, não o índice: se a ordem do template mudar, o índice
 * abriria a resposta errada, que é pior que fechar todas.
 */
function usePreservarFaq(ref: React.RefObject<HTMLDivElement | null>, html: string) {
  const abertos = React.useRef(new Set<string>());
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const chave = (d: HTMLDetailsElement) => d.querySelector("summary")?.textContent?.trim() ?? "";
    const lista = [...raiz.querySelectorAll<HTMLDetailsElement>("details")];

    // Reaplica o que já estava aberto antes desta recriação.
    for (const d of lista) {
      const k = chave(d);
      if (!k) continue;
      if (abertos.current.has(k)) d.open = true;
      else if (d.open) abertos.current.add(k);
    }

    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      const k = chave(d);
      if (!k) return;
      if (d.open) abertos.current.add(k);
      else abertos.current.delete(k);
    };
    for (const d of lista) d.addEventListener("toggle", onToggle);
    return () => {
      for (const d of lista) d.removeEventListener("toggle", onToggle);
    };
  }, [ref, html]);
}

/** Os valores que o template consome, espelhando o `renderVals` do protótipo. */
function construirValores(st: { sticky: boolean; mobile: boolean; menu: boolean; anual: boolean; tab: number; a: string; v: string; s: string; p: string }, mudar: (p: Partial<typeof st>) => void): Valores {
  const num = (x: string) => parseFloat(String(x).replace(",", ".")) || 0;
  // Trava a leitura na mesma faixa que o input declara. O `min`/`max` do HTML segura o
  // stepper, não o teclado: sem clampe aqui, "-50 alunos" imprimia "+R$ -10.392 a mais por
  // mês" (sinal de mais na frente de negativo) e um valor alto imprimia bilhões. Numa página
  // cuja tese é que todo número tem procedência, esse era o único lugar que se deixava pegar.
  const preso = (x: string, min: number, max: number) => Math.min(max, Math.max(min, num(x)));
  const nAlunos = preso(st.a, 0, 200);
  const vSessao = preso(st.v, 0, 600);
  const nSessoes = preso(st.s, 0, 7);
  const pctExtra = preso(st.p, 0, 50);
  // 4,33 é a média de semanas por mês, como no protótipo.
  const mes = nAlunos * vSessao * nSessoes * 4.33 * (pctExtra / 100);
  const fmt = (n: number) => "R$ " + Math.round(n).toLocaleString("pt-BR");
  const { anual } = st;

  const vals: Valores = {
    // A contagem de vagas era 43 fixo no protótipo. Sem sistema de cobrança não há o que
    // contar, e barra de progresso de escassez inventada é publicidade enganosa.
    vagas: VAGAS_REAIS,
    vagasPct: VAGAS_REAIS + "%",
    stickyT: st.sticky ? "translateY(0)" : "translateY(120%)",
    isMobile: st.mobile,
    isDesktop: !st.mobile,
    menuOpen: st.menu && st.mobile,
    toggleMenu: () => mudar({ menu: !st.menu }),
    fecharMenu: () => mudar({ menu: false }),
    verAnual: () => mudar({ anual: true }),
    verMensal: () => mudar({ anual: false }),
    tAnBg: anual ? "#10233A" : "transparent",
    tAnFg: anual ? "#FFFFFF" : "#5C6D84",
    tMeBg: !anual ? "#10233A" : "transparent",
    tMeFg: !anual ? "#FFFFFF" : "#5C6D84",
    // Preço da FONTE ÚNICA, sem o "R$" (o template já imprime o cifrão ao lado).
    proPreco: String(anual ? PRECO_MENSAL : PRECO_TABELA),
    proWasDisp: anual ? "inline" : "none",
    proSub: anual
      ? `${fmtBRL(PRECO_ANUAL)} por ano, em 12x de ${fmtBRL(PRECO_MENSAL)}. Economia de ${fmtBRL(ECONOMIA_ANUAL)}`
      : "cobrado mês a mês, sem fidelidade",
    estPreco: String(anual ? PRECO_ESTUDIO : PRECO_ESTUDIO + 20),
    aVal: st.a,
    vVal: st.v,
    sVal: st.s,
    pVal: st.p,
    mudaA: (e: Event) => mudar({ a: (e.target as HTMLInputElement).value }),
    mudaV: (e: Event) => mudar({ v: (e.target as HTMLInputElement).value }),
    mudaS: (e: Event) => mudar({ s: (e.target as HTMLInputElement).value }),
    mudaP: (e: Event) => mudar({ p: (e.target as HTMLInputElement).value }),
    economiaTxt: fmtBRL(ECONOMIA_ANUAL),
    tabelaTxt: fmtBRL(PRECO_TABELA),
    proMesTxt: `${fmtBRL(PRECO_MENSAL)}/mês`,
    mesTxt: "+" + fmt(mes),
    anoTxt: "+" + fmt(mes * 12) + " por ano",
    mesesTxt: (() => {
      const n = Math.max(1, Math.floor(mes / PRECO_MENSAL));
      return n === 1 ? "1 mês" : `${n} meses`;
    })(),
  };
  for (const i of [0, 1, 2, 3]) {
    const on = st.tab === i;
    vals[`t${i}Bg`] = on ? "#10233A" : "transparent";
    vals[`t${i}Fg`] = on ? "#FFFFFF" : "#5C6D84";
    vals[`p${i}Disp`] = on ? "block" : "none";
    vals[`setTab${i}`] = () => mudar({ tab: i });
  }
  return vals;
}

/** Rolagem e largura, como no `componentDidMount` do protótipo. */
function useJanela(mudar: (p: { sticky?: boolean; mobile?: boolean; menu?: boolean }) => void) {
  React.useEffect(() => {
    /*
     * A posição vem do elemento que de fato rola, e não só de `window.scrollY`.
     *
     * O script do protótipo lê `window.scrollY`, o que vale numa página solta. Dentro
     * deste app a rolagem pode acontecer num contêiner, e ali `scrollY` fica em 0 para
     * sempre: foi assim que a barra fixa nunca apareceu na tentativa anterior.
     */
    const posicao = () => Math.max(window.scrollY, document.scrollingElement?.scrollTop ?? 0);
    const aoRolar = () => mudar({ sticky: posicao() > 760 });
    const aoRedimensionar = () => mudar({ mobile: window.innerWidth < 980, menu: false });
    aoRolar();
    aoRedimensionar();
    document.addEventListener("scroll", aoRolar, { passive: true, capture: true });
    window.addEventListener("resize", aoRedimensionar);
    return () => {
      document.removeEventListener("scroll", aoRolar, { capture: true });
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, [mudar]);
}

/**
 * Delegação de eventos: o clique e a digitação encontram o handler pelo atributo.
 *
 * A marcação é injetada como texto, então não há como pendurar função nela. O
 * `renderizar` deixa o NOME do handler num atributo e aqui ele é resolvido no objeto de
 * valores, que é o mesmo que alimentou a renderização.
 */
function useDelegacao(ref: React.RefObject<HTMLDivElement | null>, vals: Valores) {
  const ultimo = React.useRef(vals);
  ultimo.current = vals;
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const acionar = (tipo: "click" | "change") => (e: Event) => {
      const alvo = (e.target as HTMLElement | null)?.closest?.(`[${ATTR_ACAO}-${tipo}]`);
      const nome = alvo?.getAttribute(`${ATTR_ACAO}-${tipo}`);
      if (!nome) return;
      const fn = ultimo.current[nome];
      if (typeof fn === "function") (fn as (ev: Event) => void)(e);
    };
    const aoClicar = acionar("click");
    // `input` e não `change`: o protótipo recalcula a cada tecla, e `change` só dispara
    // quando o campo perde o foco, o que faria a calculadora parecer travada.
    const aoDigitar = acionar("change");
    raiz.addEventListener("click", aoClicar);
    raiz.addEventListener("input", aoDigitar);
    return () => {
      raiz.removeEventListener("click", aoClicar);
      raiz.removeEventListener("input", aoDigitar);
    };
  }, [ref]);
}

/** Links para rotas do app navegam pelo roteador, em vez de recarregar tudo. */
function useNavegacaoInterna(ref: React.RefObject<HTMLDivElement | null>) {
  const navegar = useNavigate();
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!href || !href.startsWith("/") || e.metaKey || e.ctrlKey || e.shiftKey || a?.target === "_blank") return;
      e.preventDefault();
      navegar(href);
    };
    raiz.addEventListener("click", aoClicar);
    return () => raiz.removeEventListener("click", aoClicar);
  }, [ref, navegar]);
}
