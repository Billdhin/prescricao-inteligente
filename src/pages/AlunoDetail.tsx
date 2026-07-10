import * as React from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Navigation,
  CalendarPlus,
  Target,
  Dumbbell,
  Activity,
  AlertTriangle,
  Clock,
  CalendarClock,
  TrendingUp,
  UserMinus,
  UserCheck,
  FlaskConical,
  HeartPulse,
  FileDown,
  FileText,
  Lock,
  Route as RouteIcon,
  ShieldCheck,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos, useUser, isPremiumUnlocked, marcaDoUsuario } from "@/lib/store";
import { exportPrescricaoPDF } from "@/lib/exportPrescricao";
import { exportProntuarioPDF, idDocumento } from "@/lib/exportProntuario";
import { ProntuarioView } from "@/components/rcd/ProntuarioView";
import { exercises } from "@/data/exercises";
import type { Aluno, Avaliacao } from "@/data/alunos";
import { tempoDesde, sugestaoProgressao } from "@/data/alunos";
import { getSpecialGroup } from "@/data/specialGroups";
import { ModalidadePills, ParametroPills, CriteriosLista } from "@/components/special/SpecialUI";
import { AlunoFormModal } from "@/components/app/AlunoFormModal";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
import { useDialog } from "@/lib/useDialog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;

const TIPO_AVAL_LABEL: Record<string, string> = {
  inicial: "Inicial",
  reavaliacao: "Reavaliação",
  pontual: "Pontual",
  retorno: "Retorno",
};

