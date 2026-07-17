import * as React from "react";
import { Link } from "react-router-dom";
import { X, GraduationCap, CheckCircle2, CalendarRange } from "lucide-react";
import { buttonClasses, Card } from "@/components/ui/primitives";
import { useDialog } from "@/lib/useDialog";
import { useAlunos } from "@/lib/store";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useAprender } from "../store";
import { MODELOS_PERIODIZACAO } from "@/data/periodizacao";

/**
 * Ponte Aprender → Atender: aplicar um conhecimento como justificativa em uma
 * prescrição de um aluno. Nesta etapa o vínculo é salvo localmente (aplicações do
 * Aprender); a gravação direta na prescrição chega com a integração completa.
 */
export function ApplyDrawer({
  lessonId,
  lessonSlug,
  lessonTitle,
  defaultSummary,
  onClose,
}: {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  defaultSummary: string;
  onClose: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const { alunos, prescricoes } = useAlunos();
  const addApplication = useAprender((s) => s.addApplication);
  const ativos = alunos.filter((a) => a.status === "ativo");

  const [alunoId, setAlunoId] = React.useState("");
  const [prescricaoId, setPrescricaoId] = React.useState("");
  const [justification, setJustification] = React.useState(defaultSummary);
  const [salvo, setSalvo] = React.useState(false);

  const prescsDoAluno = prescricoes.filter((p) => p.alunoId === alunoId);
  const aluno = alunos.find((a) => a.id === alunoId);

  // A ponte de volta ao Atender existe pelo próprio link que o modelo declara para a aula,
  // e não por uma segunda lista de slugs que sairia do ar em silêncio. É o SLUG que casa
  // com o href; `lesson.id` vem prefixado com "l-" e nunca casaria.
  const modeloDaAula = MODELOS_PERIODIZACAO.find((m) => m.aprenderHref?.endsWith(`/${lessonSlug}`));

  const confirmar = () => {
    if (!justification.trim()) return;
    addApplication({
      lessonId,
      lessonTitle,
      studentId: alunoId || undefined,
      studentName: aluno?.nome,
      prescriptionId: prescricaoId || undefined,
      justification: justification.trim(),
    });
    toast(aluno ? `Justificativa vinculada a ${aluno.nome}` : "Justificativa salva");
    setSalvo(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Aplicar no atendimento"
        className="flex h-full w-full max-w-md flex-col overflow-hidden bg-surface shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <GraduationCap className="h-3.5 w-3.5" /> Aprender no atendimento
            </div>
            <h2 className="font-display text-lg font-bold text-ink">Aplicar em uma prescrição</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        {salvo ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <h3 className="font-display text-lg font-bold text-ink">Justificativa registrada</h3>
            <p className="max-w-xs text-sm text-ink-2">
              O vínculo ficou salvo nas suas aplicações. Você encontra em Salvos e no perfil do aluno quando a
              integração completa estiver ativa.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {/* Aula de um modelo de periodização: o caminho natural depois de estudar o
                  modelo é montar um plano com ele. O motor aceita a escolha e mostra, no
                  raciocínio, o que ele sugeriria para o caso. */}
              {modeloDaAula && aluno && (
                <Link
                  to={`/prescrever-treino?aluno=${aluno.id}&modelo=${modeloDaAula.id}`}
                  className={buttonClasses("primary", "sm")}
                >
                  <CalendarRange className="h-4 w-4" /> Montar plano com {modeloDaAula.nome.toLowerCase()}
                </Link>
              )}
              {aluno && (
                <Link to={`/alunos/${aluno.id}`} className={buttonClasses("secondary", "sm")}>
                  Abrir perfil do aluno
                </Link>
              )}
              <button onClick={onClose} className={buttonClasses(modeloDaAula && aluno ? "ghost" : "primary", "sm")}>
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
              <div className="rounded-xl bg-surface-soft p-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Conteúdo</div>
                <div className="font-semibold text-ink">{lessonTitle}</div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Aluno</span>
                {ativos.length === 0 ? (
                  <Card className="p-4 text-center text-sm text-ink-2">
                    Nenhum aluno ativo.
                    <Link to="/alunos?novo=1" className={cn(buttonClasses("primary", "sm"), "mt-2")}>
                      Cadastrar aluno
                    </Link>
                  </Card>
                ) : (
                  <select
                    value={alunoId}
                    onChange={(e) => {
                      setAlunoId(e.target.value);
                      setPrescricaoId("");
                    }}
                    className="input"
                  >
                    <option value="">Selecione um aluno (opcional)</option>
                    {ativos.map((a) => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                )}
              </label>

              {alunoId && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Prescrição</span>
                  <select value={prescricaoId} onChange={(e) => setPrescricaoId(e.target.value)} className="input">
                    <option value="">Vincular ao aluno (sem prescrição específica)</option>
                    {prescsDoAluno.map((p) => (
                      <option key={p.id} value={p.id}>{p.titulo}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Justificativa</span>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={5}
                  className="input"
                  placeholder="Como este conhecimento embasa a decisão para este aluno."
                />
                <span className="mt-1 block text-xs text-ink-3">
                  Edite livremente. Fica registrada como apoio à sua decisão, sem substituir avaliação individual.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
                Cancelar
              </button>
              <button
                onClick={confirmar}
                disabled={!justification.trim()}
                className={cn(buttonClasses("primary", "sm"), !justification.trim() && "cursor-not-allowed opacity-50")}
              >
                Confirmar aplicação
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
