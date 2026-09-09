import * as React from "react";
import { parDeMarca } from "@/lib/theme/palettes";

/**
 * A VITRINE DO APP DO ALUNO, na landing: as telas de verdade, com a marca de quem está lendo.
 *
 * ## O que ela substitui
 *
 * A seção "O que o aluno vê" era um carrossel de quatro celulares desenhados à mão no HTML do
 * protótipo, mais um print estático (`/landing/sistema-aluno.webp`). Duas coisas estavam
 * erradas nisso. A primeira é que o desenho envelheceu: o app do aluno hoje abre com o cartão
 * da marca do professor, tem tira da semana, treino guiado com registro série a série e uma
 * aba de progresso com histórico e conquistas, e nada disso aparecia. A segunda é que a página
 * AFIRMAVA "no app com a sua marca" e mostrava a marca azul do produto, ou seja, pedia para o
 * visitante acreditar exatamente no que ela não estava mostrando.
 *
 * ## Por que ela é interativa
 *
 * White-label é a promessa mais difícil de acreditar sem ver. Aqui o visitante troca a cor, põe
 * a própria logo e vira o app do claro para o escuro, e as telas mudam na frente dele. O que
 * ele mexe é o mesmo conjunto que o produto guarda: `Marca.corPrimaria`, `Marca.logoDataUrl` e
 * a pele que o ALUNO escolhe no perfil dele.
 *
 * ## A parte honesta, que é a que dá valor
 *
 * A cor escolhida passa por `parDeMarca`, A MESMA função que o app do aluno usa: ela puxa o
 * preenchimento até 3:1 contra o fundo e escolhe a tinta que escreve em cima até 4,5:1. Então
 * quem escolher um amarelo claro vê aqui, na landing, exatamente o que veria no produto: a cor
 * entra ajustada para continuar legível, e o quanto ela andou está dito em tela. Um mockup que
 * pintasse a cor crua prometeria uma coisa e entregaria outra no primeiro login.
 *
 * E como o fundo entra nessa conta, TROCAR A PELE REFAZ O AJUSTE: a mesma cor pode passar
 * intacta no escuro e precisar andar no claro. É a demonstração mais direta do que a régua faz,
 * e ela só existe porque as duas peles são reais no produto.
 *
 * A logo é lida com `FileReader` e vira `dataURL` no estado deste componente. Não sobe para
 * lugar nenhum, e a tela diz isso.
 */

/* ------------------------------- estado da vitrine ------------------------------- */

export interface MarcaDemo {
  cor: string;
  nome: string;
  /** dataURL da logo; null = cai nas iniciais, como no produto */
  logo: string | null;
  /**
   * A pele do app do aluno. Não é campo de marca (quem escolhe é o aluno, no perfil dele), mas
   * mora aqui porque este objeto é o estado inteiro da vitrine, e ele precisa sobreviver ao
   * re-render da landing: cada mudança de estado da página reinjeta o HTML e remonta a ilha.
   */
  escuro: boolean;
}

export const MARCA_DEMO_PADRAO: MarcaDemo = { cor: "#2064EC", nome: "Rafael Trainer", logo: null, escuro: true };

/** Cores de partida. Escolhidas por serem difíceis: duas delas SÓ funcionam ajustadas. */
const SUGESTOES = ["#2064EC", "#14B3BA", "#E2543E", "#7A3FF2", "#E8A317", "#17202E"];

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "PT";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/* --------------------------------- as duas peles --------------------------------- */

/**
 * OS VALORES SÃO OS DO PRODUTO, e não uma paleta inventada para o mockup.
 *
 * Saíram de `ALUNO_ESCURO` e `ALUNO_CLARO` em `lib/theme/palettes.ts`, que é a pele do app do
 * aluno e é validada pelo `check:contraste`. Ficam copiados aqui, e não importados, porque
 * aquelas constantes são internas ao módulo de tema e exportá-las só para a landing abriria uma
 * porta para alguém pintar tela de produto com elas por fora do sistema de tokens. Se um dia a
 * pele mudar lá, este bloco é o único lugar a acompanhar.
 */
