import { Link } from "react-router-dom";
import * as React from "react";
import {
  ArrowRight,
  Check,
  Plus,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { MarcaPino } from "@/components/brand/Logo";
import { MonitorMockup, type MockupTela } from "@/components/landing/MockupApp";
import { MotorDecidindo } from "@/components/landing/MotorDecidindo";
import {
  NOME_PLANO,
  PRECO_MENSAL,
  PRECO_ANUAL_FUNDADOR,
  PRECO_ANUAL_EQUIV_MES,
  VAGAS_FUNDADOR,
  ITENS_PLANO,
  fmtBRL,
} from "@/data/planos";

/**
 * Landing "Redesign do Mapa da Prescrição".
 *
 * Reconstrução fiel do protótipo de redesign (o site público de marketing),
 * na paleta e tipografia exatas dele: fundo areia #F6F5F2, texto navy #10233A,
 * teal #12B5A8, borda quente #EAE8E3, botão navy #0D1A2B, rodapé escuro #0B1220.
 * Bricolage Grotesque nos títulos (font-display), Instrument Sans no corpo.
 * Ordem: dor → ciclo do cuidado → por dentro → semáforo → ciência → comparativo
 * → prova social → preço → FAQ → CTA. Links e preço são os reais do produto.
 */

/* ------------------------------ átomos ---------------------------------- */

const WRAP = "mx-auto w-full max-w-[1160px] px-6";

/* Etiqueta versalete das seções (ex.: "O CICLO DO CUIDADO") */
function Eyebrow({ children, color = "#12B5A8" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.16em]" style={{ color }}>
      <span aria-hidden className="h-px w-6" style={{ background: color }} />
      {children}
    </div>
  );
}

/**
 * Destino que pode ser uma seção desta página (#id) ou uma rota do app.
 *
 * O `<Link to="#x">` do react-router NÃO é âncora: ele trata como rota, não
 * encontra, cai no curinga `path="*"` e devolve o visitante à home — foi assim
 * que "Ver o app por dentro" parecia não fazer nada. Âncora é `<a href>`.
 */
function Acao({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) {
  // Âncora NATIVA de propósito: é o navegador que rola, então funciona mesmo se
  // o JS falhar, e honra o scroll-mt das seções (o título não fica atrás do
  // cabeçalho fixo). A suavidade vem do CSS, em `useRolagemSuave`.
  if (to.startsWith("#")) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

/**
 * Rolagem suave só enquanto a landing está na tela (e só para quem não pediu
 * menos movimento). Escopado ao ciclo de vida da página para não alterar o
 * comportamento de rolagem do app logado.
 */
function useRolagemSuave() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raiz = document.documentElement;
    const anterior = raiz.style.scrollBehavior;
    raiz.style.scrollBehavior = "smooth";
    return () => {
      raiz.style.scrollBehavior = anterior;
    };
  }, []);
}

/* Botão primário (navy sólido) e secundário (branco com borda quente) */
const CTA_BASE = "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold transition-colors";

function CtaPrimary({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Acao
      to={to}
      className={`${CTA_BASE} bg-[#0D1A2B] text-white shadow-[0_2px_10px_rgba(13,26,43,0.18)] hover:bg-[#16283f] ${className}`}
    >
      {children}
    </Acao>
  );
}
function CtaSecondary({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Acao
      to={to}
      className={`${CTA_BASE} border border-[#EAE8E3] bg-white text-[#10233A] hover:border-[#d9d6cf] ${className}`}
    >
      {children}
    </Acao>
  );
}

/* --------------------------------- página -------------------------------- */

export function Landing() {
  useRolagemSuave();
  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#10233A] antialiased">
      <Header />
      <Hero />
      <Problema />
      {/* A demonstração vem LOGO DEPOIS da dor e ANTES de qualquer explicação de como o
          produto funciona. Quem acabou de se reconhecer no problema quer ver a coisa
          decidindo, não ler o mecanismo. É também o que tira a /casos-rcd do limbo: ela
          existia, era auditável, e a home não a linkava de lugar nenhum. */}
      <MotorDecidindo WRAP={WRAP} Eyebrow={Eyebrow} />
      <Ciclo />
      <PorDentro />
      <Semaforo />
      <Respaldo />
      <Comparativo />
      <ParaQueServe />
      <Planos />
      <Faq />
      <CtaFinal />
      <Footer />
    </div>
  );
}

/* --------------------------------- header -------------------------------- */

