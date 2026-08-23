import * as React from "react";
import type { Avaliacao, Sexo } from "@/data/alunos";
import {
  getEscala,
  faixasDe,
  classificarNaEscala,
  type EscalaAvaliacao,
  type TomFaixa,
} from "@/data/escalasAvaliacao";
import { bibliografia } from "@/data/referencias";
import { cn } from "@/lib/utils";

/**
 * Evolução do aluno em uma métrica ao longo das avaliações: seletor de métrica,
 * resumo do delta e mini-gráfico da série. Vivia embutido no AlunoDetail; virou
 * componente reutilizável para servir também ao painel "Como estava antes" da
 * reavaliação (AvaliacaoModal), sem duplicar a lógica da série nem do desenho.
 */

// `dir` = direção desejável da métrica: "menor" (cair é bom), "maior" (subir é
// bom), "neutro" (sem juízo de valor). Colore o delta pela direção certa, então
// ganhar massa muscular aparece como positivo, não como alerta.
export type DirMetrica = "menor" | "maior" | "neutro";
export type MetricaEvolucao = { key: string; label: string; unit: string; dir: DirMetrica };

export const METRICAS_EVOLUCAO: MetricaEvolucao[] = [
  { key: "peso", label: "Peso", unit: "kg", dir: "neutro" },
  { key: "percentualGordura", label: "% gordura", unit: "%", dir: "menor" },
  { key: "cintura", label: "Cintura", unit: "cm", dir: "menor" },
  { key: "quadril", label: "Quadril", unit: "cm", dir: "neutro" },
  { key: "massaMuscular", label: "Massa muscular", unit: "kg", dir: "maior" },
  { key: "imc", label: "IMC", unit: "", dir: "neutro" },
  { key: "fcRepouso", label: "FC repouso", unit: "bpm", dir: "menor" },
  { key: "pressaoSistolica", label: "PA sistólica", unit: "mmHg", dir: "menor" },
];

// Subconjunto-chave para o painel "Como estava antes" da reavaliação: peso, IMC e
// % de gordura são as três leituras que orientam a maioria das decisões de rumo.
export const METRICAS_CHAVE: MetricaEvolucao[] = METRICAS_EVOLUCAO.filter((m) =>
  ["peso", "imc", "percentualGordura"].includes(m.key),
);

/** Classe de cor do delta segundo a direção desejável da métrica. */
export function corDelta(dir: DirMetrica, delta: number): string {
  if (dir === "neutro" || delta === 0) return "text-ink-2";
  const bom = dir === "menor" ? delta < 0 : delta > 0;
  return bom ? "text-success" : "text-[color:var(--cta-text)]";
}

/* ------------------------------ Evolução ------------------------------ */

/**
 * A EVOLUÇÃO DE UMA MEDIDA, COM A FAIXA CLÍNICA ATRÁS DA CURVA.
 *
 * O que estava aqui era uma polilinha sem eixo, sem data e sem valor, desenhada com
 * `preserveAspectRatio="none"`. O Filipe: "o gráfico da avaliação está bem feio, nada
 * profissional". Estava, e não era só estética: medido num bloco de 112px de altura, o eixo x
 * escalava 7,6 vezes e o y 2,8, então cada ponto virava uma elipse de 46 por 17 pixels e a
 * INCLINAÇÃO DA RETA não representava a variação, era o esticão do navegador.
 *
 * O que o desenho novo acrescenta, e de onde cada coisa vem:
 *
 *  - Geometria correta. Sem `preserveAspectRatio`, o SVG escala igual nos dois eixos.
 *  - O valor de hoje em tamanho de leitura, com a variação escrita por extenso ao lado.
 *    "1,4 kg abaixo" em vez de só a cor do número: cor sozinha não é dado para quem não
 *    distingue verde de vermelho.
 *  - As FAIXAS da escala clínica atrás da curva, quando a medida tem escala publicada
 *    (`escalasAvaliacao`), com o corte exato e a fonte citada no rodapé. É o que transforma
 *    "caiu um pouco" em "saiu da faixa de estágio 1", que é a leitura que decide conduta.
 *    Medida sem escala (peso, massa muscular) não ganha faixa nenhuma, porque não existe
 *    corte publicado para ela e inventar um seria o oposto do que este produto faz.
 *  - A mudança de faixa entre a primeira e a última avaliação vira frase, quando acontece.
 */
