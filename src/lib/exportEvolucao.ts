import type { MarcaDocumento } from "@/lib/store";
import { abrirDocumento } from "@/lib/abrirDocumento";
import type { Aluno, Avaliacao } from "@/data/alunos";
import { METRICAS_EVOLUCAO, type DirMetrica } from "@/components/app/EvolucaoMini";
import { getSpecialGroup } from "@/data/specialGroups";
import { getEscala, classificarNaEscala } from "@/data/escalasAvaliacao";
import { getReferencia } from "@/data/referencias";
import { desenharEvolucao } from "@/lib/avaliacao/desenharEvolucao";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { escapar as esc, faixaNumeros, folhaHtml, rotulo } from "@/lib/pdfPapel";
import { numeroBR, semPontoFinal } from "@/lib/pdfTexto";

/**
 * A EVOLUÇÃO DO ALUNO no papel: o documento que o profissional mostra e o aluno leva para
 * casa (e que o próprio aluno baixa pelo app).
 *
 * O que mudou em 12/09/2026, medindo o papel contra a tela:
 *
 * - TINHA METADE DA FOLHA EM BRANCO e nenhum gráfico, enquanto a tela desenha a curva de
 *   cada medida. Agora cada linha traz a minicurva, desenhada pela mesma função da tela
 *   (`desenharEvolucao`), e o topo traz as três leituras principais em corpo grande.
 * - A matriz de datas estourava a largura na QUARTA avaliação (medido: 639 px de 656). O
 *   papel agora imprime primeira, última e a curva inteira, com as intermediárias na própria
 *   curva, então a folha não muda de forma quando o acompanhamento cresce.
 * - CLASSIFICAÇÃO: a tela diz em que faixa o valor cai (escala publicada, com fonte); o papel
 *   imprimia o número cru.
 * - Direção da mudança em PALAVRA, não só em cor: documento impresso costuma sair em tons de
 *   cinza, e a cor sozinha não é dado.
 * - Variação de percentual sai em PONTO PERCENTUAL ("p.p."), como na tela; antes saía "-0,9%",
 *   que é outra coisa.
 * - Cobertura: "medida em 2 das 3 avaliações" quando a medida faltou em alguma.
 * - Período coberto, identificação do aluno e linha de assinatura, que não existiam.
 *
 * Documento honesto: as medidas dependem do método e do dia; a evolução é tendência, não
 * valor exato. O rótulo clínico do grupo NUNCA entra: imprime o `rotuloAluno`.
 */

const fmtLongo = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));
/** "25 jul 26": sem o "de" e sem o ponto, que só alargam a coluna (mesma regra da tela). */
const fmtCurto = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })
    .format(new Date(ts))
    .replace(/\./g, "")
    .replace(/ de /g, " ");

/** Mesma regra do EvolucaoMini (corDelta), em cores do papel. */
function corDeltaPdf(dir: DirMetrica, delta: number): string {
  if (dir === "neutro" || delta === 0) return C.ink2;
  const bom = dir === "menor" ? delta < 0 : delta > 0;
  return bom ? C.sucesso : C.perigo;
}

/** A palavra que acompanha a cor: "na direção certa", "na direção oposta", "sem juízo". */
function palavraDelta(dir: DirMetrica, delta: number): string {
  if (delta === 0) return "sem mudança";
  if (dir === "neutro") return "variação registrada";
  const bom = dir === "menor" ? delta < 0 : delta > 0;
  return bom ? "na direção certa" : "na direção oposta";
}

/** Unidade da VARIAÇÃO: variação de percentual é ponto percentual, e não por cento. */
const unidadeDelta = (unit: string) => (unit.trim() === "%" ? " p.p." : unit.trim() ? ` ${unit.trim()}` : "");
const unidadeValor = (unit: string) => (unit.trim() === "%" ? "%" : unit.trim() ? ` ${unit.trim()}` : "");

export interface EvolucaoPdfOpts {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  profissional: string;
  cref?: string;
  marca?: MarcaDocumento;
}

/**
 * Monta o HTML do documento (função pura, sem tocar em `window`), para o export
 * abaixo e para o guardrail `check:documentos` conseguir varrer a saída.
 */
