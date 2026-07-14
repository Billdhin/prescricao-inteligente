import * as React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, Printer, RotateCcw, Save, Navigation } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import {
  getSemaforo,
  avaliarSemaforo,
  type ChecklistSemaforo,
  type CorSemaforo,
  type ResultadoSemaforo,
} from "@/data/semaforo";
import { getSpecialGroup, AVISO_SEGURANCA } from "@/data/specialGroups";
import { refCurta } from "@/data/referencias";
import { useAlunos, useUser, uid } from "@/lib/store";
import { printSemaforo } from "@/lib/printSemaforo";
import { SeloRCD } from "./SeloRCD";
import { cn } from "@/lib/utils";

/**
 * SEMÁFORO DE LIBERAÇÃO — checklist pré-sessão de 30–60s do Motor RCD.
 * "Antes de começar, você sabe em 30 segundos se pode liberar o treino daquele
 * aluno hoje — e por quê." O resultado é registrado (vira parte do prontuário)
 * e pode ser impresso. A decisão final é sempre do profissional.
 */

const COR_UI: Record<
  CorSemaforo,
  { bg: string; border: string; text: string; dot: string; icon: React.ReactNode }
> = {
  verde: {
    bg: "bg-[#eafaf0]",
    border: "border-success/40",
    text: "text-[#15803d]",
    dot: "bg-success",
    icon: <CheckCircle2 className="h-6 w-6 text-success" />,
  },
  amarelo: {
    bg: "bg-[#fef7e8]",
    border: "border-warning/40",
    text: "text-[#b45309]",
    dot: "bg-warning",
    icon: <AlertTriangle className="h-6 w-6 text-warning" />,
  },
  vermelho: {
    bg: "bg-[#fdecec]",
    border: "border-[#ef4444]/40",
    text: "text-[#b91c1c]",
    dot: "bg-[#ef4444]",
    icon: <XCircle className="h-6 w-6 text-[#ef4444]" />,
  },
};