export function AlunoDetail() {
  const { id = "" } = useParams();
  const { alunos, avaliacoes, prescricoes, liberacoes, addAvaliacao, updateAluno, removeAluno, archivePrescricao } =
    useAlunos();
  const navigate = useNavigate();
  const [editar, setEditar] = React.useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = React.useState(false);
  const usuario = useUser();
  const { name: profNome, plan, cref } = usuario;
  const premium = isPremiumUnlocked(plan);
  const [avaliar, setAvaliar] = React.useState(false);
  const [prontuarioDe, setProntuarioDe] = React.useState<string | null>(null);
  const location = useLocation();
  const recemCriado = Boolean((location.state as { recemCriado?: boolean } | null)?.recemCriado);
  const [params, setParams] = useSearchParams();

  // ?avaliar=1 (vindo de Avaliações) abre o modal de registrar avaliação e limpa o param.
  React.useEffect(() => {
    if (params.get("avaliar") === "1") {
      setAvaliar(true);
      params.delete("avaliar");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Aluno não encontrado.</p>
        <Link to="/alunos" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar para Alunos
        </Link>
      </div>
    );
  }

  const avals = avaliacoes.filter((a) => a.alunoId === id).sort((a, b) => a.data - b.data);
  const avalsDesc = [...avals].reverse();
  const prescs = prescricoes.filter((p) => p.alunoId === id).sort((a, b) => b.data - a.data);
  const reavaliacaoVencida = aluno.proximaReavaliacaoEm ? aluno.proximaReavaliacaoEm < Date.now() : false;
  const libsDoAluno = liberacoes.filter((l) => l.alunoId === id).slice(0, 3);
  const prescAberta = prontuarioDe ? prescs.find((p) => p.id === prontuarioDe) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/alunos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Alunos
      </Link>

      {recemCriado && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-success">
            <CalendarPlus className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">{aluno.nome} cadastrado(a).</span> Próximo passo: registre a
            primeira avaliação para acompanhar a evolução, ou já prescreva o treino.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary", "sm")}>
              Registrar avaliação
            </button>
            <Link to={`/gps?aluno=${aluno.id}`} className={buttonClasses("primary", "sm")}>
              Prescrever agora
            </Link>
          </div>
        </Card>
      )}

      {/* Cabeçalho */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-brand text-xl font-bold text-white">
            {aluno.iniciais}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{aluno.nome}</h1>
              <Pill tone={aluno.status === "ativo" ? "success" : "neutral"}>{aluno.status}</Pill>
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {aluno.idade ? `${aluno.idade} anos · ` : ""}
              {aluno.sexo ? `${aluno.sexo} · ` : ""}
              {aluno.objetivo} · {aluno.nivel}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {aluno.restricoes.length > 0 ? (
                aluno.restricoes.map((r) => (
                  <Pill key={r} tone="warning" icon={<AlertTriangle className="h-3 w-3" />}>
                    {r}
                  </Pill>
                ))
              ) : (
                <Pill tone="neutral">Sem restrição</Pill>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditar(true)} className={buttonClasses("outline")}>
              Editar
            </button>
            <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary")}>
              <CalendarPlus className="h-4 w-4" /> Registrar avaliação
            </button>
            <Link to={`/gps?aluno=${aluno.id}`} className={buttonClasses("primary")}>
              <Navigation className="h-4 w-4" /> Prescrever
            </Link>
          </div>
        </div>
      </Card>

      {/* Acompanhamento: tempo de cadastro, tempo no nível, status e progressão */}
      <AcompanhamentoCard aluno={aluno} onUpdate={(patch) => updateAluno(aluno.id, patch)} />

      {/* Jornada de Prescrição */}
      <JornadaCard aluno={aluno} onFase={(n) => updateAluno(aluno.id, { faseJornada: n })} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Coluna principal: evolução + avaliações */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0f7f9] text-analysis">
                <Activity className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-ink">Evolução</h2>
            </div>
            <Evolucao avals={avals} />
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Avaliações</h2>
              <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary", "sm")}>
                <CalendarPlus className="h-4 w-4" /> Registrar
              </button>
            </div>
            {avalsDesc.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-2">Nenhuma avaliação registrada ainda.</p>
            ) : (
              <ol className="space-y-3">
                {avalsDesc.map((av) => (
                  <li key={av.id} className="flex gap-3 rounded-xl border border-border p-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-semibold text-ink">{fmtData(av.data)}</span>
                        {av.tipo && <Pill tone="neutral">{TIPO_AVAL_LABEL[av.tipo]}</Pill>}
                        {av.medidas.peso != null && <Medida label="Peso" value={`${av.medidas.peso} kg`} />}
                        {av.medidas.percentualGordura != null && (
                          <Medida label="% gordura" value={`${av.medidas.percentualGordura}%`} />
                        )}
                        {av.medidas.cintura != null && <Medida label="Cintura" value={`${av.medidas.cintura} cm`} />}
                        {av.dorEscala != null && <Medida label="Dor" value={`${av.dorEscala}/10`} />}
                      </div>
                      {(av.testes?.length || av.fotos?.length || av.regioesDor?.length) && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {av.testes?.length ? (
                            <Pill tone="analysis">{av.testes.length} teste{av.testes.length > 1 ? "s" : ""}</Pill>
                          ) : null}
                          {av.fotos?.length ? <Pill tone="primary">{av.fotos.length} foto{av.fotos.length > 1 ? "s" : ""}</Pill> : null}
                          {av.regioesDor?.length ? (
                            <Pill tone="warning">dor: {av.regioesDor.slice(0, 2).join(", ")}{av.regioesDor.length > 2 ? "..." : ""}</Pill>
                          ) : null}
                        </div>
                      )}
                      {av.observacoes && <p className="mt-1 text-sm text-ink-2">{av.observacoes}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Coluna lateral: perfil + prescrições */}
        <div className="space-y-4">
          <Card className="p-5 md:p-6">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Perfil de treino</h2>
            <dl className="space-y-3 text-sm">
              <Info icon={<Target className="h-4 w-4 text-primary" />} label="Objetivo" value={aluno.objetivo} />
              <Info icon={<Activity className="h-4 w-4 text-analysis" />} label="Nível" value={aluno.nivel} />
              <div>
                <dt className="mb-1 flex items-center gap-2 text-ink-3">
                  <Dumbbell className="h-4 w-4" /> Equipamentos
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {aluno.equipamentos.map((eq) => (
                    <Pill key={eq} tone="neutral">
                      {eq}
                    </Pill>
                  ))}
                </dd>
              </div>
              {aluno.proximaReavaliacaoEm && (
                <Info
                  icon={<CalendarPlus className={cn("h-4 w-4", reavaliacaoVencida ? "text-warning" : "text-ink-3")} />}
                  label="Reavaliação"
                  value={
                    reavaliacaoVencida
                      ? `vencida (${fmtData(aluno.proximaReavaliacaoEm)})`
                      : `em ${diasAte(aluno.proximaReavaliacaoEm)} dias`
                  }
                />
              )}
            </dl>
            {aluno.observacoes && (
              <p className="mt-3 rounded-xl border border-border bg-surface-soft p-3 text-sm text-ink-2">
                {aluno.observacoes}
              </p>
            )}
          </Card>

          {/* Gate pré-sessão vale para TODO aluno: sem grupo especial, usa o checklist geral */}
          <Card className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Semáforo de Liberação</h2>
              </div>
              <p className="mb-3 text-sm text-ink-2">
                Antes da sessão: libere o treino de hoje em 30 segundos, com o porquê registrado.
              </p>
              {libsDoAluno.length > 0 && (
                <ul className="mb-3 space-y-1.5">
                  {libsDoAluno.map((l) => (
                    <li key={l.id} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          l.resultado === "verde" && "bg-success",
                          l.resultado === "amarelo" && "bg-warning",
                          l.resultado === "vermelho" && "bg-[#ef4444]",
                        )}
                      />
                      <span className="text-ink">
                        {l.resultado === "verde"
                          ? "Liberado"
                          : l.resultado === "amarelo"
                            ? "Liberado com ajuste"
                            : "Não liberado"}
                      </span>
                      <span className="tabular ml-auto text-xs text-ink-3">{fmtData(l.data)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to={`/semaforo?grupo=${aluno.grupoEspecial ?? "geral"}&aluno=${aluno.id}`}
                className={buttonClasses("secondary", "sm")}
              >
                <ShieldCheck className="h-4 w-4" /> Fazer o semáforo de hoje
              </Link>
            </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Prescrições</h2>
              <Link to={`/gps?aluno=${aluno.id}`} className="text-sm font-semibold text-primary hover:underline">
                Nova
              </Link>
            </div>
            {prescs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-sm text-ink-2">Sem prescrição ainda.</p>
                <Link to={`/gps?aluno=${aluno.id}`} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
                  <Navigation className="h-4 w-4" /> Prescrever agora
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {prescs.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-ink">{p.titulo}</span>
                      <Pill tone={p.status === "ativa" ? "success" : "neutral"}>{p.status}</Pill>
                    </div>
                    <div className="tabular mb-2 text-xs text-ink-3">{fmtData(p.data)}</div>
                    <ul className="space-y-1">
                      {p.itens.map((it) => (
                        <li key={it.slug} className="flex items-center justify-between gap-2 text-sm">
                          <Link to={`/movement-lab/${it.slug}`} className="inline-flex min-w-0 items-center gap-1.5 text-ink hover:text-primary">
                            <FlaskConical className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                            <span className="truncate">{nomeEx(it.slug)}</span>
                          </Link>
                          {it.series && <span className="shrink-0 text-xs text-ink-3">{it.series}</span>}
                        </li>
                      ))}
                    </ul>
                    {p.observacoes && <p className="mt-2 text-xs text-ink-2">{p.observacoes}</p>}
                    {p.raciocinio && (
                      <p className="mt-1 text-xs text-ink-3">
                        <span className="font-semibold">Raciocínio: </span>
                        {p.raciocinio}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-2.5">
                      {p.prontuario && (
                        <button
                          onClick={() => setProntuarioDe(p.id)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-analysis hover:underline"
                        >
                          <FileText className="h-4 w-4" /> Ver prontuário ({idDocumento(p.id)})
                        </button>
                      )}
                      {premium ? (
                        <button
                          onClick={() =>
                            p.prontuario
                              ? exportProntuarioPDF({ aluno, presc: p, prontuario: p.prontuario, profissional: profNome, cref, marca: marcaDoUsuario(usuario) })
                              : exportPrescricaoPDF({ aluno, presc: p, profissional: profNome, cref, marca: marcaDoUsuario(usuario) })
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          <FileDown className="h-4 w-4" />
                          {p.prontuario ? "Exportar prontuário assinável" : "Exportar PDF (com sua marca)"}
                        </button>
                      ) : (
                        <Link
                          to="/pricing"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-ink"
                        >
                          <Lock className="h-3.5 w-3.5" /> Exportar PDF para o aluno: plano Profissional
                        </Link>
                      )}
                      {p.status === "ativa" && (
                        <button
                          onClick={() => {
                            archivePrescricao(p.id);
                            toast("Prescrição arquivada");
                          }}
                          className="ml-auto text-sm font-medium text-ink-3 hover:text-ink"
                        >
                          Arquivar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Ação administrativa: excluir (o status ativo/saiu fica em Acompanhamento) */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm">
        <button onClick={() => setConfirmarExclusao(true)} className="font-medium text-[#b91c1c] hover:underline">
          Excluir aluno
        </button>
      </div>

      {editar && (
        <AlunoFormModal
          inicial={aluno}
          onClose={() => setEditar(false)}
          onSave={(a) => {
            updateAluno(aluno.id, a);
            setEditar(false);
            toast(`Dados de ${a.nome} atualizados`);
          }}
        />
      )}

      {confirmarExclusao && (
        <ConfirmarExclusaoModal
          nome={aluno.nome}
          onClose={() => setConfirmarExclusao(false)}
          onConfirm={() => {
            removeAluno(aluno.id);
            toast(`${aluno.nome} excluído(a)`);
            navigate("/alunos");
          }}
        />
      )}

      {avaliar && (
        <AvaliacaoModal
          onClose={() => setAvaliar(false)}
          onSave={(av) => {
            addAvaliacao(av);
            setAvaliar(false);
            toast(`Avaliação registrada para ${aluno.nome}`);
          }}
          alunoId={aluno.id}
          anterior={avalsDesc[0]}
        />
      )}

      {prescAberta?.prontuario && (
        <ProntuarioView
          prontuario={prescAberta.prontuario}
          titulo={prescAberta.titulo}
          docId={idDocumento(prescAberta.id)}
          onExportar={() =>
            exportProntuarioPDF({
              aluno,
              presc: prescAberta,
              prontuario: prescAberta.prontuario!,
              profissional: profNome,
              cref,
              marca: marcaDoUsuario(usuario),
            })
          }
          podeExportar={premium}
          onClose={() => setProntuarioDe(null)}
        />
      )}
    </div>
  );
}

/** Exclusão é irreversível (apaga avaliações, prescrições e liberações): confirma antes. */
function ConfirmarExclusaoModal({
  nome,
  onClose,
  onConfirm,
}: {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Excluir ${nome}`}
        className="w-full max-w-sm rounded-card bg-surface p-6 text-center shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-ink">Excluir {nome}?</h2>
        <p className="mt-2 text-sm text-ink-2">
          Isso apaga o aluno com todas as avaliações, prescrições e liberações registradas. Esta ação
          não pode ser desfeita. Se quiser só tirar da lista ativa, prefira arquivar.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-[#b91c1c] px-4 text-sm font-semibold text-white hover:bg-[#991b1b]"
          >
            Excluir definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

function JornadaCard({ aluno, onFase }: { aluno: Aluno; onFase: (n: 1 | 2 | 3 | 4) => void }) {
  const unlocked = isPremiumUnlocked(useUser((s) => s.plan));
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;

  if (!grupo) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Jornada de Prescrição</div>
          <p className="text-sm text-ink-2">
            Associe um grupo especial para guiar modalidades, parâmetros e progressão deste aluno.
          </p>
        </div>
        <Link to="/special-groups" className={buttonClasses("secondary", "sm")}>
          Escolher grupo <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  if (grupo.premium && !unlocked) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1e6] text-[color:var(--cta-text)]">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Jornada de Prescrição · {grupo.nome}</div>
          <p className="text-sm text-ink-2">Este grupo faz parte do plano Profissional. Assine para ver a jornada.</p>
        </div>
        <Link to="/pricing" className={buttonClasses("primary", "sm")}>
          Assinar
        </Link>
      </Card>
    );
  }

  // Modalidades/parâmetros seguem a FASE selecionada (evita dessincronizar ao trocar de fase).
  const fase = (Math.min(4, Math.max(1, aluno.faseJornada ?? 1))) as 1 | 2 | 3 | 4;
  const faseObj = grupo.fases[fase - 1] ?? grupo.fases[0];
  const modalidades = faseObj.modalidades;
  const parametros = faseObj.parametros;

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
            <RouteIcon className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Jornada de Prescrição</h2>
        </div>
        <Link to={`/special-groups/${grupo.slug}`} className="text-sm font-semibold text-primary hover:underline">
          Ver jornada completa
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <RotuloJ>Grupo especial</RotuloJ>
            <div className="font-semibold text-ink">{grupo.nome}</div>
          </div>
          <div>
            <RotuloJ>Fase atual</RotuloJ>
            <div className="mb-2 flex gap-1.5">
              {([1, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => onFase(n)}
                  aria-label={`Definir fase ${n}`}
                  className={cn(
                    // 44px: acionado com o celular na mão, ao lado do aluno
                    "h-11 w-11 rounded-full text-sm font-bold transition-colors",
                    n === fase ? "gradient-brand text-white" : "bg-surface-soft text-ink-2 hover:bg-primary-tint",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold text-ink">{faseObj.nome}</div>
            <p className="text-sm text-ink-2">{faseObj.objetivo}</p>
          </div>
          <div>
            <RotuloJ>Modalidades recomendadas</RotuloJ>
            <ModalidadePills ids={modalidades} />
          </div>
          <div>
            <RotuloJ>Parâmetros a acompanhar</RotuloJ>
            <ParametroPills ids={parametros} />
          </div>
        </div>

        <div className="space-y-3">
          <CriteriosLista titulo="Próximos critérios para avançar" itens={faseObj.criteriosAvancar} tipo="avancar" />
          <div className="rounded-xl border border-warning/30 bg-[#fef4e2]/40 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-warning">Cautelas</div>
            <ul className="space-y-1">
              {grupo.riscosCautelas.slice(0, 3).map((c) => (
                <li key={c} className="flex gap-2 text-sm text-ink-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <Link to={`/gps?aluno=${aluno.id}`} className={cn(buttonClasses("primary"), "w-full")}>
            <Navigation className="h-4 w-4" /> Prescrever para esta fase
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RotuloJ({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">{children}</div>;
}

/** Acompanhamento do vínculo: tempo de cadastro (dias→meses), tempo no nível,
 *  status ativo/saiu e a SUGESTÃO de avançar de nível (progressão é manual). */
function AcompanhamentoCard({ aluno, onUpdate }: { aluno: Aluno; onUpdate: (patch: Partial<Aluno>) => void }) {
  const navigate = useNavigate();
  const cadastro = tempoDesde(aluno.criadoEm);
  const noNivel = tempoDesde(aluno.nivelDesde ?? aluno.criadoEm);
  const ativo = aluno.status === "ativo";
  const sug = ativo ? sugestaoProgressao(aluno) : null;

  const toggleStatus = () => {
    onUpdate({ status: ativo ? "inativo" : "ativo" });
    toast(ativo ? `${aluno.nome} marcado(a) como saiu` : `${aluno.nome} reativado(a)`);
  };
  const avancar = () => {
    if (!sug) return;
    onUpdate({ nivel: sug.proximo, nivelDesde: Date.now() });
    toast(`${aluno.nome} avançou para ${sug.proximo}. Revise a prescrição.`);
  };

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
          <CalendarClock className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-ink">Acompanhamento</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat icon={<CalendarClock className="h-4 w-4" />} rotulo="Tempo de cadastro" valor={cadastro.texto} />
        <MiniStat icon={<TrendingUp className="h-4 w-4" />} rotulo={`No nível ${aluno.nivel}`} valor={noNivel.texto} />
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", ativo ? "bg-[#e7f8ee] text-success" : "bg-surface-soft text-ink-3")}>
            {ativo ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <div className="text-xs text-ink-3">Situação</div>
            <div className="font-semibold text-ink">{ativo ? "Ativo" : "Saiu / inativo"}</div>
          </div>
        </div>
      </div>

      {/* Sugestão de progressão de nível (o profissional decide) */}
      {sug && (
        <Card tone="primary" className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-ink">
              <span className="font-semibold">
                {aluno.nome.split(" ")[0]} está há {sug.mesesNoNivel} {sug.mesesNoNivel === 1 ? "mês" : "meses"} como {aluno.nivel}.
              </span>{" "}
              Considere avançar para {sug.proximo} e revisar toda a prescrição. A decisão é sua; avance quando a
              técnica e a resposta ao treino indicarem.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={avancar} className={buttonClasses("primary", "sm")}>
              Avançar para {sug.proximo}
            </button>
          </div>
        </Card>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={toggleStatus} className={buttonClasses("secondary", "sm")}>
          {ativo ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          {ativo ? "Marcar que o aluno saiu" : "Reativar aluno"}
        </button>
        {sug && (
          <button onClick={() => navigate(`/gps?aluno=${aluno.id}`)} className={buttonClasses("ghost", "sm")}>
            <Navigation className="h-4 w-4" /> Revisar prescrição
          </button>
        )}
      </div>
    </Card>
  );
}

function MiniStat({ icon, rotulo, valor }: { icon: React.ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-ink-3">{rotulo}</div>
        <div className="font-semibold text-ink">{valor}</div>
      </div>
    </div>
  );
}

function Medida({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-ink-2">
      {label}: <span className="font-semibold text-ink">{value}</span>
    </span>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-ink-3">
        {icon} {label}
      </dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

const METRICAS_EVOLUCAO: { key: string; label: string; unit: string }[] = [
  { key: "peso", label: "Peso", unit: "kg" },
  { key: "percentualGordura", label: "% gordura", unit: "%" },
  { key: "cintura", label: "Cintura", unit: "cm" },
  { key: "quadril", label: "Quadril", unit: "cm" },
  { key: "massaMuscular", label: "Massa muscular", unit: "kg" },
  { key: "imc", label: "IMC", unit: "" },
  { key: "fcRepouso", label: "FC repouso", unit: "bpm" },
  { key: "pressaoSistolica", label: "PA sistólica", unit: "mmHg" },
];

function Evolucao({ avals }: { avals: Avaliacao[] }) {
  const metrics = METRICAS_EVOLUCAO;
  const disponiveis = metrics.filter((m) => avals.some((a) => a.medidas[m.key] != null));
  const [metric, setMetric] = React.useState(disponiveis[0]?.key ?? "peso");

  if (avals.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-2">Registre avaliações para ver a evolução.</p>;
  }

  const cfg = metrics.find((m) => m.key === metric) ?? metrics[0];
  const serie = avals.map((a) => a.medidas[cfg.key]).filter((v): v is number => v != null);
  const primeiro = serie[0];
  const ultimo = serie[serie.length - 1];
  const delta = ultimo != null && primeiro != null ? +(ultimo - primeiro).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {disponiveis.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                metric === m.key ? "bg-primary-tint text-primary" : "text-ink-2 hover:bg-surface-soft",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {serie.length >= 2 && (
          <span className="text-sm text-ink-2">
            {cfg.label}: {ultimo}
            {cfg.unit} ·{" "}
            <span className={cn("font-semibold", delta <= 0 ? "text-success" : "text-[color:var(--cta-text)]")}>
              {delta > 0 ? "+" : ""}
              {delta}
              {cfg.unit}
            </span>{" "}
            no período
          </span>
        )}
      </div>
      {serie.length < 2 ? (
        <p className="py-4 text-center text-sm text-ink-3">Ao menos duas avaliações para traçar a curva.</p>
      ) : (
        <MiniLine values={serie} />
      )}
    </div>
  );
}

function MiniLine({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coord = (v: number, i: number) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 40 - ((v - min) / range) * 34 - 3;
    return { x, y };
  };
  const pts = values.map((v, i) => {
    const c = coord(v, i);
    return `${c.x},${c.y}`;
  });
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-28 w-full">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {values.map((v, i) => {
        const c = coord(v, i);
        return <circle key={i} cx={c.x} cy={c.y} r={3} fill="var(--primary)" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}
