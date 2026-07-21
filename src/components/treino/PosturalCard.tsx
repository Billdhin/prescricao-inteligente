import * as React from "react";
import { ScanLine, Plus, Trash2, FileDown, X, Camera, Sparkles, Loader2 } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos, useUser, marcaDoUsuario, uid } from "@/lib/store";
import { useDialog } from "@/lib/useDialog";
import type { Aluno } from "@/data/alunos";
import {
  type AvaliacaoPostural,
  type ObservacaoPostural,
  type VistaPostural,
  type AnalisePosturalVista,
  CHECKPOINTS_POSTURAIS,
  ROTULO_VISTA,
  ehReferencia,
  montarLaudo,
} from "@/data/postural";
import { exportPosturalPDF } from "@/lib/exportPostural";
import type { Marco } from "@/lib/postura/vision";
import type { MedidaPostural } from "@/lib/postura/metrics";
import { PosturalAnalyzer } from "@/components/treino/PosturalAnalyzer";

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
        resolve(canvas.toDataURL("image/jpeg", 0.75));
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
 * fluxo inteligente (detecção de pose no navegador + ajuste manual + laudo).
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
          <h2 className="font-display text-lg font-bold text-ink">Avaliação postural</h2>
        </div>
        <button onClick={() => setNovo(true)} className={buttonClasses("secondary", "sm")}>
          <Plus className="h-4 w-4" /> Nova avaliação
        </button>
      </div>

      <p className="mb-3 text-sm text-ink-2">
        A foto é analisada por visão computacional no seu próprio dispositivo: o modelo acha os pontos do corpo, mede
        os ângulos e você ajusta o que quiser. A foto não sai daqui. É apoio ao seu olhar, não diagnóstico nem medição
        clínica de precisão.
      </p>

      {doAluno.length === 0 ? (
        <p className="text-sm text-ink-3">Nenhuma avaliação ainda. Faça a primeira para registrar a evolução postural.</p>
      ) : (
        <div className="space-y-2">
          {doAluno.map((av) => {
            const desvios = av.observacoes.filter((o) => {
              const cp = CHECKPOINTS_POSTURAIS.find((c) => c.id === o.checkpointId);
              return cp && !ehReferencia(cp, o.achado);
            }).length;
            const comIA = av.analises && Object.keys(av.analises).length > 0;
            return (
              <div key={av.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink">{fmt(av.data)}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    <Pill tone={desvios > 0 ? "warning" : "success"}>
                      {desvios > 0 ? `${desvios} achado${desvios > 1 ? "s" : ""} a observar` : "Sem achados"}
                    </Pill>
                    {comIA && <Pill tone="analysis">Com análise</Pill>}
                  </div>
                </div>
                <button onClick={() => exportar(av)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-soft">
                  <FileDown className="h-4 w-4" /> Laudo
                </button>
                <button onClick={() => removePostural(av.id)} aria-label="Excluir avaliação" className="rounded-md p-2 text-ink-3 hover:bg-surface-soft hover:text-cta">
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

type MarcosPorVista = Partial<Record<VistaPostural, Marco[]>>;
type MedidasPorVista = Partial<Record<VistaPostural, MedidaPostural[]>>;

function PosturalModal({ aluno, onClose, onSaved }: { aluno: Aluno; onClose: () => void; onSaved: () => void }) {
  const addPostural = useAlunos((s) => s.addPostural);
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const [fotos, setFotos] = React.useState<Partial<Record<VistaPostural, string>>>({});
  const [marcos, setMarcos] = React.useState<MarcosPorVista>({});
  const [medidas, setMedidas] = React.useState<MedidasPorVista>({});
  const [analisando, setAnalisando] = React.useState<VistaPostural | null>(null);
  const [erro, setErro] = React.useState<Partial<Record<VistaPostural, string>>>({});
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
  const analises: Partial<Record<VistaPostural, AnalisePosturalVista>> = {};
  for (const v of VISTAS) {
    if (marcos[v]) {
      analises[v] = {
        marcos: marcos[v]!.map((k) => ({ nome: k.nome, x: k.x, y: k.y, score: k.score })),
        medidas: (medidas[v] ?? []).map((m) => ({
          checkpointId: m.checkpointId,
          rotulo: m.rotulo,
          valor: m.valor,
          classificacao: m.classificacao,
          confianca: m.confianca,
        })),
      };
    }
  }
  const previa: AvaliacaoPostural = { id: "previa", alunoId: aluno.id, data: Date.now(), fotos, observacoes, analises };
  const laudoAuto = montarLaudo(previa, aluno.nome);
  const laudo = laudoEditado ?? laudoAuto;

  const escolherFoto = async (v: VistaPostural, file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await lerFotoReduzida(file);
      setFotos((f) => ({ ...f, [v]: dataUrl }));
      setMarcos((m) => ({ ...m, [v]: undefined }));
      setErro((e) => ({ ...e, [v]: undefined }));
    } catch {
      /* imagem inválida: ignora */
    }
  };

  const analisar = async (v: VistaPostural) => {
    const foto = fotos[v];
    if (!foto) return;
    setAnalisando(v);
    setErro((e) => ({ ...e, [v]: undefined }));
    try {
      const { detectarPose, carregarImagem } = await import("@/lib/postura/vision");
      const img = await carregarImagem(foto);
      const detec = await detectarPose(img);
      setMarcos((m) => ({ ...m, [v]: detec }));
      setLaudoEditado(null);
    } catch (e) {
      setErro((er) => ({ ...er, [v]: (e as Error)?.message ?? "Não consegui analisar. Ajuste manualmente." }));
    } finally {
      setAnalisando(null);
    }
  };

  // Handlers estáveis por vista (evitam loop de efeito no analisador).
  const onMarcosDe = React.useCallback(
    (v: VistaPostural) => (novos: Marco[]) => setMarcos((m) => ({ ...m, [v]: novos })),
    [],
  );
  const onMedidasDe = React.useCallback(
    (v: VistaPostural) => (novas: MedidaPostural[]) => {
      setMedidas((md) => ({ ...md, [v]: novas }));
      // pré-preenche os pontos cobertos pela análise (só os confiáveis); o
      // profissional ainda pode sobrepor no seletor abaixo.
      setAchados((a) => {
        const next = { ...a };
        for (const med of novas) if (med.classificacao) next[med.checkpointId] = med.classificacao;
        return next;
      });
      setLaudoEditado(null);
    },
    [],
  );

  const salvar = () => {
    addPostural({
      id: uid(),
      alunoId: aluno.id,
      data: Date.now(),
      fotos: Object.keys(fotos).length ? fotos : undefined,
      observacoes,
      analises: Object.keys(analises).length ? analises : undefined,
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
        aria-label="Nova avaliação postural"
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Nova avaliação postural</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          {VISTAS.map((v) => (
            <section key={v} className="rounded-xl border border-border p-3">
              <h3 className="mb-2 font-display text-sm font-bold text-ink">{ROTULO_VISTA[v]}</h3>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface-soft px-3 py-2 text-sm text-ink-2 hover:bg-surface">
                  <Camera className="h-4 w-4 text-ink-3" />
                  {fotos[v] ? "Trocar foto" : "Adicionar foto"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => escolherFoto(v, e.target.files?.[0])} />
                </label>
                {fotos[v] && !marcos[v] && (
                  <button
                    onClick={() => analisar(v)}
                    disabled={analisando === v}
                    className={buttonClasses("primary", "sm")}
                  >
                    {analisando === v ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {analisando === v ? "Analisando..." : "Analisar postura"}
                  </button>
                )}
              </div>

              {erro[v] && <p className="mt-2 text-xs text-cta">{erro[v]} Você pode marcar os achados na mão abaixo.</p>}

              {fotos[v] && marcos[v] && (
                <div className="mt-3">
                  <PosturalAnalyzer
                    dataUrl={fotos[v]!}
                    vista={v}
                    marcos={marcos[v]!}
                    onMarcos={onMarcosDe(v)}
                    onMedidas={onMedidasDe(v)}
                  />
                </div>
              )}

              {/* Roteiro manual (pré-preenchido pela análise, sempre editável) */}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
            <p className="mb-2 text-xs text-ink-3">Gerado dos achados e das medidas. Ajuste o texto antes de salvar, se quiser.</p>
            <textarea
              value={laudo}
              onChange={(e) => setLaudoEditado(e.target.value)}
              rows={8}
              className="input font-mono text-xs leading-relaxed"
            />
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button onClick={salvar} className={buttonClasses("primary", "sm")}>
            Salvar avaliação
          </button>
        </div>
      </div>
    </div>
  );
}