export function SemaforoLiberacao({
  grupoSlug,
  alunoId,
  alunoNome,
  fase,
  onRegistrado,
  className,
}: {
  grupoSlug: string;
  alunoId?: string;
  alunoNome?: string;
  /** fase da jornada, propagada para o "Prescrever agora" não perder o contexto */
  fase?: number;
  /** chamado após salvar a liberação no histórico */
  onRegistrado?: (resultado: ResultadoSemaforo) => void;
  className?: string;
}) {
  // Condições sem checklist próprio (as adicionais) usam o checklist geral do dia.
  const checklist = getSemaforo(grupoSlug) ?? (grupoSlug ? getSemaforo("geral") : undefined);
  // "geral" não é grupo especial: o gate vale para qualquer aluno
  const grupo = getSpecialGroup(grupoSlug);
  const nomeChecklist = grupo?.nome ?? "Checklist geral do dia";
  const nomeDocumento = grupo?.rotuloAluno ?? "Checklist geral do dia";
  const addLiberacao = useAlunos((s) => s.addLiberacao);
  const { name: profNome, cref, logoDataUrl } = useUser();
  const [respostas, setRespostas] = React.useState<Record<string, string>>({});
  const [registrado, setRegistrado] = React.useState(false);

  if (!checklist) return null;

  const completo = checklist.itens.every((i) => respostas[i.id]);
  const resultado = completo ? avaliarSemaforo(checklist, respostas) : null;

  const registrar = () => {
    if (!resultado) return;
    addLiberacao({
      id: uid(),
      alunoId,
      grupoSlug,
      data: Date.now(),
      respostas,
      resultado: resultado.cor,
      ajustes: resultado.ajustes,
    });
    setRegistrado(true);
    onRegistrado?.(resultado);
  };

  const reset = () => {
    setRespostas({});
    setRegistrado(false);
  };

  return (
    <Card className={cn("p-5 md:p-6", className)}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-bold text-ink">Semáforo de Liberação</h2>
        <SeloRCD compacto />
      </div>
      <p className="mb-4 text-sm text-ink-2">
        {nomeChecklist}
        {alunoNome ? ` · ${alunoNome}` : ""}: responda em ~30s e saiba se a sessão de hoje está
        liberada, e por quê.
      </p>

      <div className="space-y-4">
        {checklist.itens.map((item, idx) => (
          <fieldset key={item.id}>
            <legend className="mb-0.5 flex gap-2 text-sm font-semibold text-ink">
              <span className="tabular grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-tint text-[11px] font-bold text-primary">
                {idx + 1}
              </span>
              {item.pergunta}
            </legend>
            <p className="mb-1.5 pl-7 text-xs text-ink-3">
              {item.porque}
              {item.refs?.length ? (
                <span className="ml-1 text-ink-3/80">[{item.refs.map(refCurta).join("; ")}]</span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-1.5 pl-7">
              {item.opcoes.map((op) => {
                const ativa = respostas[item.id] === op.valor;
                return (
                  <button
                    key={op.valor}
                    type="button"
                    onClick={() => {
                      setRespostas((r) => ({ ...r, [item.id]: op.valor }));
                      setRegistrado(false);
                    }}
                    aria-pressed={ativa}
                    className={cn(
                      // alvo >= 44px: o checklist é respondido no celular, em pé, na recepção
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-medium transition-colors",
                      ativa
                        ? cn(COR_UI[op.cor].bg, COR_UI[op.cor].border, COR_UI[op.cor].text, "font-semibold")
                        : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
                    )}
                  >
                    <span aria-hidden className={cn("h-2 w-2 rounded-full", ativa ? COR_UI[op.cor].dot : "bg-ink-3/40")} />
                    {op.rotulo}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Resultado */}
      {resultado && (
        <div
          role="status"
          className={cn(
            "mt-5 rounded-xl border p-4",
            COR_UI[resultado.cor].bg,
            COR_UI[resultado.cor].border,
          )}
        >
          <div className="flex items-center gap-2.5">
            {COR_UI[resultado.cor].icon}
            <div>
              <div className={cn("font-display text-lg font-bold", COR_UI[resultado.cor].text)}>
                {resultado.rotulo}
              </div>
              <p className="text-xs text-ink-2">
                {resultado.cor === "verde" &&
                  "Nenhum sinal de alerta nos itens verificados; registre e siga para a sessão."}
                {resultado.cor === "amarelo" &&
                  "A sessão pode acontecer COM os ajustes abaixo; registre o racional."}
                {resultado.cor === "vermelho" &&
                  "Hoje não é dia de treinar: os motivos abaixo pedem reavaliação e, se persistirem, encaminhamento."}
              </p>
            </div>
          </div>

          {resultado.ajustes.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-black/5 pt-3">
              {resultado.ajustes.map((a) => (
                <li key={a.pergunta} className="flex gap-2 text-sm text-ink">
                  <span aria-hidden className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", COR_UI[resultado.cor].dot)} />
                  <span>
                    <span className="font-semibold">{a.acao}</span>{" "}
                    <span className="text-xs text-ink-3">({a.pergunta})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!registrado ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
              <button onClick={registrar} className={buttonClasses("primary", "sm")}>
                <Save className="h-4 w-4" /> Registrar liberação
              </button>
              <span className="text-xs text-ink-3">Registre para guardar no histórico e seguir.</span>
            </div>
          ) : (
            <div className="mt-3 space-y-3 border-t border-black/5 pt-3">
              {/* Próximo passo: prescrever ou voltar, sempre com um caminho de saída (nunca beco sem saída) */}
              <div className="flex flex-wrap items-center gap-2">
                {resultado.cor !== "vermelho" && (
                  <Link
                    to={`/gps?${new URLSearchParams({
                      ...(alunoId ? { aluno: alunoId } : {}),
                      ...(grupo ? { grupo: grupoSlug } : {}),
                      ...(fase ? { fase: String(fase) } : {}),
                    }).toString()}`}
                    className={buttonClasses("primary", "sm")}
                  >
                    <Navigation className="h-4 w-4" /> Prescrever agora
                  </Link>
                )}
                {alunoId ? (
                  <Link to={`/alunos/${alunoId}`} className={buttonClasses("secondary", "sm")}>
                    {resultado.cor === "vermelho" ? "Registrar no perfil e reavaliar" : `Voltar ao perfil${alunoNome ? ` de ${alunoNome.split(" ")[0]}` : ""}`}
                  </Link>
                ) : (
                  resultado.cor === "vermelho" && (
                    <Link to="/dashboard" className={buttonClasses("secondary", "sm")}>
                      Voltar ao início
                    </Link>
                  )
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="success">Registrado no histórico, entra no prontuário</Pill>
                <button
                  // impresso pode chegar ao aluno: usa o nome de programa digno, não o rótulo clínico
                  onClick={() => printSemaforo(nomeDocumento, checklist, respostas, resultado, alunoNome, profNome, cref, logoDataUrl || undefined)}
                  className={buttonClasses("outline", "sm")}
                >
                  <Printer className="h-4 w-4" /> Imprimir
                </button>
                <button onClick={reset} className={buttonClasses("ghost", "sm")}>
                  <RotateCcw className="h-4 w-4" /> Refazer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-ink-3">
        {AVISO_SEGURANCA} A decisão de liberar, ajustar ou adiar a sessão é sempre do profissional
        habilitado; o semáforo documenta o racional dessa decisão.
      </p>
    </Card>
  );
}

export type { ChecklistSemaforo };
