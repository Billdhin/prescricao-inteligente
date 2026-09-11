import * as React from "react";
import {
  Sparkles,
  Dumbbell,
  Trophy,
  CalendarCheck,
  CalendarRange,
  TrendingUp,
  Flame,
  Medal,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { corDeContraste } from "@/lib/theme/palettes";
import type { Avaliacao } from "@/data/alunos";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import { resumoGamificacao } from "@/lib/gamificacao";
import { semanaAtual, sessoesPrincipais, type PlanoTreino } from "@/data/periodizacao";
import { sessaoConcluida } from "@/components/student/blocoRegistro";

const ICONES: Record<string, LucideIcon> = {
  Sparkles,
  Dumbbell,
  Trophy,
  CalendarCheck,
  CalendarRange,
  TrendingUp,
  Flame,
};

/** "jun", "set": o mês curto sem o ponto que o Intl põe. */
const mesCurto = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(ts)).replace(".", "");

/**
 * As sessões principais de cada semana do plano, da 1 até a atual, e quantas fecharam.
 * Fonte das duas leituras do Progresso que falam em treino do PLANO ("Treinos feitos" e o
 * gráfico por semana), pela mesma régua do resto do app (`sessaoConcluida`).
 */
function semanasDoPlano(plano: PlanoTreino, execucoes: Execucao[]) {
  const atual = semanaAtual(plano);
  const micros = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos);
  return Array.from({ length: atual }, (_, i) => {
    const n = i + 1;
    const micro = micros.find((mc) => mc.semana === n);
    const sessoes = sessoesPrincipais(micro?.sessoes ?? []);
    return {
      semana: n,
      descarga: micro?.tipo === "deload",
      prescritas: sessoes.length,
      feitas: sessoes.filter((s) => sessaoConcluida(s, n, execucoes)).length,
    };
  });
}

/**
 * O PROGRESSO do aluno, na leitura do protótipo (tela 08): a sequência e os treinos feitos
 * no topo, o gráfico de treinos por semana, os dois números que ele acompanha (peso e
 * esforço médio) e a dor. As conquistas moram em `ConquistasAluno`, no fim da aba.
 *
 * Tudo derivado do que o próprio aluno registrou e do que o profissional mediu.
 * Não existe ponto inventado, sequência arredondada nem conquista fictícia: se
 * um dado não existe, o bloco correspondente simplesmente não aparece.
 */
export function GamificacaoView({
  alunoId,
  execucoes,
  cor,
  avaliacoes = [],
  feedbacks = [],
  plano,
}: {
  alunoId: string;
  execucoes: Execucao[];
  cor: string;
  /** avaliações do aluno: alimentam o card de peso (medida do profissional) */
  avaliacoes?: Avaliacao[];
  /** feedbacks de sessão: alimentam o esforço médio (PSE que o aluno registrou) */
  feedbacks?: SessaoFeedback[];
  /** plano ativo: com ele, "treinos feitos" e o gráfico contam as semanas DO PLANO */
  plano?: PlanoTreino;
}) {
  const r = React.useMemo(() => resumoGamificacao(alunoId, execucoes), [alunoId, execucoes]);
  const semanas = React.useMemo(() => (plano ? semanasDoPlano(plano, execucoes) : null), [plano, execucoes]);

  if (r.totalTreinos === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-2">
          <Medal className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-2">
          Comece o treino de hoje na aba <strong className="text-ink">Hoje</strong>. A partir do primeiro registro
          aparecem aqui a sua sequência e as suas conquistas.
        </p>
      </Card>
    );
  }

  /*
   * "TREINOS FEITOS": com plano, sessões fechadas sobre sessões prescritas até esta semana,
   * e o apoio diz "até esta semana" para o denominador não ler como meta do plano inteiro.
   * Sem plano não há o que prescrito, e o número vira dias treinados, sem denominador.
   */
  const feitas = semanas ? semanas.reduce((s, w) => s + w.feitas, 0) : null;
  const prescritas = semanas ? semanas.reduce((s, w) => s + w.prescritas, 0) : null;
  const diasTreinados = new Set(
    execucoes.filter((e) => e.alunoId === alunoId).map((e) => new Date(e.concluidoEm).toDateString()),
  ).size;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[14px] border border-border bg-surface p-3">
          <div className="text-2xs text-ink-2">Sequência</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="tabular font-display text-2xl font-bold leading-none text-primary-texto">{r.sequencia.atual}</span>
            <span className="text-2xs font-medium text-ink-2">{r.sequencia.atual === 1 ? "dia" : "dias"}</span>
          </div>
          {/* O recorde só aparece quando é outro número: igual ao atual, ele é o próprio. */}
          {r.sequencia.recorde > r.sequencia.atual && (
            <div className="tabular mt-1 text-2xs text-ink-2">recorde {r.sequencia.recorde}</div>
          )}
        </div>
        <div className="rounded-[14px] border border-border bg-surface p-3">
          <div className="text-2xs text-ink-2">{feitas != null ? "Treinos feitos" : "Dias treinados"}</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="tabular font-display text-2xl font-bold leading-none text-ink">{feitas ?? diasTreinados}</span>
            {prescritas != null && prescritas > 0 && (
              <span className="tabular text-2xs font-medium text-ink-2">/ {prescritas}</span>
            )}
          </div>
          {prescritas != null && prescritas > 0 && <div className="mt-1 text-2xs text-ink-2">até esta semana</div>}
        </div>
      </div>

      {semanas && semanas.some((w) => w.prescritas > 0) ? (
        <GraficoSemanasDoPlano semanas={semanas} cor={cor} frequencia={plano?.frequenciaSemanal} />
      ) : (
        <GraficoSemanasCivis dados={r.porSemana} cor={cor} />
      )}

      <div className="grid grid-cols-2 gap-2">
        <PesoCard avaliacoes={avaliacoes} />
        <EsforcoCard feedbacks={feedbacks} />
      </div>

      <DorCard avaliacoes={avaliacoes} />
    </div>
  );
}

