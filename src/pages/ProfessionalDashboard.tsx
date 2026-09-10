import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Navigation,
  CalendarPlus,
  AlertTriangle,
  ArrowRight,
  Crown,
  GitCompare,
  TrendingUp,
  CheckCircle2,
  Activity,
  Dumbbell,
  ClipboardList,
  PartyPopper,
  CalendarRange,
  CalendarCheck,
  Wallet,
  X,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { EspinhaSelo } from "@/components/ui/EspinhaSelo";
import { RetencaoPanel } from "@/components/treino/RetencaoPanel";
import { AvatarAluno } from "@/components/alunos/FotoAluno";
import { useUser, useAlunos, isPremiumUnlocked, planLabel } from "@/lib/store";
import { avisosDoAluno, type CicloCtx } from "@/lib/gps/proximoPasso";
import { rotaDoDia, type RotaDoDia, type ParadaDoDia } from "@/lib/gps/rotaDoDia";
import { alunosParaReativar } from "@/lib/retencao";
import { proximaReavaliacao, semanaAtual } from "@/data/periodizacao";
import { statusEfetivo, formatBRL } from "@/data/cobranca";
import { getAtivacao, marcarCelebrado, minutosPrimeiroCaso } from "@/lib/ativacao";
import type { Aluno } from "@/data/alunos";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));
const fmtHoje = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);