export function EvolucaoMini({
  avals,
  metricas = METRICAS_EVOLUCAO,
  valorUnico = false,
  sexo,
}: {
  avals: Avaliacao[];
  /** subconjunto de métricas a oferecer no seletor (padrão: todas as disponíveis) */
  metricas?: MetricaEvolucao[];
  /** com só 1 avaliação, mostra o valor anterior no lugar do aviso de curva
   *  (usado no painel "Como estava antes" da reavaliação) */
  valorUnico?: boolean;
  /** sexo declarado: escalas cujo corte difere por sexo não classificam sem ele */
  sexo?: Sexo;
}) {
  const disponiveis = metricas.filter((m) => avals.some((a) => a.medidas[m.key] != null));
  const [metric, setMetric] = React.useState(disponiveis[0]?.key ?? metricas[0]?.key ?? "peso");

  if (avals.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-2">Registre avaliações para ver a evolução.</p>;
  }

  const cfg = metricas.find((m) => m.key === metric) ?? metricas[0];
  // Ponto = par (data, valor). A data entra porque o eixo passou a existir, e porque o
  // intervalo entre avaliações é parte da leitura: cair 2 kg em 3 semanas não é cair 2 kg
  // em 6 meses.
  const pontos = avals
    .filter((a) => a.medidas[cfg.key] != null)
    .map((a) => ({ data: a.data, valor: a.medidas[cfg.key] as number }))
    .sort((a, b) => a.data - b.data);
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const delta = ultimo && primeiro ? +(ultimo.valor - primeiro.valor).toFixed(1) : 0;

  const escala = getEscala(cfg.key);
  const faixaIni = escala && primeiro ? classificarNaEscala(escala, primeiro.valor, sexo) : undefined;
  const faixaFim = escala && ultimo ? classificarNaEscala(escala, ultimo.valor, sexo) : undefined;
  const mudouDeFaixa = faixaIni && faixaFim && faixaIni.rotulo !== faixaFim.rotulo;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {disponiveis.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            aria-pressed={metric === m.key}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              metric === m.key ? "bg-primary-tint text-primary" : "text-ink-2 hover:bg-surface-soft",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {ultimo != null && (
        <div className="mb-1 flex flex-wrap items-end gap-x-3 gap-y-1">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-3">
              {pontos.length >= 2 ? "Hoje" : "Última avaliação"}
            </p>
            <p className="tabular font-display text-3xl font-bold leading-none text-ink">
              {fmtValor(ultimo.valor)}
              {cfg.unit && (
                <span className={cn("text-base font-semibold text-ink-2", cfg.unit !== "%" && "ml-1")}>{cfg.unit}</span>
              )}
            </p>
          </div>
          {pontos.length >= 2 && (
            <span className={cn("mb-1 rounded-full px-2.5 py-0.5 text-sm font-semibold", tomDelta(cfg.dir, delta))}>
              {fraseDelta(delta, cfg.unit)}
            </span>
          )}
        </div>
      )}

      {/* A mudança de faixa é o que o profissional de fato procura, e ela só é dita quando
          acontece de verdade: sem escala, sem sexo declarado numa escala que exige, ou sem
          mudança, não sai frase nenhuma. */}
      {/*
        A frase nomeia os rotulos como eles sao escritos na escala, sem tentar encaixa-los numa
        regencia. A primeira versao dizia "saiu de X para Y" e saia torta, porque os rotulos da
        diretriz nao sao sintagmas nominais ("Nao caracteriza hipertensao" e uma oracao). O
        formato abaixo funciona para qualquer rotulo, hoje e nos que forem acrescentados.
      */}
      {faixaFim && (
        <p className="mb-3 text-sm text-ink-2">
          Classificação hoje: <span className="font-semibold text-ink">{faixaFim.rotulo}</span>.
          {mudouDeFaixa ? (
            <> Na primeira avaliação era <span className="font-semibold text-ink">{faixaIni!.rotulo}</span>.</>
          ) : null}
        </p>
      )}

      {pontos.length >= 2 ? (
        <Curva pontos={pontos} escala={escala} sexo={sexo} />
      ) : valorUnico && ultimo != null ? (
        <p className="py-1 text-sm text-ink-2">Uma avaliação registrada. A curva começa na próxima.</p>
      ) : (
        <p className="py-4 text-center text-sm text-ink-3">Ao menos duas avaliações para traçar a curva.</p>
      )}

      {escala && pontos.length >= 2 && (
        <p className="mt-3 border-t border-border pt-2.5 text-2xs leading-relaxed text-ink-2">
          Faixas de {escala.nome.toLowerCase()} segundo {bibliografia(escala.refIds)[0]?.ref.fonte ?? "a fonte citada"}.{" "}
          {escala.limite}
        </p>
      )}
    </div>
  );
}

