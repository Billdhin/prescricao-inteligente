import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarRange,
  Users,
  UserCheck,
  Sparkles,
  ChevronDown,
  Target,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Repeat,
  Info,
} from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { cn } from "@/lib/utils";
import { OBJETIVOS, type GpsObjetivo } from "@/lib/gps/engine";
import { gerarPlano, type PlanoGerado } from "@/lib/gps/periodizacao";
import {
  getModelo,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type Tendencia,
} from "@/data/periodizacao";
import type { Nivel } from "@/data/types";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { getParam } from "@/data/monitoringParameters";
import { bibliografia } from "@/data/referencias";
import { useAlunos, useUser, isPremiumUnlocked } from "@/lib/store";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const DURACOES = [8, 12, 16, 24];
const FREQUENCIAS = [2, 3, 4, 5, 6];

/* ------------------------------- Página ------------------------------- */

export function PrescreverTreino() {
  const [params] = useSearchParams();
  const alunos = useAlunos((s) => s.alunos);
  const plan = useUser((s) => s.plan);
  const premium = isPremiumUnlocked(plan);

  const alunoPre = params.get("aluno");
  const alunoInicial = alunos.find((a) => a.id === alunoPre);

  const [alunoId, setAlunoId] = React.useState<string | undefined>(alunoInicial?.id);
  const aluno = alunos.find((a) => a.id === alunoId);

  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>(alunoInicial?.objetivo ?? "Hipertrofia");
  const [nivel, setNivel] = React.useState<Nivel>(alunoInicial?.nivel ?? "Iniciante");
  const [grupo, setGrupo] = React.useState<string>(alunoInicial?.grupoEspecial ?? "");
  const [frequencia, setFrequencia] = React.useState(3);
  const [semanas, setSemanas] = React.useState(12);
  const [disponibilidade, setDisponibilidade] = React.useState("");
  const [plano, setPlano] = React.useState<PlanoGerado | null>(null);

  // Ao escolher um aluno, herda o perfil (defaults inteligentes).
  const escolherAluno = (id: string | undefined) => {
    setAlunoId(id);
    const a = alunos.find((x) => x.id === id);
    if (a) {
      setObjetivo(a.objetivo);
      setNivel(a.nivel);
      setGrupo(a.grupoEspecial ?? "");
    }
    setPlano(null);
  };

  const gerar = () => {
    setPlano(gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial: grupo || undefined, disponibilidade }));
    requestAnimationFrame(() => document.getElementById("resultado-treino")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const carregarExemplo = () => {
    setAlunoId(undefined);
    setObjetivo("Hipertrofia");
    setNivel("Intermediário");
    setGrupo("");
    setFrequencia(4);
    setSemanas(12);
    setDisponibilidade("Seg, qua, sex e sáb, cerca de 60 min");
    setPlano(gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4 }));
    requestAnimationFrame(() => document.getElementById("resultado-treino")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <SeloRCD compacto />
          <Pill tone="neutral">Planejamento longitudinal</Pill>
        </div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <CalendarRange className="h-6 w-6 text-primary" /> Prescrever treino
        </h1>
        <p className="mt-1 text-ink-2">
          Monte a periodização completa do aluno (macrociclo, mesociclos e microciclos) com base científica.
          A ferramenta apoia a sua decisão e organiza a progressão; você edita tudo depois. Para exercícios
          individuais, use{" "}
          <Link to="/gps" className="font-semibold text-primary hover:underline">
            Prescrever exercício
          </Link>
          .
        </p>
      </div>

      {/* Passo 1: contexto */}
      <Card variant="raised" className="p-5">
        <SectionHeader eyebrow="Passo 1" title="Contexto do aluno" />

        {/* Aluno */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink">Aluno</label>
          {alunos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-sm text-ink-3">
              Nenhum aluno cadastrado ainda. Você pode gerar um plano avulso abaixo ou{" "}
              <Link to="/alunos" className="font-semibold text-primary hover:underline">
                cadastrar um aluno
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => escolherAluno(undefined)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  !alunoId ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                )}
              >
                <Users className="h-3.5 w-3.5" /> Plano avulso
              </button>
              {alunos.map((a) => (
                <button
                  key={a.id}
                  onClick={() => escolherAluno(a.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    alunoId === a.id ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" /> {a.nome}
                </button>
              ))}
            </div>
          )}
          {aluno && (
            <p className="mt-2 text-xs text-ink-3">
              Objetivo, nível e grupo especial vieram do cadastro de {aluno.nome}. Ajuste se quiser.
              {aluno.restricoes.length > 0 && ` ${aluno.restricoes.length} restrição(ões) registradas no perfil serão consideradas.`}
            </p>
          )}
        </div>

        {/* Objetivo + nível */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Objetivo">
            <Opcoes valor={objetivo} opcoes={OBJETIVOS} onSelect={(v) => setObjetivo(v as GpsObjetivo)} />
          </Campo>
          <Campo label="Nível de treinamento">
            <Opcoes valor={nivel} opcoes={NIVEIS} onSelect={(v) => setNivel(v as Nivel)} />
          </Campo>
        </div>

        {/* Grupo especial */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Condição / grupo especial <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <select
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            className="input w-full"
          >
            <option value="">Sem condição especial</option>
            {specialGroups.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.nome}
              </option>
            ))}
          </select>
          {grupo && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis" />
              A jornada de fases deste grupo será a base do macrociclo, e os cuidados serão sobrepostos.
            </p>
          )}
        </div>

        {/* Frequência + duração + disponibilidade */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Frequência semanal">
            <Opcoes valor={String(frequencia)} opcoes={FREQUENCIAS.map((f) => `${f}`)} onSelect={(v) => setFrequencia(Number(v))} sufixo="x" />
          </Campo>
          <Campo label="Duração do acompanhamento">
            <Opcoes valor={String(semanas)} opcoes={DURACOES.map((d) => `${d}`)} onSelect={(v) => setSemanas(Number(v))} sufixo=" sem" />
          </Campo>
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Disponibilidade e observações <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <input
            value={disponibilidade}
            onChange={(e) => setDisponibilidade(e.target.value)}
            placeholder="Ex.: seg/qua/sex à noite, 60 min, academia completa"
            className="input w-full"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={gerar} className={buttonClasses("primary")}>
            <Sparkles className="h-4 w-4" /> Gerar periodização
          </button>
          <button onClick={carregarExemplo} className={buttonClasses("ghost", "sm")}>
            Carregar exemplo
          </button>
        </div>
      </Card>

      {/* Resultado */}
      {plano && (
        <div id="resultado-treino" className="scroll-mt-24">
          <ResultadoPlano plano={plano} premium={premium} objetivo={objetivo} nivel={nivel} semanas={semanas} grupo={grupo} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Resultado ------------------------------- */

function ResultadoPlano({
  plano,
  premium,
  objetivo,
  nivel,
  semanas,
  grupo,
}: {
  plano: PlanoGerado;
  premium: boolean;
  objetivo: GpsObjetivo;
  nivel: Nivel;
  semanas: number;
  grupo: string;
}) {
  const [aba, setAba] = React.useState<"principal" | "alternativa">("principal");
  const macro = aba === "alternativa" && plano.alternativa ? plano.alternativa : plano.principal;
  const modelo = getModelo(aba === "alternativa" && plano.modeloAltId ? plano.modeloAltId : plano.modeloId);
  const grupoObj = grupo ? getSpecialGroup(grupo) : undefined;
  const biblio = bibliografia(plano.refIds);

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Passo 2" title="Periodização proposta" />

      {/* Resumo + raciocínio */}
      <Card variant="raised" className="border-l-4 border-primary p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill tone="primary">{modelo.nome}</Pill>
          <span className="text-sm text-ink-2">{objetivo} · {nivel} · {semanas} semanas</span>
          {grupoObj && <Pill tone="analysis">{grupoObj.nome}</Pill>}
        </div>
        <p className="text-sm text-ink">{plano.raciocinio}</p>
      </Card>

      {/* Opção principal x alternativa (a alternativa faz parte do plano Profissional) */}
      {plano.alternativa && premium && (
        <div role="tablist" aria-label="Opções de periodização" className="flex gap-1.5">
          {(["principal", "alternativa"] as const).map((k) => {
            const m = k === "alternativa" ? getModelo(plano.modeloAltId!) : getModelo(plano.modeloId);
            return (
              <button
                key={k}
                role="tab"
                aria-selected={aba === k}
                onClick={() => setAba(k)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                  aba === k ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                )}
              >
                {k === "principal" ? "Opção principal" : "Alternativa"}: {m.nome}
              </button>
            );
          })}
        </div>
      )}

      {/* Gráfico de progressão */}
      <GraficoProgressao macro={macro} />

      {/* Timeline macro -> meso -> micro */}
      <div className="space-y-3">
        {macro.mesociclos.map((m, i) => {
          const bloqueado = !premium && i > 0;
          return bloqueado ? (
            i === 1 ? (
              <PaywallCard
                key={m.id}
                titulo="Veja a periodização completa"
                descricao="A prévia mostra o primeiro bloco. Os demais mesociclos, a alternativa, a edição e o PDF fazem parte do plano Profissional."
              />
            ) : null
          ) : (
            <MesocicloCard key={m.id} meso={m} indice={i} />
          );
        })}
      </div>

      {/* Área explicativa do modelo */}
      <ModeloExplicacao modelo={modelo} />

      {/* Referências */}
      {biblio.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">
            <BookOpen className="h-3.5 w-3.5" /> Base científica
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-ink-2">
            {biblio.map((b) => (
              <li key={b.ref.id}>
                {b.ref.autores}. {b.ref.titulo}. {b.ref.fonte}, {b.ref.ano}.
                {b.ref.doi && (
                  <>
                    {" "}
                    <a href={`https://doi.org/${b.ref.doi}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      doi:{b.ref.doi}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <p className="rounded-xl bg-surface-soft p-3 text-xs text-ink-3">
        As faixas são referência e não substituem a sua decisão. O plano apoia a organização e a justificativa;
        a conduta é do profissional habilitado. Para condições de saúde, integre a liberação e o acompanhamento
        do profissional de saúde.
      </p>
    </div>
  );
}

/* ------------------------------- Gráfico ------------------------------- */

const NIVEL_TENDENCIA: Record<Tendencia, number> = { reduz: -0.6, estavel: 0, sobe: 0.6, varia: 0 };

function serieSemanal(macro: Macrociclo) {
  const pontos: { semana: number; vol: number; int: number; cpx: number; deload: boolean }[] = [];
  macro.mesociclos.forEach((m, mi) => {
    m.microciclos.forEach((w, wi) => {
      let vol = 2 + mi * 0.35 + NIVEL_TENDENCIA[m.tendenciaVolume];
      let int = 1.6 + mi * 0.5 + NIVEL_TENDENCIA[m.tendenciaIntensidade];
      let cpx = 1.6 + mi * 0.4 + NIVEL_TENDENCIA[m.tendenciaComplexidade];
      if (m.tendenciaVolume === "varia") vol += wi % 2 === 0 ? 0.4 : -0.4;
      if (m.tendenciaIntensidade === "varia") int += wi % 2 === 0 ? -0.4 : 0.5;
      if (w.tipo === "deload") {
        vol *= 0.6;
        int *= 0.7;
      }
      const clamp = (n: number) => Math.max(0.5, Math.min(4, n));
      pontos.push({ semana: w.semana, vol: clamp(vol), int: clamp(int), cpx: clamp(cpx), deload: w.tipo !== "carga" });
    });
  });
  return pontos;
}

function GraficoProgressao({ macro }: { macro: Macrociclo }) {
  const pts = serieSemanal(macro);
  const W = 640;
  const H = 180;
  const padX = 28;
  const padY = 18;
  const n = pts.length;
  const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, n - 1);
  const y = (v: number) => padY + (H - padY * 2) * (1 - (v - 0.5) / 3.5);
  const linha = (sel: (p: (typeof pts)[number]) => number) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(sel(p)).toFixed(1)}`).join(" ");

  const series = [
    { nome: "Volume", cor: "var(--primary)", sel: (p: (typeof pts)[number]) => p.vol },
    { nome: "Intensidade", cor: "var(--cta)", sel: (p: (typeof pts)[number]) => p.int },
    { nome: "Complexidade", cor: "var(--analysis)", sel: (p: (typeof pts)[number]) => p.cpx },
  ];

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-ink-3" />
        <h3 className="font-display text-base font-bold text-ink">Progressão ao longo das semanas</h3>
      </div>
      <p className="mb-3 text-xs text-ink-3">Tendência qualitativa por semana. Barras claras marcam semanas de descarga.</p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full min-w-[520px]" role="img" aria-label="Gráfico de progressão de volume, intensidade e complexidade por semana">
          {pts.map((p, i) =>
            p.deload ? <rect key={i} x={x(i) - 6} y={padY} width={12} height={H - padY * 2} fill="var(--surface-soft)" rx={2} /> : null,
          )}
          {series.map((s) => (
            <path key={s.nome} d={linha(s.sel)} fill="none" stroke={s.cor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {pts.map((p, i) => (
            <text key={i} x={x(i)} y={H - 2} textAnchor="middle" className="fill-ink-3" style={{ fontSize: 8 }}>
              {p.semana}
            </text>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {series.map((s) => (
          <span key={s.nome} className="flex items-center gap-1.5 text-xs text-ink-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.cor }} /> {s.nome}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------- Mesociclo ------------------------------- */

const TEND_LABEL: Record<Tendencia, string> = { sobe: "sobe", reduz: "reduz", estavel: "estável", varia: "varia" };

function MesocicloCard({ meso, indice }: { meso: Mesociclo; indice: number }) {
  const [aberto, setAberto] = React.useState(indice === 0);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface-soft"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white">{indice + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-ink">{meso.nome}</span>
            <span className="text-xs text-ink-3">semanas {meso.semanaInicio} a {meso.semanaFim}</span>
            {meso.deload && <Pill tone="neutral">com descarga</Pill>}
            {meso.reavaliacao && <Pill tone="analysis">reavaliar ao fim</Pill>}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">{meso.foco}</p>
        </div>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {/* tendências + capacidades */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Pill tone="neutral">Volume {TEND_LABEL[meso.tendenciaVolume]}</Pill>
            <Pill tone="neutral">Intensidade {TEND_LABEL[meso.tendenciaIntensidade]}</Pill>
            <Pill tone="neutral">Complexidade {TEND_LABEL[meso.tendenciaComplexidade]}</Pill>
          </div>
          <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
          <ListaChips titulo="Tipos de exercício" itens={meso.tiposExercicio} />

          {/* parâmetros */}
          {meso.parametros.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">Acompanhar</p>
              <div className="flex flex-wrap gap-1.5">
                {meso.parametros.map((id) => {
                  const p = getParam(id);
                  return p ? <Pill key={id} tone="neutral">{p.sigla ?? p.nome}</Pill> : null;
                })}
              </div>
            </div>
          )}

          {/* critérios */}
          <div className="grid gap-3 sm:grid-cols-2">
            <CriterioLista titulo="Progredir quando" itens={meso.criteriosProgressao} tone="success" />
            <CriterioLista titulo="Regredir ou revisar se" itens={meso.criteriosRegressao} tone="warning" />
          </div>

          {/* microciclos (semanas) */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">Semanas</p>
            <div className="space-y-2">
              {meso.microciclos.map((w) => (
                <MicrocicloRow key={w.id} micro={w} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function MicrocicloRow({ micro }: { micro: Microciclo }) {
  const [aberto, setAberto] = React.useState(false);
  return (
    <div className="rounded-xl border border-border">
      <button onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="flex w-full items-center gap-2 p-2.5 text-left text-sm hover:bg-surface-soft">
        <Pill tone={micro.tipo === "deload" ? "warning" : micro.tipo === "teste" ? "analysis" : "neutral"}>Semana {micro.semana}</Pill>
        <span className="text-ink-2">{micro.frequencia}x na semana</span>
        {micro.tipo === "deload" && <span className="text-xs text-ink-3">{micro.nota}</span>}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>
      {aberto && (
        <div className="space-y-2 border-t border-border p-2.5">
          {micro.sessoes.map((s) => (
            <div key={s.id} className="rounded-lg bg-surface-soft p-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-ink">{s.nome}</span>
              </div>
              <ul className="space-y-1">
                {s.blocos.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-baseline gap-x-2 text-xs text-ink-2">
                    <span className="font-semibold text-ink">{b.nome}</span>
                    {b.series && <span>{b.series} séries</span>}
                    {b.reps && <span>· {b.reps} reps</span>}
                    {b.intensidade && <span>· {b.intensidade}</span>}
                    {b.intervalo && b.intervalo !== "-" && <span>· intervalo {b.intervalo}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Modelo (explicação) ------------------------------- */

function ModeloExplicacao({ modelo }: { modelo: ReturnType<typeof getModelo> }) {
  return (
    <details className="group rounded-card border border-border bg-surface-soft">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <Info className="h-4 w-4 shrink-0 text-ink-3" />
        Entenda o modelo: {modelo.nome}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-4 pb-4">
        <Bloco titulo="Como funciona" texto={modelo.comoFunciona} />
        <Bloco titulo="Racional científico" texto={modelo.racionalCientifico} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ListaChips titulo="Indicado para" itens={modelo.perfisIndicados} />
          <ListaChips titulo="Variáveis a controlar" itens={modelo.variaveisControladas} />
          <CriterioLista titulo="Pontos fortes" itens={modelo.pontosFortes} tone="success" />
          <CriterioLista titulo="Limitações" itens={modelo.limitacoes} tone="warning" />
        </div>
        <CriterioLista titulo="Erros comuns" itens={modelo.errosComuns} tone="warning" />
        {modelo.aprenderHref && (
          <Link to={modelo.aprenderHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <BookOpen className="h-4 w-4" /> Aprofundar no Aprender
          </Link>
        )}
      </div>
    </details>
  );
}

/* ------------------------------- Peças ------------------------------- */

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

function Opcoes({ valor, opcoes, onSelect, sufixo }: { valor: string; opcoes: readonly string[]; onSelect: (v: string) => void; sufixo?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          aria-pressed={valor === o}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            valor === o ? "border-primary bg-primary-tint font-semibold text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
          )}
        >
          {o}
          {sufixo}
        </button>
      ))}
    </div>
  );
}

function ListaChips({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{titulo}</p>
      <div className="flex flex-wrap gap-1.5">
        {itens.map((it, i) => (
          <span key={i} className="rounded-lg bg-surface px-2 py-1 text-xs text-ink-2">{it}</span>
        ))}
      </div>
    </div>
  );
}

function CriterioLista({ titulo, itens, tone }: { titulo: string; itens: string[]; tone: "success" | "warning" }) {
  if (!itens.length) return null;
  const dot = tone === "success" ? "bg-success" : "bg-warning";
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{titulo}</p>
      <ul className="space-y-1">
        {itens.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-analysis">
        <Target className="h-3.5 w-3.5" /> {titulo}
      </p>
      <p className="text-sm text-ink-2">{texto}</p>
    </div>
  );
}
