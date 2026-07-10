import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { TrafficCone } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { SemaforoLiberacao } from "@/components/rcd/SemaforoLiberacao";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { getSemaforo } from "@/data/semaforo";
import { useAlunos, useUser, isPremiumUnlocked } from "@/lib/store";

/**
 * /semaforo — gate de segurança pré-sessão (Motor RCD), acessível direto:
 * escolha o grupo (e opcionalmente o aluno) e responda em ~30s.
 */
export function Semaforo() {
  const [params] = useSearchParams();
  const { plan } = useUser();
  const unlocked = isPremiumUnlocked(plan);
  const alunos = useAlunos((s) => s.alunos);

  const [grupoSlug, setGrupoSlug] = React.useState(() => {
    const g = params.get("grupo");
    return g && getSemaforo(g) ? g : "geral";
  });
  const [alunoId, setAlunoId] = React.useState(() => params.get("aluno") ?? "");

  // Escolher o aluno herda o grupo DELE (checklist certo sem retrabalho);
  // sem grupo especial, vale o checklist geral.
  const onAluno = (id: string) => {
    setAlunoId(id);
    const a = alunos.find((x) => x.id === id);
    if (a) setGrupoSlug(a.grupoEspecial && getSemaforo(a.grupoEspecial) ? a.grupoEspecial : "geral");
  };

  const grupo = getSpecialGroup(grupoSlug);
  const aluno = alunoId ? alunos.find((a) => a.id === alunoId) : undefined;
  const locked = !!grupo?.premium && !unlocked;

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
              {specialGroups
                .filter((g) => getSemaforo(g.slug))
                .map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.nome}
                    {g.premium && !unlocked ? " (Premium)" : ""}
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

      {locked ? (
        <PaywallCard
          titulo={`O semáforo de ${grupo?.nome} é do plano Profissional`}
          descricao="No plano gratuito você usa o Semáforo de Liberação para obesidade grave e hipertensão. Assine para liberar todos os grupos e o Prontuário de Decisão exportável."
        />
      ) : (
        <SemaforoLiberacao grupoSlug={grupoSlug} alunoId={aluno?.id} alunoNome={aluno?.nome} />
      )}
    </div>
  );
}