/** "1,4 kg abaixo" / "3 pontos acima" / "sem mudança". Palavra, não só sinal. */
function fraseDelta(d: number, unidade: string): string {
  if (d === 0) return "sem mudança no período";
  return `${comUnidade(Math.abs(d), unidade)} ${d < 0 ? "abaixo" : "acima"}`;
}

/** Fundo e cor do chip do delta, pela direção desejável da métrica. */
function tomDelta(dir: DirMetrica, d: number): string {
  if (dir === "neutro" || d === 0) return "bg-surface-soft text-ink-2 ring-1 ring-inset ring-border";
  const bom = dir === "menor" ? d < 0 : d > 0;
  return bom ? "bg-success-tint text-success" : "bg-warning-tint text-warning";
}

const fmtValor = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

/** Numero com a unidade colada, e o porcento sem espaco ("28,5%", mas "1,5 kg"). */
export function comUnidade(n: number, unidade: string): string {
  return unidade === "%" ? fmtValor(n) + "%" : unidade ? fmtValor(n) + " " + unidade : fmtValor(n);
}

const FUNDO_FAIXA: Record<TomFaixa, string> = {
  bom: "var(--success-tint)",
  atencao: "var(--warning-tint)",
  alerta: "var(--danger-tint)",
};
const TEXTO_FAIXA: Record<TomFaixa, string> = {
  bom: "var(--success)",
  atencao: "var(--warning)",
  alerta: "var(--danger)",
};

/**
 * A curva em si. Coordenadas em px do próprio viewBox, com `preserveAspectRatio` no padrão:
 * o SVG escala igual nos dois eixos, então ponto é ponto e ângulo é ângulo.
 */
