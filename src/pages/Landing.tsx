import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  COBRANCA_ATIVA,
  PRECO_MENSAL,
  PRECO_MENSAL_AVULSO,
  PRECO_SEMESTRAL_MES,
  PRECO_SEMESTRAL,
  PRECO_ANUAL,
  PRECO_FUNDADOR_MES,
  PRECO_FUNDADOR_ANO,
  ANO_NO_MENSAL,
  ECONOMIA_SEMESTRAL,
  VAGAS_FUNDADOR,
  VAGAS_FUNDADOR_OCUPADAS,
  fmtBRL,
} from "@/data/planos";
import { renderizarComEstados, cssDosEstados, ATTR_ACAO, type Valores } from "./landing/renderizar";
import "./landing/prototipo.css";
import template from "./landing/prototipo.html?raw";

// O CSS dos hovers/focus autorados no template depende SÓ do template: uma vez por módulo.
const CSS_ESTADOS = cssDosEstados(template);

/**
 * LANDING: PORTE DO REDESIGN DE 08/09/2026 (canvas "Redesign Mapa da Prescrição").
 *
 * A marcação vive em `landing/prototipo.html` e este componente só a injeta e liga o
 * comportamento; `renderizar` interpreta a linguagem de template (`{{ }}`, `<sc-if>`,
 * `sc-camel-on-click`, `style-hover`). O canvas trazia três heros em A/B/C com seletor de
 * protótipo; o próprio export fixa o HERO B como padrão, e é só ele que vai ao ar. O
 * responsivo é o do canvas: grades `auto-fit` + visibilidade por aparelho
 * ([data-oculta-m]/[data-so-m]) chaveada pelo `data-mobile` calculado aqui (corte em 860,
 * com um segundo corte em 960 para as colunas do hero).
 *
 * ## O que o protótipo dizia e o site NÃO diz, e por quê
 *
 * - "Vídeo · 4:12" e "Filipe explica o Mapa em 4 minutos": o VSL ainda não foi publicado,
 *   e duração inventada de vídeo inexistente é promessa quebrada. O quadro do player fica
 *   como o canvas desenhou, com o selo dizendo "em breve" e sem link morto; quando o vídeo
 *   subir, entra o embed com a duração real.
 * - Depoimentos "Nome do profissional · CREF · cidade": modelo ilustrativo do canvas.
 *   Prova social fabricada não vai ao ar (check:legal bloco D barra o literal); a seção
 *   de prova mostra o caso demonstrativo real e os cartões entram quando houver relato
 *   autorizado.
 * - "12 fundadores já entraram" com barra de progresso: número inventado. O contador só
 *   existe atrás de `cobrancaAtiva`, lendo contagem real; hoje a faixa diz a condição
 *   sem fingir venda.
 * - Garantia, reembolso e botões "Assinar": atrás de `<sc-if cobrancaAtiva>`, como sempre
 *   (check:legal bloco I). Enquanto COBRANCA_ATIVA for false, a página diz "Criar minha
 *   conta" e "hoje sem cartão", e os preços são a tabela anunciada.
 * - Preço só por binding da fonte única (`@/data/planos`). O fundador de R$ 590/ano do
 *   canvas e do VSL virou a fonte: planos.ts foi alinhado na direção do vídeo gravado.
 */
type Estado = { mobile: boolean; largo: boolean; menu: boolean };