export function ProfessionalDashboard() {
  const { name, plan } = useUser();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, loadExamples, declaracoes } = useAlunos();
  const premium = isPremiumUnlocked(plan);
  // Fallback quando o nome está vazio (o profissional pode limpar em Configurações):
  // "Olá" seco, sem a vírgula pendurada.
  const firstName = name.split(" ")[0];
  // Sem nome preenchido, o H1 da home saía como "Olá" pendurado, uma saudação inacabada.
  const saudacao = firstName ? `Olá, ${firstName}` : "Seu dia";

  const ativos = alunos.filter((a) => a.status === "ativo");
  const avaliacoesMes = avaliacoes.filter((a) => Date.now() - a.data <= 30 * DIA).length;
  const planosAtivos = planos.filter((p) => p.status === "ativo");
  // Predicado ÚNICO de "ter treino": o objeto canônico é o plano de treino (a
  // periodização). A prescrição avulsa é insumo, não o treino. Mesma definição
  // usada pela Linha do cuidado (proximoPasso.ts), acaba a discordância antiga.
  const temTreinoAtivo = (id: string) => planosAtivos.some((p) => p.alunoId === id);
  const comTreino = ativos.filter((a) => temTreinoAtivo(a.id)).length;

  // Quem precisa de atenção HOJE vem da MESMA fonte do stepper do aluno
  // (avisosDoAluno), não de uma cópia da lógica: Painel, lista e tela do aluno
  // falam o mesmo "próximo passo".
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes };
  // "Não liberado" pendente é a pendência mais grave (tone "danger"): esses alunos
  // sobem para o topo da lista de atenção. Ordenação estável mantém o resto na
  // ordem original.
  const temAlertaVermelho = (motivos: ReturnType<typeof avisosDoAluno>) =>
    motivos.some((m) => m.tone === "danger");
  // Pendência de LIBERAÇÃO (vermelho pendente ou a etapa "liberar") abre direto na
  // aba Semáforo do aluno, onde se faz o semáforo de hoje. Antes só o vermelho
  // roteava; a etapa "liberar" caía na aba padrão.
  const precisaSemaforo = (motivos: ReturnType<typeof avisosDoAluno>) =>
    motivos.some((m) => m.etapa === "liberar");
  const atencao = ativos
    .map((a) => ({ aluno: a, motivos: avisosDoAluno(a, ctx) }))
    .filter((x) => x.motivos.length > 0)
    .sort((a, b) => Number(temAlertaVermelho(b.motivos)) - Number(temAlertaVermelho(a.motivos)));

  // A rota do dia: as paradas do profissional, da mesma fonte única que alimenta
  // o chip da lista de alunos e a Linha do cuidado. Sem fonte única, a rota
  // contradiria a lista na mesma tela.
  const rota = rotaDoDia(alunos, ctx);
  // Deduplicação na CAMADA DE APRESENTAÇÃO (motor intocado): cada aluno aparece
  // uma vez, na sua pendência mais forte. Precedência: rota/atenção > reativar > seus.
  const atencaoIds = new Set(atencao.map((x) => x.aluno.id));
  // Quem está numa parada da rota de hoje (inclui a etapa "liberar", que não gera
  // aviso porque tem chip null) NÃO pode reaparecer em "Em dia": era a contradição
  // de o mesmo aluno estar na rota e listado como em dia na mesma tela.
  const rotaIds = new Set(rota.paradas.map((p) => p.aluno.id));
  const alunosSemAtencao = alunos.filter((a) => !atencaoIds.has(a.id) && !rotaIds.has(a.id));
  const reativarIds = new Set(alunosParaReativar(alunosSemAtencao, execucoes).map((s) => s.aluno.id));
  const seusAlunos = ativos.filter((a) => !atencaoIds.has(a.id) && !rotaIds.has(a.id) && !reativarIds.has(a.id));
  // Parados que o cartão Reativar NÃO mostra porque a rota já os mostra: o cartão precisa
  // saber disso para não dizer "ninguém parado" quando há, só que em outro lugar da tela.
  const paradosNaRota = alunosParaReativar(ativos, execucoes).filter(
    (s) => atencaoIds.has(s.aluno.id) || rotaIds.has(s.aluno.id),
  ).length;
  const semanaDoAluno = (id: string) => {
    const p = planosAtivos.find((x) => x.alunoId === id);
    return p ? semanaAtual(p) : undefined;
  };

  // Ritual de segunda (parcial, sem backend): dois agregados deriváveis localmente.
  // Nada é inventado; se os dois forem zero, a linha some.
  const agora = Date.now();
  const diaSemana = (new Date(agora).getDay() + 6) % 7; // 0 = segunda-feira
  const inicioSemana = new Date(agora).setHours(0, 0, 0, 0) - diaSemana * DIA;
  const fimSemana = inicioSemana + 7 * DIA - 1;
  const reavaliamSemana = planosAtivos.filter((p) => {
    const r = proximaReavaliacao(p);
    return r != null && r.em >= inicioSemana && r.em <= fimSemana;
  }).length;
  const pendentesCentavos = alunos.reduce(
    (soma, a) => (a.cobranca && statusEfetivo(a.cobranca) === "pendente" ? soma + a.cobranca.valorCentavos : soma),
    0,
  );

  return (
    <div className="space-y-4">
      {/* O HERÓI NAVY do protótipo: saudação, resumo da rota e os três números
          do dia dentro do mesmo cartão escuro. */}
      <HeroDoDia
        saudacao={saudacao}
        rota={rota}
        ativos={ativos.length}
        comTreino={comTreino}
        pendentesCentavos={pendentesCentavos}
        avaliacoesMes={avaliacoesMes}
      />

      {alunos.length === 0 ? (
        <EmptyPro onExemplos={loadExamples} />
      ) : (
        <>
      {/* Moldura única de boas-vindas: celebração do 1º caso + passo a passo em
          linha de chips (como no protótipo); colapsa a uma linha quando termina. */}
      <MolduraBoasVindas
        temAluno={alunos.length > 0}
        temAvaliacao={avaliacoes.length > 0}
        temPrescricao={prescricoes.length > 0}
        temTreino={planos.length > 0}
        temEvolucao={avaliacoes.length >= 2}
        primeiroAlunoId={ativos[0]?.id ?? alunos[0]?.id}
      />

      {/* O corpo em duas colunas do protótipo: a rota de hoje à esquerda (o
          bloco-assinatura) e a coluna de apoio à direita. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RotaDeHojeCard rota={rota} reavaliamSemana={reavaliamSemana} />

        <div className="space-y-4">
          <SemanaDosAlunos execucoes={execucoes} />
          <RetencaoPanel
            alunos={alunosSemAtencao}
            execucoes={execucoes}
            nomeProfissional={name || undefined}
            paradosNaRota={paradosNaRota}
          />
          <div className="grid grid-cols-3 gap-2">
            <AtalhoRef to="/comparador" titulo="Comparador" hint="decidir entre dois" />
            <AtalhoRef to="/protocols" titulo="Protocolos" hint="pontos de partida" />
            <AtalhoRef to="/aprender" titulo="Estudar" hint="trilhas e casos" />
          </div>
        </div>
      </div>

      {/* Seus alunos (apoio): quem NÃO está na rota, ou seja, quem está em dia. */}
      {seusAlunos.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">Em dia</h2>
            <Link to="/alunos" className="text-sm font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {seusAlunos.slice(0, 4).map((a) => (
              <AlunoCard key={a.id} aluno={a} temTreino={temTreinoAtivo(a.id)} semana={semanaDoAluno(a.id)} />
            ))}
          </div>
        </section>
      )}
        </>
      )}

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional
        individualizada nem prescrição clínica.
      </p>
    </div>
  );
}

