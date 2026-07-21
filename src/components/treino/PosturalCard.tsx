import * as React from "react";
import { ScanLine, Plus, Trash2, FileDown, X, Camera } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos, useUser, marcaDoUsuario, uid } from "@/lib/store";
import { useDialog } from "@/lib/useDialog";
import type { Aluno } from "@/data/alunos";
import {
  type AvaliacaoPostural,
  type ObservacaoPostural,
  type VistaPostural,
  CHECKPOINTS_POSTURAIS,
  ROTULO_VISTA,
  ehReferencia,
  montarLaudo,
} from "@/data/postural";
import { exportPosturalPDF } from "@/lib/exportPostural";

const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const VISTAS: VistaPostural[] = ["anterior", "lateral", "posterior"];

/** Reduz a imagem antes de guardar (data URL cabe no armazenamento local). */
function lerFotoReduzida(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Rastreio postural (lado do profissional): lista os rastreios do aluno e abre o
 * roteiro de captura. É rastreio VISUAL assistido, não medição por imagem.
 */
export function PosturalCard({ aluno }: { aluno: Aluno }) {
  const posturais = useAlunos((s) => s.posturais);
  const removePostural = useAlunos((s) => s.removePostural);
  const user = useUser();
  const [novo, setNovo] = React.useState(false);

  const doAluno = posturais.filter((p) => p.alunoId === aluno.id).sort((a, b) => b.data - a.data);
  const marca = marcaDoUsuario(user);

  const exportar = (av: AvaliacaoPostural) =>
    exportPosturalPDF({ aluno, avaliacao: av, profissional: user.name, cref: user.cref || undefined, marca });

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-tint text-primary">
            <ScanLine className="h-5 w-5" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Rastreio postural</h2>
        </div>
        <button onClick={() => setNovo(true)} className={buttonClasses("secondary", "sm")}>
          <Plus className="h-4 w-4" /> Novo rastreio
        </button>
      </div>

      <p className="mb-3 text-sm text-ink-2">
        Roteiro visual por vista, com laudo pronto para a sua marca. É apoio ao seu olhar clínico, sem medir ângulos
        por foto nem diagnosticar.
      </p>

      {doAluno.length === 0 ? (
        <p className="text-sm text-ink-3">Nenhum rastreio ainda. Faça o primeiro para registrar a evolução postural.</p>
      ) : (
        <div className="space-y-2">
          {doAluno.map((av) => {
            const desvios = av.observacoes.filter((o) => {
              const cp = CHECKPOINTS_POSTURAIS.find((c) => c.id === o.checkpointId);
              return cp && !ehReferencia(cp, o.achado);
            }).length;
            return (
              <div key={av.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink">{fmt(av.data)}</div>
                  <div className="mt-0.5">
                    <Pill tone={desvios > 0 ? "warning" : "success"}>
                      {desvios > 0 ? `${desvios} achado${desvios > 1 ? "s" : ""} a observar` : "Sem achados"}
                    </Pill>
                  </div>
                </div>
                <button onClick={() => exportar(av)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-soft">
                  <FileDown className="h-4 w-4" /> Laudo
                </button>
                <button onClick={() => removePostural(av.id)} aria-label="Excluir rastreio" className="rounded-md p-2 text-ink-3 hover:bg-surface-soft hover:text-cta">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {novo && <PosturalModal aluno={aluno} onClose={() => setNovo(false)} onSaved={() => setNovo(false)} />}
    </Card>
  );
}

function PosturalModal({ aluno, onClose, onSaved }: { aluno: Aluno; onClose: () => void; onSaved: () => void }) {
  const addPostural = useAlunos((s) => s.addPostural);
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const [fotos, setFotos] = React.useState<Partial<Record<VistaPostural, string>>>({});
  const [achados, setAchados] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(CHECKPOINTS_POSTURAIS.map((c) => [c.id, c.opcoes[0]])),
  );
  const [notas, setNotas] = React.useState<Record<string, string>>({});
  const [laudoEditado, setLaudoEditado] = React.useState<string | null>(null);

  const observacoes: ObservacaoPostural[] = CHECKPOINTS_POSTURAIS.map((c) => ({
    checkpointId: c.id,
    achado: achados[c.id],
    nota: notas[c.id]?.trim() || undefined,
  }));
  const previa: AvaliacaoPostural = { id: "previa", alunoId: aluno.id, data: Date.now(), fotos, observacoes };
  const laudoAuto = montarLaudo(previa, aluno.nome);
  const laudo = laudoEditado ?? laudoAuto;

  const escolherFoto = async (v: VistaPostural, file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await lerFotoReduzida(file);
      setFotos((f) => ({ ...f, [v]: dataUrl }));
    } catch {
      /* imagem inválida: ignora silenciosamente */
    }
  };

  const salvar = () => {
    addPostural({
      id: uid(),
      alunoId: aluno.id,
      data: Date.now(),
      fotos: Object.keys(fotos).length ? fotos : undefined,
      observacoes,
      resumo: laudoEditado ?? laudoAuto,
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Novo rastreio postural"
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Novo rastreio postural</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          {VISTAS.map((v) => (
            <section key={v}>
              <h3 className="mb-2 font-display text-sm font-bold text-ink">{ROTULO_VISTA[v]}</h3>

              <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface-soft px-3 py-2 text-sm text-ink-2 hover:bg-surface">
                <Camera className="h-4 w-4 text-ink-3" />
                {fotos[v] ? "Trocar foto" : "Adicionar foto (opcional)"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => escolherFoto(v, e.target.files?.[0])}
                />
                {fotos[v] && <img src={fotos[v]} alt="" className="ml-auto h-10 w-10 rounded object-cover" />}
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                {CHECKPOINTS_POSTURAIS.filter((c) => c.vista === v).map((c) => (
                  <label key={c.id} className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink-2">{c.regiao}</span>
                    <select
                      value={achados[c.id]}
                      onChange={(e) => {
                        setAchados((a) => ({ ...a, [c.id]: e.target.value }));
                        setLaudoEditado(null);
                      }}
                      className="input"
                    >
                      {c.opcoes.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h3 className="mb-2 font-display text-sm font-bold text-ink">Rascunho do laudo</h3>
            <p className="mb-2 text-xs text-ink-3">Gerado a partir dos achados. Ajuste o texto antes de salvar, se quiser.</p>
            <textarea
              value={laudo}
              onChange={(e) => setLaudoEditado(e.target.value)}
              rows={6}
              className="input font-mono text-xs leading-relaxed"
            />
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button onClick={salvar} className={buttonClasses("primary", "sm")}>
            Salvar rastreio
          </button>
        </div>
      </div>
    </div>
  );
}
