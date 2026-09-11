import * as React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, MapPin } from "lucide-react";
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

/** O tom do cartão segue a urgência do passo, com os mesmos tokens do resto da ficha. */
const TOM_DO_PASSO: Record<ProximoPasso["tone"], { caixa: string; sobrelinha: string }> = {
  warning: { caixa: "border-warning-fill/40 bg-warning-tint", sobrelinha: "text-warning" },
  cta: { caixa: "border-warning-fill/40 bg-warning-tint", sobrelinha: "text-warning" },
  primary: { caixa: "border-primary/20 bg-primary-tint/50", sobrelinha: "text-primary" },
  success: { caixa: "border-border bg-surface", sobrelinha: "text-ink-2" },
};

/**
 * A frase do motor com a PRIMEIRA frase em negrito, como o "Próximo passo" do protótipo:
 * o que aconteceu em destaque, o que fazer em seguida no corpo. Frase sem ponto no meio
 * sai inteira em negrito.
 */
function FraseDoPasso({ frase }: { frase: string }) {
  const i = frase.indexOf(". ");
  if (i < 0) return <b className="font-semibold">{frase}</b>;
  return (
    <>
      <b className="font-semibold">{frase.slice(0, i + 1)}</b> {frase.slice(i + 2)}
    </>
  );
}

/**
 * O CICLO DO CUIDADO: onde o aluno está e qual o próximo movimento, no topo da tela
 * do aluno em qualquer aba. É a assinatura do produto.
 *
 * Tem a cara do cartão "Próximo passo" do protótipo (10/09/2026): um cartão tonal na cor
 * da urgência, a frase com o fato em negrito e UM botão escuro. Os cinco marcos datados
 * ficam numa linha só, que rola de lado no celular: antes eles quebravam em duas ou três
 * linhas, e com o cartão navy embaixo o bloco passava de 250 px e empurrava as abas para
 * fora da primeira dobra.
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

  const tom = TOM_DO_PASSO[passo.tone];

  return (
    <section aria-label="Próximo passo do cuidado" className={cn("rounded-card border p-3.5 lg:p-5", tom.caixa)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className={cn("text-2xs font-bold uppercase tracking-[0.12em]", tom.sobrelinha)}>
          Próximo passo · {ROTULO_ETAPA[passo.etapa]}
        </p>
        <span className="ml-auto flex items-center gap-2.5 text-2xs">
          <span className="tabular text-ink-2">etapa {n} de 5</span>
          <Link to="/tutorial" className="font-semibold text-primary hover:underline">
            como funciona?
          </Link>
        </span>
      </div>

      {/* Chips datados dos marcos, numa linha que rola de lado. O atual ganha o pino da
          marca; o feito, o traço verde; o futuro, a borda tracejada. Não são botões, então
          ficam com 28 px; a rolagem recebe foco para quem navega pelo teclado. */}
      <ol
        aria-label="Etapas do ciclo de cuidado"
        tabIndex={0}
        className="-mx-3.5 mt-2.5 flex gap-1.5 overflow-x-auto px-3.5 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:-mx-5 lg:px-5 [&::-webkit-scrollbar]:hidden"
      >
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
            <li key={p.chave} className="shrink-0">
              <span
                aria-current={est === "atual" ? "step" : undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-2xs font-semibold",
                  est === "feito" && "border-success/30 bg-success-tint text-success",
                  est === "atual" && "border-primary bg-primary-tint text-primary",
                  est === "pendente" && "border-dashed border-ink-3/40 bg-surface/60 text-ink-3",
                )}
              >
                {est === "feito" ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : est === "atual" ? (
                  <MapPin className="h-3 w-3" aria-hidden />
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

      {/* O passo de agora: a frase do motor (fonte única) e a ação primária. */}
      <p className="mt-2.5 text-[15px] leading-normal text-ink">
        <FraseDoPasso frase={passo.frase} />
      </p>
      <div className="mt-3">
        <CtaPasso aluno={aluno} passo={passo} onAvaliar={onAvaliar} onAcompanhar={onAcompanhar} onLiberar={onLiberar} />
      </div>
    </section>
  );
}

/** Botão de ação do passo: o primário escuro da casa, com a seta de "ir". */
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
    "inline-flex min-h-[40px] max-w-full items-center gap-1.5 rounded-control bg-ink px-4 py-2 text-left text-[13.5px] font-semibold text-surface transition-[filter] hover:brightness-[1.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  const label = (
    <>
      {passo.cta.label} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </>
  );
  // Destino explícito do passo manda em tudo: é por ele que "planejar" leva à seção
  // do PERFIL quando é o perfil que trava a prescrição. Sem esta linha, a espinha
  // do cuidado mandava o profissional para a tela de prescrição bloqueada, com o
  // rótulo certo e o endereço errado.
  if (passo.cta.to) {
    return (
      <Link to={passo.cta.to} className={cls}>
        {label}
      </Link>
    );
  }
  switch (passo.cta.kind) {
    case "planejar":
      return (
        <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cls}>
          {label}
        </Link>
      );
    case "liberar":
      // O semáforo do aluno em contexto se faz na aba dele, aqui mesmo na página,
      // não na /semaforo global (que virou o painel do dia).
      return (
        <button onClick={onLiberar} className={cls}>
          {label}
        </button>
      );
    case "avaliar":
    case "reavaliar":
      return (
        <button onClick={onAvaliar} className={cls}>
          {label}
        </button>
      );
    case "acompanhar":
    default:
      return (
        <button onClick={onAcompanhar} className={cls}>
          {label}
        </button>
      );
  }
}
