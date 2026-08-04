import * as React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { Aluno } from "@/data/alunos";
import {
  type ProximoPasso,
  type EtapaCiclo,
  type EstadoEtapa,
  ROTULO_ETAPA,
} from "@/lib/gps/proximoPasso";

/** Datas de cada marco do ciclo (quando existem), para os chips datados. */
export interface DatasCiclo {
  cadastro?: number;
  avaliar?: number;
  planejar?: number;
  reavaliar?: number;
}

const fmtDDMM = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

const DIA = 86_400_000;

/**
 * Os cinco passos do ciclo COMO O PROFISSIONAL LÊ (o desenho): Cadastrar, Avaliar,
 * Planejar, Liberar, Reavaliar. O motor tem "acompanhar" no lugar de "cadastrar";
 * aqui o cadastro (o aluno existe) é sempre o passo 1 e o "acompanhar" some, virando
 * o estado de quem já passou por Liberar. O estado de cada chip vem do `estado`
 * monotônico do motor, então o chip nunca mente sobre onde o aluno está.
 */
const PASSOS_DISPLAY: { chave: string; rotulo: string; engine?: EtapaCiclo }[] = [
  { chave: "cadastro", rotulo: "Cadastrar" },
  { chave: "avaliar", rotulo: "Avaliar", engine: "avaliar" },
  { chave: "planejar", rotulo: "Planejar", engine: "planejar" },
  { chave: "liberar", rotulo: "Liberar", engine: "liberar" },
  { chave: "reavaliar", rotulo: "Reavaliar", engine: "reavaliar" },
];

/** "etapa N de 5" a partir da etapa atual do motor. */
const NUM_ETAPA: Record<EtapaCiclo, number> = {
  avaliar: 2,
  planejar: 3,
  liberar: 4,
  acompanhar: 4,
  reavaliar: 5,
};

/**
 * O CICLO DO CUIDADO: onde o aluno está e qual o próximo movimento, no topo da tela
 * do aluno em qualquer aba. É a assinatura do produto: chips datados dos marcos e,
 * embaixo, um cartão escuro com o passo de AGORA e a ação primária.
 */
