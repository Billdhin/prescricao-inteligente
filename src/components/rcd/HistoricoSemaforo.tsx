import * as React from "react";
import { rotuloSemaforo } from "@/data/semaforo";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import type { Liberacao } from "@/data/alunos";
import { cn } from "@/lib/utils";

/*
 * O HISTÓRICO DO SEMÁFORO SEM ROLAGEM INFINITA.
 *
 * Cada liberação era um cartão com borda, cor e respiro próprios, e um aluno que faz o
 * semáforo antes de toda sessão chega a trinta registros em poucas semanas: a aba virava uma
 * coluna de "Liberado, Liberado, Liberado" mais alta que três telas, e o que importa (o dia com
 * ajuste, o não liberado, a conduta diferente) ficava perdido no meio. O resumo dos 30 dias já
 * mostra a sequência; aqui o que o profissional procura é a EXCEÇÃO e o que foi feito com ela.
 *
 * Então:
 * - o mês corrente fica aberto e os anteriores viram uma linha de resumo ("agosto · 12
 *   registros · 11 liberados, 1 com ajuste"), que abre com um toque;
 * - cada registro é uma linha só (ponto, resultado, dia); o que tem ajuste ou conduta
 *   diferente ganha uma seta que abre o detalhe no lugar;
 * - o filtro "Só com ressalva" deixa só os dias que pediram alguma coisa;
 * - dentro de um mês aberto, oito linhas e "Mostrar mais", para nenhum mês virar parede.
 */

type Resultado = Liberacao["resultado"];

// o rótulo vem de data/semaforo: aqui ele já tinha divergido (faltava o "hoje")
const ROTULO: Record<Resultado, string> = { verde: rotuloSemaforo("verde"), amarelo: rotuloSemaforo("amarelo"), vermelho: rotuloSemaforo("vermelho") };
const PONTO: Record<Resultado, string> = { verde: "bg-success", amarelo: "bg-warning-fill", vermelho: "bg-danger-fill" };
const TEXTO: Record<Resultado, string> = { verde: "text-ink", amarelo: "text-warning", vermelho: "text-danger" };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const POR_MES = 8;

const diaCurto = (ts: number) => {
  const d = new Date(ts);
  const semana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(d).replace(".", "");
  return `${semana}, ${String(d.getDate()).padStart(2, "0")} ${MESES_CURTOS[d.getMonth()]}`;
};
const chaveMes = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
};
// Só a primeira letra sobe: o `capitalize` do CSS subiria todas ("Agosto De 2025").
const nomeMes = (ts: number, anoAtual: number) => {
  const d = new Date(ts);
  const mes = MESES[d.getMonth()];
  const nome = d.getFullYear() === anoAtual ? mes : `${mes} de ${d.getFullYear()}`;
  return nome.charAt(0).toUpperCase() + nome.slice(1);
};
const temRessalva = (l: Liberacao) => l.resultado !== "verde" || Boolean(l.decisaoContraria);

function contagem(lista: Liberacao[]): string {
  const n = (r: Resultado) => lista.filter((l) => l.resultado === r).length;
  const partes = [
    n("verde") && `${n("verde")} ${n("verde") === 1 ? "liberado" : "liberados"}`,
    n("amarelo") && `${n("amarelo")} com ajuste`,
    n("vermelho") && `${n("vermelho")} não ${n("vermelho") === 1 ? "liberado" : "liberados"}`,
  ].filter(Boolean);
  return partes.join(", ");
}

