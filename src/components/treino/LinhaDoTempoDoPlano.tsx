import * as React from "react";
import { Link } from "react-router-dom";
import { CalendarRange } from "lucide-react";
import { Card, buttonClasses } from "@/components/ui/primitives";
import { corDaFase } from "@/components/treino/PlanoEditor";
import { chaveDaFase, indicesDeCorDasFases, nomeDaFase } from "@/lib/gps/fasesDoPlano";
import { mesocicloAtual, rotuloMeso, semanaAtual, type PlanoTreino, type TipoMicrociclo } from "@/data/periodizacao";
import { cn } from "@/lib/utils";

/*
 * A LINHA DO TEMPO DO PLANO, o cartão do protótipo (10/09/2026) na Visão do aluno.
 *
 * Uma barra por semana do plano (quantas o plano tiver, e não doze fixas). Duas regras:
 *
 *  - A COR é a da FASE, com a mesma regra do cartão do plano, do calendário e do gráfico do
 *    editor (fasesDoPlano + corDaFase): quem viu a fase 2 em azul lá encontra azul aqui.
 *  - A ALTURA é o TIPO da semana, que é o campo real do plano: carga, teste ou descarga. O
 *    protótipo liga altura a "base/progressão", que não existe no dado; o tipo é o
 *    equivalente honesto e é justamente o que se precisa antever (quando vem a descarga).
 *
 * A semana é a do calendário, contada desde a data do plano, como em todo o produto: o
 * sistema não registra presença, então "semana 7" é aritmética de calendário e não um fato
 * sobre o aluno.
 */

const ALTURA: Record<TipoMicrociclo, number> = { carga: 28, teste: 20, deload: 14 };
const HACHURA = "repeating-linear-gradient(135deg, rgba(255,255,255,.6) 0 1.5px, transparent 1.5px 4px)";

/**
 * Quais semanas ganham rótulo: em 24 semanas não cabem 24 rótulos em 326 px. Uma a cada
 * `passo`, e a semana atual e a última sempre; um rótulo do passo vizinho de um desses sai,
 * para dois textos não se sobreporem numa coluna de 13 px.
 */
function semanasRotuladas(total: number, atual?: number): Set<number> {
  const passo = Math.max(1, Math.ceil(total / 12));
  const s = new Set<number>();
  for (let n = 1; n <= total; n += passo) s.add(n);
  const fixar = (alvo: number) => {
    if (s.has(alvo)) return;
    for (const n of [...s]) if (Math.abs(n - alvo) < passo && n !== atual) s.delete(n);
    s.add(alvo);
  };
  fixar(total);
  if (atual != null && atual >= 1 && atual <= total) fixar(atual);
  return s;
}

/**
 * As barras do plano. Sem `atual` (um rascunho que o aluno ainda não começou), todas saem no
 * tom de futuro.
 */
