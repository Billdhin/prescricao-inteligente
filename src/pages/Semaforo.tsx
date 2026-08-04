import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TrafficCone, ShieldCheck, ArrowRight, Users, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, SectionHeader, Pill, buttonClasses, type PillTone } from "@/components/ui/primitives";
import { SemaforoLiberacao } from "@/components/rcd/SemaforoLiberacao";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { useAlunos, useUser, isPremiumUnlocked } from "@/lib/store";
import { estadoSemaforo, type EstadoSemaforo } from "@/lib/gps/semaforoDiario";

/**
 * /semaforo é o "Semáforo do dia": o painel operacional da carteira. Quem já fez o
 * semáforo hoje, quem segue com pendência (vermelho não reaberto) e quem falta,
 * com 1 clique para a aba Semáforo do aluno. O caminho POR ALUNO é a lista; o
 * fluxo AVULSO (sem aluno, por grupo) fica embaixo, para uma liberação rápida que
 * não pertence a ninguém da carteira.
 */

const fmtDDMM = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

/** Vocabulário e tom únicos do resultado (mesmos de src/data/semaforo.ts). */
const ROTULO_RESULTADO: Record<"verde" | "amarelo" | "vermelho", string> = {
  verde: "Liberado",
  amarelo: "Liberado com ajuste",
  vermelho: "Não liberado hoje",
};
const TONE_RESULTADO: Record<"verde" | "amarelo" | "vermelho", PillTone> = {
  verde: "success",
  amarelo: "warning",
  vermelho: "danger",
};

