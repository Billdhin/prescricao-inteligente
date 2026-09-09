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
 * White-label é a promessa mais difícil de acreditar sem ver. Aqui o visitante troca a cor e
 * põe a própria logo, e as telas mudam na frente dele. O que ele mexe é o mesmo par de campos
 * que o produto guarda em Configurações (`Marca.corPrimaria` e `Marca.logoDataUrl`).
 *
 * ## A parte honesta, que é a que dá valor
 *
 * A cor escolhida passa por `parDeMarca`, A MESMA função que o app do aluno usa: ela puxa o
 * preenchimento até 3:1 contra o fundo e escolhe a tinta que escreve em cima até 4,5:1. Então
 * quem escolher um amarelo claro vê aqui, na landing, exatamente o que veria no produto: a cor
 * entra ajustada para continuar legível, e o quanto ela andou está dito em tela. Um mockup que
 * pintasse a cor crua prometeria uma coisa e entregaria outra no primeiro login.
 *
 * A logo é lida com `FileReader` e vira `dataURL` no estado deste componente. Não sobe para
 * lugar nenhum, e a tela diz isso.
 */

/* ------------------------------- estado da marca ------------------------------- */

export interface MarcaDemo {
  cor: string;
  nome: string;
  /** dataURL da logo; null = cai nas iniciais, como no produto */
  logo: string | null;
}

export const MARCA_DEMO_PADRAO: MarcaDemo = { cor: "#2064EC", nome: "Rafael Trainer", logo: null };

/** Cores de partida. Escolhidas por serem difíceis: duas delas SÓ funcionam ajustadas. */
const SUGESTOES = ["#2064EC", "#14B3BA", "#E2543E", "#7A3FF2", "#E8A317", "#17202E"];

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "PT";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/* --------------------------------- pele do celular --------------------------------- */

const FUNDO = "#0B1628";
const CARTAO = "#13233B";
const TINTA = "#F3F1EA";
const FRACO = "#8FA0B5";
const MEIO = "#B9C6D6";

const TELAS = [
  { titulo: "Treino de hoje", desc: "A marca do professor abre a tela, com a sessão do dia, a fase do plano e o que falta fazer." },
  { titulo: "Registro série a série", desc: "Carga, repetições e esforço percebido, guardados no mesmo lugar em que foram prescritos." },
  { titulo: "Progresso e constância", desc: "Histórico, sequência de treinos e a leitura do que mudou desde a primeira avaliação." },
  { titulo: "Quem monta o treino", desc: "O aluno vê o professor, o plano em que está e o que já contou sobre si." },
] as const;

/* ------------------------------- peças reutilizadas ------------------------------- */