export function BarrasDoPlano({
  plano,
  atual,
  rotulos = true,
  className,
}: {
  plano: PlanoTreino;
  /** semana corrente; ausente = nada começou */
  atual?: number;
  rotulos?: boolean;
  className?: string;
}) {
  const semanas = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos.map((micro) => ({ micro, meso: m })));
  const corPorFase = indicesDeCorDasFases(plano.macrociclo.mesociclos);
  const total = semanas.length;
  const comRotulo = rotulos ? semanasRotuladas(total, atual) : new Set<number>();
  const colunas = { gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` };
  const descargas = semanas.filter((s) => s.micro.tipo === "deload").length;
  const meso = atual != null ? mesocicloAtual(plano) : undefined;

  return (
    <div className={className}>
      <div
        className="grid h-7 items-end gap-0.5 sm:gap-1"
        style={colunas}
        role="img"
        aria-label={
          atual != null
            ? `Semana ${atual} de ${total} do plano${meso ? `, ${nomeDaFase(meso)}` : ""}. ${descargas} ${descargas === 1 ? "semana" : "semanas"} de descarga.`
            : `Plano de ${total} semanas, ainda não iniciado. ${descargas} ${descargas === 1 ? "semana" : "semanas"} de descarga.`
        }
      >
        {semanas.map(({ micro, meso: m }, i) => {
          const c = corDaFase(corPorFase.get(chaveDaFase(m)) ?? 0);
          const passou = atual != null && micro.semana <= atual;
          const hoje = micro.semana === atual;
          const descarga = micro.tipo === "deload";
          return (
            <span
              key={micro.id}
              title={`Semana ${micro.semana} · ${nomeDaFase(m)}${descarga ? " · descarga" : micro.tipo === "teste" ? " · teste" : ""}`}
              className={cn(
                "block min-w-0 origin-bottom rounded-[5px] motion-safe:animate-sobe",
                hoje && "ring-2 ring-ink ring-offset-1 ring-offset-surface",
              )}
              style={{
                height: ALTURA[micro.tipo] ?? ALTURA.carga,
                background: passou ? c.forte : `rgba(${c.rgb},.33)`,
                backgroundImage: descarga ? HACHURA : undefined,
                animationDelay: `${Math.min(i, 24) * 25}ms`,
              }}
            />
          );
        })}
      </div>
      {rotulos && (
        <div className="mt-1.5 grid gap-0.5 sm:gap-1" style={colunas} aria-hidden>
          {semanas.map(({ micro }) => (
            <span
              key={micro.id}
              className={cn(
                "tabular whitespace-nowrap text-center text-2xs",
                micro.semana === atual ? "font-bold text-ink" : "text-ink-3",
              )}
            >
              {comRotulo.has(micro.semana) ? `S${micro.semana}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function LinhaDoTempoDoPlano({
  plano,
  alunoId,
  podeTreino,
  onAbrir,
}: {
  plano?: PlanoTreino;
  alunoId: string;
  /** gate duro: sem prontidão, o vazio explica o que falta em vez de oferecer o botão */
  podeTreino: { ok: boolean; motivo?: string };
  /** leva à aba Treino, onde o plano mora */
  onAbrir: () => void;
}) {
  if (!plano) {
    return (
      <Card className="p-4 md:p-[22px]">
        <h2 className="font-display text-lg font-bold text-ink">Linha do tempo do plano</h2>
        <p className="mt-1 text-[13.5px] text-ink-2">
          <b className="font-semibold text-ink">Sem treino montado.</b>{" "}
          {podeTreino.ok ? "A avaliação já está pronta; o próximo passo é montar o plano." : podeTreino.motivo}
        </p>
        {podeTreino.ok && (
          <Link to={`/prescrever-treino?aluno=${alunoId}`} className={cn(buttonClasses("primary", "sm"), "mt-3 h-[38px] px-3.5 text-[13px]")}>
            <CalendarRange className="h-4 w-4" aria-hidden /> Montar treino
          </Link>
        )}
      </Card>
    );
  }

  const atual = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  // Uma entrada por FASE na legenda, na ordem em que aparecem no plano, com o nome curto.
  const corPorFase = indicesDeCorDasFases(plano.macrociclo.mesociclos);
  const fases = [...corPorFase.entries()].map(([chave, indice]) => ({
    chave,
    cor: corDaFase(indice),
    nome: nomeDaFase(plano.macrociclo.mesociclos.find((m) => chaveDaFase(m) === chave)!),
  }));
  const temDescarga = plano.macrociclo.mesociclos.some((m) => m.microciclos.some((mc) => mc.tipo === "deload"));

  return (
    <Card className="p-4 md:p-[22px]">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h2 className="font-display text-lg font-bold text-ink">Linha do tempo do plano</h2>
        <button type="button" onClick={onAbrir} className="ml-auto min-h-[32px] text-[13px] font-semibold text-primary hover:underline">
          Abrir
        </button>
      </div>
      <p className="tabular text-[13px] text-ink-2">
        semana {atual} de {plano.semanas}
        {meso ? ` · ${rotuloMeso(meso)}` : ""} · {plano.frequenciaSemanal}×/sem
      </p>

      <BarrasDoPlano plano={plano} atual={atual} className="mt-4" />

      <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12.5px] text-ink-2">
        {fases.map((f) => (
          <li key={f.chave} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: f.cor.forte }} />
            {f.nome}
          </li>
        ))}
        {temDescarga && (
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-ink-3/40"
              style={{ backgroundImage: HACHURA }}
            />
            Descarga
          </li>
        )}
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[3px] border-2 border-ink" />
          Semana atual · S{atual}
        </li>
      </ul>
    </Card>
  );
}