export function Semaforo() {
  const [params] = useSearchParams();
  const alunos = useAlunos((s) => s.alunos);
  const liberacoes = useAlunos((s) => s.liberacoes);
  const { plan } = useUser();
  const unlocked = isPremiumUnlocked(plan);

  const ativos = alunos.filter((a) => a.status === "ativo");
  // Estado de HOJE de cada aluno ativo, da fonte única. Vermelho pendente (de
  // qualquer dia) sobe para o topo: é a pendência que reabre a sessão.
  const linhas = ativos
    .map((a) => ({ aluno: a, estado: estadoSemaforo(a.id, liberacoes) }))
    .sort((x, y) => Number(!!y.estado.vermelhoPendente) - Number(!!x.estado.vermelhoPendente));
  // Falta liberar = sem registro de hoje, ou com um "não liberado" ainda aberto.
  const faltam = linhas.filter((l) => !l.estado.hoje || l.estado.vermelhoPendente).length;

  // Avulso (sem aluno): mantém só o seletor de GRUPO. O caminho por aluno agora é a
  // lista acima, então o seletor de aluno saiu daqui. Aceita ?grupo e ?fase para os
  // atalhos que ainda caem no semáforo avulso (ex.: prescrição sem aluno).
  const [grupoSlug, setGrupoSlug] = React.useState(() => {
    const g = params.get("grupo");
    return g && getSpecialGroup(g) ? g : "geral";
  });
  const fase = Number(params.get("fase")) || undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionHeader
        eyebrow="Rotina do dia"
        icon={<TrafficCone className="h-3 w-3" />}
        title="Semáforo do dia"
        subtitle="Quem já foi liberado hoje e quem falta."
        right={
          faltam > 0 ? (
            <span className="tabular rounded-full bg-warning-tint px-3 py-1.5 text-sm font-bold text-warning">
              {faltam} para liberar
            </span>
          ) : ativos.length > 0 ? (
            <span className="rounded-full bg-success-tint px-3 py-1.5 text-sm font-bold text-success">
              Todos liberados
            </span>
          ) : undefined
        }
      />

      {/* Lista dos alunos ativos com o estado de hoje */}
      {ativos.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-tint text-primary">
            <Users className="h-6 w-6" />
          </span>
          <p className="max-w-sm text-sm text-ink-2">
            Você ainda não tem alunos ativos. Cadastre um aluno para fazer o semáforo de liberação
            antes das sessões.
          </p>
          <Link to="/alunos" className={buttonClasses("primary", "sm")}>
            <Users className="h-4 w-4" /> Ir para Alunos
          </Link>
        </Card>
      ) : (
        <Card className="p-2 sm:p-3">
          <ul className="divide-y divide-border">
            {linhas.map(({ aluno, estado }) => {
              const falta = !estado.hoje || !!estado.vermelhoPendente;
              return (
                <li key={aluno.id}>
                  <Link
                    to={`/alunos/${aluno.id}?aba=semaforo`}
                    className="flex items-center gap-3 rounded-card p-3 transition-colors hover:bg-surface-soft"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
                      {aluno.iniciais}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{aluno.nome}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {/* A bolinha do mockup: cheia quando já houve registro,
                            vazada quando ainda falta. Decorativa; o Pill ao lado
                            diz o estado por escrito (nunca só por cor/forma). */}
                        <Marcador estado={estado} />
                        <EstadoHoje estado={estado} />
                      </div>
                    </div>
                    {falta ? (
                      <span className={buttonClasses("secondary", "sm")}>Fazer</span>
                    ) : (
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-2" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Semáforo avulso (sem aluno): recolhido, como o "Liberação avulsa →" do
          mockup. É exceção, não rotina; aberto por padrão competia com a lista. */}
      <details className="group space-y-4 border-t border-border pt-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Liberação avulsa (sem aluno)
          <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden />
        </summary>
        <p className="mt-2 text-sm text-ink-2">
          Uma liberação rápida que não fica no histórico de ninguém. O semáforo de um aluno da carteira se faz no perfil
          dele, pela lista acima.
        </p>

        <Card className="mt-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Grupo / condição</span>
            <select value={grupoSlug} onChange={(e) => setGrupoSlug(e.target.value)} className="input">
              <option value="geral">Sem condição especial (checklist geral)</option>
              {/* Desde a rodada de gates clínicos, TODA condição tem checklist próprio, e
                  `check:semaforo` trava a volta do "cai no geral". O aviso que existia aqui
                  saiu junto com a causa dele. */}
              {specialGroups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.nome}
                  {g.premium && !unlocked ? " (Premium)" : ""}
                </option>
              ))}
            </select>
          </label>
        </Card>

        <div className="mt-4">
          <SemaforoLiberacao grupoSlug={grupoSlug} fase={fase} />
        </div>
      </details>
    </div>
  );
}

/** O ponto que abre a linha no mockup: cheio na cor do resultado quando houve
 *  registro, vazado quando ainda falta. Puramente decorativo. */
function Marcador({ estado }: { estado: EstadoSemaforo }) {
  const cor = estado.vermelhoPendente
    ? "bg-danger-fill"
    : estado.hoje?.resultado === "verde"
      ? "bg-success"
      : estado.hoje?.resultado === "amarelo"
        ? "bg-warning"
        : null;
  return (
    <span
      aria-hidden
      className={
        cor
          ? `h-2 w-2 shrink-0 rounded-full ${cor}`
          : "h-2 w-2 shrink-0 rounded-full ring-1 ring-inset ring-ink-3"
      }
    />
  );
}

/**
 * O estado de HOJE do aluno como um Pill: vermelho pendente (de qualquer dia)
 * primeiro; senão o resultado registrado hoje; senão "Sem semáforo hoje" (neutro).
 */
function EstadoHoje({ estado }: { estado: EstadoSemaforo }) {
  if (estado.vermelhoPendente) {
    return (
      <Pill tone="danger" icon={<XCircle className="h-3 w-3" />}>
        Não liberado em {fmtDDMM(estado.vermelhoPendente.data)}
      </Pill>
    );
  }
  if (estado.hoje) {
    const r = estado.hoje.resultado;
    return (
      <Pill
        tone={TONE_RESULTADO[r]}
        icon={r === "verde" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      >
        {ROTULO_RESULTADO[r]}
      </Pill>
    );
  }
  return <Pill tone="neutral">Sem semáforo hoje</Pill>;
}
