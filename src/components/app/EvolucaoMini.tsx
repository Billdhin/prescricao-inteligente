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
 * Marcas "redondas" para o eixo y: passo 1, 2 ou 5 vezes potência de 10, o clássico dos
 * eixos legíveis. Mostrar o teto e o piso crus da janela (138,7 / 127,3) era exatamente o
 * que dava cara de improviso ao gráfico: número de eixo se lê de relance ou atrapalha.
 */
function ticksBonitos(min: number, max: number, alvo = 4): number[] {
  const bruto = (max - min) / alvo;
  if (!(bruto > 0)) return [];
  const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
  const norm = bruto / mag;
  const passo = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / passo) * passo; v <= max + passo * 1e-6; v += passo) out.push(+v.toFixed(6));
  return out;
}

/**
 * Interpolação cúbica MONÓTONA (Fritsch-Carlson): suaviza a linha sem nunca passar acima ou
 * abaixo dos valores medidos. Spline comum "enfeita" com overshoot, e num gráfico clínico um
 * vale que a medida não teve é dado inventado.
 */
function caminhoSuave(pts: { x: number; y: number }[]): string {
  if (pts.length < 3) return `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  const n = pts.length;
  const dx: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / (dx[i] || 1));
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const f = 3 / Math.sqrt(s); t[i] = f * a * m[i]; t[i + 1] = f * b * m[i]; }
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C ${pts[i].x + h} ${pts[i].y + t[i] * h} ${pts[i + 1].x - h} ${pts[i + 1].y - t[i + 1] * h} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

/**
 * A curva em si. Coordenadas em px do próprio viewBox, com `preserveAspectRatio` no padrão:
 * o SVG escala igual nos dois eixos, então ponto é ponto e ângulo é ângulo.
 *
 * As decisões de desenho desta versão, cada uma matando um defeito medido na tela:
 *
 *  - EIXO X PROPORCIONAL AO TEMPO. O comentário lá em cima sempre disse que o intervalo
 *    entre avaliações é parte da leitura, mas o desenho espaçava por índice, então 4 semanas
 *    e 6 meses ocupavam o mesmo vão. Agora a distância horizontal É o intervalo.
 *  - Grade horizontal em marcas redondas, no lugar do teto/piso crus da janela.
 *  - Linha suave por interpolação monótona, sem overshoot (não desenha valor que não houve).
 *  - Faixa clínica mais discreta (opacidade menor) e SEM o degradê da área por cima: era a
 *    sobreposição dos dois que dava o tom barrento. O degradê só existe em medida sem escala.
 *  - Rótulos com defesa de colisão: valor e data somem quando ficariam um sobre o outro, e
 *    todo texto é grampeado na área útil (a última data saía cortada na borda direita).
 */
function Curva({ pontos, escala, sexo }: { pontos: { data: number; valor: number }[]; escala?: EscalaAvaliacao; sexo?: Sexo }) {
  const uid = React.useId().replace(/:/g, "");
  const L = 46; // gutter do eixo y
  const R = 14;
  const T = 22; // espaço para o rótulo de valor acima do ponto mais alto
  const B = 32; // espaço para as datas
  const W = 520;
  const H = 216;
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

  const t0 = pontos[0].data;
  const tN = pontos[pontos.length - 1].data;
  const px = (p: { data: number }, i: number) =>
    tN === t0 ? x0 + (i / Math.max(pontos.length - 1, 1)) * (x1 - x0) : x0 + ((p.data - t0) / (tN - t0)) * (x1 - x0);
  const py = (v: number) => y1 - ((v - dmin) / (dmax - dmin)) * (y1 - y0);
  const xs = pontos.map((p, i) => px(p, i));
  // Texto grampeado na área útil: rótulo centrado num ponto da borda sairia cortado.
  const grampo = (x: number, margem: number) => Math.min(Math.max(x, x0 + margem), x1 - margem);

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
  const temBanda = bandas.length > 0;
  const cortes = bandas.filter((b) => b.f.de > dmin && b.f.de < dmax);

  // Marca redonda que cair em cima de um corte de faixa cede a vez: o corte é o número
  // que carrega significado clínico, a marca é só régua.
  const ticks = ticksBonitos(dmin, dmax).filter((v) => cortes.every((c) => Math.abs(py(c.f.de) - py(v)) > 11));

  const ultimoI = pontos.length - 1;
  // Defesa de colisão dos rótulos: o de hoje sempre aparece; os demais só quando têm ar
  // em relação ao vizinho já mostrado e ao próprio hoje. Sem isso, duas avaliações na
  // mesma quinzena viram números um sobre o outro.
  const visiveis = (folgaMin: number): boolean[] => {
    const v = new Array<boolean>(pontos.length).fill(false);
    let xAnterior = -Infinity;
    for (let i = 0; i < pontos.length; i++) {
      if (i === ultimoI) { v[i] = true; continue; }
      if (xs[i] - xAnterior >= folgaMin && xs[ultimoI] - xs[i] >= folgaMin) {
        v[i] = true;
        xAnterior = xs[i];
      }
    }
    return v;
  };
  const mostraValor = visiveis(42);
  const mostraData = visiveis(60);

  const pts = pontos.map((p, i) => ({ x: xs[i], y: py(p.valor) }));
  const linha = caminhoSuave(pts);
  const area = `${linha} L ${xs[ultimoI]} ${y1} L ${xs[0]} ${y1} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Curva da medida ao longo das avaliações">
      <defs>
        <linearGradient id={`sob-curva-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {bandas.map((b, i) => (
        <g key={i}>
          <rect x={x0} y={b.y} width={x1 - x0} height={b.h} fill={FUNDO_FAIXA[b.f.tom]} opacity="0.45" />
          {/* O rótulo só entra quando a faixa tem altura para ele; senão vira texto
              atravessando a borda de outra faixa. */}
          {b.h >= 20 && (
            <text
              x={x1 - 6}
              y={b.y + 14}
              textAnchor="end"
              fontSize="9.5"
              fontWeight="600"
              letterSpacing="0.5"
              opacity="0.85"
              fill={TEXTO_FAIXA[b.f.tom]}
            >
              {b.f.rotulo.toUpperCase()}
            </text>
          )}
        </g>
      ))}

      {/* A grade fica entre a faixa e a curva: régua atrás do dado, nunca por cima dele. */}
      {ticks.map((v) => (
        <g key={`t${v}`}>
          <line x1={x0} y1={py(v)} x2={x1} y2={py(v)} stroke="var(--ink-3)" strokeWidth="1" opacity="0.14" />
          <text x={x0 - 8} y={py(v) + 3.5} textAnchor="end" fontSize="10.5" fill="var(--ink-3)" className="tabular">
            {fmtValor(v)}
          </text>
        </g>
      ))}
      {cortes.map((b, i) => (
        <g key={`c${i}`}>
          <line x1={x0} y1={py(b.f.de)} x2={x1} y2={py(b.f.de)} stroke={TEXTO_FAIXA[b.f.tom]} strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
          <text x={x0 - 8} y={py(b.f.de) + 3.5} textAnchor="end" fontSize="10.5" fontWeight="600" fill={TEXTO_FAIXA[b.f.tom]} className="tabular">
            {b.f.de}
          </text>
        </g>
      ))}

      {/* O degradê sob a curva só em medida sem escala: sobreposto à faixa clínica ele
          barrenta as duas camadas, e a faixa é a que informa. */}
      {!temBanda && <path d={area} fill={`url(#sob-curva-${uid})`} />}
      <path d={linha} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {pontos.map((p, i) => {
        const atual = i === ultimoI;
        return (
          <g key={i}>
            {atual ? (
              <>
                <circle cx={xs[i]} cy={py(p.valor)} r="10.5" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.28" />
                <circle cx={xs[i]} cy={py(p.valor)} r="6" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
              </>
            ) : (
              <circle cx={xs[i]} cy={py(p.valor)} r="4" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2.5" />
            )}
            {mostraValor[i] && (
              <text x={grampo(xs[i], 16)} y={py(p.valor) - (atual ? 15 : 12)} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink)" className="tabular">
                {fmtValor(p.valor)}
              </text>
            )}
            {mostraData[i] && (
              <text x={grampo(xs[i], 22)} y={y1 + 20} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)">
                {fmtEixoData(p.data)}
              </text>
            )}
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
