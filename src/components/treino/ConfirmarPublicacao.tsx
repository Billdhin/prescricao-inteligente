import * as React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { DiferencaDePlano } from "@/lib/gps/diffPlano";

/**
 * A ANTESSALA DE PUBLICAR NO APP DO ALUNO.
 *
 * O Filipe: "para que o professor não fique totalmente no escuro sobre o que está
 * prescrevendo". O botão publicava direto, e era o gesto de maior consequência da tela: o
 * aluno recebe outro treino no celular no mesmo instante.
 *
 * Isto NÃO é um "tem certeza?", que ninguém lê. É a DIFERENÇA em relação ao que ele já está
 * fazendo, organizada em entra, sai e muda, mais a consequência que decide de verdade: em que
 * semana ele está e o que acontece com essa contagem.
 *
 * Quando não há plano anterior (primeira publicação), o diálogo não aparece: não existe
 * diferença a mostrar, e uma confirmação sem conteúdo só ensina o profissional a clicar sem
 * ler o próximo.
 */
export function ConfirmarPublicacao({
  nomeAluno,
  diferenca,
  onCancelar,
  onConfirmar,
}: {
  nomeAluno: string;
  diferenca: DiferencaDePlano;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => dialogRef.current?.focus(), []);
  const primeiro = nomeAluno.split(" ")[0];

  const mudancas: { tom: "warning" | "success" | "danger"; rotulo: string; texto: React.ReactNode }[] = [];
  if (diferenca.frequencia)
    mudancas.push({
      tom: "warning",
      rotulo: "Muda",
      texto: (
        <>
          <b>Frequência</b>: de {diferenca.frequencia.de} para {diferenca.frequencia.para} sessões por semana.
        </>
      ),
    });
  if (diferenca.duracao)
    mudancas.push({
      tom: "warning",
      rotulo: "Muda",
      texto: (
        <>
          <b>Duração</b>: de {diferenca.duracao.de} para {diferenca.duracao.para} semanas.
        </>
      ),
    });
  if (diferenca.modelo)
    mudancas.push({
      tom: "warning",
      rotulo: "Muda",
      texto: (
        <>
          <b>Modelo</b>: de {diferenca.modelo.de} para {diferenca.modelo.para}.
        </>
      ),
    });
  if (diferenca.isometrico)
    mudancas.push({
      tom: diferenca.isometrico.para > diferenca.isometrico.de ? "success" : "danger",
      rotulo: diferenca.isometrico.para > diferenca.isometrico.de ? "Entra" : "Sai",
      texto: (
        <>
          <b>Protocolo isométrico</b>: de {diferenca.isometrico.de} para {diferenca.isometrico.para} sessões por
          semana, separadas do treino.
        </>
      ),
    });
  if (diferenca.saem.length)
    mudancas.push({
      tom: "danger",
      rotulo: "Sai",
      texto: (
        <>
          <b>
            {diferenca.saem.length} {diferenca.saem.length === 1 ? "exercício sai" : "exercícios saem"}
          </b>{" "}
          do treino: {listar(diferenca.saem)}.
        </>
      ),
    });
  if (diferenca.entram.length)
    mudancas.push({
      tom: "success",
      rotulo: "Entra",
      texto: (
        <>
          <b>
            {diferenca.entram.length} {diferenca.entram.length === 1 ? "exercício entra" : "exercícios entram"}
          </b>
          : {listar(diferenca.entram)}.
        </>
      ),
    });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 backdrop-blur-sm sm:p-4" onClick={onCancelar}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`O que muda para ${primeiro}`}
        className="flex max-h-modal w-full max-w-lg flex-col overflow-hidden rounded-card bg-surface shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onCancelar()}
      >
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-bold text-ink">O que muda para {primeiro}</h2>
          <p className="mt-0.5 text-sm text-ink-2">Ela recebe isto no app assim que você publicar.</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {diferenca.semMudancaEstrutural ? (
            <p className="text-sm text-ink-2">
              O desenho do treino continua o mesmo: mesmos exercícios, mesma frequência, mesma duração e mesmo
              modelo. O que você ajustou foi a dose de alguma semana, e é isso que vai ao app.
            </p>
          ) : (
            <>
              <p className="mb-2.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
                Diferenças em relação ao treino que {primeiro} segue hoje
              </p>
              <ul className="space-y-2">
                {mudancas.map((m, i) => (
                  <li key={i} className="flex gap-2.5 rounded-xl bg-surface-soft p-3">
                    <Pill tone={m.tom}>{m.rotulo}</Pill>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">{m.texto}</p>
                  </li>
                ))}
                {diferenca.mantidos > 0 && (
                  <li className="flex gap-2.5 rounded-xl bg-surface-soft p-3">
                    <Pill tone="neutral">Igual</Pill>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
                      Os {diferenca.mantidos} exercícios que {primeiro} já vinha fazendo continuam no plano.
                    </p>
                  </li>
                )}
              </ul>
            </>
          )}

          {/*
            A consequência que decide de verdade. Arquivar um plano na semana 2 e na semana 11
            são decisões diferentes, e só uma delas joga fora dois meses de progressão.
          */}
          <Card tone="warning" className="mt-4 flex gap-3 p-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
              <b>
                {primeiro} está na semana {diferenca.semanaDoAluno} de {diferenca.totalDoAnterior} do treino atual.
              </b>{" "}
              Publicar arquiva esse treino e a contagem recomeça na semana 1. O histórico de execução dela fica
              guardado.
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface-soft p-4">
          <button onClick={onCancelar} className={buttonClasses("secondary", "sm")}>
            Voltar e ajustar
          </button>
          <button onClick={onConfirmar} className={cn(buttonClasses("primary", "sm"), "gradient-publicar text-white")}>
            Publicar para {primeiro} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Até três nomes na frase; o resto vira contagem, senão a linha não se lê. */
function listar(nomes: string[], max = 3): string {
  if (nomes.length <= max) return nomes.join(", ");
  return `${nomes.slice(0, max).join(", ")} e mais ${nomes.length - max}`;
}