export function Landing() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [st, setSt] = React.useState<Estado>({ mobile: false, largo: true, menu: false });
  const mudar = React.useCallback((p: Partial<Estado>) => setSt((s) => ({ ...s, ...p })), []);

  useJanela(mudar);

  const vals = React.useMemo<Valores>(() => construirValores(st, mudar), [st, mudar]);
  const html = React.useMemo(() => renderizarComEstados(template, vals), [vals]);

  useDelegacao(ref, vals);
  useNavegacaoInterna(ref);
  useRevelar(ref, html);
  useProgressoRolagem(ref);
  usePreservarFaq(ref, html);

  return (
    <>
      <style>{CSS_ESTADOS}</style>
      <div ref={ref} className="landing-prototipo" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

/**
 * REVEAL POR SCROLL, no desenho do canvas: elementos [data-reveal] entram com fade e
 * subida; [data-stagger] escalona os filhos; [data-grow] anima barras até a largura alvo.
 *
 * Cada mudança de estado (menu, largura) re-injeta o HTML inteiro, então nada pode viver
 * em nó do DOM: a cada render o motor recomeça, revelando NA HORA o que já está acima de
 * 90% da janela (o que o visitante já viu não pisca) e observando só o que ainda está
 * abaixo. Quem esconde é o JS; se nada disto rodar, a página fica inteira visível.
 */
function useRevelar(ref: React.RefObject<HTMLDivElement | null>, html: string) {
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz || typeof IntersectionObserver === "undefined") return;

    const crescer = (el: Element) =>
      el.querySelectorAll<HTMLElement>("[data-grow]").forEach((g) => {
        g.style.width = g.getAttribute("data-grow") ?? "";
      });

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const ent of entradas) {
          if (!ent.isIntersecting) continue;
          const el = ent.target as HTMLElement;
          if (el.hasAttribute("data-stagger")) {
            Array.from(el.children).forEach((c, k) => {
              const f = c as HTMLElement;
              f.style.transition = `opacity .7s ease ${k * 90}ms, transform .7s cubic-bezier(.2,.8,.2,1) ${k * 90}ms`;
              f.style.opacity = "1";
              f.style.transform = "none";
            });
          }
          el.style.opacity = "1";
          el.style.transform = "none";
          crescer(el);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    for (const el of raiz.querySelectorAll<HTMLElement>("[data-reveal]")) {
      const r = el.getBoundingClientRect();
      // Já está na janela (ou acima dela): revela sem animar, para o re-render do menu
      // ou do resize não fazer a página piscar.
      if (r.top < window.innerHeight * 0.9) {
        crescer(el);
        continue;
      }
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      if (el.hasAttribute("data-stagger"))
        Array.from(el.children).forEach((c) => {
          const f = c as HTMLElement;
          f.style.opacity = "0";
          f.style.transform = "translateY(18px)";
        });
      obs.observe(el);
    }

    return () => obs.disconnect();
  }, [ref, html]);
}

/**
 * A régua de progresso do topo é IMPERATIVA de propósito: alimentá-la por estado React
 * re-renderizaria (e re-injetaria) a página inteira a cada tick de rolagem.
 */
function useProgressoRolagem(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const aoRolar = () => {
      const barra = ref.current?.querySelector<HTMLElement>("#lp-progresso");
      if (!barra) return;
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      barra.style.width = max > 0 ? `${Math.min(100, (d.scrollTop / max) * 100)}%` : "0";
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar();
    return () => window.removeEventListener("scroll", aoRolar);
  }, [ref]);
}

/**
 * Mantém abertas as respostas do FAQ que o visitante abriu, através das recriações do DOM.
 * A chave é o texto do resumo, não o índice: se a ordem mudar, o índice abriria a
 * resposta errada, que é pior que fechar todas.
 */