export function LinhaDoCuidado({
  aluno,
  passo,
  estado,
  datas,
  onAvaliar,
  onAcompanhar,
  onLiberar,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  estado: Record<EtapaCiclo, EstadoEtapa>;
  datas?: DatasCiclo;
  onAvaliar: () => void;
  onAcompanhar: () => void;
  /** liberar abre a aba Semáforo do próprio aluno (nunca sai para /semaforo) */
  onLiberar: () => void;
}) {
  const n = NUM_ETAPA[passo.etapa];
  const dataDe = (chave: string): number | undefined =>
    chave === "cadastro" ? datas?.cadastro : chave === "avaliar" ? datas?.avaliar : chave === "planejar" ? datas?.planejar : chave === "reavaliar" ? datas?.reavaliar : undefined;

  return (
    <Card variant="raised" className="overflow-hidden p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">
          Ciclo do cuidado <span className="normal-case tracking-normal text-ink-2">· etapa {n} de 5</span>
        </div>
        <Link to="/tutorial" className="shrink-0 text-2xs font-semibold text-primary hover:underline">
          como funciona?
        </Link>
      </div>

      {/* Chips datados dos marcos. O atual ganha o pino da marca; o feito, o traço
          verde; o futuro, a borda tracejada. */}
      <ol aria-label="Etapas do ciclo de cuidado" className="flex flex-wrap gap-2">
        {PASSOS_DISPLAY.map((p) => {
          const est: EstadoEtapa = p.chave === "cadastro" ? "feito" : estado[p.engine!];
          const ts = dataDe(p.chave);
          const futuroReav = p.chave === "reavaliar" && est !== "feito" && ts != null;
          // O `Math.max(0, ...)` que estava aqui ESMAGAVA O PASSADO: uma reavaliação vencida
          // há 15 dias saía como "em 0 dias", ou seja, a tira que é a espinha do cuidado
          // traduzia atraso como "é hoje", enquanto o cartão Medidas da MESMA tela dizia
          // "Reavaliação vencida". Atraso é a informação que mais precisa aparecer.
          const dias = futuroReav ? Math.round((ts! - Date.now()) / DIA) : 0;
          return (
            <li key={p.chave}>
              <span
                aria-current={est === "atual" ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  est === "feito" && "border-success/40 bg-success-tint text-success",
                  est === "atual" && "border-primary bg-primary-tint text-primary",
                  est === "pendente" && "border-dashed border-border text-ink-3",
                )}
              >
                {est === "feito" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : est === "atual" ? (
                  <MapPin className="h-3.5 w-3.5" />
                ) : null}
                <span>{p.rotulo}</span>
                {ts != null && (
                  <span className={cn("tabular font-medium", est === "pendente" ? "text-ink-3" : "opacity-80")}>
                    {fmtDDMM(ts)}
                    {futuroReav &&
                      (dias < 0
                        ? ` · vencida há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "dia" : "dias"}`
                        : dias === 0
                          ? " · é hoje"
                          : ` · em ${dias} ${dias === 1 ? "dia" : "dias"}`)}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Cartão escuro do AGORA: o passo atual e a ação primária, no navy da marca. */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-card px-4 py-3.5" style={{ background: "#0D1524" }}>
        <span aria-hidden className="relative grid h-3 w-3 place-items-center">
          {passo.tone !== "success" && (
            <span className="animate-halo absolute inset-0 rounded-full" style={{ background: "rgba(226,84,62,.5)" }} />
          )}
          <span
            className="relative h-2.5 w-2.5 rounded-full"
            style={{ background: passo.tone === "success" ? "#14B3BA" : "var(--danger-fill)" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-2xs font-bold uppercase tracking-[0.14em]" style={{ color: "#8FA1BD" }}>
            Agora · {ROTULO_ETAPA[passo.etapa]}
          </div>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: "#F2F6FC" }}>
            {passo.frase}
          </p>
        </div>
        <CtaPasso aluno={aluno} passo={passo} onAvaliar={onAvaliar} onAcompanhar={onAcompanhar} onLiberar={onLiberar} />
      </div>
    </Card>
  );
}

/** Botão de ação do AGORA, em teal sobre o navy (o positivo do app do aluno). */
function CtaPasso({
  aluno,
  passo,
  onAvaliar,
  onAcompanhar,
  onLiberar,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  onAvaliar: () => void;
  onAcompanhar: () => void;
  onLiberar: () => void;
}) {
  const cls =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B3BA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1524] sm:w-auto";
  const estilo = { background: "#14B3BA", color: "#06231F" };
  const label = (
    <>
      {passo.cta.label} <ArrowRight className="h-4 w-4" />
    </>
  );
  // Destino explícito do passo manda em tudo: é por ele que "planejar" leva à seção
  // do PERFIL quando é o perfil que trava a prescrição. Sem esta linha, a espinha
  // do cuidado mandava o profissional para a tela de prescrição bloqueada, com o
  // rótulo certo e o endereço errado.
  if (passo.cta.to) {
    return (
      <Link to={passo.cta.to} className={cls} style={estilo}>
        {label}
      </Link>
    );
  }
  switch (passo.cta.kind) {
    case "planejar":
      return (
        <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cls} style={estilo}>
          {label}
        </Link>
      );
    case "liberar":
      // O semáforo do aluno em contexto se faz na aba dele, aqui mesmo na página,
      // não na /semaforo global (que virou o painel do dia).
      return (
        <button onClick={onLiberar} className={cls} style={estilo}>
          {label}
        </button>
      );
    case "avaliar":
    case "reavaliar":
      return (
        <button onClick={onAvaliar} className={cls} style={estilo}>
          {label}
        </button>
      );
    case "acompanhar":
    default:
      return (
        <button onClick={onAcompanhar} className={cls} style={estilo}>
          {label}
        </button>
      );
  }
}