interface Pele {
  escuro: boolean;
  /** fundo da tela (bg) */
  fundo: string;
  /** cartão (surface) */
  cartao: string;
  /** superfície de apoio dentro do cartão (surfaceSoft) */
  suave: string;
  /** contorno (border) */
  linha: string;
  /** texto principal (ink) */
  tinta: string;
  /** texto secundário (ink2) */
  meio: string;
  /** texto de apoio (ink4) */
  fraco: string;
  /** barra de abas do rodapé */
  abas: string;
}

const PELE_ESCURA: Pele = {
  escuro: true,
  fundo: "#0D1524",
  cartao: "#131D31",
  suave: "#232F45",
  linha: "#2E3E5A",
  tinta: "#F2F6FC",
  meio: "#97A9C5",
  fraco: "#6E819F",
  abas: "#0A1220",
};

const PELE_CLARA: Pele = {
  escuro: false,
  fundo: "#F6F8FC",
  cartao: "#FFFFFF",
  suave: "#E9EEF6",
  linha: "#D6DEEA",
  tinta: "#0B1628",
  meio: "#5B6779",
  fraco: "#8FA0B5",
  abas: "#FFFFFF",
};

/*
 * A pele viaja por CONTEXTO, e não por prop.
 *
 * São nove componentes aninhados e cada um usa três ou quatro tokens. Passar tudo por prop
 * transformaria a assinatura de cada tela numa lista de cores, que é justamente onde se erra:
 * basta esquecer um `fraco` num lugar para o claro sair com texto invisível.
 */
const PeleCtx = React.createContext<Pele>(PELE_ESCURA);
const usePele = () => React.useContext(PeleCtx);

/* ------------------------------- cores da SEÇÃO (sempre escura) ------------------------------- */

const LP_TURQUESA = "#7FE3D8";
const LP_MEIO = "#B9C6D6";
const LP_FRACO = "#8FA0B5";
const LP_TINTA = "#F3F1EA";

const TELAS = [
  { titulo: "Treino de hoje", desc: "A marca do professor abre a tela, com a sessão do dia, a fase do plano e o que falta fazer." },
  { titulo: "Registro série a série", desc: "Carga, repetições e esforço percebido, guardados no mesmo lugar em que foram prescritos." },
  { titulo: "Progresso e constância", desc: "Histórico, sequência de treinos e a leitura do que mudou desde a primeira avaliação." },
  { titulo: "Quem monta o treino", desc: "O aluno vê o professor, o plano em que está e o que já contou sobre si." },
] as const;

/* ------------------------------- peças reutilizadas ------------------------------- */

