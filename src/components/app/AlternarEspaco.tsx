/**
 * A MESMA CONTA, DOIS ESPAÇOS: atender alunos e ver o próprio treino.
 *
 * O buraco que isto fecha: uma pessoa cadastrada como aluno não tinha caminho nenhum para
 * passar a atender. E "migrar de aluno para profissional" seria a solução errada, porque as
 * duas coisas não são estados do mesmo eixo, são relações diferentes:
 *
 *   ser aluno de alguém = existe uma ficha em que a conta é o aluno
 *   atender alunos      = existem fichas em que a conta é quem prescreve
 *
 * A mesma pessoa pode ter as duas ao mesmo tempo, e na Educação Física isso é a regra, não a
 * exceção: quem treina gente também treina com alguém. Migrar destruiria um vínculo para
 * criar o outro; alternar mantém os dois (ver alternarEspaco em cloudAuth).
 *
 * Por isso o texto aqui evita a palavra "migrar" e evita "perfil"/"papel". Ele fala do que a
 * pessoa vai FAZER, e diz na mesma frase que a volta existe, porque a dúvida de quem lê é
 * sempre "vou perder o meu treino?".
 */
import * as React from "react";
import { ChevronRight, Users, Dumbbell } from "lucide-react";
import { useCloudAuth, alternarEspaco } from "@/lib/backend/cloudAuth";
import { cn } from "@/lib/utils";
import { toastFalha } from "@/lib/toast";

export function AlternarEspaco({ className }: { className?: string }) {
  const { role, temVinculoDeAluno, configured, status } = useCloudAuth();
  const [indo, setIndo] = React.useState(false);

  // Sem nuvem não existe conta, e sem conta não existe espaço a alternar. O app 100% local
  // segue exatamente como era.
  if (!configured || status !== "signed-in" || !role) return null;

  // Quem está no espaço do aluno sempre pode abrir o seu; quem está atendendo só volta para
  // "meu treino" se alguém de fato o atende.
  const destino = role === "aluno" ? "profissional" : "aluno";
  if (destino === "aluno" && !temVinculoDeAluno) return null;

  const ir = async () => {
    setIndo(true);
    try {
      await alternarEspaco(destino);
    } catch {
      toastFalha("Não consegui trocar agora. Tente de novo em instantes.");
    } finally {
      setIndo(false);
    }
  };

  const paraProfissional = destino === "profissional";
  const Icone = paraProfissional ? Users : Dumbbell;
  const titulo = paraProfissional ? "Atender meus próprios alunos" : "Ver o meu treino";
  // A segunda linha responde a dúvida que a primeira levanta, em vez de repetir o título.
  const explicacao = paraProfissional
    ? "Abre o seu espaço de trabalho, com a sua carteira. O seu treino continua aqui, e você volta quando quiser."
    : "Volta para o treino que prescrevem para você. A sua carteira de alunos continua intacta.";

  return (
    <button
      type="button"
      onClick={ir}
      disabled={indo}
      className={cn(
        "flex min-h-[64px] w-full items-center gap-3 rounded-card border border-border bg-surface p-3.5 text-left transition-colors hover:bg-surface-soft disabled:opacity-60",
        className,
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-surface-soft text-ink-2">
        <Icone className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{indo ? "Trocando…" : titulo}</span>
        <span className="block text-xs text-ink-2">{explicacao}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden />
    </button>
  );
}