function usePreservarFaq(ref: React.RefObject<HTMLDivElement | null>, html: string) {
  const abertos = React.useRef(new Set<string>());
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const chave = (d: HTMLDetailsElement) => d.querySelector("summary")?.textContent?.trim() ?? "";
    const lista = [...raiz.querySelectorAll<HTMLDetailsElement>("details")];

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

/**
 * Os valores que o template consome. Preço sempre da FONTE ÚNICA (`@/data/planos`); os
 * números grandes saem sem o "R$" quando o template imprime o cifrão em tipografia
 * própria, e formatados quando o valor entra no meio da frase.
 *
 * `cobrancaAtiva`/`semCobranca` são o par que liga os dois textos de risco (sc-if não tem
 * else). O contador de fundadores lê VAGAS_FUNDADOR_OCUPADAS da fonte única: desde
 * 08/09/2026 existem confirmações REAIS (3 fundadores), então a barra aparece nas duas
 * fases, sempre com o número que a fonte declara.
 */
function construirValores(st: Estado, mudar: (p: Partial<Estado>) => void): Valores {
  const ocupadas = VAGAS_FUNDADOR_OCUPADAS;
  return {
    isMobile: st.mobile,
    isDesktop: !st.mobile,
    menuOpen: st.menu && st.mobile,
    toggleMenu: () => mudar({ menu: !st.menu }),
    fecharMenu: () => mudar({ menu: false }),

    cobrancaAtiva: COBRANCA_ATIVA,
    semCobranca: !COBRANCA_ATIVA,

    // Responsivo do canvas: atributo de aparelho + colunas por faixa de largura.
    mobileAttr: String(st.mobile),
    colunasHero: st.largo ? "minmax(0,5fr) minmax(0,7fr)" : "1fr",
    colunasPalco: !st.mobile ? "minmax(0,5fr) minmax(0,7fr)" : "1fr",
    padFone: st.mobile ? "0" : "0 64px",
    gapRodape: st.mobile ? "28px" : "40px",

    // A escada de preços, por binding.
    mensalAvulso: String(PRECO_MENSAL_AVULSO),
    anoNoMensal: fmtBRL(ANO_NO_MENSAL),
    semestralMes: String(PRECO_SEMESTRAL_MES),
    semestralFatura: fmtBRL(PRECO_SEMESTRAL),
    economiaSemestralAno: fmtBRL(ECONOMIA_SEMESTRAL),
    proPreco: String(PRECO_MENSAL),
    proAno: fmtBRL(PRECO_ANUAL),
    fundadorMes: String(PRECO_FUNDADOR_MES),
    fundadorAno: fmtBRL(PRECO_FUNDADOR_ANO),
    vagas: String(VAGAS_FUNDADOR),

    // Contador de fundadores: só renderiza com a cobrança ativa, com contagem real.
    vagasOcupadas: String(ocupadas),
    vagasRestantes: String(VAGAS_FUNDADOR - ocupadas),
    percentualVagas: `${Math.round((ocupadas / VAGAS_FUNDADOR) * 100)}% preenchido`,
    barraVagas: `${Math.round((ocupadas / VAGAS_FUNDADOR) * 100)}%`,
  };
}

/** Largura da janela: dois cortes (860 para aparelho, 960 para as colunas do hero).
 *  Redimensionar fecha o menu. */
function useJanela(mudar: (p: Partial<Estado>) => void) {
  React.useEffect(() => {
    const aoRedimensionar = () =>
      mudar({ mobile: window.innerWidth < 860, largo: window.innerWidth >= 960, menu: false });
    aoRedimensionar();
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [mudar]);
}

/**
 * Delegação de eventos: o clique encontra o handler pelo atributo. A marcação é injetada
 * como texto, então não há como pendurar função nela; `renderizar` deixa o NOME do
 * handler num atributo e aqui ele é resolvido no objeto de valores.
 */
function useDelegacao(ref: React.RefObject<HTMLDivElement | null>, vals: Valores) {
  const ultimo = React.useRef(vals);
  ultimo.current = vals;
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const aoClicar = (e: Event) => {
      const alvo = (e.target as HTMLElement | null)?.closest?.(`[${ATTR_ACAO}-click]`);
      const nome = alvo?.getAttribute(`${ATTR_ACAO}-click`);
      if (!nome) return;
      const fn = ultimo.current[nome];
      if (typeof fn === "function") (fn as (ev: Event) => void)(e);
    };
    raiz.addEventListener("click", aoClicar);
    return () => raiz.removeEventListener("click", aoClicar);
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