/**
 * O herói do Meu dia, fiel ao protótipo: cartão navy de 24px com textura de
 * grade, dois halos de cor, a saudação com o resumo REAL da rota e os três
 * números do dia como azulejos translúcidos. A superfície é fixa (navy da
 * casca, fora do tema claro/escuro), então os valores são literais medidos.
 */
function HeroDoDia({
  saudacao,
  rota,
  ativos,
  comTreino,
  pendentesCentavos,
  avaliacoesMes,
}: {
  saudacao: string;
  rota: RotaDoDia;
  ativos: number;
  comTreino: number;
  pendentesCentavos: number;
  avaliacoesMes: number;
}) {
  const restantes = rota.total - rota.feitas;
  const fraseRota =
    restantes > 0
      ? `${restantes} ${restantes === 1 ? "parada" : "paradas"} na rota de hoje.`
      : rota.total > 0
        ? "Rota de hoje concluída."
        : "Seu dia começa por aqui.";
  return (
    <section
      className="relative overflow-hidden rounded-[24px] p-5 md:p-8"
      style={{ background: "#0B1628", color: "#F3F1EA" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 60% 100% at 100% 50%,#000 0%,transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 100% at 100% 50%,#000 0%,transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[120px] -top-[160px] h-[460px] w-[460px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(232,163,23,.22) 0%,rgba(232,163,23,0) 62%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[220px] left-[30%] h-[460px] w-[460px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(20,179,186,.22) 0%,rgba(20,179,186,0) 62%)" }}
      />
      <div className="relative grid items-end gap-7 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <p
            className="m-0 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: "#7FE3D8" }}
          >
            <span aria-hidden className="h-2 w-2 animate-pulseDot rounded-full" style={{ background: "#7FE3D8" }} />
            <span className="capitalize">{fmtHoje(Date.now())}</span>
          </p>
          <h1 className="m-0 mt-3 font-display text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.05] tracking-[-0.03em]">
            {saudacao}. {fraseRota}
          </h1>
          <p className="m-0 mt-3 max-w-[560px] text-[15px] leading-relaxed" style={{ color: "#B9C6D6" }}>
            {resumoDaRota(rota)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {rota.agora && (
              <Link
                to={destinoDaParada(rota.agora)}
                className="inline-flex h-11 items-center gap-2 rounded-control px-5 text-sm font-bold transition-[filter] hover:brightness-110"
                style={{ background: "#E8A317", color: "#0B1628", boxShadow: "0 12px 24px -12px rgba(232,163,23,.7)" }}
              >
                Abrir o dia <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
            <Link
              to="/assessments"
              className="inline-flex h-11 items-center gap-2 rounded-control border px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,.2)" }}
            >
              <CalendarPlus className="h-4 w-4" aria-hidden /> Registrar avaliação
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <AzulejoDoDia valor={String(ativos)} rotulo={ativos === 1 ? "aluno ativo" : "alunos ativos"} />
          <AzulejoDoDia valor={String(comTreino)} rotulo="com treino ativo" cor="#7FE3D8" />
          {pendentesCentavos > 0 ? (
            <AzulejoDoDia valor={formatBRL(pendentesCentavos)} rotulo="pendentes" tom="ambar" />
          ) : (
            <AzulejoDoDia valor={String(avaliacoesMes)} rotulo="avaliações em 30 dias" />
          )}
        </div>
      </div>
    </section>
  );
}

/** Um azulejo do herói: número grande e rótulo, translúcido sobre o navy. O tom
 *  âmbar é o do dinheiro parado, literal do protótipo. */
function AzulejoDoDia({ valor, rotulo, cor, tom }: { valor: string; rotulo: string; cor?: string; tom?: "ambar" }) {
  const ambar = tom === "ambar";
  return (
    <div
      className="rounded-card border p-3.5"
      style={
        ambar
          ? { background: "rgba(232,163,23,.14)", borderColor: "rgba(232,163,23,.3)" }
          : { background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }
      }
    >
      <p
        className="tabular m-0 font-display text-3xl font-bold leading-none tracking-[-0.03em]"
        style={{ color: ambar ? "#F0B429" : cor ?? "#F3F1EA" }}
      >
        {valor}
      </p>
      <p className="m-0 mt-1.5 text-xs" style={{ color: ambar ? "#D6C39A" : "#8FA0B5" }}>
        {rotulo}
      </p>
    </div>
  );
}

/* ------------------------------- Auxiliares ------------------------------- */

/* Moldura única de boas-vindas: funde a celebração do 1º caso (a métrica-mãe) e
   o checklist "Seu passo a passo" num só card, encabeçado pela espinha do cuidado
   (halo de 3 ciclos, 1 por página). Colapsa para uma linha quando o fluxo termina,
   em vez de virar mobília permanente nas aberturas diárias. */
function MolduraBoasVindas({
  temAluno,
  temAvaliacao,
  temPrescricao,
  temTreino,
  temEvolucao,
  primeiroAlunoId,
}: {
  temAluno: boolean;
  temAvaliacao: boolean;
  temPrescricao: boolean;
  temTreino: boolean;
  temEvolucao: boolean;
  primeiroAlunoId?: string;
}) {
  const [oculto, setOculto] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("pi-passos-ocultos") === "1",
  );
  const [celebracaoFechada, setCelebracaoFechada] = useState(() => {
    const a = getAtivacao();
    return !(a.primeiroSalvo && !a.celebrado);
  });
  const min = minutosPrimeiroCaso();
  const mostrarCelebracao = !celebracaoFechada;

  const passos = [
    { done: temAluno, label: "Cadastre um aluno", to: "/alunos?novo=1" },
    { done: temAvaliacao, label: "Registre uma avaliação", to: primeiroAlunoId ? `/alunos/${primeiroAlunoId}?avaliar=1` : "/alunos" },
    { done: temPrescricao, label: "Escolha exercícios com justificativa", to: primeiroAlunoId ? `/gps?aluno=${primeiroAlunoId}` : "/gps" },
    { done: temTreino, label: "Monte o treino do aluno", to: primeiroAlunoId ? `/prescrever-treino?aluno=${primeiroAlunoId}` : "/prescrever-treino" },
    { done: temEvolucao, label: "Acompanhe a evolução", to: "/assessments" },
  ];
  // Estado MONOTÔNICO para exibição: um passo só conta como feito se todos os
  // anteriores também estão. Senão o passo 5 (evolução, já verdadeiro pelos seeds)
  // aparecia com check enquanto o passo 4 ainda era "o próximo", contradição.
  const feitoMono = passos.map((_, i) => passos.slice(0, i + 1).every((x) => x.done));
  const feitos = feitoMono.filter(Boolean).length;
  const atualIdx = feitoMono.indexOf(false);
  const completo = feitos === passos.length;

  const ocultar = () => {
    localStorage.setItem("pi-passos-ocultos", "1");
    setOculto(true);
  };
  const fecharCelebracao = () => {
    marcarCelebrado();
    setCelebracaoFechada(true);
  };

  if (oculto) return null;

  // Colapsado: uma linha quando o fluxo terminou (e não há mais celebração a mostrar).
  if (completo && !mostrarCelebracao) {
    return (
      <Card className="flex items-center gap-4 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">Fluxo dominado.</span> Você percorreu o ciclo do
            cuidado, do cadastro à evolução.
          </p>
          <button onClick={ocultar} className="shrink-0 text-xs font-medium text-ink-3 hover:text-ink">
            Ocultar
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="px-5 py-4">
      {mostrarCelebracao && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-success/30 bg-success-tint/50 p-3">
          <PartyPopper className="h-5 w-5 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">
              Primeiro caso real resolvido{min ? ` em ${min} min` : ""}.
            </span>{" "}
            Vincule a um aluno para salvar e exportar o prontuário; é assim que cada caso vira defesa
            técnica sua.
          </p>
          <button onClick={fecharCelebracao} aria-label="Fechar" className="rounded-full p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* A linha de chips do protótipo: título, contador e um chip-pílula por
          passo. O feito risca e apaga; o atual acende em azul. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-sm font-bold text-ink">Seu passo a passo</h2>
          <Pill tone="primary">{feitos} de {passos.length}</Pill>
        </div>
        <ol className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {passos.map((p, i) => {
            const atual = i === atualIdx;
            const feito = feitoMono[i];
            return (
              <li key={p.label}>
                <Link
                  to={p.to}
                  aria-current={atual ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2.5 text-xs font-semibold transition-colors",
                    feito
                      ? "border-border bg-bg text-ink-3 line-through decoration-ink-3/50"
                      : atual
                        ? "border-primary bg-primary-tint text-primary"
                        : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  <span
                    className={cn(
                      "tabular grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-2xs font-bold leading-none",
                      feito ? "bg-success-fill text-on-success-fill" : atual ? "bg-primary text-on-primary" : "bg-surface-mute text-ink-3",
                    )}
                  >
                    {feito ? "✓" : i + 1}
                  </span>
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ol>
        <button onClick={ocultar} className="ml-auto shrink-0 text-xs font-medium text-ink-3 hover:text-ink">
          Ocultar
        </button>
      </div>
    </Card>
  );
}

function EmptyPro({ onExemplos }: { onExemplos: () => void }) {
  return (
    <Card variant="raised" className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
      <span className="grid h-16 w-16 place-items-center rounded-card bg-primary-tint text-primary">
        <Navigation className="h-8 w-8" />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Comece resolvendo um caso de verdade</h2>
        <p className="mx-auto mt-1 max-w-md text-ink-2">
          Pense num aluno que você tem agora, com hipertensão, diabetes, dor lombar ou idade
          avançada. Em poucos minutos você sai com a decisão documentada e o porquê de cada escolha.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/gps?primeiro-caso=1" className={buttonClasses("primary")}>
          <Navigation className="h-4 w-4" /> Resolver um caso agora
        </Link>
        <Link to="/alunos?novo=1" className={buttonClasses("secondary")}>
          <UserPlus className="h-4 w-4" /> Cadastrar um aluno
        </Link>
        <button onClick={onExemplos} className={buttonClasses("ghost")}>
          Carregar exemplos
        </button>
      </div>
    </Card>
  );
}


/*
 * O CARTÃO DE QUEM ESTÁ EM DIA, no formato do protótipo: nome, objetivo e a SEMANA do plano
 * ("Hipertrofia · S9"), e a data da última avaliação à direita.
 *
 * Ele carregava pílulas âmbar de restrição ("Dor no joelho +1") e de "Sem treino". Numa lista
 * que se chama "Em dia", uma pílula de alerta em cada cartão desmente o título, e a restrição
 * já vive na ficha. O "sem treino" continua, só que como texto: quem não tem plano não tem
 * semana para mostrar, e dizer isso no lugar da semana é a informação exata.
 */
function AlunoCard({ aluno, temTreino, semana }: { aluno: Aluno; temTreino: boolean; semana?: number }) {
  const dias = aluno.proximaReavaliacaoEm ? diasAte(aluno.proximaReavaliacaoEm) : null;
  return (
    <Link
      to={`/alunos/${aluno.id}`}
      className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-3.5 py-3 transition-colors hover:bg-surface-soft"
    >
      <AvatarAluno
        aluno={aluno}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] font-display text-xs font-bold"
        style={{ background: "#0B1628", color: "#F3F1EA" }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{aluno.nome}</div>
        <div className="truncate text-xs text-ink-2">
          {aluno.objetivo} · {temTreino && semana ? `S${semana}` : temTreino ? aluno.nivel : "sem treino"}
        </div>
      </div>
      {aluno.ultimaAvaliacaoEm && (
        <span className="shrink-0 whitespace-nowrap text-xs text-ink-3">
          aval. {fmtData(aluno.ultimaAvaliacaoEm)}
          {dias !== null && dias < 0 ? " · reavaliar" : ""}
        </span>
      )}
    </Link>
  );
}


/**
 * "Sua rota de hoje": o contador de paradas, a próxima parada em destaque e a
 * lista das restantes, cada uma com o VERBO da ação (nunca "ver" genérico).
 *
 * Substitui o antigo "Precisam de atenção", que mostrava as mesmas pessoas com
 * pílulas de diagnóstico e um botão sem nome. A diferença que importa: aqui o
 * profissional lê o que FAZER, e o rótulo vem da mesma fonte que decide o
 * próximo passo, então a tela nunca sugere uma coisa e a lista outra.
 */
/** A família de cor de cada parada, lida do tom da fonte única (nunca de outra conta). */
const COR_DA_PARADA: Record<ParadaDoDia["tone"], { chip: string; avatar: string; filete: string }> = {
  warning: { chip: "bg-warning-tint text-warning", avatar: "bg-warning-tint text-warning", filete: "var(--warning-fill)" },
  cta: { chip: "bg-warning-tint text-warning", avatar: "bg-warning-tint text-warning", filete: "var(--warning-fill)" },
  success: { chip: "bg-analysis-tint text-analysis", avatar: "bg-analysis-tint text-analysis", filete: "var(--analysis-fill)" },
  primary: { chip: "bg-primary-tint text-primary", avatar: "bg-primary-tint text-primary", filete: "var(--primary)" },
};

function RotaDeHojeCard({ rota, reavaliamSemana }: { rota: RotaDoDia; reavaliamSemana: number }) {
  if (rota.total === 0) return null;

  if (rota.paradas.length === 0) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink">Rota de hoje concluída.</span> Os {rota.feitas} alunos ativos estão
          em dia: avaliação registrada, treino ativo e semáforo do dia feito.
        </p>
      </Card>
    );
  }

  /*
   * OS CHIPS SÃO AS PARADAS AGRUPADAS PELO VERBO CURTO ("Liberar · 2 alunos").
   *
   * Agrupavam pela frase inteira do botão, e a frase é longa: o topo do cartão virava quatro
   * pílulas de 40 caracteres ("Recomendado: fazer o semáforo de hoje · 2 alunos") e, pior,
   * "Abrir Medicamentos" e "Abrir Saúde e restrições" saíam separados sendo a mesma ação
   * (completar o perfil). Com um aluno só, o chip diz o nome dele; com vários, quantos.
   */
  const grupos = new Map<string, ParadaDoDia[]>();
  for (const p of rota.paradas) {
    const atual = grupos.get(p.acaoCurta) ?? [];
    atual.push(p);
    grupos.set(p.acaoCurta, atual);
  }

  return (
    <Card variant="raised" className="p-5 md:p-6">
      {/* O botão "Abrir o dia" que morava aqui saiu: ele repetia o do herói, logo acima,
          com o mesmo destino. O lugar dele é dos chips, como no protótipo. */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Sua rota de hoje</h2>
          <p className="tabular text-sm text-ink-2">
            {rota.feitas} de {rota.total} paradas feitas
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {[...grupos.entries()].map(([verbo, ps]) => (
            <span key={verbo} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", COR_DA_PARADA[ps[0].tone].chip)}>
              {verbo} · {ps.length === 1 ? ps[0].aluno.nome.split(" ")[0] : `${ps.length} alunos`}
            </span>
          ))}
        </div>
      </div>

      {/* Trilho de progresso: uma marca por parada, acesa nas já feitas. */}
      <div className="mt-4 flex gap-1.5" role="img" aria-label={`${rota.feitas} de ${rota.total} paradas feitas`}>
        {Array.from({ length: rota.total }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn("h-1.5 flex-1 rounded-full", i < rota.feitas ? "bg-analysis-fill" : "bg-surface-mute")}
          />
        ))}
      </div>

      {reavaliamSemana > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-2">
          <CalendarCheck className="h-3.5 w-3.5 text-analysis" aria-hidden />
          Ritual de segunda: {reavaliamSemana}{" "}
          {reavaliamSemana === 1 ? "reavaliação marcada" : "reavaliações marcadas"} para esta semana.
        </p>
      )}

      <ol className="mt-4 space-y-2">
        {rota.paradas.map((p) => {
          const cor = COR_DA_PARADA[p.tone];
          return (
            <li key={p.aluno.id}>
              <Link
                to={destinoDaParada(p)}
                // A frase inteira do botão continua disponível: é o nome acessível e a dica.
                aria-label={`${p.aluno.nome}: ${p.frase} ${p.acao}`}
                title={p.acao}
                className="flex items-center gap-3.5 overflow-hidden rounded-[14px] border border-border bg-surface py-3 pr-3.5 transition-colors hover:border-ink hover:bg-surface-soft"
              >
                {/* Filete de urgência na cor de PREENCHIMENTO da família, como o protótipo
                    desenha: a tinta de texto (âmbar escuro) saía marrom numa faixa de 4px. */}
                <span aria-hidden className="w-1 self-stretch rounded-r-full" style={{ background: cor.filete }} />
                <AvatarAluno
                  aluno={p.aluno}
                  className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold", cor.avatar)}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{p.aluno.nome}</div>
                  <div className="truncate text-sm text-ink-2">{p.frase}</div>
                </div>
                <span className="hidden shrink-0 whitespace-nowrap rounded-full bg-bg px-3 py-1.5 text-xs font-semibold text-ink sm:inline">
                  {p.acaoCurta} →
                </span>
                <span aria-hidden className="shrink-0 text-ink-3 sm:hidden">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/*
 * O RESUMO DA ROTA EM UMA FRASE, para o herói ("Dois semáforos para liberar, uma reavaliação
 * vencida e três perfis para completar."). O protótipo escreve exatamente isso debaixo da
 * saudação, e a tela real tinha uma frase fixa ("comece pelo que precisa de atenção") que
 * dizia a mesma coisa todo dia. Sai das MESMAS paradas da rota, agrupadas pelo verbo curto,
 * na ordem de urgência da rota.
 */
const PARTE_DO_RESUMO: Record<string, { um: string; varios: string; feminino?: boolean }> = {
  Liberar: { um: "semáforo para liberar", varios: "semáforos para liberar" },
  Avaliar: { um: "avaliação inicial", varios: "avaliações iniciais", feminino: true },
  Reavaliar: { um: "reavaliação vencida", varios: "reavaliações vencidas", feminino: true },
  Planejar: { um: "treino para montar", varios: "treinos para montar" },
  "Completar perfil": { um: "perfil para completar", varios: "perfis para completar" },
  Revisar: { um: "declaração de aluno para revisar", varios: "declarações de alunos para revisar", feminino: true },
  "Ver semáforo": { um: "encaminhamento para conferir", varios: "encaminhamentos para conferir" },
  "Ver execução": { um: "aluno que parou de registrar", varios: "alunos que pararam de registrar" },
};
const POR_EXTENSO_M = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];
const POR_EXTENSO_F = ["", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

function resumoDaRota(rota: RotaDoDia): string {
  if (rota.total === 0) return "Comece pelo que precisa de atenção e resolva o próximo passo de cada aluno.";
  if (rota.paradas.length === 0) return "Todos os alunos ativos estão em dia hoje.";
  // Quem pediu o treino abre a frase: é gente esperando do outro lado, e a parada dele não
  // entra de novo na conta do verbo (seria contar o mesmo aluno duas vezes).
  const pedidos = rota.paradas.filter((p) => p.pediuTreino).length;
  const contagem = new Map<string, number>();
  for (const p of rota.paradas) if (!p.pediuTreino) contagem.set(p.acaoCurta, (contagem.get(p.acaoCurta) ?? 0) + 1);
  const partes = [...contagem.entries()].map(([verbo, n]) => {
    const def = PARTE_DO_RESUMO[verbo];
    if (!def) return `${n} ${verbo.toLowerCase()}`;
    const numero = n <= 10 ? (def.feminino ? POR_EXTENSO_F : POR_EXTENSO_M)[n] : String(n);
    return `${numero} ${n === 1 ? def.um : def.varios}`;
  });
  if (pedidos) partes.unshift(pedidos === 1 ? "um aluno pediu o treino" : `${pedidos <= 10 ? POR_EXTENSO_M[pedidos] : pedidos} alunos pediram o treino`);
  const lista = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
  return `${lista.charAt(0).toUpperCase()}${lista.slice(1)}. Comece pelo que precisa de você.`;
}

/** Onde cada parada abre. Liberar cai direto na aba Semáforo do aluno; avaliar
 *  abre o modal de avaliação pelo deep-link; o resto abre a ficha. */
function destinoDaParada(p: ParadaDoDia): string {
  // O destino explícito do passo manda: com o perfil travando a prescrição, a
  // parada leva à seção do perfil que destrava, não à tela bloqueada.
  if (p.to) return p.to;
  if (p.etapa === "liberar") return `/alunos/${p.aluno.id}?aba=semaforo`;
  if (p.etapa === "avaliar" || p.etapa === "reavaliar") return `/alunos/${p.aluno.id}?avaliar=1`;
  if (p.etapa === "planejar") return `/prescrever-treino?aluno=${p.aluno.id}`;
  return `/alunos/${p.aluno.id}`;
}

/** Atalho de referência da coluna de apoio, compacto e centrado como no
 *  protótipo: nome em cima, descrição de uma linha embaixo. */
function AtalhoRef({ to, titulo, hint }: { to: string; titulo: string; hint: string }) {
  return (
    <Link
      to={to}
      className="rounded-[14px] border border-border bg-surface px-2 py-3 text-center transition-colors hover:bg-surface-soft"
    >
      <span className="block truncate text-sm font-semibold text-ink">{titulo}</span>
      <span className="block truncate text-xs text-ink-3">{hint}</span>
    </Link>
  );
}

/**
 * "Semana dos seus alunos": quantos treinos aconteceram por dia da semana civil,
 * o total e a variação contra a semana anterior.
 *
 * Um treino = um DIA em que o aluno registrou alguma coisa (a mesma definição do
 * app do aluno). Contar execuções soltas inflaria o número: seis exercícios num
 * dia não são seis treinos. A variação só aparece quando a semana anterior teve
 * movimento; percentual sobre zero não existe.
 */
function SemanaDosAlunos({ execucoes }: { execucoes: { alunoId?: string; concluidoEm: number }[] }) {
  const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const agora = Date.now();
  const diaSemana = (new Date(agora).getDay() + 6) % 7;
  const inicio = new Date(agora).setHours(0, 0, 0, 0) - diaSemana * DIA;

  // Um "treino" por aluno por dia: chave aluno+dia, contada uma vez.
  const contaJanela = (de: number, ate: number) =>
    new Set(
      execucoes
        .filter((e) => e.concluidoEm >= de && e.concluidoEm < ate)
        .map((e) => `${e.alunoId ?? "?"}#${Math.floor(e.concluidoEm / DIA)}`),
    ).size;

  const porDia = DIAS.map((_, i) => contaJanela(inicio + i * DIA, inicio + (i + 1) * DIA));
  const total = porDia.reduce((s, n) => s + n, 0);
  const anterior = contaJanela(inicio - 7 * DIA, inicio);
  const variacao = anterior > 0 ? Math.round(((total - anterior) / anterior) * 100) : null;
  const max = Math.max(1, ...porDia);
  /*
   * O CARTÃO APARECE SEMPRE, e com zero ele diz que é zero.
   *
   * Ele saía com `return null` quando a semana e a anterior estavam vazias. Numa carteira em
   * que os alunos ainda não usam o app, isso é todo dia: a coluna da direita do Meu dia ficava
   * só com os atalhos, e o profissional nunca descobria que o registro do aluno alimenta esta
   * leitura. Zero é um dado, e o texto de baixo diz de onde ele viria.
   */

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-bold text-ink">Semana dos seus alunos</h2>
        {variacao != null && variacao !== 0 && (
          <span
            className={cn("tabular text-sm font-bold", variacao > 0 ? "text-analysis" : "text-warning")}
            title={`${anterior} ${anterior === 1 ? "treino" : "treinos"} na semana passada`}
          >
            {variacao > 0 ? "+" : "−"}
            {Math.abs(variacao)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        <b className="tabular font-display text-xl text-ink">{total}</b> {total === 1 ? "treino registrado" : "treinos registrados"}
        {variacao != null && variacao !== 0 && <span className="text-ink-3"> · contra {anterior} na semana passada</span>}
      </p>
      {/*
        AS BARRAS NÃO APARECIAM, e o motivo era de CSS, não de dado.
        A altura de cada barra era um percentual, e o pai dela (a coluna do dia) não tinha
        altura definida: percentual de altura sobre pai de altura automática resolve para
        automático, ou seja, zero. O cartão mostrava os números em cima e os dias embaixo, com
        nada no meio. A coluna agora ocupa a altura toda do gráfico e empilha pelo fundo.
      */}
      <div className="mt-3 flex h-[92px] items-end gap-2" role="img" aria-label={DIAS.map((d, i) => `${d}: ${porDia[i]}`).join(", ")}>
        {DIAS.map((d, i) => {
          const n = porDia[i];
          // Como o protótipo: os dias que já passaram em turquesa, hoje em azul, o resto
          // da semana em cinza. Dia sem treino fica cinza em qualquer posição: turquesa
          // num zero pareceria valor.
          const cor = n === 0 || i > diaSemana ? "bg-surface-mute" : i === diaSemana ? "bg-primary" : "bg-analysis-fill";
          return (
            <div key={d} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="tabular text-2xs font-bold text-ink-2">{n || ""}</span>
              <div aria-hidden className={cn("w-full rounded-t-[6px] rounded-b-[3px]", cor)} style={{ height: `${Math.max(6, (n / max) * 100)}%` }} />
              <span className={cn("text-2xs", i === diaSemana ? "font-bold text-ink" : "text-ink-3")}>{d}</span>
            </div>
          );
        })}
      </div>
      {total === 0 && (
        <p className="mt-3 text-xs leading-relaxed text-ink-3">
          Nenhum treino registrado ainda nesta semana. Cada dia em que um aluno registra no app aparece aqui.
        </p>
      )}
    </Card>
  );
}