function Header() {
  const nav = [
    ["Casos", "#casos"],
    ["O ciclo", "#ciclo"],
    ["Por dentro", "#por-dentro"],
    ["Ciência", "#ciencia"],
    ["Planos", "#planos"],
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-[#EAE8E3] bg-[#F6F5F2]/[0.86] backdrop-blur-md">
      <div className={`${WRAP} flex h-[67px] items-center justify-between`}>
        <Brand />
        <nav className="hidden items-center gap-7 text-[15px] text-[#10233A] md:flex">
          {nav.map(([label, href]) => (
            <Acao key={href} to={href} className="text-[#5A6B7D] transition-colors hover:text-[#10233A]">
              {label}
            </Acao>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="hidden text-[15px] font-medium text-[#5A6B7D] hover:text-[#10233A] sm:block">
            Entrar
          </Link>
          <Acao
            to="#planos"
            className="inline-flex items-center rounded-xl bg-[#0D1A2B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16283f]"
          >
            Assinar agora
          </Acao>
        </div>
      </div>
    </header>
  );
}

/* Marca OFICIAL do produto: o pino com a rota de 3 nós (/brand/marca-pino.webp,
   a arte escolhida pelo Filipe) + o wordmark de duas cores. Fundo transparente,
   então serve no cabeçalho claro e no rodapé escuro. */
function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <MarcaPino className="h-8 w-8 shrink-0" />
      <span
        className="whitespace-nowrap font-display text-[17px] font-bold leading-none"
        style={{ color: dark ? "#F6F5F2" : "#10233A" }}
      >
        Mapa da <span style={{ color: dark ? "#12B5A8" : "#2064EC" }}>Prescrição</span>
      </span>
    </span>
  );
}

/* ---------------------------------- hero --------------------------------- */

function Hero() {
  return (
    <section className="px-6 pb-[72px] pt-[60px]">
      <div className="mx-auto grid w-full max-w-[1160px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EAE8E3] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#5A6B7D]">
            <span className="h-2 w-2 rounded-full bg-[#12B5A8]" />
            Feito por profissionais de Educação Física
          </div>
          <h1 className="font-display text-[42px] font-bold leading-[1.06] tracking-[-0.01em] text-[#10233A] md:text-[52px]">
            Todo treino que você entrega tem um porquê.
            <br />
            <span
              className="bg-gradient-to-r from-[#12B5A8] to-[#2064EC] bg-clip-text text-transparent"
            >
              Aqui ele fica registrado.
            </span>
          </h1>
          <p className="mt-5 max-w-[34rem] text-[18px] leading-relaxed text-[#5A6B7D]">
            Cadastrar, avaliar, planejar, liberar e reavaliar: o ciclo inteiro do cuidado num lugar
            só, cada decisão com a justificativa técnica e a fonte ao lado. Você decide; o sistema
            guarda o raciocínio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CtaPrimary to="#planos">Assinar o Mapa</CtaPrimary>
            <CtaSecondary to="#por-dentro">Ver o app por dentro</CtaSecondary>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[13.5px] font-medium text-[#8A97A6]">
            {["7 dias para testar", "Cancela quando quiser", "Seus dados são seus"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#12B5A8]" /> {t}
              </span>
            ))}
          </div>
        </div>

        <PhoneMock />
      </div>
    </section>
  );
}

/* Mockup do celular: o ciclo do cuidado da Marina + evolução + reavaliação */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      <div className="overflow-hidden rounded-[18px] border border-[#EAE8E3] bg-white shadow-[0_24px_60px_-24px_rgba(16,35,58,0.28)]">
        {/* barra do navegador */}
        <div className="flex items-center gap-1.5 border-b border-[#EAE8E3] bg-[#FBFAF8] px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E3E0DA]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E3E0DA]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E3E0DA]" />
          <span className="ml-2 font-mono text-[11.5px] text-[#8A97A6]">app.mapadaprescricao.com.br</span>
        </div>

        <div className="space-y-3 p-4">
          {/* aluno */}
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E9F6EE] font-display text-base font-bold text-[#1B7A4B]">
              M
            </span>
            <div>
              <div className="font-display text-[15px] font-bold text-[#10233A]">Marina</div>
              <div className="text-[12px] text-[#8A97A6]">Emagrecimento · Iniciante · desde jul/2026</div>
            </div>
          </div>

          {/* ciclo do cuidado */}
          <div className="rounded-[14px] border border-[#EFEDE8] p-3">
            <div className="mb-2 flex items-center justify-between text-2xs font-bold uppercase tracking-[0.12em] text-[#8A97A6]">
              <span>Ciclo do cuidado</span>
              <span className="text-[#5A6B7D]">· etapa 4 de 5</span>
            </div>
            {/* as 5 etapas cabem na linha com padding curto; se a fonte do
                sistema esticar, quebram em duas em vez de serem cortadas. A data
                da reavaliação vive no cartão de baixo, não no chip. */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                ["Cadastrar", "done"],
                ["Avaliar", "done"],
                ["Planejar", "done"],
                ["Liberar", "now"],
                ["Reavaliar", "next"],
              ].map(([label, st]) => (
                <span
                  key={label}
                  className={
                    // borda em todos (transparente nos preenchidos) para que os
                    // cinco chips tenham exatamente a mesma altura
                    "whitespace-nowrap rounded-full border px-1.5 py-0.5 text-2xs font-semibold " +
                    (st === "done"
                      ? "border-transparent bg-[#E9F6EE] text-[#1B7A4B]"
                      : st === "now"
                        ? "border-transparent bg-[#0D1A2B] text-white"
                        : "border-[#EAE8E3] text-[#8A97A6]")
                  }
                >
                  {st === "done" ? "✓ " : ""}
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* AGORA · liberar */}
          <div className="rounded-[14px] bg-[#0D1A2B] p-3.5 text-white">
            <div className="mb-1 text-2xs font-bold uppercase tracking-[0.14em] text-[#7f93ab]">Agora · Liberar</div>
            <div className="text-[13.5px] font-medium leading-snug">
              O treino está pronto; o semáforo confirma o dia.
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#5ee0d0]">
              Fazer o semáforo <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* evolução */}
          <div className="rounded-[14px] border border-[#EFEDE8] p-3">
            <div className="mb-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-[#8A97A6]">
              Evolução · peso
            </div>
            <div className="flex items-end justify-between">
              <span className="font-display text-2xl font-bold tabular-nums text-[#10233A]">78,2 kg</span>
              <span className="rounded-full bg-[#E9F6EE] px-2 py-0.5 text-[12px] font-bold text-[#1B7A4B]">−2,4 kg</span>
            </div>
            {/* altura em % de uma caixa fixa: barras de gráfico, não blocos
                achatados. A última é a medida de hoje, por isso destacada. */}
            <div className="mt-2.5 flex h-16 items-end justify-between gap-1.5">
              {[100, 89, 93, 76, 67, 55, 46].map((h, i, a) => (
                <span
                  key={i}
                  className={
                    "w-full max-w-[26px] rounded-t-[3px] " +
                    (i === a.length - 1 ? "bg-[#2064EC]" : "bg-[#DCE7F6]")
                  }
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* reavaliar */}
          <div className="flex items-center justify-between rounded-[14px] border border-[#EAE8E3] bg-[#FBFAF8] px-3 py-2.5">
            <div>
              <div className="text-2xs font-bold uppercase tracking-[0.12em] text-[#8A97A6]">Reavaliar em 20/08</div>
              <div className="text-[12px] text-[#5A6B7D]">Fim de Base e adaptação · 20 dias.</div>
            </div>
          </div>
        </div>
      </div>

      {/* selo flutuante */}
      <div className="absolute -bottom-3 -left-3 inline-flex items-center gap-1.5 rounded-[14px] border border-[#EAE8E3] bg-white px-3 py-2 shadow-[0_10px_24px_-12px_rgba(16,35,58,0.35)]">
        <span className="h-2 w-2 rounded-full bg-[#1B7A4B]" />
        <span className="text-[12.5px] font-semibold text-[#10233A]">Justificativa registrada</span>
      </div>
    </div>
  );
}

/* ------------------------------- problema -------------------------------- */

function Problema() {
  const cards = [
    ["A planilha", "Cada aluno numa aba, cada aba com um padrão diferente. Só você entende, e às vezes nem você."],
    ["A dúvida", "Aluno chega com pressão alta e dor no ombro. Libera? Adapta? Encaminha? A resposta some junto com o dia."],
    ["O retrabalho", "Todo mês, montar tudo de novo do zero, sem lembrar por que você tinha escolhido aquilo."],
    ["A reavaliação", "Marcada de cabeça, cobrada por ninguém, feita quando dá. E o progresso vira achismo."],
  ];
  return (
    <section className={`${WRAP} pb-[84px]`}>
      <h2 className="mx-auto max-w-2xl text-center font-display text-[28px] font-bold leading-tight text-[#10233A] md:text-[34px]">
        Você conhece essa rotina melhor do que gostaria
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(([t, d]) => (
          <div key={t} className="rounded-[18px] border border-[#EAE8E3] bg-white p-5">
            <div className="font-display text-[17px] font-bold text-[#10233A]">{t}</div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#5A6B7D]">{d}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-2xl text-center text-[16px] text-[#5A6B7D]">
        Nada disso é falta de competência sua. É falta de um lugar onde o seu raciocínio caiba inteiro.
      </p>
    </section>
  );
}

/* ------------------------------ ciclo do cuidado ------------------------- */

function Ciclo() {
  const steps = [
    ["01", "Cadastrar", "Perfil em 6 passos: básicos, objetivo, saúde e restrições, medicamentos, equipamentos e notas. Só o que muda a prescrição."],
    ["02", "Avaliar", "Medidas, dor, evolução por data e avaliação postural por visão computacional, e a foto nunca sai do seu dispositivo."],
    ["03", "Planejar", "Periodização de até 12 semanas com curva de volume, intensidade e complexidade. Editar uma sessão move a curva."],
    ["04", "Liberar", "Quatro perguntas antes da sessão, cerca de 40 segundos. A pior resposta define a cor do dia."],
    ["05", "Reavaliar", "Data marcada pelo fim do bloco, não pela sua memória. O sistema cobra você antes do aluno cobrar."],
  ];
  return (
    <section id="ciclo" className={`${WRAP} scroll-mt-24 pb-[84px]`}>
      <div className="text-center">
        <div className="flex justify-center">
          <Eyebrow color="#1B7A4B">O ciclo do cuidado</Eyebrow>
        </div>
        <h2 className="font-display text-[28px] font-bold text-[#10233A] md:text-[34px]">
          Cinco etapas. O sistema sempre te diz em qual você está.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[16px] text-[#5A6B7D]">
          Nenhum aluno fica no limbo. Cada perfil mostra a etapa atual, o que falta e a próxima ação
          recomendada, do primeiro cadastro até a reavaliação com data marcada.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map(([n, t, d]) => (
          <div key={n} className="flex flex-col rounded-[18px] border border-[#EAE8E3] bg-white p-[22px]">
            <span className="font-mono text-[11.5px] font-bold text-[#1B7A4B]">{n}</span>
            <div className="mt-2 font-display text-[18px] font-bold text-[#10233A]">{t}</div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5A6B7D]">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ por dentro ------------------------------- */

const ABAS = [
  {
    id: "cadastro",
    label: "1 · Cadastro",
    url: "app.mapadaprescricao.com.br/alunos/mariana/perfil",
    titulo: "Cadastro que só pergunta o que muda a prescrição",
    d1: "Seis passos: básicos, objetivo, saúde e restrições, medicamentos, equipamentos e notas.",
    d2: "Nada de formulário longo: o que não altera a conduta fica de fora.",
  },
  {
    id: "avaliacoes",
    label: "2 · Avaliações",
    url: "app.mapadaprescricao.com.br/assessments",
    titulo: "Evolução que vira argumento",
    d1: "Peso, % de gordura e cintura por data, com leitura automática do período e exportação em PDF para mostrar ao aluno.",
    d2: "A reavaliação aparece com data e motivo, e o ciclo cobra você antes do aluno cobrar.",
  },
  {
    id: "semaforo",
    label: "3 · Semáforo",
    url: "app.mapadaprescricao.com.br/alunos/mariana?aba=semaforo",
    titulo: "A decisão do dia, com o porquê",
    d1: "Quatro perguntas antes da sessão. A pior resposta define a cor e a conduta recomendada.",
    d2: "Cada resposta fica registrada, dia a dia, no histórico do aluno.",
  },
  {
    id: "periodizacao",
    label: "4 · Periodização",
    url: "app.mapadaprescricao.com.br/prescrever-treino",
    titulo: "A curva que responde à edição",
    d1: "Volume, intensidade e complexidade ao longo do bloco. Editar uma sessão move a curva na hora.",
    d2: "As fases aparecem nomeadas, com a semana de descarga marcada e a semana de hoje em destaque.",
  },
];

function PorDentro() {
  const [ativa, setAtiva] = React.useState(1);
  const aba = ABAS[ativa];
  return (
    <section id="por-dentro" className="scroll-mt-24 border-y border-[#EAE8E3] bg-[#FBFAF8]">
      <div className={`${WRAP} py-[84px]`}>
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Por dentro do app</Eyebrow>
          </div>
          <h2 className="font-display text-[28px] font-bold text-[#10233A] md:text-[34px]">
            O sistema como ele é hoje, tela por tela
          </h2>
        </div>

        {/* abas */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {ABAS.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setAtiva(i)}
              aria-pressed={i === ativa}
              className={
                "rounded-full px-4 py-2 text-[14px] font-semibold transition-colors " +
                (i === ativa
                  ? "bg-[#0D1A2B] text-white"
                  : "border border-[#EAE8E3] bg-white text-[#5A6B7D] hover:text-[#10233A]")
              }
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.55fr_1fr]">
          {/* monitor com a interface real do sistema */}
          <MonitorMockup tela={aba.id as MockupTela} url={aba.url} />

          {/* explicativo da aba */}
          <div>
            <h3 className="font-display text-[22px] font-bold text-[#10233A]">{aba.titulo}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5A6B7D]">{aba.d1}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5A6B7D]">{aba.d2}</p>
            <p className="mt-5 text-[12.5px] text-[#8A97A6]">
              A interface real do sistema, com os dados de um aluno de exemplo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- semáforo ------------------------------- */

const TONE_DOT: Record<string, string> = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" };
const TONE_TINT: Record<string, string> = { success: "bg-success/15", warning: "bg-warning/15", danger: "bg-danger/15" };

const CORES = [
  {
    id: "verde",
    label: "Liberada",
    tone: "success",
    titulo: "Segue o treino como está.",
    d: "Nenhum sinal de alerta nos itens do dia: sono, dor, energia e prontidão dentro do esperado. A sessão planejada acontece integralmente.",
    conduta: "Executar o microciclo do dia como prescrito. Registrar a PSE ao final para alimentar a próxima progressão.",
  },
  {
    id: "amarelo",
    label: "Com ajuste",
    tone: "warning",
    titulo: "Treina, sim. Com ajuste e com registro.",
    d: "Existe algo a considerar: dor nova em um movimento, noite ruim de sono, cansaço fora do comum. Não é motivo para parar, é motivo para adaptar e anotar por quê.",
    conduta: "Sessão conservadora: monitore a PSE e substitua os padrões que provocam sintoma. Fica registrado o que gerou o ajuste.",
  },
  {
    id: "vermelho",
    label: "Não liberada",
    tone: "danger",
    titulo: "Hoje não. E fica claro por quê.",
    d: "Um sinal exige cautela antes de treinar: pressão fora da faixa, dor aguda, sintoma que pede avaliação. A sessão espera e o motivo fica registrado.",
    conduta: "Adiar o treino de carga. Reavaliar o sinal e, se persistir, encaminhar ao profissional de saúde. O alerta acompanha o aluno até ser resolvido.",
  },
];

function Semaforo() {
  const [sel, setSel] = React.useState(1);
  const c = CORES[sel];
  return (
    <section id="semaforo" className={`${WRAP} scroll-mt-24 pb-[84px] pt-[84px]`}>
      <div className="text-center">
        <div className="flex justify-center">
          <Eyebrow color="#F59E0B">O semáforo</Eyebrow>
        </div>
        <h2 className="font-display text-[28px] font-bold text-[#10233A] md:text-[34px]">
          Quatro perguntas, quarenta segundos, uma decisão registrada.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[16px] text-[#5A6B7D]">
          Antes da sessão, o checklist do dia. A pior resposta define a cor, e um item sem resposta
          nunca libera direto. Clique nas cores para ver como a conduta muda.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="flex flex-wrap justify-center gap-2">
          {CORES.map((cc, i) => (
            <button
              key={cc.id}
              onClick={() => setSel(i)}
              aria-pressed={i === sel}
              className={
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors " +
                (i === sel ? "border-[#0D1A2B] bg-[#0D1A2B] text-white" : "border-[#EAE8E3] bg-[#FBFAF8] text-[#10233A] hover:border-[#d9d6cf]")
              }
            >
              <span className={"h-2.5 w-2.5 rounded-full " + TONE_DOT[cc.tone]} />
              {cc.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#EAE8E3] bg-white">
          <div className="flex items-center gap-3 border-b border-[#EFEDE8] px-6 py-4">
            <span className={"grid h-9 w-9 place-items-center rounded-full " + TONE_TINT[c.tone]}>
              <span className={"h-3.5 w-3.5 rounded-full " + TONE_DOT[c.tone]} />
            </span>
            <span className="font-display text-[18px] font-bold text-[#10233A]">{c.titulo}</span>
          </div>
          <div className="grid gap-0 md:grid-cols-[1.3fr_1fr]">
            <p className="px-6 py-5 text-[15px] leading-relaxed text-[#5A6B7D]">{c.d}</p>
            <div className="border-t border-[#EFEDE8] bg-[#FBFAF8] px-6 py-5 md:border-l md:border-t-0">
              <div className="mb-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-[#8A97A6]">Conduta</div>
              <p className="text-[14px] leading-relaxed text-[#10233A]">{c.conduta}</p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-center text-[12.5px] text-[#8A97A6]">
          Quem libera, ajusta ou adia é sempre o profissional habilitado. O semáforo documenta o
          racional dessa decisão e ele entra no prontuário.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------- respaldo -------------------------------- */

const CIENCIA_ABAS = [
  {
    id: "resumo",
    label: "Resumo",
    corpo:
      "PA de repouso entre 130/85 e 159/99 mmHg classifica a sessão como com ajuste: intensidade moderada, respiração contínua, sem Valsalva.",
  },
  {
    id: "pratica",
    label: "Na prática",
    corpo:
      "Prefira cadeia fechada e tronco apoiado, evite apneia nas séries e mantenha a percepção de esforço em faixa moderada. Meça a pressão antes se houver sintoma.",
  },
  {
    id: "ciencia",
    label: "Ciência",
    corpo:
      "A recomendação de intensidade moderada e respiração contínua para hipertensão estágio 1 vem das diretrizes abaixo, citadas na decisão.",
  },
];

const REFS = [
  ["01", "ACSM's Guidelines for Exercise Testing and Prescription", "American College of Sports Medicine"],
  ["02", "Garber et al., 2011: Quantity and Quality of Exercise", "Position stand do ACSM"],
  ["03", "Diretriz Brasileira de Hipertensão Arterial", "Sociedade Brasileira de Cardiologia"],
];

function Respaldo() {
  const [aba, setAba] = React.useState(0);
  return (
    <section id="ciencia" className="scroll-mt-24 border-y border-[#EAE8E3] bg-[#FBFAF8]">
      <div className={`${WRAP} py-[84px]`}>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow color="#2064EC">Respaldo técnico</Eyebrow>
            <h2 className="font-display text-[28px] font-bold leading-tight text-[#10233A] md:text-[34px]">
              Toda tela tem uma aba "Ciência". Nenhuma sugestão sai do nada.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5A6B7D]">
              Em cada painel existem três leituras: <b className="text-[#10233A]">Resumo</b> para decidir
              rápido, <b className="text-[#10233A]">Na prática</b> para a sessão e{" "}
              <b className="text-[#10233A]">Ciência</b> para ver de onde a regra veio, com a referência a um
              clique, no meio do atendimento.
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-[#5A6B7D]">
              O módulo Estudar reúne o material completo, e os Protocolos mostram cada regra ativa com a
              fonte declarada.
            </p>
            <div className="mt-6 flex gap-4">
              <div className="rounded-[14px] border border-[#EAE8E3] bg-white px-5 py-4">
                <div className="font-display text-[28px] font-bold text-[#10233A]">23</div>
                <div className="mt-0.5 text-[13px] text-[#5A6B7D]">condições de saúde com regra e fonte declaradas</div>
              </div>
              <div className="rounded-[14px] border border-[#EAE8E3] bg-white px-5 py-4">
                <div className="font-display text-[28px] font-bold text-[#10233A]">100%</div>
                <div className="mt-0.5 text-[13px] text-[#5A6B7D]">das faixas de treino com referência rastreável</div>
              </div>
            </div>
          </div>

          {/* cartão da aba Ciência */}
          <div className="overflow-hidden rounded-[18px] border border-[#EAE8E3] bg-white">
            <div className="flex items-center justify-between border-b border-[#EFEDE8] px-5 py-3.5">
              <span className="font-display text-[15px] font-bold text-[#10233A]">Hipertensão e treino de força</span>
              <span className="font-mono text-2xs text-[#8A97A6]">/estudar</span>
            </div>
            <div className="flex gap-1 border-b border-[#EFEDE8] px-5 pt-3">
              {CIENCIA_ABAS.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setAba(i)}
                  className={
                    "rounded-full px-3 py-2 text-[13px] font-semibold transition-colors " +
                    (i === aba ? "bg-[#F6F5F2] text-[#10233A]" : "text-[#8A97A6] hover:text-[#10233A]")
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
            <div className="px-5 py-4">
              <div className="mb-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-[#8A97A6]">
                {aba === 0 ? "Regra aplicada" : CIENCIA_ABAS[aba].label}
              </div>
              <p className="text-[14px] leading-relaxed text-[#10233A]">{CIENCIA_ABAS[aba].corpo}</p>

              <div className="mt-4 space-y-2">
                {REFS.map(([n, t, org]) => (
                  <div key={n} className="flex gap-3 rounded-[10px] border border-[#EFEDE8] bg-[#FBFAF8] p-3">
                    <span className="font-mono text-2xs font-bold text-[#2064EC]">{n}</span>
                    <div>
                      <div className="text-[13px] font-semibold leading-snug text-[#10233A]">{t}</div>
                      <div className="text-[12px] text-[#8A97A6]">{org}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11.5px] text-[#8A97A6]">
                <span>Revisado em 03/2026</span>
                <span>Responsável técnico CREF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ comparativo ------------------------------ */

function Comparativo() {
  const planilha = [
    "O treino está lá. O motivo dele, não.",
    "O risco do aluno mora na sua memória.",
    "A reavaliação depende de você lembrar.",
    "Se alguém questionar sua conduta, você reconstrói de cabeça.",
  ];
  const mapa = [
    "Cada escolha carrega o porquê e a fonte ao lado dela.",
    "O ciclo do cuidado mostra em que etapa está cada aluno.",
    "A reavaliação chega até você, com data e motivo.",
    "Histórico completo, pronto para mostrar a quem perguntar.",
  ];
  return (
    <section className={`${WRAP} pb-[84px] pt-[84px]`}>
      <h2 className="mx-auto max-w-2xl text-center font-display text-[28px] font-bold leading-tight text-[#10233A] md:text-[34px]">
        Ter os dados é uma coisa. Ter o raciocínio guardado é outra.
      </h2>
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        <div className="rounded-[18px] border border-[#EAE8E3] bg-white p-6">
          <div className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8A97A6]">Na planilha</div>
          <ul className="space-y-3">
            {planilha.map((t) => (
              <li key={t} className="flex gap-3 text-[14.5px] text-[#5A6B7D]">
                <span className="mt-2.5 h-px w-3 shrink-0 bg-[#c9c5bd]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[18px] border-2 border-[#1B7A4B]/25 bg-[#E9F6EE]/40 p-6">
          <div className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#1B7A4B]">No Mapa da Prescrição</div>
          <ul className="space-y-3">
            {mapa.map((t) => (
              <li key={t} className="flex gap-3 text-[14.5px] text-[#10233A]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1B7A4B]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- para que serve ----------------------------- */

/**
 * Esta seção era "Quem já usa", com três frases entre aspas assinadas por
 * "Nome do profissional · Personal · CREF 000000-G/UF". Eram DEPOIMENTOS
 * INVENTADOS: nenhuma daquelas frases saiu da boca de um usuário, e o CREF
 * era um placeholder de zeros. Prova social fabricada é publicidade enganosa
 * (CDC, art. 37) e, num produto que se vende pela honestidade da base
 * científica, é a contradição mais cara possível.
 *
 * As três frases descreviam bem o problema que o produto resolve, então
 * continuam aqui: como AFIRMAÇÕES DA CASA sobre o que a ferramenta faz, sem
 * aspas e sem assinatura de terceiro. Quando houver depoimento real, com
 * nome e autorização do profissional, volta a ser depoimento.
 */
function ParaQueServe() {
  const itens: [string, string][] = [
    [
      "Ninguém fica para trás",
      "A reavaliação de cada aluno tem data, e o ciclo do cuidado mostra quem está vencido antes de você lembrar.",
    ],
    [
      "Segurança para conduzir comorbidade",
      "O semáforo pergunta o que importa naquela condição e registra a decisão do dia, com a faixa da diretriz ao lado.",
    ],
    [
      "O porquê fica à vista",
      "Cada escolha do motor vem com a justificativa e a referência, para você abrir na frente do aluno ou do médico dele.",
    ],
  ];
  return (
    <section className="border-y border-[#EAE8E3] bg-[#FBFAF8]">
      <div className={`${WRAP} py-[72px]`}>
        <div className="flex justify-center">
          <Eyebrow>Para que serve no dia a dia</Eyebrow>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {itens.map(([titulo, texto]) => (
            <div key={titulo} className="rounded-[18px] border border-[#EAE8E3] bg-white p-6">
              <div className="font-display text-[17px] font-bold leading-snug text-[#10233A]">{titulo}</div>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#5A6B7E]">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- planos -------------------------------- */

/**
 * A tabela de preços agora vem de `@/data/planos`, a fonte única. Aqui havia duas
 * faixas escritas à mão, uma delas ("Essencial", R$ 59) prometendo um teto de 20
 * alunos que o código nunca aplicou, enquanto a /pricing anunciava plano único por
 * R$ 59 e a /roi calculava com 59. Três telas, três ofertas.
 */
function Planos() {
  const [anual, setAnual] = React.useState(false);
  const planos = [
    {
      nome: NOME_PLANO,
      desc: "Um plano só, com tudo liberado. Sem versão limitada e sem recurso escondido atrás de upgrade.",
      mensal: PRECO_MENSAL,
      destaque: true,
      itens: ITENS_PLANO,
      cta: `Assinar ${NOME_PLANO}`,
    },
  ];
  return (
    <section id="planos" className="scroll-mt-24 px-6 pb-[84px] pt-[84px]">
      <div className="mx-auto w-full max-w-[860px]">
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Planos</Eyebrow>
          </div>
          <h2 className="font-display text-[28px] font-bold text-[#10233A] md:text-[34px]">
            Menos que uma hora de aula por mês
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-[#5A6B7D]">
            Assine, cadastre o primeiro aluno hoje e veja o ciclo se montar. Se não fizer sentido, você
            cancela sozinho, sem ligação, sem retenção.
          </p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-[#EAE8E3] bg-white p-1 text-[13.5px] font-semibold">
            <button
              onClick={() => setAnual(false)}
              className={"rounded-full px-3.5 py-1.5 " + (!anual ? "bg-[#0D1A2B] text-white" : "text-[#5A6B7D]")}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnual(true)}
              className={"rounded-full px-3.5 py-1.5 " + (anual ? "bg-[#0D1A2B] text-white" : "text-[#5A6B7D]")}
            >
              Anual · fundador
            </button>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-[460px] gap-4">
          {planos.map((p) => {
            // O equivalente mensal da oferta anual sai do valor REAL do ano
            // (`PRECO_ANUAL_FUNDADOR`), não de uma regra de "2 meses grátis"
            // calculada aqui. Assim o número da tela e o número cobrado são o mesmo.
            const preco = anual ? PRECO_ANUAL_EQUIV_MES : p.mensal;
            return (
              <div
                key={p.nome}
                className={
                  "relative flex flex-col rounded-[18px] bg-white p-6 text-left " +
                  (p.destaque ? "border-2 border-[#0D1A2B] shadow-[0_20px_50px_-30px_rgba(16,35,58,0.4)]" : "border border-[#EAE8E3]")
                }
              >
                {/* O selo "Recomendado" só fazia sentido quando havia duas faixas para
                    comparar. Com plano único ele recomenda o quê, contra o quê? Sai. */}
                <div className="font-display text-[19px] font-bold text-[#10233A]">{p.nome}</div>
                <p className="mt-1 text-[13.5px] text-[#5A6B7D]">{p.desc}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-[16px] font-semibold text-[#8A97A6]">R$</span>
                  <span className="font-display text-[40px] font-extrabold leading-none tabular-nums text-[#10233A]">{preco}</span>
                  <span className="mb-1 text-[14px] font-medium text-[#8A97A6]">/mês</span>
                </div>
                <div className="text-[12px] text-[#8A97A6]">
                  {anual
                    ? `${fmtBRL(PRECO_ANUAL_FUNDADOR)} no ano, para as primeiras ${VAGAS_FUNDADOR} contas`
                    : "cobrado mensalmente"}
                </div>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {p.itens.map((it) => (
                    <li key={it} className="flex gap-2.5 text-[14px] text-[#10233A]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1B7A4B]" />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard"
                  className={
                    "mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-[15px] font-semibold transition-colors " +
                    (p.destaque
                      ? "bg-[#0D1A2B] text-white hover:bg-[#16283f]"
                      : "border border-[#EAE8E3] bg-white text-[#10233A] hover:border-[#d9d6cf]")
                  }
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ ---------------------------------- */

const FAQ = [
  [
    "O sistema prescreve no meu lugar?",
    "Não. Ele organiza o raciocínio, ranqueia os exercícios pela avaliação e documenta o porquê de cada escolha, mas quem decide, libera e assina é sempre o profissional habilitado (CREF). É apoio à decisão, não decisão automática.",
  ],
  [
    "Quanto tempo leva para cadastrar um aluno?",
    "Poucos minutos. O cadastro tem 6 passos e só pergunta o que muda a prescrição: básicos, objetivo, saúde e restrições, medicamentos, equipamentos e notas.",
  ],
  [
    "Serve para quem acabou de se formar?",
    "Especialmente. O semáforo e a base científica de cada regra dão segurança para conduzir aluno com comorbidade desde o primeiro atendimento, com o respaldo à mão.",
  ],
  [
    "A foto da avaliação postural vai para algum servidor?",
    "Não. A análise postural por visão computacional roda no seu próprio dispositivo, e a foto nunca sai dele.",
  ],
  [
    "Meu aluno também tem acesso?",
    "Sim. Ele recebe o app do aluno, onde vê o treino, consulta o semáforo e registra a execução, além do PDF com a sua marca. Como o plano é único, isso já está incluído.",
  ],
  [
    "Consigo cancelar sem dor de cabeça?",
    "Sim. Você cancela sozinho, em dois cliques, sem ligação e sem retenção. Os 7 dias iniciais são para testar sem compromisso.",
  ],
];

function Faq() {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <section className={`${WRAP} pb-[84px] pt-[84px]`}>
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-display text-[28px] font-bold text-[#10233A] md:text-[34px]">
          Perguntas que todo mundo faz
        </h2>
        <div className="mt-8 space-y-2.5">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="overflow-hidden rounded-[14px] border border-[#EAE8E3] bg-white">
              <button
                onClick={() => setOpen((o) => (o === i ? null : i))}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-[15.5px] font-semibold text-[#10233A]">{q}</span>
                <Plus
                  className={"h-4 w-4 shrink-0 text-[#8A97A6] transition-transform " + (open === i ? "rotate-45" : "")}
                />
              </button>
              {open === i && <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-[#5A6B7D]">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA final ------------------------------ */

function CtaFinal() {
  return (
    <section className="px-6 py-[52px]">
      <div className="mx-auto w-full max-w-[1160px] rounded-[24px] bg-[#0D1A2B] px-6 py-14 text-center text-white md:px-14">
        <h2 className="mx-auto max-w-3xl font-display text-[30px] font-bold leading-tight md:text-[38px]">
          O próximo aluno que entrar merece uma prescrição com endereço.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] text-[#aeb9c8]">
          Cadastre hoje, avalie na primeira sessão e publique o plano ainda essa semana, com a
          justificativa técnica do lado.
        </p>
        <div className="mt-7 flex justify-center">
          <Acao
            to="#planos"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0D1A2B] transition-colors hover:bg-white/90"
          >
            Assinar o Mapa da Prescrição <ArrowRight className="h-4 w-4" />
          </Acao>
        </div>
        <p className="mt-5 text-[12.5px] text-[#7f93ab]">7 dias para testar · cancelamento em dois cliques</p>
      </div>
    </section>
  );
}

/* --------------------------------- footer -------------------------------- */

function Footer() {
  const cols: [string, [string, string][]][] = [
    [
      "Produto",
      [
        ["O ciclo do cuidado", "#ciclo"],
        ["Por dentro do app", "#por-dentro"],
        ["Semáforo diário", "#semaforo"],
        ["Planos e preços", "#planos"],
        ["Entrar na conta", "/dashboard"],
      ],
    ],
    [
      "Ciência",
      [
        ["Respaldo técnico", "#ciencia"],
        ["Referências bibliográficas", "/aprender/biblioteca"],
        ["Módulo Estudar", "/aprender"],
        ["Protocolos ativos", "/protocols"],
      ],
    ],
    // Termos e Privacidade agora EXISTEM como página (`/termos` e `/privacidade`) e
    // por isso entram aqui. Antes ficavam de fora de propósito, porque um "Termos de
    // uso" que cai no curinga de rota e volta para a home é pior que a ausência dele.
    // A regra continua valendo para qualquer link novo: só entra se abrir algo.
    [
      "Suporte e legal",
      [
        ["Falar com o suporte", "/suporte"],
        ["Tutoriais", "/tutorial"],
        ["Termos de uso", "/termos"],
        ["Política de Privacidade", "/privacidade"],
      ],
    ],
  ];
  const linkCls = "text-[14px] text-[#9fb0c4] transition-colors hover:text-white";
  return (
    <footer className="bg-[#0B1220] text-white">
      <div className={`${WRAP} py-14`}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Brand dark />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#9fb0c4]">
              Cadastrar, avaliar, planejar, liberar e reavaliar, com o porquê documentado. A decisão é
              sempre sua.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-[#7f93ab]">
              <ShieldCheck className="h-3.5 w-3.5" /> Responsável técnico registrado no CREF
            </p>
          </div>
          {cols.map(([titulo, links]) => (
            <div key={titulo}>
              <div className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#5f7290]">{titulo}</div>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Acao to={href} className={linkCls}>
                      {label}
                    </Acao>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-1.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#c9a24b]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#c9a24b] text-2xs font-black text-[#0B1220]">!</span>
            Aviso importante
          </div>
          <p className="text-[13px] leading-relaxed text-[#9fb0c4]">
            O Mapa da Prescrição é uma ferramenta de apoio à decisão destinada a profissionais de
            Educação Física registrados no CREF. Não realiza diagnóstico, não substitui avaliação de
            profissional de saúde e não emite prescrição de forma autônoma: toda conduta registrada é de
            responsabilidade do profissional que a assina. As faixas e classificações do semáforo são
            referências baseadas em diretrizes públicas e não configuram liberação ou contraindicação
            clínica.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12.5px] text-[#7f93ab] md:flex-row md:items-center md:justify-between">
          {/* O CNPJ que estava aqui era o placeholder 00.000.000/0001-00, ou seja, um
              dado de identificação FALSO no rodapé de um site que trata dado de saúde.
              Sai até existir o número real. E "Dados hospedados no Brasil" era uma
              promessa que o repositório não sustenta: a região do provedor não está
              declarada em lugar nenhum do código. Fica o que é verificável (acesso
              autenticado, tráfego criptografado) e o resto vai para a Política. */}
          <span>© 2026 Mapa da Prescrição</span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Acesso autenticado e tráfego criptografado ·{" "}
            <Acao to="/privacidade" className="underline decoration-white/30 hover:text-white">
              como tratamos os dados
            </Acao>
          </span>
        </div>
      </div>
    </footer>
  );
}
