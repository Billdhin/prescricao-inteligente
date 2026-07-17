import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TrafficCone, CalendarRange } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { SemaforoLiberacao } from "@/components/rcd/SemaforoLiberacao";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { getSemaforo } from "@/data/semaforo";
import { useAlunos, useUser, isPremiumUnlocked } from "@/lib/store";
import { semanaAtual, mesocicloAtual } from "@/data/periodizacao";

/**
 * /semaforo — gate de segurança pré-sessão (Motor RCD), acessível direto:
 * escolha o grupo (e opcionalmente o aluno) e responda em ~30s.
 */
export function Semaforo() {
  const [params] = useSearchParams();
  const { plan } = useUser();
  const unlocked = isPremiumUnlocked(plan);
  const alunos = useAlunos((s) => s.alunos);
  const planos = useAlunos((s) => s.planos);

  const [grupoSlug, setGrupoSlug] = React.useState(() => {
    const g = params.get("grupo");
    // Aceita qualquer condição existente, não só as que têm checklist próprio:
    // sem gate específico o componente aplica o geral e avisa.
    return g && getSpecialGroup(g) ? g : "geral";
  });
  const [alunoId, setAlunoId] = React.useState(() => params.get("aluno") ?? "");
  const fase = Number(params.get("fase")) || undefined;

  // Escolher o aluno herda o grupo DELE (checklist certo sem retrabalho);
  // sem grupo especial, vale o checklist geral.
  const onAluno = (id: string) => {
    setAlunoId(id);
    const a = alunos.find((x) => x.id === id);
    if (a) setGrupoSlug(a.grupoEspecial && getSpecialGroup(a.grupoEspecial) ? a.grupoEspecial : "geral");
  };

  const grupo = getSpecialGroup(grupoSlug);
  const aluno = alunoId ? alunos.find((a) => a.id === alunoId) : undefined;
  const locked = !!grupo?.premium && !unlocked;
  const planoAtivo = aluno ? planos.find((p) => p.alunoId === aluno.id && p.status === "ativo") : undefined;
  const mesoHoje = planoAtivo ? mesocicloAtual(planoAtivo) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Pill tone="primary" icon={<TrafficCone className="h-3 w-3" />} className="mb-3">
          Gate pré-sessão
        </Pill>
        <h1 className="font-display text-3xl font-bold text-ink">Semáforo de Liberação</h1>
        <p className="mt-2 max-w-2xl text-ink-2">
          Antes de começar a sessão, saiba em 30 segundos se pode liberar o treino daquele aluno
          hoje, e por quê. O resultado fica registrado e entra no prontuário.
        </p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Grupo / condição</span>
            <select value={grupoSlug} onChange={(e) => setGrupoSlug(e.target.value)} className="input">
              <option value="geral">Sem condição especial (checklist geral)</option>
              {/* Todas as condições aparecem. Antes, as que não tinham checklist próprio
                  eram filtradas fora e não havia caminho para fazer o semáforo de uma
                  gestante. As sem gate próprio caem no checklist geral, e o card diz isso. */}
              {specialGroups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.nome}
                  {g.premium && !unlocked ? " (Premium)" : ""}
                  {getSemaforo(g.slug) ? "" : " (checklist geral)"}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Aluno (opcional)</span>
            <select value={alunoId} onChange={(e) => onAluno(e.target.value)} className="input">
              <option value="">Sem aluno vinculado</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {/* O semáforo decide a sessão de HOJE. Quando o aluno tem plano, a sessão de hoje
          tem um lugar no plano, e decidir sem ver esse lugar é decidir no escuro. */}
      {planoAtivo && (
        <Card variant="soft" className="flex flex-wrap items-center gap-3 p-4">
          <CalendarRange className="h-5 w-5 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">
              {aluno?.nome.split(" ")[0]} está na semana {semanaAtual(planoAtivo)} de {planoAtivo.semanas} do plano
            </span>
            {mesoHoje && (
              <>
                {" "}
                ({mesoHoje.nome}: {mesoHoje.foco.toLowerCase().replace(/\.$/, "")})
              </>
            )}
            . Se o semáforo pedir ajuste hoje, ajuste a sessão e mantenha o plano.
          </p>
          <Link to={`/prescrever-treino?plano=${planoAtivo.id}`} className={buttonClasses("secondary", "sm")}>
            Abrir o plano
          </Link>
        </Card>
      )}

      {locked ? (
        <PaywallCard
          titulo={`O semáforo de ${grupo?.nome} é do plano Profissional`}
          descricao="No plano gratuito você usa o Semáforo de Liberação para obesidade grave e hipertensão. Assine para liberar todos os grupos e o Prontuário de Decisão exportável."
        />
      ) : (
        <SemaforoLiberacao grupoSlug={grupoSlug} alunoId={aluno?.id} alunoNome={aluno?.nome} fase={fase} />
      )}
    </div>
  );
}