export function montarEvolucaoHtml({ aluno, avaliacoes, profissional, cref, marca }: EvolucaoPdfOpts): string {
  const cor = marca?.corPrimaria || C.marca;
  const cols = [...avaliacoes].sort((a, b) => a.data - b.data);
  const linhas = METRICAS_EVOLUCAO.filter((m) => cols.some((a) => a.medidas[m.key] != null));
  const sexo = aluno.sexo;

  // Se o aluno tem grupo, o papel mostra o programa em linguagem digna (rotuloAluno).
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const programa = grupo?.rotuloAluno;

  const dias = cols.length >= 2 ? Math.round((cols[cols.length - 1].data - cols[0].data) / 86_400_000) : 0;

  /** Uma linha da tabela: valores, curva, classificação e a variação por extenso. */
  const linhaHtml = (m: (typeof METRICAS_EVOLUCAO)[number]) => {
    const pontos = cols
      .filter((a) => a.medidas[m.key] != null)
      .map((a) => ({ data: a.data, valor: a.medidas[m.key] as number }));
    const primeiro = pontos[0];
    const ultimo = pontos[pontos.length - 1];
    const delta = pontos.length >= 2 ? +(ultimo.valor - primeiro.valor).toFixed(1) : null;

    const curva = (() => {
      if (pontos.length < 2) return `<span class="mini">série de 1 medida</span>`;
      const g = desenharEvolucao(pontos, { largura: 120, altura: 22, margem: 3 });
      const bolinhas = g.pontos
        .map(
          (p, i) =>
            `<circle cx="${p.x}" cy="${p.y}" r="${i === g.pontos.length - 1 ? 2.6 : 1.5}" fill="${
              i === g.pontos.length - 1 ? cor : "#ffffff"
            }" stroke="${cor}" stroke-width="${i === g.pontos.length - 1 ? 0 : 1.1}" />`,
        )
        .join("");
      return `<svg width="${g.largura}" height="${g.altura}" viewBox="0 0 ${g.largura} ${g.altura}" role="img" aria-label="curva de ${esc(
        m.label,
      )}"><path d="${g.d}" fill="none" stroke="${cor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />${bolinhas}</svg>`;
    })();

    const escala = getEscala(m.key);
    const faixa = escala && ultimo ? classificarNaEscala(escala, ultimo.valor, sexo) : undefined;
    const faixaIni = escala && primeiro ? classificarNaEscala(escala, primeiro.valor, sexo) : undefined;
    const classificacao = faixa
      ? `<div class="mini">${esc(faixa.rotulo)}${
          faixaIni && faixaIni.rotulo !== faixa.rotulo ? ` (era ${esc(faixaIni.rotulo)})` : ""
        }</div>`
      : "";

    const cobertura =
      pontos.length < cols.length ? `<div class="mini">medida em ${pontos.length} de ${cols.length} avaliações</div>` : "";

    return `<tr>
      <td><b>${esc(m.label)}</b>${classificacao}${cobertura}</td>
      <td class="num">${numeroBR(primeiro.valor)}<span class="sub">${esc(unidadeValor(m.unit))}</span><div class="mini">${esc(
        fmtCurto(primeiro.data),
      )}</div></td>
      <td class="curva">${curva}</td>
      <td class="num"><b>${numeroBR(ultimo.valor)}<span class="sub">${esc(unidadeValor(m.unit))}</span></b><div class="mini">${esc(
        fmtCurto(ultimo.data),
      )}</div></td>
      <td class="num">${
        delta != null
          ? `<b style="color:${corDeltaPdf(m.dir, delta)}">${delta > 0 ? "+" : ""}${numeroBR(delta)}${esc(
              unidadeDelta(m.unit),
            )}</b><div class="mini">${esc(palavraDelta(m.dir, delta))}</div>`
          : `<span class="sub">sem comparação</span>`
      }</td>
    </tr>`;
  };

  const tabela = linhas.length
    ? `<table class="dados">
        <thead><tr>
          <th>Medida</th>
          <th class="num" style="width:22mm">Primeira</th>
          <th style="width:34mm">Ao longo do tempo</th>
          <th class="num" style="width:24mm">Última</th>
          <th class="num" style="width:30mm">Variação</th>
        </tr></thead>
        <tbody>${linhas.map(linhaHtml).join("")}</tbody>
      </table>`
    : `<p class="sub">Nenhuma medida numérica registrada ainda.</p>`;

  // As três leituras que orientam a maioria das decisões, quando existem.
  const destaques = ["peso", "percentualGordura", "pressaoSistolica", "fcRepouso"]
    .map((k) => linhas.find((m) => m.key === k))
    .filter((m): m is (typeof METRICAS_EVOLUCAO)[number] => Boolean(m))
    .slice(0, 3)
    .map((m) => {
      const pts = cols.filter((a) => a.medidas[m.key] != null).map((a) => a.medidas[m.key] as number);
      const delta = pts.length >= 2 ? +(pts[pts.length - 1] - pts[0]).toFixed(1) : null;
      return {
        rot: m.label,
        valor: `${numeroBR(pts[pts.length - 1])}${unidadeValor(m.unit)}`,
        obs: delta != null ? `${delta > 0 ? "+" : ""}${numeroBR(delta)}${unidadeDelta(m.unit)} ${palavraDelta(m.dir, delta)}` : "primeira medida",
      };
    });

  const anotacoes = cols
    .filter((a) => a.observacoes?.trim())
    .map((a) => `<li><b style="color:${cor}">${esc(fmtLongo(a.data))}:</b> ${esc(a.observacoes!.trim())}</li>`)
    .join("");

  // As escalas usadas na classificação, com a fonte de cada uma.
  const fontes = [...new Set(linhas.map((m) => m.key))]
    .map((k) => getEscala(k))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map(
      (e) =>
        `<li><b>${esc(e.nome)}</b>: ${esc(e.oQueMede)} Limite: ${esc(e.limite)} ${e.refIds
          .map((id) => getReferencia(id))
          .filter((r): r is NonNullable<typeof r> => Boolean(r))
          .map((r) => esc(`${semPontoFinal(r.autores)}. ${semPontoFinal(r.titulo)}. ${semPontoFinal(r.fonte)}, ${r.ano}.`))
          .join(" ")}</li>`,
    )
    .join("");

  const css = `
    * { box-sizing: border-box; }
    ${cabecalhoCss(cor)}
    td.curva { vertical-align: middle; }
    .aluno { display: flex; flex-wrap: wrap; gap: 2mm 6mm; background: ${C.papelSuave}; border-radius: 10px; padding: 3mm 4mm; margin: 0 0 4mm; font-size: 9.5pt; }
    ul.notas { margin: 0; padding-left: 5mm; }
    ul.notas li { margin-bottom: 1.5mm; }
  `;

  return folhaHtml({
    titulo: `Evolução · ${aluno.nome}`,
    cor,
    css,
    corridoEsq: `<b>Evolução do aluno</b> · ${esc(aluno.nome)}`,
    corridoDir: `${esc(profissional)}${cref ? ` · CREF ${esc(cref)}` : ""}`,
    rodapeEsq: cols.length
      ? `${cols.length} ${cols.length === 1 ? "avaliação" : "avaliações"}${dias ? ` em ${dias} dias` : ""}`
      : "sem avaliações",
    rodapeDir: `Emitido em ${esc(fmtLongo(Date.now()))}`,
    rodapeLegal:
      "As medidas dependem do método e das condições de cada dia; leia a evolução como tendência, não como valor exato. Documento de apoio à conduta do profissional responsável. Não constitui diagnóstico. Gerado pelo Mapa da Prescrição.",
    corpo: `
    ${cabecalhoHtml({
      cor,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: "Evolução do aluno",
      no: 4,
      direita: `<div class="sub">${esc(fmtLongo(Date.now()))}</div>`,
    })}

    <h1>Evolução de ${esc(aluno.nome)}</h1>
    <p class="sub">Comparativo das medidas registradas ao longo do acompanhamento.</p>

    <div class="aluno">
      <span><b>${esc(aluno.nome)}</b>${aluno.idade ? ` · ${aluno.idade} anos` : ""}</span>
      ${programa ? `<span>Programa: <b style="color:${cor}">${esc(programa)}</b></span>` : ""}
      ${
        cols.length
          ? `<span>Período: <b>${esc(fmtCurto(cols[0].data))}</b> a <b>${esc(fmtCurto(cols[cols.length - 1].data))}</b>${
              dias ? ` (${dias} dias)` : ""
            }</span>`
          : ""
      }
    </div>

    ${destaques.length ? faixaNumeros(destaques) : ""}

    ${rotulo("Medidas registradas")}
    ${tabela}

    ${anotacoes ? `${rotulo("Anotações por avaliação")}<ul class="notas">${anotacoes}</ul>` : ""}
    ${fontes ? `${rotulo("Escalas usadas na classificação")}<ul class="notas legal">${fontes}</ul>` : ""}

    <div class="assinaturas">
      <div>
        <div class="linha-ass"></div>
        <b>${esc(profissional)}</b>
        <div class="mini">Profissional de Educação Física${cref ? ` · CREF ${esc(cref)}` : ""}</div>
      </div>
      <div>
        <div class="linha-ass"></div>
        <b>Data</b>
        <div class="mini">Conversado com o aluno</div>
      </div>
    </div>`,
  });
}

export function exportEvolucaoPDF(opts: EvolucaoPdfOpts) {
  const html = montarEvolucaoHtml(opts);
  abrirDocumento(html);
}