function Selo({ children, cor, tinta }: { children: React.ReactNode; cor?: string; tinta?: string }) {
  const p = usePele();
  return (
    <span
      style={{
        borderRadius: 999,
        padding: "3px 8px",
        fontSize: 9.5,
        fontWeight: 600,
        background: cor ?? p.suave,
        color: tinta ?? p.meio,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Botao({ children, cor, tinta }: { children: React.ReactNode; cor: string; tinta: string }) {
  return (
    <div
      style={{
        background: cor,
        color: tinta,
        borderRadius: 12,
        padding: "10px 12px",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {children}
    </div>
  );
}

/** O cartão da marca que abre o app do aluno: logo em papel branco, ou iniciais. */
function CartaoDaMarca({ marca, cor, tinta }: { marca: MarcaDemo; cor: string; tinta: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, background: cor, color: tinta, borderRadius: 14, padding: 10 }}>
      <span
        style={{
          display: "grid",
          placeItems: "center",
          height: 34,
          minWidth: 34,
          flex: "none",
          borderRadius: 10,
          background: "#fff",
          padding: "3px 5px",
          overflow: "hidden",
        }}
      >
        {marca.logo ? (
          <img src={marca.logo} alt="" style={{ maxHeight: 28, maxWidth: 62, objectFit: "contain", display: "block" }} />
        ) : (
          <b style={{ color: cor, fontSize: 12, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{iniciais(marca.nome)}</b>
        )}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 9, opacity: 0.85 }}>Seu treino com</span>
        <b style={{ display: "block", fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {marca.nome || "Seu professor"}
        </b>
      </span>
    </div>
  );
}

function BarraDeAbas({ ativa, cor }: { ativa: number; cor: string }) {
  const p = usePele();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 44,
        background: p.abas,
        borderTop: `1px solid ${p.linha}`,
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        alignItems: "center",
        fontSize: 8.5,
        textAlign: "center",
      }}
    >
      {["Hoje", "Treinos", "Progresso", "Perfil"].map((t, i) => (
        <span key={t} style={{ color: i === ativa ? cor : p.fraco, fontWeight: i === ativa ? 700 : 500 }}>
          {t}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------- as telas ----------------------------------- */

const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

function TelaHoje({ marca, cor, tinta }: { marca: MarcaDemo; cor: string; tinta: string }) {
  const p = usePele();
  return (
    <>
      <CartaoDaMarca marca={marca} cor={cor} tinta={tinta} />
      <p style={{ margin: "10px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15.5, letterSpacing: "-.02em" }}>
        Boa tarde, Helena
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 9.5, color: p.fraco }}>Quarta · Fase 4 · semana 10 de 12</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginTop: 8 }}>
        {DIAS.map((d, i) => (
          <span
            key={d}
            style={{
              borderRadius: 8,
              padding: "4px 0",
              textAlign: "center",
              background: p.cartao,
              border: i === 2 ? `1.5px solid ${cor}` : `1.5px solid ${p.linha}`,
            }}
          >
            <span style={{ display: "block", fontSize: 6.5, color: p.fraco, fontWeight: 700 }}>{d}</span>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: i <= 2 ? p.tinta : p.fraco }}>{7 + i}</span>
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 14, padding: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>Treino de hoje</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: cor }}>Fase 4</span>
        </div>
        <p style={{ margin: "5px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14.5 }}>Sessão 1</p>
        <p style={{ margin: "1px 0 0", fontSize: 9.5, color: p.fraco }}>Condicionamento aeróbio</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginTop: 7 }}>
          {[
            ["4", "exercícios"],
            ["6", "séries"],
            ["35", "minutos"],
          ].map(([n, r]) => (
            <span key={r} style={{ background: p.suave, borderRadius: 9, padding: "5px 0", textAlign: "center" }}>
              <b style={{ display: "block", fontSize: 12.5, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{n}</b>
              <span style={{ fontSize: 7.5, color: p.fraco }}>{r}</span>
            </span>
          ))}
        </div>
        <p style={{ margin: "8px 0 4px", fontSize: 9, color: p.fraco }}>0 de 4 feitos</p>
        <div style={{ height: 4, borderRadius: 999, background: p.suave }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Botao cor={cor} tinta={tinta}>Começar treino</Botao>
      </div>
      {/*
        A LISTA "SUA SESSÃO" SAIU DAQUI, e a conta é de espaço, não de conteúdo.
        Medido no aparelho de 258 px: com ela, esta tela pedia 609 px numa área útil de 437, e o
        último cartão saía serrado atrás da barra de abas. As outras três telas fecham em 523 px
        e cabem. O cartão "Treino de hoje" já nomeia a sessão, a fase e as contagens, e a lista
        exercício a exercício é justamente o que a tela seguinte mostra por inteiro.
      */}
    </>
  );
}

function TelaTreino({ cor, tinta }: { cor: string; tinta: string }) {
  const p = usePele();
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span>
          <span style={{ display: "block", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>
            Sessão 1
          </span>
          <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15 }}>Exercício 2 de 4</b>
        </span>
        <span style={{ fontSize: 10, color: p.fraco }}>08:14</span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: p.suave, marginTop: 7, overflow: "hidden" }}>
        <div style={{ height: "100%", width: "38%", borderRadius: 999, background: cor }} />
      </div>
      <p style={{ margin: "10px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, lineHeight: 1.15 }}>
        Ponte de glúteos
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
        <Selo cor={cor} tinta={tinta}>2 x 13</Selo>
        <Selo>pare com 3 de sobra</Selo>
        <Selo>intervalo 1,3 min</Selo>
      </div>
      <p style={{ margin: "11px 0 5px", fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>
        Séries
      </p>
      <div style={{ display: "flex", gap: 5 }}>
        {[1, 2].map((n) => (
          <span
            key={n}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: 10,
              fontWeight: 700,
              background: n === 1 ? cor : "transparent",
              color: n === 1 ? tinta : p.fraco,
              border: n === 1 ? "none" : `1.5px solid ${p.linha}`,
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
        {[
          ["24", "kg"],
          ["13", "repetições"],
        ].map(([v, r]) => (
          <span key={r} style={{ background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 11, padding: "7px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: p.fraco, fontSize: 13 }}>−</span>
            <span style={{ textAlign: "center" }}>
              <b style={{ display: "block", fontSize: 14, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{v}</b>
              <span style={{ fontSize: 7.5, color: p.fraco }}>{r}</span>
            </span>
            <span style={{ color: p.fraco, fontSize: 13 }}>+</span>
          </span>
        ))}
      </div>
      <p style={{ margin: "9px 0 5px", fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>
        Esforço percebido
      </p>
      <div style={{ display: "flex", gap: 3 }}>
        {[5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            style={{
              flex: 1,
              borderRadius: 7,
              padding: "6px 0",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 10.5,
              background: n === 7 ? cor : p.cartao,
              color: n === 7 ? tinta : p.meio,
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 10 }}>
        <Botao cor={cor} tinta={tinta}>Registrar série 1</Botao>
      </div>
    </>
  );
}

const SEMANAS = [6, 6, 4, 6, 6, 5];

function TelaProgresso({ cor }: { cor: string }) {
  const p = usePele();
  return (
    <>
      <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>
        Seu progresso
      </p>
      <div style={{ marginTop: 9, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 14, padding: 11 }}>
        <b style={{ fontSize: 12.5 }}>Seu histórico</b>
        <p style={{ margin: "2px 0 0", fontSize: 9.5, color: p.fraco }}>95 exercícios registrados</p>
        <div style={{ marginTop: 8, background: p.suave, borderRadius: 10, padding: "7px 9px" }}>
          <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16 }}>
            6 <span style={{ fontSize: 9.5, color: p.fraco, fontWeight: 500 }}>dias</span>
          </b>
          <p style={{ margin: 0, fontSize: 8.5, color: p.fraco }}>de sequência · recorde: 6</p>
        </div>
      </div>
      <div style={{ marginTop: 7, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 14, padding: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <b style={{ fontSize: 11.5 }}>Treinos por semana</b>
          <span style={{ fontSize: 8.5, color: p.fraco }}>últimas 6</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 52, marginTop: 9 }}>
          {SEMANAS.map((v, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: `${(v / 6) * 100}%`,
                borderRadius: "4px 4px 2px 2px",
                background: i === SEMANAS.length - 1 ? cor : p.suave,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7.5, color: p.fraco, marginTop: 4 }}>
          <span>s1</span>
          <span>s6</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 7 }}>
        <span style={{ background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 11, padding: 9 }}>
          <span style={{ display: "block", fontSize: 7.5, letterSpacing: ".1em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>Peso</span>
          <b style={{ display: "block", marginTop: 2, fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15 }}>75,2 kg</b>
          <span style={{ fontSize: 8, color: p.fraco }}>menos 3,3 kg</span>
        </span>
        <span style={{ background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 11, padding: 9 }}>
          <span style={{ display: "block", fontSize: 7.5, letterSpacing: ".1em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>
            Dor percebida
          </span>
          <b style={{ display: "block", marginTop: 2, fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15 }}>4 para 2</b>
          <span style={{ fontSize: 8, color: p.fraco }}>desde a 1ª avaliação</span>
        </span>
      </div>
      <div style={{ marginTop: 7, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cor, flex: "none" }} />
        <span style={{ fontSize: 9, color: p.meio }}>
          Remada: 3×9 no lugar de 3×10. <b style={{ color: p.tinta }}>{"Seu professor vai rever."}</b>
        </span>
      </div>
    </>
  );
}

function TelaPerfil({
  marca,
  cor,
  tinta,
  onPele,
}: {
  marca: MarcaDemo;
  cor: string;
  tinta: string;
  onPele: (escuro: boolean) => void;
}) {
  const p = usePele();
  return (
    <>
      <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>Perfil</p>
      <div style={{ marginTop: 9, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 14, padding: 11, display: "flex", gap: 9, alignItems: "center" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: p.suave,
            fontWeight: 700,
            fontSize: 12,
            flex: "none",
          }}
        >
          HD
        </span>
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 12.5 }}>Helena Duarte</b>
          <span style={{ fontSize: 9, color: p.fraco }}>Emagrecimento · Iniciante · 58 anos</span>
        </span>
      </div>
      <div style={{ marginTop: 7, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 14, padding: 11 }}>
        <span style={{ display: "block", fontSize: 7.5, letterSpacing: ".1em", textTransform: "uppercase", color: p.fraco, fontWeight: 700 }}>
          Quem monta o seu treino
        </span>
        <div style={{ marginTop: 8 }}>
          <CartaoDaMarca marca={marca} cor={cor} tinta={tinta} />
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 9.5, color: p.meio, lineHeight: 1.45 }}>
          Condicionamento com monitoramento da pressão: 12 semanas
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 8.5, color: p.fraco }}>12 semanas · 3x por semana</p>
      </div>
      {/*
        A APARÊNCIA AQUI É DE VERDADE, e antes era desenho.
        Este cartão já existia com os dois botões pintados, e clicar não fazia nada: a tela
        mostrava uma escolha que o mockup não sabia executar. Agora ele é a mesma escolha do
        controle ao lado, vista de onde o ALUNO a faz, que é o perfil dele.
      */}
      <div style={{ marginTop: 7, background: p.cartao, border: `1px solid ${p.linha}`, borderRadius: 14, padding: 11 }}>
        <b style={{ fontSize: 11.5 }}>Aparência</b>
        <p style={{ margin: "1px 0 8px", fontSize: 8.5, color: p.fraco }}>Como o app se veste neste aparelho</p>
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { rotulo: "Escuro", escuro: true },
            { rotulo: "Claro", escuro: false },
          ].map((o) => {
            const ativo = p.escuro === o.escuro;
            return (
              <button
                key={o.rotulo}
                type="button"
                onClick={() => onPele(o.escuro)}
                aria-pressed={ativo}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRadius: 9,
                  border: 0,
                  padding: "6px 0",
                  fontSize: 10,
                  fontWeight: ativo ? 700 : 600,
                  background: ativo ? cor : p.suave,
                  color: ativo ? tinta : p.meio,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {o.rotulo}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- o aparelho ---------------------------------- */

function Celular({
  marca,
  cor,
  tinta,
  tela,
  largura,
  pele,
  onPele,
}: {
  marca: MarcaDemo;
  cor: string;
  tinta: string;
  tela: number;
  largura: number;
  pele: Pele;
  onPele: (escuro: boolean) => void;
}) {
  return (
    <PeleCtx.Provider value={pele}>
      <div
        style={{
          position: "relative",
          width: largura,
          flex: "none",
          padding: 7,
          borderRadius: 40,
          background: "#0A0F18",
          boxShadow: "0 40px 70px -34px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.08),inset 0 0 0 1px rgba(255,255,255,.08)",
        }}
      >
        <span style={{ position: "absolute", left: -2, top: 92, width: 3, height: 22, borderRadius: 2, background: "#1B2432" }} />
        <span style={{ position: "absolute", left: -2, top: 124, width: 3, height: 42, borderRadius: 2, background: "#1B2432" }} />
        <span style={{ position: "absolute", right: -2, top: 110, width: 3, height: 56, borderRadius: 2, background: "#1B2432" }} />
        <div
          style={{
            position: "relative",
            borderRadius: 33,
            overflow: "hidden",
            background: pele.fundo,
            aspectRatio: "9 / 19.3",
            transition: "background .25s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 18px",
              fontSize: 9.5,
              fontWeight: 600,
              color: pele.tinta,
              zIndex: 2,
            }}
          >
            <span>09:41</span>
            {/* A ilha do aparelho é preta nas duas peles: ela é o vidro, não a interface. */}
            <span style={{ width: 50, height: 15, borderRadius: 999, background: "#05080C", position: "absolute", left: "50%", top: 7, transform: "translateX(-50%)" }} />
            <span style={{ width: 13, height: 7, borderRadius: 2, border: `1px solid ${pele.tinta}` }} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "36px 11px 50px",
              color: pele.tinta,
              fontFamily: "'Instrument Sans',sans-serif",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              /*
               * O CONTEÚDO SOME NUMA ESMAECIDA, e não num corte.
               *
               * A tela do aluno ROLA, e nenhuma das quatro cabe inteira num aparelho de 258 px.
               * Com `overflow:hidden` seco, o último cartão saía serrado atrás da barra de abas
               * e a vitrine parecia quebrada. A máscara faz o que um celular de verdade faz:
               * mostra que ainda há tela abaixo. Ela para ANTES da barra de abas (que é irmã
               * deste bloco), então as abas continuam sólidas.
               */
              maskImage: "linear-gradient(180deg,#000 calc(100% - 64px),transparent calc(100% - 46px))",
              WebkitMaskImage: "linear-gradient(180deg,#000 calc(100% - 64px),transparent calc(100% - 46px))",
            }}
          >
            {tela === 0 && <TelaHoje marca={marca} cor={cor} tinta={tinta} />}
            {tela === 1 && <TelaTreino cor={cor} tinta={tinta} />}
            {tela === 2 && <TelaProgresso cor={cor} />}
            {tela === 3 && <TelaPerfil marca={marca} cor={cor} tinta={tinta} onPele={onPele} />}
          </div>
          <BarraDeAbas ativa={tela === 1 ? 0 : tela} cor={cor} />
        </div>
      </div>
    </PeleCtx.Provider>
  );
}

/* --------------------------------- os controles --------------------------------- */

function Controles({
  marca,
  onChange,
  ajustou,
}: {
  marca: MarcaDemo;
  onChange: (m: MarcaDemo) => void;
  ajustou: boolean;
}) {
  const idArquivo = React.useId();
  const [erro, setErro] = React.useState<string | null>(null);

  const lerLogo = (arquivo: File | undefined) => {
    if (!arquivo) return;
    // 1 MB é folgado para uma logo e barra o retrato de 8 MP arrastado por engano.
    if (arquivo.size > 1_000_000) {
      setErro("Escolha uma imagem de até 1 MB.");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      setErro(null);
      onChange({ ...marca, logo: String(leitor.result) });
    };
    leitor.onerror = () => setErro("Não deu para ler esse arquivo. Tente um PNG ou SVG.");
    leitor.readAsDataURL(arquivo);
  };

  const rotulo = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" as const, fontWeight: 700, color: LP_TURQUESA };
  const campo = {
    width: "100%",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: 10,
    color: LP_TINTA,
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
  };

  return (
    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 14 }}>
      <p style={{ margin: 0, ...rotulo }}>Veja com a sua marca</p>
      <p style={{ margin: "6px 0 12px", fontSize: 12.5, color: LP_MEIO, lineHeight: 1.5 }}>
        Troque a cor, ponha a sua logo e vire o app do escuro para o claro. As telas mudam na
        hora, do mesmo jeito que mudam para o seu aluno.
      </p>

      <label htmlFor={`${idArquivo}-nome`} style={{ display: "block", fontSize: 11, color: LP_FRACO, marginBottom: 4 }}>
        Nome que o aluno vê
      </label>
      <input
        id={`${idArquivo}-nome`}
        value={marca.nome}
        maxLength={28}
        onChange={(e) => onChange({ ...marca, nome: e.target.value })}
        placeholder="Seu nome ou o da sua assessoria"
        style={campo}
      />

      <p style={{ margin: "12px 0 6px", fontSize: 11, color: LP_FRACO }}>Cor da marca</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {SUGESTOES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ ...marca, cor: c })}
            aria-label={`Usar a cor ${c}`}
            aria-pressed={marca.cor.toLowerCase() === c.toLowerCase()}
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: c,
              cursor: "pointer",
              border: marca.cor.toLowerCase() === c.toLowerCase() ? "2px solid #fff" : "1px solid rgba(255,255,255,.35)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)",
              padding: 0,
            }}
          />
        ))}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 9,
            border: "1px dashed rgba(255,255,255,.25)",
            padding: "4px 9px",
            fontSize: 11.5,
            color: LP_MEIO,
            cursor: "pointer",
          }}
        >
          <input
            type="color"
            value={marca.cor}
            onChange={(e) => onChange({ ...marca, cor: e.target.value })}
            aria-label="Escolher outra cor"
            style={{ width: 18, height: 18, padding: 0, border: 0, background: "none", cursor: "pointer" }}
          />
          outra
        </label>
      </div>

      {/*
        A PELE É ESCOLHA DO ALUNO, e a frase diz isso.
        O app do professor é papel claro e o do aluno nasce escuro; o claro entrou porque quem
        treina de manhã ao ar livre lia mal o navy. Quem escolhe é o aluno, no perfil dele, e a
        vitrine não pode sugerir que é mais um ajuste de marca.
      */}
      <p style={{ margin: "12px 0 6px", fontSize: 11, color: LP_FRACO }}>Aparência que o aluno escolhe</p>
      <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 999, padding: 3 }}>
        {[
          { rotulo: "Escuro", escuro: true },
          { rotulo: "Claro", escuro: false },
        ].map((o) => {
          const ativo = marca.escuro === o.escuro;
          return (
            <button
              key={o.rotulo}
              type="button"
              onClick={() => onChange({ ...marca, escuro: o.escuro })}
              aria-pressed={ativo}
              style={{
                border: 0,
                borderRadius: 999,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: ativo ? 700 : 600,
                cursor: "pointer",
                fontFamily: "inherit",
                background: ativo ? LP_TURQUESA : "transparent",
                color: ativo ? "#0B1628" : LP_MEIO,
                transition: "background .2s ease, color .2s ease",
              }}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>

      <p style={{ margin: "12px 0 6px", fontSize: 11, color: LP_FRACO }}>Sua logo</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.16)",
            background: "rgba(255,255,255,.06)",
            padding: "7px 12px",
            fontSize: 12.5,
            fontWeight: 600,
            color: LP_TINTA,
            cursor: "pointer",
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={(e) => lerLogo(e.target.files?.[0])}
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          />
          {marca.logo ? "Trocar imagem" : "Enviar imagem"}
        </label>
        {marca.logo && (
          <button
            type="button"
            onClick={() => onChange({ ...marca, logo: null })}
            style={{ background: "none", border: 0, color: LP_MEIO, fontSize: 12, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}
          >
            Usar as iniciais
          </button>
        )}
      </div>
      {erro && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#FFB4A6" }}>{erro}</p>}
      <p style={{ margin: "8px 0 0", fontSize: 11, color: LP_FRACO, lineHeight: 1.5 }}>
        A imagem fica só neste navegador: ela não é enviada para lugar nenhum.
      </p>

      {/*
        A frase que faz esta vitrine valer: a cor é AJUSTADA, e o produto faz o mesmo.
        Sem ela, quem escolhe um tom claro veria a landing "corrigir" a cor sem explicar,
        e concluiria que o mockup está errado.
      */}
      {ajustou && (
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: LP_TURQUESA, lineHeight: 1.5 }}>
          Esta cor foi ajustada para o texto continuar legível sobre ela, na aparência que está
          selecionada. O app do aluno faz exatamente esse ajuste, com a mesma régua de contraste.
        </p>
      )}
    </div>
  );
}

/* ---------------------------------- a seção ---------------------------------- */

export function VitrineDoAluno({
  marca,
  onChange,
  mobile,
}: {
  marca: MarcaDemo;
  onChange: (m: MarcaDemo) => void;
  mobile: boolean;
}) {
  const [tela, setTela] = React.useState(0);
  const pele = marca.escuro ? PELE_ESCURA : PELE_CLARA;
  // A MESMA função do app do aluno: preenchimento a 3:1 do fundo, tinta a 4,5:1 em cima dele.
  // O fundo é o da PELE selecionada, então virar o app refaz o ajuste, que é o que acontece
  // de verdade quando o aluno troca a aparência.
  const { preenche: cor, tinta } = React.useMemo(() => parDeMarca(marca.cor, pele.fundo), [marca.cor, pele.fundo]);
  const ajustou = cor.toLowerCase() !== marca.cor.toLowerCase();
  const trocarPele = (escuro: boolean) => onChange({ ...marca, escuro });

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        // A coluna do celular é uma TRILHA FIXA, e não meia largura.
        // Com duas colunas de 1fr, um aparelho de 258 px flutuava no meio de 500 px de vazio e
        // a seção inteira lia como larga demais. A trilha fixa cola o celular no texto.
        gridTemplateColumns: mobile ? "1fr" : "minmax(0,1fr) 292px",
        gap: mobile ? 26 : 40,
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", minWidth: 0, order: 1 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 400,
            height: 400,
            margin: "-200px 0 0 -200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${cor}44 0%, transparent 62%)`,
            pointerEvents: "none",
            transition: "background .3s ease",
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <Celular
            marca={marca}
            cor={cor}
            tinta={tinta}
            tela={tela}
            largura={mobile ? 244 : 258}
            pele={pele}
            onPele={trocarPele}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
          {TELAS.map((t, i) => (
            <button
              key={t.titulo}
              type="button"
              onClick={() => setTela(i)}
              aria-label={`Ver ${t.titulo}`}
              aria-pressed={i === tela}
              style={{
                width: i === tela ? 22 : 6,
                height: 6,
                borderRadius: 3,
                border: 0,
                padding: 0,
                background: i === tela ? LP_TURQUESA : "rgba(255,255,255,.25)",
                // Só a cor faz a travessia. A largura muda de uma vez porque animá-la é
                // animar layout: quatro pontinhos não justificam recalcular a linha 60 vezes
                // por segundo, e a cor sozinha já carrega a mudança de estado.
                transition: "background .3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ minWidth: 0, order: mobile ? 2 : 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: LP_TURQUESA,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 22, height: 2, background: LP_TURQUESA, borderRadius: 2 }} />
          05 · O que o aluno vê
        </p>
        <h2
          style={{
            margin: "16px 0 0",
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 700,
            letterSpacing: "-.03em",
            fontSize: "clamp(28px,2.7vw,36px)",
            lineHeight: 1.08,
            color: "#fff",
            textWrap: "balance",
          }}
        >
          O aluno registra. Você acompanha e decide o próximo ajuste.
        </h2>
        <p style={{ margin: "14px 0 0", fontSize: 15, color: LP_MEIO, lineHeight: 1.6 }}>
          Quatro telas resumem o dia do aluno, no app com a sua marca. Toque em cada etapa para ver.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "18px 0" }}>
          {TELAS.map((t, i) => (
            <button
              key={t.titulo}
              type="button"
              onClick={() => setTela(i)}
              aria-pressed={i === tela}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                textAlign: "left",
                width: "100%",
                border: 0,
                borderRadius: 12,
                padding: 9,
                cursor: "pointer",
                background: i === tela ? "rgba(255,255,255,.07)" : "transparent",
                transition: "background .2s ease",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flex: "none",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  background: i === tela ? LP_TURQUESA : "#13233B",
                  color: i === tela ? "#0B1628" : LP_TURQUESA,
                }}
              >
                {i + 1}
              </span>
              <span style={{ minWidth: 0 }}>
                <b style={{ display: "block", fontSize: 14.5, color: "#fff" }}>{t.titulo}</b>
                <span style={{ display: "block", marginTop: 2, fontSize: 13, lineHeight: 1.5, color: i === tela ? "#D6DFEA" : LP_FRACO }}>
                  {t.desc}
                </span>
              </span>
            </button>
          ))}
        </div>

        <Controles marca={marca} onChange={onChange} ajustou={ajustou} />
      </div>
    </div>
  );
}