function Selo({ children, cor, tinta }: { children: React.ReactNode; cor?: string; tinta?: string }) {
  return (
    <span
      style={{
        borderRadius: 999,
        padding: "3px 8px",
        fontSize: 9.5,
        fontWeight: 600,
        background: cor ?? "rgba(255,255,255,.07)",
        color: tinta ?? MEIO,
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
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 46,
        background: "#0F1B30",
        borderTop: "1px solid rgba(255,255,255,.06)",
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        alignItems: "center",
        fontSize: 8.5,
        textAlign: "center",
      }}
    >
      {["Hoje", "Treinos", "Progresso", "Perfil"].map((t, i) => (
        <span key={t} style={{ color: i === ativa ? cor : FRACO, fontWeight: i === ativa ? 700 : 500 }}>
          {t}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------- as telas ----------------------------------- */

const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

function TelaHoje({ marca, cor, tinta }: { marca: MarcaDemo; cor: string; tinta: string }) {
  return (
    <>
      <CartaoDaMarca marca={marca} cor={cor} tinta={tinta} />
      <p style={{ margin: "10px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>
        Boa tarde, Helena
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 9.5, color: FRACO }}>Quarta · Fase 4 · semana 10 de 12</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginTop: 9 }}>
        {DIAS.map((d, i) => (
          <span
            key={d}
            style={{
              borderRadius: 8,
              padding: "5px 0",
              textAlign: "center",
              background: CARTAO,
              border: i === 2 ? `1.5px solid ${cor}` : "1.5px solid transparent",
            }}
          >
            <span style={{ display: "block", fontSize: 6.5, color: FRACO, fontWeight: 700 }}>{d}</span>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: i <= 2 ? TINTA : FRACO }}>{7 + i}</span>
          </span>
        ))}
      </div>
      <div style={{ marginTop: 9, background: CARTAO, borderRadius: 14, padding: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>Treino de hoje</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: cor }}>Fase 4</span>
        </div>
        <p style={{ margin: "5px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15 }}>Sessão 1</p>
        <p style={{ margin: "1px 0 0", fontSize: 9.5, color: FRACO }}>Condicionamento aeróbio</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginTop: 8 }}>
          {[
            ["4", "exercícios"],
            ["6", "séries"],
            ["35", "minutos"],
          ].map(([n, r]) => (
            <span key={r} style={{ background: "rgba(255,255,255,.05)", borderRadius: 9, padding: "6px 0", textAlign: "center" }}>
              <b style={{ display: "block", fontSize: 13, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{n}</b>
              <span style={{ fontSize: 7.5, color: FRACO }}>{r}</span>
            </span>
          ))}
        </div>
        <p style={{ margin: "9px 0 4px", fontSize: 9, color: FRACO }}>0 de 4 feitos</p>
        <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,.08)" }} />
      </div>
      <div style={{ marginTop: 9 }}>
        <Botao cor={cor} tinta={tinta}>Começar treino</Botao>
      </div>
      <p style={{ margin: "11px 0 5px", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>
        Sua sessão
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          ["Bicicleta ergométrica", "35 min · contínuo"],
          ["Ponte de glúteos", "2 x 13 · reserva 3"],
          ["Remada na máquina", "2 x 13 · reserva 3"],
        ].map(([nome, dose]) => (
          <span key={nome} style={{ display: "flex", alignItems: "center", gap: 8, background: CARTAO, borderRadius: 10, padding: "7px 9px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.25)", flex: "none" }} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <b style={{ display: "block", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nome}</b>
              <span style={{ fontSize: 8.5, color: FRACO }}>{dose}</span>
            </span>
          </span>
        ))}
      </div>
    </>
  );
}

function TelaTreino({ cor, tinta }: { cor: string; tinta: string }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span>
          <span style={{ display: "block", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>
            Sessão 1
          </span>
          <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15 }}>Exercício 2 de 4</b>
        </span>
        <span style={{ fontSize: 10, color: FRACO }}>08:14</span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,.08)", marginTop: 7, overflow: "hidden" }}>
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
      <p style={{ margin: "11px 0 5px", fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>
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
              color: n === 1 ? tinta : FRACO,
              border: n === 1 ? "none" : `1.5px solid rgba(255,255,255,.18)`,
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
          <span key={r} style={{ background: CARTAO, borderRadius: 11, padding: "7px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: FRACO, fontSize: 13 }}>−</span>
            <span style={{ textAlign: "center" }}>
              <b style={{ display: "block", fontSize: 14, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{v}</b>
              <span style={{ fontSize: 7.5, color: FRACO }}>{r}</span>
            </span>
            <span style={{ color: FRACO, fontSize: 13 }}>+</span>
          </span>
        ))}
      </div>
      <p style={{ margin: "9px 0 5px", fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>
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
              background: n === 7 ? cor : CARTAO,
              color: n === 7 ? tinta : MEIO,
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

function TelaProgresso({ cor, tinta }: { cor: string; tinta: string }) {
  return (
    <>
      <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>
        Seu progresso
      </p>
      <div style={{ marginTop: 9, background: CARTAO, borderRadius: 14, padding: 11 }}>
        <b style={{ fontSize: 12.5 }}>Seu histórico</b>
        <p style={{ margin: "2px 0 0", fontSize: 9.5, color: FRACO }}>95 exercícios registrados</p>
        <div style={{ marginTop: 8, background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "7px 9px" }}>
          <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16 }}>
            6 <span style={{ fontSize: 9.5, color: FRACO, fontWeight: 500 }}>dias</span>
          </b>
          <p style={{ margin: 0, fontSize: 8.5, color: FRACO }}>de sequência · recorde: 6</p>
        </div>
      </div>
      <div style={{ marginTop: 7, background: CARTAO, borderRadius: 14, padding: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <b style={{ fontSize: 11.5 }}>Treinos por semana</b>
          <span style={{ fontSize: 8.5, color: FRACO }}>últimas 6</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 52, marginTop: 9 }}>
          {SEMANAS.map((v, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: `${(v / 6) * 100}%`,
                borderRadius: "4px 4px 2px 2px",
                background: i === SEMANAS.length - 1 ? cor : "rgba(255,255,255,.14)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7.5, color: FRACO, marginTop: 4 }}>
          <span>s1</span>
          <span>s6</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 7 }}>
        <span style={{ background: CARTAO, borderRadius: 11, padding: 9 }}>
          <span style={{ display: "block", fontSize: 7.5, letterSpacing: ".1em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>Peso</span>
          <b style={{ display: "block", marginTop: 2, fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15 }}>75,2 kg</b>
          <span style={{ fontSize: 8, color: FRACO }}>menos 3,3 kg</span>
        </span>
        <span style={{ background: CARTAO, borderRadius: 11, padding: 9 }}>
          <span style={{ display: "block", fontSize: 7.5, letterSpacing: ".1em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>
            Dor percebida
          </span>
          <b style={{ display: "block", marginTop: 2, fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15 }}>4 para 2</b>
          <span style={{ fontSize: 8, color: FRACO }}>desde a 1ª avaliação</span>
        </span>
      </div>
      <div style={{ marginTop: 7, background: CARTAO, borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cor, flex: "none" }} />
        <span style={{ fontSize: 9, color: MEIO }}>
          Remada: 3×9 no lugar de 3×10. <b style={{ color: TINTA }}>{"Seu professor vai rever."}</b>
        </span>
      </div>
    </>
  );
}

function TelaPerfil({ marca, cor, tinta }: { marca: MarcaDemo; cor: string; tinta: string }) {
  return (
    <>
      <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>Perfil</p>
      <div style={{ marginTop: 9, background: CARTAO, borderRadius: 14, padding: 11, display: "flex", gap: 9, alignItems: "center" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,.08)",
            fontWeight: 700,
            fontSize: 12,
            flex: "none",
          }}
        >
          HD
        </span>
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 12.5 }}>Helena Duarte</b>
          <span style={{ fontSize: 9, color: FRACO }}>Emagrecimento · Iniciante · 58 anos</span>
        </span>
      </div>
      <div style={{ marginTop: 7, background: CARTAO, borderRadius: 14, padding: 11 }}>
        <span style={{ display: "block", fontSize: 7.5, letterSpacing: ".1em", textTransform: "uppercase", color: FRACO, fontWeight: 700 }}>
          Quem monta o seu treino
        </span>
        <div style={{ marginTop: 8 }}>
          <CartaoDaMarca marca={marca} cor={cor} tinta={tinta} />
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 9.5, color: MEIO, lineHeight: 1.45 }}>
          Condicionamento com monitoramento da pressão: 12 semanas
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 8.5, color: FRACO }}>12 semanas · 3x por semana</p>
      </div>
      <div style={{ marginTop: 7, background: CARTAO, borderRadius: 14, padding: 11 }}>
        <b style={{ fontSize: 11.5 }}>Aparência</b>
        <p style={{ margin: "1px 0 8px", fontSize: 8.5, color: FRACO }}>Como o app se veste neste aparelho</p>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={{ flex: 1, textAlign: "center", borderRadius: 9, padding: "6px 0", fontSize: 10, fontWeight: 700, background: cor, color: tinta }}>
            Escuro
          </span>
          <span style={{ flex: 1, textAlign: "center", borderRadius: 9, padding: "6px 0", fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,.05)", color: MEIO }}>
            Claro
          </span>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- o aparelho ---------------------------------- */

function Celular({ marca, cor, tinta, tela, largura }: { marca: MarcaDemo; cor: string; tinta: string; tela: number; largura: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: largura,
        flex: "none",
        padding: 8,
        borderRadius: 42,
        background: "#0A0F18",
        boxShadow: "0 40px 70px -34px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.08),inset 0 0 0 1px rgba(255,255,255,.08)",
      }}
    >
      <span style={{ position: "absolute", left: -2, top: 96, width: 3, height: 24, borderRadius: 2, background: "#1B2432" }} />
      <span style={{ position: "absolute", left: -2, top: 130, width: 3, height: 44, borderRadius: 2, background: "#1B2432" }} />
      <span style={{ position: "absolute", right: -2, top: 114, width: 3, height: 60, borderRadius: 2, background: "#1B2432" }} />
      <div style={{ position: "relative", borderRadius: 33, overflow: "hidden", background: FUNDO, aspectRatio: "9 / 19.3" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            fontSize: 10,
            fontWeight: 600,
            color: TINTA,
            zIndex: 2,
          }}
        >
          <span>09:41</span>
          <span style={{ width: 54, height: 16, borderRadius: 999, background: "#05080C", position: "absolute", left: "50%", top: 7, transform: "translateX(-50%)" }} />
          <span style={{ width: 13, height: 7, borderRadius: 2, border: `1px solid ${TINTA}` }} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "40px 12px 54px",
            color: TINTA,
            fontFamily: "'Instrument Sans',sans-serif",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {tela === 0 && <TelaHoje marca={marca} cor={cor} tinta={tinta} />}
          {tela === 1 && <TelaTreino cor={cor} tinta={tinta} />}
          {tela === 2 && <TelaProgresso cor={cor} tinta={tinta} />}
          {tela === 3 && <TelaPerfil marca={marca} cor={cor} tinta={tinta} />}
        </div>
        <BarraDeAbas ativa={tela === 1 ? 0 : tela} cor={cor} />
      </div>
    </div>
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

  const rotulo = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" as const, fontWeight: 700, color: "#7FE3D8" };
  const campo = {
    width: "100%",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: 10,
    color: TINTA,
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
  };

  return (
    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 14 }}>
      <p style={{ margin: 0, ...rotulo }}>Veja com a sua marca</p>
      <p style={{ margin: "6px 0 12px", fontSize: 12.5, color: MEIO, lineHeight: 1.5 }}>
        Troque a cor e ponha a sua logo. As telas mudam na hora, do mesmo jeito que mudam para o seu aluno.
      </p>

      <label htmlFor={`${idArquivo}-nome`} style={{ display: "block", fontSize: 11, color: FRACO, marginBottom: 4 }}>
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

      <p style={{ margin: "12px 0 6px", fontSize: 11, color: FRACO }}>Cor da marca</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {SUGESTOES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ ...marca, cor: c })}
            aria-label={`Usar a cor ${c}`}
            aria-pressed={marca.cor.toLowerCase() === c.toLowerCase()}
            style={{
              width: 30,
              height: 30,
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
            padding: "5px 9px",
            fontSize: 11.5,
            color: MEIO,
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

      <p style={{ margin: "12px 0 6px", fontSize: 11, color: FRACO }}>Sua logo</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.16)",
            background: "rgba(255,255,255,.06)",
            padding: "8px 12px",
            fontSize: 12.5,
            fontWeight: 600,
            color: TINTA,
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
            style={{ background: "none", border: 0, color: MEIO, fontSize: 12, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}
          >
            Usar as iniciais
          </button>
        )}
      </div>
      {erro && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#FFB4A6" }}>{erro}</p>}
      <p style={{ margin: "8px 0 0", fontSize: 11, color: FRACO, lineHeight: 1.5 }}>
        A imagem fica só neste navegador: ela não é enviada para lugar nenhum.
      </p>

      {/*
        A frase que faz esta vitrine valer: a cor é AJUSTADA, e o produto faz o mesmo.
        Sem ela, quem escolhe um tom claro veria a landing "corrigir" a cor sem explicar,
        e concluiria que o mockup está errado.
      */}
      {ajustou && (
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "#7FE3D8", lineHeight: 1.5 }}>
          Esta cor foi ajustada para o texto continuar legível sobre ela. O app do aluno faz
          exatamente esse ajuste, com a mesma régua de contraste.
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
  // A MESMA função do app do aluno: preenchimento a 3:1 do fundo, tinta a 4,5:1 em cima dele.
  const { preenche: cor, tinta } = React.useMemo(() => parDeMarca(marca.cor, FUNDO), [marca.cor]);
  const ajustou = cor.toLowerCase() !== marca.cor.toLowerCase();

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "minmax(0,1fr) minmax(0,1fr)",
        gap: mobile ? 28 : 48,
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
            width: 520,
            height: 520,
            margin: "-260px 0 0 -260px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${cor}44 0%, transparent 62%)`,
            pointerEvents: "none",
            transition: "background .3s ease",
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <Celular marca={marca} cor={cor} tinta={tinta} tela={tela} largura={mobile ? 250 : 268} />
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
                background: i === tela ? "#7FE3D8" : "rgba(255,255,255,.25)",
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
            color: "#7FE3D8",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 22, height: 2, background: "#7FE3D8", borderRadius: 2 }} />
          05 · O que o aluno vê
        </p>
        <h2
          style={{
            margin: "16px 0 0",
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 700,
            letterSpacing: "-.03em",
            fontSize: "clamp(28px,3vw,38px)",
            lineHeight: 1.08,
            color: "#fff",
            textWrap: "balance",
          }}
        >
          O aluno registra. Você acompanha e decide o próximo ajuste.
        </h2>
        <p style={{ margin: "14px 0 0", fontSize: 15.5, color: MEIO, lineHeight: 1.6 }}>
          Quatro telas resumem o dia do aluno, no app com a sua marca. Toque em cada etapa para ver.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "20px 0" }}>
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
                padding: 10,
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
                  background: i === tela ? "#7FE3D8" : "#13233B",
                  color: i === tela ? "#0B1628" : "#7FE3D8",
                }}
              >
                {i + 1}
              </span>
              <span style={{ minWidth: 0 }}>
                <b style={{ display: "block", fontSize: 14.5, color: "#fff" }}>{t.titulo}</b>
                <span style={{ display: "block", marginTop: 2, fontSize: 13, lineHeight: 1.5, color: i === tela ? "#D6DFEA" : FRACO }}>
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