function Curva({ pontos, escala, sexo }: { pontos: { data: number; valor: number }[]; escala?: EscalaAvaliacao; sexo?: Sexo }) {
  const L = 46; // gutter do eixo y
  const R = 12;
  const T = 20; // espaço para o rótulo de valor acima do primeiro ponto
  const B = 34; // espaço para as datas
  const W = 520;
  const H = 210;
  const x0 = L;
  const x1 = W - R;
  const y0 = T;
  const y1 = H - B;

  const vals = pontos.map((p) => p.valor);
  const vmin = Math.min(...vals);
  const vmax = Math.max(...vals);
  const amplitude = vmax - vmin;
  // Folga de 18% da amplitude, e um piso absoluto para série quase plana não virar uma
  // linha colada no topo com o eixo mentindo uma variação enorme.
  const folga = Math.max(amplitude * 0.18, Math.abs(vmax) * 0.02, 0.5);
  const dmin = vmin - folga;
  const dmax = vmax + folga;

  const px = (i: number) => x0 + (i / (pontos.length - 1)) * (x1 - x0);
  const py = (v: number) => y1 - ((v - dmin) / (dmax - dmin)) * (y1 - y0);

  const faixas = escala ? faixasDe(escala, sexo) : undefined;
  // Só as faixas que aparecem na janela visível, recortadas nela. Faixa fora do domínio
  // seria uma tarja de cor sem nenhum ponto dentro, que confunde em vez de informar.
  const bandas = (faixas ?? [])
    .map((f) => {
      const topo = py(Math.min(f.ate, dmax));
      const base = py(Math.max(f.de, dmin));
      return { f, y: topo, h: base - topo };
    })
    .filter((b) => b.h > 1);

  const linha = pontos.map((p, i) => `${px(i)} ${py(p.valor)}`).join(" L ");
  const area = `M ${linha} L ${px(pontos.length - 1)} ${y1} L ${x0} ${y1} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Curva da medida ao longo das avaliações">
      <defs>
        <linearGradient id="sob-curva" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {bandas.map((b, i) => (
        <g key={i}>
          <rect x={x0} y={b.y} width={x1 - x0} height={b.h} fill={FUNDO_FAIXA[b.f.tom]} />
          {/* O rótulo só entra quando a faixa tem altura para ele; senão vira texto
              atravessando a borda de outra faixa. */}
          {b.h >= 18 && (
            <text
              x={x1 - 4}
              y={b.y + 13}
              textAnchor="end"
              fontSize="10"
              fontWeight="600"
              fill={TEXTO_FAIXA[b.f.tom]}
            >
              {b.f.rotulo.toUpperCase()}
            </text>
          )}
          {b.f.de > dmin && (
            <line x1={x0} y1={py(b.f.de)} x2={x1} y2={py(b.f.de)} stroke={TEXTO_FAIXA[b.f.tom]} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          )}
        </g>
      ))}

      {/* Referências do eixo y: o teto, o piso e todo corte de faixa que caia dentro. */}
      {[dmax, dmin].map((v, i) => (
        <text key={`e${i}`} x={x0 - 6} y={py(v) + (i === 0 ? 9 : 0)} textAnchor="end" fontSize="10.5" fill="var(--ink-3)" className="tabular">
          {fmtValor(+v.toFixed(1))}
        </text>
      ))}
      {bandas
        .filter((b) => b.f.de > dmin && b.f.de < dmax)
        .map((b, i) => (
          <text key={`c${i}`} x={x0 - 6} y={py(b.f.de) + 3.5} textAnchor="end" fontSize="10.5" fontWeight="600" fill={TEXTO_FAIXA[b.f.tom]} className="tabular">
            {b.f.de}
          </text>
        ))}

      <path d={area} fill="url(#sob-curva)" />
      <path d={`M ${linha}`} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {pontos.map((p, i) => {
        const atual = i === pontos.length - 1;
        return (
          <g key={i}>
            {atual ? (
              <>
                <circle cx={px(i)} cy={py(p.valor)} r="10.5" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.28" />
                <circle cx={px(i)} cy={py(p.valor)} r="5.5" fill="var(--primary)" />
              </>
            ) : (
              <circle cx={px(i)} cy={py(p.valor)} r="4" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2.5" />
            )}
            <text x={px(i)} y={py(p.valor) - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink)" className="tabular">
              {fmtValor(p.valor)}
            </text>
            <text x={px(i)} y={y1 + 20} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)">
              {fmtEixoData(p.data)}
            </text>
          </g>
        );
      })}

      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="var(--border)" strokeWidth="1" />
    </svg>
  );
}

/** "04 jun" no eixo: sem o "de" e sem o ponto, que num rótulo de eixo só ocupam espaço. */
const fmtEixoData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(ts))
    .replace(" de ", " ")
    .replace(".", "");

// Data curta para os cabeçalhos de coluna da tabela comparativa (dd mmm aa).
/** "04 jun 26" no cabecalho da coluna: o "de" e o ponto do pt-BR so alargam a tabela. */
const fmtDataCurta = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })
    .format(new Date(ts))
    .replace(/ de /g, " ")
    .replace(".", "");

/** Seta para cima ou para baixo. Forma, e não só cor: é o que sobrevive ao daltonismo. */
function SetaDirecao({ sobe, cor }: { sobe: boolean; cor: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={cor} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      {sobe ? <path d="M7 12V2M3 6l4-4 4 4" /> : <path d="M7 2v10M3 8l4 4 4-4" />}
    </svg>
  );
}

/**
 * COMPARATIVO POR DATA: medidas nas linhas, avaliações em colunas cronológicas.
 *
 * O Filipe: "a tabela comparativa por data está bem feia, e não fica claro quando não tem
 * dados". O `NaNmmHg` que ele viu era outro defeito, já corrigido na origem (letra digitada
 * num campo numérico virando não-número). O que restava aqui era a tabela:
 *
 *  - A DIREÇÃO só existia na cor do delta. Quem não distingue verde de vermelho lia a tabela
 *    inteira como neutra. Agora a direção é seta mais palavra, e a cor virou reforço.
 *  - A UNIDADE se repetia em toda célula, roubando espaço do número. Ela é da linha inteira,
 *    então subiu para o rótulo e os números ganharam o alinhamento tabular limpo.
 *  - A AUSÊNCIA era um ponto solto, que se lê como sujeira de renderização e não como "não
 *    medido". Agora está escrita.
 *  - A COLUNA DE HOJE, que é a que decide, tinha o mesmo peso das anteriores.
 *
 * Continua sem recalcular nada: lê `medidas` como está, inclusive `imc`. Rola na horizontal
 * em telas estreitas.
 */
export function TabelaEvolucao({ avals }: { avals: Avaliacao[] }) {
  // As avaliações já chegam ascendentes; fixamos a ordem aqui para as colunas.
  const cols = [...avals].sort((a, b) => a.data - b.data);
  const linhas = METRICAS_EVOLUCAO.filter((m) => cols.some((a) => a.medidas[m.key] != null));

  if (cols.length === 0 || linhas.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-2">
        Registre avaliações com medidas para ver a tabela comparativa.
      </p>
    );
  }

  const ultima = cols.length - 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="whitespace-nowrap border-b-2 border-border px-3 pb-2.5 pt-1 text-left text-2xs font-semibold uppercase tracking-wide text-ink-2">
              Medida
            </th>
            {cols.map((a, i) => (
              <th
                key={a.id}
                className={cn(
                  "whitespace-nowrap px-3 pb-2.5 pt-1 text-right text-2xs font-semibold uppercase tracking-wide",
                  i === ultima ? "border-b-2 border-ink text-ink" : "border-b-2 border-border text-ink-3",
                )}
              >
                {fmtDataCurta(a.data)}
                {/* A primeira e a última se nomeiam: é o que o olho procura numa fila de datas. */}
                {(i === 0 || i === ultima) && (
                  <span className="block text-2xs font-normal normal-case tracking-normal">
                    {i === ultima ? "mais recente" : "inicial"}
                  </span>
                )}
              </th>
            ))}
            <th className="w-52 whitespace-nowrap border-b-2 border-border px-3 pb-2.5 pt-1 text-left text-2xs font-semibold uppercase tracking-wide text-ink-2">
              No período
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((m, li) => {
            const serie = cols.map((a) => a.medidas[m.key]);
            const presentes = serie.filter((v): v is number => v != null);
            const primeiro = presentes[0];
            const ultimo = presentes[presentes.length - 1];
            const delta =
              presentes.length >= 2 && primeiro != null && ultimo != null ? +(ultimo - primeiro).toFixed(1) : null;
            const bom = delta == null || m.dir === "neutro" || delta === 0 ? null : m.dir === "menor" ? delta < 0 : delta > 0;
            const cor = bom == null ? "var(--ink-2)" : bom ? "var(--success)" : "var(--warning)";
            const classeTexto = bom == null ? "text-ink-2" : bom ? "text-success" : "text-warning";
            return (
              <tr key={m.key} className={li % 2 === 0 ? "bg-surface-soft" : undefined}>
                <th scope="row" className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-ink">
                  {m.label}
                  {m.unit && <span className="ml-1 text-xs font-normal text-ink-3">{m.unit}</span>}
                </th>
                {serie.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      "tabular whitespace-nowrap px-3 py-2.5 text-right",
                      i === ultima ? "font-bold text-ink" : "text-ink-2",
                    )}
                  >
                    {v != null ? fmtValor(v) : <span className="text-xs italic text-ink-3">não medido</span>}
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  {delta != null && delta !== 0 ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <SetaDirecao sobe={delta > 0} cor={cor} />
                      <span className={cn("tabular text-sm font-semibold", classeTexto)}>
                        {fmtValor(Math.abs(delta))} {delta > 0 ? "acima" : "abaixo"}
                      </span>
                      {/* A palavra que diz se essa direção é a desejada PARA ESTE OBJETIVO.
                          Sem ela, "2,8 kg abaixo" é um fato sem leitura: em emagrecimento é
                          bom, em hipertrofia não é, e a tabela não pode decidir sozinha. */}
                      <span className="text-xs text-ink-3">
                        {m.dir === "neutro" ? "sem juízo" : bom ? "na direção certa" : "na direção oposta"}
                      </span>
                    </span>
                  ) : delta === 0 ? (
                    <span className="text-sm text-ink-2">sem mudança</span>
                  ) : (
                    <span className="text-xs italic text-ink-3">uma medida só</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