function LinhaRegistro({ l, fmtData }: { l: Liberacao; fmtData: (ts: number) => string }) {
  const [aberta, setAberta] = React.useState(false);
  const temDetalhe = l.ajustes.length > 0 || Boolean(l.decisaoContraria);
  const id = React.useId();
  const cabecalho = (
    <>
      <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PONTO[l.resultado])} />
      <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", TEXTO[l.resultado])}>
        {ROTULO[l.resultado]}
        {l.decisaoContraria && <span className="ml-1.5 text-xs font-medium text-ink-2">· conduta registrada</span>}
      </span>
      <span className="tabular shrink-0 text-xs text-ink-2">{diaCurto(l.data)}</span>
    </>
  );
  return (
    <li>
      {temDetalhe ? (
        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          aria-expanded={aberta}
          aria-controls={id}
          className="flex min-h-[40px] w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-soft"
        >
          {cabecalho}
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-2 transition-transform", aberta && "rotate-180")} aria-hidden />
        </button>
      ) : (
        <div className="flex min-h-[40px] items-center gap-2.5 px-3 py-2">
          {cabecalho}
          {/* Mesmo recuo da seta das linhas que abrem, para as datas ficarem alinhadas. */}
          <span aria-hidden className="w-4 shrink-0" />
        </div>
      )}
      {temDetalhe && aberta && (
        <div id={id} className="space-y-2 px-3 pb-3 pl-8">
          {l.ajustes.length > 0 && (
            <ul className="space-y-1.5">
              {l.ajustes.map((a) => (
                <li key={a.pergunta} className="text-sm text-ink-2">
                  <span className="font-semibold text-ink">{a.acao}</span> <span className="text-xs">({a.pergunta})</span>
                </li>
              ))}
            </ul>
          )}
          {/* A conduta divergente fica junto do resultado: é a distância entre os dois que
              documenta a decisão. */}
          {l.decisaoContraria && (
            <div className="rounded-control border border-border bg-surface-soft p-2.5">
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-2">Conduta do profissional</p>
              <p className="mt-1 text-sm text-ink">{l.decisaoContraria.justificativa}</p>
              <p className="mt-1 text-xs text-ink-2">Registrada em {fmtData(l.decisaoContraria.em)}</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function Mes({
  titulo,
  lista,
  abertoDeInicio,
  fmtData,
}: {
  titulo: string;
  lista: Liberacao[];
  abertoDeInicio: boolean;
  fmtData: (ts: number) => string;
}) {
  const [aberto, setAberto] = React.useState(abertoDeInicio);
  const [todos, setTodos] = React.useState(false);
  const visiveis = todos ? lista : lista.slice(0, POR_MES);
  const id = React.useId();
  return (
    <section className="overflow-hidden rounded-control border border-border">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={id}
        className="flex w-full items-center gap-2 bg-surface-soft px-3 py-2.5 text-left hover:bg-surface-mute"
      >
        {/* O resumo quebra linha em vez de cortar: no celular o "com ajuste" é justamente o
            pedaço que sumia atrás das reticências. */}
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
          <span className="text-sm font-semibold text-ink">{titulo}</span>
          <span className="text-xs text-ink-2">
            · {lista.length} {lista.length === 1 ? "registro" : "registros"} · {contagem(lista)}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-2 transition-transform", aberto && "rotate-180")} aria-hidden />
      </button>
      {aberto && (
        <div id={id}>
          <ol className="divide-y divide-border">
            {visiveis.map((l) => (
              <LinhaRegistro key={l.id} l={l} fmtData={fmtData} />
            ))}
          </ol>
          {lista.length > POR_MES && (
            <button
              type="button"
              onClick={() => setTodos((v) => !v)}
              className="w-full border-t border-border px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-surface-soft"
            >
              {todos ? "Mostrar menos" : `Mostrar os outros ${lista.length - POR_MES}`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export function HistoricoSemaforo({
  historico,
  fmtData,
}: {
  /** liberações do aluno, da mais recente para a mais antiga */
  historico: Liberacao[];
  fmtData: (ts: number) => string;
}) {
  const [soRessalva, setSoRessalva] = React.useState(false);
  const nRessalva = historico.filter(temRessalva).length;
  const lista = soRessalva ? historico.filter(temRessalva) : historico;
  const anoAtual = new Date().getFullYear();

  // Agrupa por mês, preservando a ordem (mais recente primeiro).
  const meses: { chave: string; titulo: string; itens: Liberacao[] }[] = [];
  for (const l of lista) {
    const k = chaveMes(l.data);
    const ultimo = meses[meses.length - 1];
    if (ultimo && ultimo.chave === k) ultimo.itens.push(l);
    else meses.push({ chave: k, titulo: nomeMes(l.data, anoAtual), itens: [l] });
  }

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[17px] font-bold text-ink">
          Histórico {historico.length > 0 && <span className="text-ink-3">· {historico.length}</span>}
        </h2>
        {historico.length > 0 && nRessalva > 0 && (
          <div role="group" aria-label="Filtrar o histórico" className="inline-flex rounded-full bg-surface-soft p-0.5 ring-1 ring-inset ring-border">
            {[
              { v: false, rotulo: "Todos" },
              { v: true, rotulo: `Só com ressalva · ${nRessalva}` },
            ].map((o) => (
              <button
                key={o.rotulo}
                type="button"
                onClick={() => setSoRessalva(o.v)}
                aria-pressed={soRessalva === o.v}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  soRessalva === o.v ? "bg-surface text-ink shadow-soft" : "text-ink-2 hover:text-ink",
                )}
              >
                {o.rotulo}
              </button>
            ))}
          </div>
        )}
      </div>
      {historico.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-2">Nenhum semáforo registrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {meses.map((m, i) => (
            // A chave inclui o filtro para o mês reabrir no estado certo quando a lista muda.
            <Mes key={`${m.chave}-${soRessalva}`} titulo={m.titulo} lista={m.itens} abertoDeInicio={i === 0 || soRessalva} fmtData={fmtData} />
          ))}
        </div>
      )}
    </Card>
  );
}