/**
 * AS CONQUISTAS, em grade de três (protótipo, tela 08), no fim da aba. As sete são as regras
 * reais de `BADGES`; as do protótipo ("6 semanas seguidas", "Primeira fase") não existem como
 * regra e não entram. A descrição ("Registrou 10 treinos") vai para o leitor de tela e para o
 * título: o nome curto é o que cabe no cartão de três colunas.
 */
export function ConquistasAluno({
  alunoId,
  execucoes,
  cor,
  tinta: tintaDada,
}: {
  alunoId: string;
  execucoes: Execucao[];
  cor: string;
  /** a tinta do par verificado da marca; sem ela, calcula por luminância */
  tinta?: string;
}) {
  const r = React.useMemo(() => resumoGamificacao(alunoId, execucoes), [alunoId, execucoes]);
  const tinta = tintaDada ?? corDeContraste(cor);
  if (r.totalTreinos === 0) return null;
  return (
    <section>
      <h3 className="font-display text-sm font-bold text-ink">Conquistas</h3>
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {r.badges.map(({ badge, conquistada }) => {
          const Icon = ICONES[badge.icone] ?? Sparkles;
          return (
            <li
              key={badge.id}
              title={badge.descricao}
              className={cn(
                "flex flex-col items-center rounded-[14px] border border-border bg-surface px-2 py-2.5 text-center",
                !conquistada && "opacity-60",
              )}
            >
              <span
                aria-hidden
                className={cn("grid h-7 w-7 place-items-center rounded-full", !conquistada && "bg-surface-soft text-ink-2")}
                style={conquistada ? { background: cor, color: tinta } : undefined}
              >
                {conquistada ? <Icon className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              </span>
              <span className="mt-1.5 text-2xs font-semibold leading-[1.3] text-ink">{badge.nome}</span>
              <span className="sr-only">
                {conquistada ? ", conquistada: " : ", ainda não: "}
                {badge.descricao}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * TREINOS POR SEMANA DO PLANO (protótipo, tela 08): uma barra por semana, da 1 até a atual.
 *
 * A escala vai até a FREQUÊNCIA PRESCRITA, que é a meta real da semana, e não até o maior
 * valor: numa escala pelo maior valor, a semana em que o aluno fez 2 de 3 aparecia cheia. A
 * descarga vem do tipo da semana no plano (nunca da posição 4/8/12 do protótipo), em âmbar,
 * e a atual na cor da marca. Mais de 12 semanas: as 12 últimas.
 */
function GraficoSemanasDoPlano({
  semanas,
  cor,
  frequencia,
}: {
  semanas: { semana: number; descarga: boolean; prescritas: number; feitas: number }[];
  cor: string;
  frequencia?: number;
}) {
  const visiveis = semanas.slice(-12);
  const teto = Math.max(1, frequencia ?? 0, ...visiveis.map((w) => w.prescritas), ...visiveis.map((w) => w.feitas));
  const atual = visiveis[visiveis.length - 1]?.semana;
  const meio = visiveis[Math.floor((visiveis.length - 1) / 2)]?.semana;
  const colunas = { gridTemplateColumns: `repeat(${visiveis.length}, minmax(0, 1fr))` };
  return (
    <div className="rounded-[16px] border border-border bg-surface p-3.5">
      <h3 className="font-display text-sm font-bold text-ink">Treinos por semana</h3>
      <div
        className="mt-2.5 grid h-[70px] items-end gap-[5px]"
        style={colunas}
        role="img"
        aria-label={visiveis
          .map((w) => `semana ${w.semana}: ${w.feitas} de ${w.prescritas}${w.descarga ? ", semana mais leve" : ""}`)
          .join("; ")}
      >
        {visiveis.map((w) => {
          const eAtual = w.semana === atual;
          const alturaPct = Math.max(6, (w.feitas / teto) * 100);
          return (
            <div key={w.semana} className="flex h-full min-w-0 flex-col items-center justify-end gap-0.5">
              <span aria-hidden className="tabular text-2xs leading-none text-ink-2">{w.feitas}</span>
              <div
                aria-hidden
                className="w-full origin-bottom animate-sobe rounded-b-[2px] rounded-t-[4px]"
                style={{
                  height: `${alturaPct}%`,
                  background: eAtual ? cor : w.descarga ? "var(--warning-fill)" : "var(--border)",
                  opacity: !eAtual && w.descarga ? 0.6 : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* O eixo na MESMA grade das barras: o rótulo fica embaixo da barra que ele nomeia. */}
      <div aria-hidden className="mt-1 grid gap-[5px]" style={colunas}>
        {visiveis.map((w) => (
          <span key={w.semana} className="tabular text-center text-2xs leading-none text-ink-2">
            {w.semana === visiveis[0].semana || w.semana === meio || w.semana === atual ? `S${w.semana}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Sem plano, as últimas 6 semanas do CALENDÁRIO: dias treinados em cada uma. O eixo cresce
 * até o maior valor real (não há meta prescrita a usar como teto).
 */
function GraficoSemanasCivis({ dados, cor }: { dados: { rotulo: string; treinos: number }[]; cor: string }) {
  const max = Math.max(1, ...dados.map((d) => d.treinos));
  const total = dados.reduce((s, d) => s + d.treinos, 0);
  if (total === 0) return null;
  return (
    <div className="rounded-[16px] border border-border bg-surface p-3.5">
      <h3 className="font-display text-sm font-bold text-ink">Dias treinados por semana</h3>
      <div
        className="mt-2.5 flex h-[70px] items-end gap-[5px]"
        role="img"
        aria-label={dados
          .map((d, i) => `semana ${i + 1}: ${d.treinos} ${d.treinos === 1 ? "dia" : "dias"}`)
          .join(", ")}
      >
        {dados.map((d, i) => {
          const atual = i === dados.length - 1;
          const alturaPct = Math.max(6, (d.treinos / max) * 100);
          return (
            <div key={d.rotulo} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-0.5">
              <span aria-hidden className="tabular text-2xs leading-none text-ink-2">{d.treinos}</span>
              <div
                aria-hidden
                className="w-full origin-bottom animate-sobe rounded-b-[2px] rounded-t-[4px]"
                style={{ height: `${alturaPct}%`, background: atual ? cor : "var(--border)" }}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-2xs text-ink-2">Semanas do calendário, da mais antiga à atual.</p>
    </div>
  );
}

/**
 * A DOR, da primeira à última avaliação (protótipo, tela 08).
 *
 * Para quem entrou no treino por causa de dor, este é o número que importa, e ele já era
 * registrado (`dorEscala`, 0 a 10) sem nunca chegar ao aluno. A leitura é direta e não
 * depende do objetivo, ao contrário do peso: dor que cai é melhora, e por isso aqui o verde
 * é honesto. O rótulo e o valor ficam colados (o protótipo os separava pelas bordas); o
 * "no joelho" do protótipo não entra, porque a escala registrada é geral, sem local.
 *
 * Só aparece com DUAS avaliações que tragam a escala: um ponto sozinho não é evolução.
 */
function DorCard({ avaliacoes }: { avaliacoes: Avaliacao[] }) {
  const comDor = avaliacoes.filter((a) => a.dorEscala != null).sort((a, b) => a.data - b.data);
  if (comDor.length < 2) return null;
  const primeiro = comDor[0].dorEscala as number;
  const ultimo = comDor[comDor.length - 1].dorEscala as number;
  const melhorou = ultimo < primeiro;
  const igual = ultimo === primeiro;
  return (
    <div className="rounded-[16px] border border-border bg-surface p-3.5">
      <p className="flex flex-wrap items-baseline gap-x-1.5 text-2xs text-ink-2">
        <span>Dor percebida</span>
        <b className={cn("tabular text-xs", melhorou ? "text-success" : igual ? "text-ink" : "text-warning")}>
          {primeiro} para {ultimo}
        </b>
      </p>
      {/* A régua vai do vermelho ao verde, e o marcador fica onde a última medida caiu.
          É a mesma escala 0 a 10 que ele responde na avaliação. */}
      <div className="relative mt-2.5 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg,#E2543E,#F0B429 40%,#3ECF8E)" }}>
        <span
          aria-hidden
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink"
          style={{ left: `${Math.max(0, Math.min(100, 100 - ultimo * 10))}%` }}
        />
      </div>
      <p className="mt-2 text-2xs text-ink-2">
        {melhorou
          ? "Menos dor do que na primeira avaliação."
          : igual
            ? "Sem mudança desde a primeira avaliação."
            : "Mais dor do que na primeira avaliação. Conte ao seu professor."}
      </p>
    </div>
  );
}

/**
 * Peso: a última medida do profissional e a diferença desde a primeira, com o mês dela.
 * SEM verde e sem vermelho, ao contrário do protótipo: peso não tem direção boa para todo
 * objetivo (quem quer ganhar massa não "melhora" perdendo quilo). Sem avaliação com peso, o
 * card não aparece (não existe peso estimado).
 */
function PesoCard({ avaliacoes }: { avaliacoes: Avaliacao[] }) {
  const comPeso = avaliacoes.filter((a) => a.medidas.peso != null).sort((a, b) => a.data - b.data);
  if (comPeso.length === 0) return null;
  const ultimo = comPeso[comPeso.length - 1].medidas.peso as number;
  const primeiro = comPeso[0].medidas.peso as number;
  const delta = ultimo - primeiro;
  return (
    <div className="rounded-[14px] border border-border bg-surface p-3">
      <div className="text-2xs text-ink-2">Peso</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="tabular font-display text-xl font-bold leading-none text-ink">{ultimo.toLocaleString("pt-BR")}</span>
        <span className="text-2xs text-ink-2">kg</span>
      </div>
      {comPeso.length > 1 && (
        <div className="tabular mt-1 text-2xs text-ink-2">
          {delta === 0
            ? `estável desde ${mesCurto(comPeso[0].data)}`
            : `${delta < 0 ? "menos" : "mais"} ${Math.abs(delta).toLocaleString("pt-BR")} kg desde ${mesCurto(comPeso[0].data)}`}
        </div>
      )}
    </div>
  );
}

/**
 * Esforço médio: a média dos PSE que o próprio aluno registrou ao fechar cada sessão, com
 * uma casa decimal e o rótulo dizendo sobre QUANTAS sessões ela foi tirada (o rótulo carrega
 * a agregação). Sem feedback com PSE, não aparece.
 */
function EsforcoCard({ feedbacks }: { feedbacks: SessaoFeedback[] }) {
  const notas = feedbacks.map((f) => f.pse).filter((n): n is number => n != null);
  if (notas.length === 0) return null;
  const media = notas.reduce((s, n) => s + n, 0) / notas.length;
  return (
    <div className="rounded-[14px] border border-border bg-surface p-3">
      <div className="text-2xs text-ink-2">Esforço médio</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="tabular font-display text-xl font-bold leading-none text-ink">
          {media.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
        </span>
        <span className="text-2xs text-ink-2">de 10</span>
      </div>
      <div className="mt-1 text-2xs text-ink-2">
        em {notas.length} {notas.length === 1 ? "sessão" : "sessões"}
      </div>
    </div>
  );
}
