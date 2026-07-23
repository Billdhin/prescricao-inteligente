import type { Aluno } from "@/data/alunos";
import type { MarcaDocumento } from "@/lib/store";
import type { Macrociclo, Mesociclo, Microciclo, PlanoTreino, Sessao } from "@/data/periodizacao";
import type { Nivel } from "@/data/types";
import { getModelo, getMetodo, TEND_LABEL, agruparBlocosPorMetodo } from "@/data/periodizacao";
import { getModalidade } from "@/data/modalities";
import { getParam } from "@/data/monitoringParameters";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { bibliografia } from "@/data/referencias";
import { desenharProgressao, posicoesFocos } from "@/lib/gps/progressao";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

const TIPO_SEMANA: Record<Microciclo["tipo"], string> = { carga: "carga", deload: "descarga", teste: "teste" };

/**
 * Semanas seguidas com o mesmo conteúdo viram uma linha só.
 *
 * Um bloco de 4 semanas costuma repetir a mesma estrutura e mudar só na descarga.
 * Imprimir as 4 idênticas gastaria páginas e ainda esconderia o que interessa: onde o
 * plano muda. Agrupar deixa a mudança visível.
 */
function agruparSemanas(microciclos: Microciclo[]) {
  const chave = (m: Microciclo) =>
    JSON.stringify({
      tipo: m.tipo,
      sessoes: m.sessoes.map((s) => ({
        nome: s.nome,
        // `metodo` e `grupoMetodo` entram na chave: semanas que diferem só na técnica de
        // série (um bi-set numa, tradicional noutra) não podem mais se fundir numa linha.
        blocos: s.blocos.map((b) => [b.nome, b.series, b.reps, b.intensidade, b.intervalo, b.formato, b.duracao, b.recuperacao, b.metodo, b.grupoMetodo]),
      })),
    });

  const grupos: { semanas: number[]; micro: Microciclo }[] = [];
  for (const m of microciclos) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && chave(ultimo.micro) === chave(m)) ultimo.semanas.push(m.semana);
    else grupos.push({ semanas: [m.semana], micro: m });
  }
  return grupos;
}

const rotuloSemanas = (semanas: number[]) =>
  semanas.length === 1 ? `Semana ${semanas[0]}` : `Semanas ${semanas[0]} a ${semanas[semanas.length - 1]}`;

/**
 * A sessão sai como quadro: musculação em tabela e cardio em ficha à parte, cada
 * variável na sua linha. Cardio se lê por formato, duração e intensidade (percentual da
 * FCmáx, watts ou pace), não por séries e carga, então não cabe na mesma tabela da força.
 */
function sessaoHtml(s: Sessao) {
  const forca = s.blocos.filter((b) => b.tipo !== "aerobio");
  const cardio = s.blocos.filter((b) => b.tipo === "aerobio");

  // Linha de um exercício. `comSufixo` mostra o método entre parênteses só nos blocos SOLTOS;
  // num grupo, o método já vem na linha-cabeçalho, então a linha do bloco fica limpa.
  const linhaForca = (b: (typeof forca)[number], comSufixo: boolean) => `
            <tr>
              <td class="ex">${esc(b.nome ?? "")}${
                comSufixo && b.metodo && b.metodo !== "tradicional" ? ` <b>(${esc(getMetodo(b.metodo)?.nome ?? "")})</b>` : ""
              }</td>
              <td>${esc(b.series ?? "")}</td>
              <td>${esc(b.reps ?? "")}</td>
              <td>${esc(b.intensidade ?? "")}</td>
              <td>${esc(b.intervalo && b.intervalo !== "-" ? b.intervalo : "")}</td>
            </tr>`;

  const corpoForca = agruparBlocosPorMetodo(forca)
    .map((seg) => {
      if (seg.tipo === "grupo") {
        const info = getMetodo(seg.metodo);
        const nomes = seg.blocos.map((b) => esc(b.nome ?? "")).join(" + ");
        // Blocos do bi/tri/super-set imprimem juntos, sob uma linha que os nomeia ("Bi-set: A + B").
        return (
          `<tr class="grupo-metodo"><td colspan="5"><b>${esc(info?.nome ?? "")}:</b> ${nomes}` +
          (info?.descricao ? ` <span class="grupo-desc">${esc(info.descricao)}</span>` : "") +
          `</td></tr>` +
          seg.blocos.map((b) => linhaForca(b, false)).join("")
        );
      }
      return linhaForca(seg.bloco, true);
    })
    .join("");

  const tabelaForca = forca.length
    ? `<div class="quadro">
        <p class="quadro-tit">Musculação</p>
        <table class="blocos">
          <thead><tr><th>Exercício</th><th>Séries</th><th>Repetições</th><th>Intensidade</th><th>Intervalo</th></tr></thead>
          <tbody>${corpoForca}</tbody>
        </table>
      </div>`
    : "";

  const fichaCardio = cardio.length
    ? `<div class="quadro">
        <p class="quadro-tit">Cardio</p>
        ${cardio
          .map((b) => {
            const atividade = b.modalidade ? getModalidade(b.modalidade)?.nome : undefined;
            const linhas: [string, string | undefined][] = [
              ["Formato", b.formato],
              ["Duração", b.duracao],
              ["Intensidade", b.intensidade],
              ["Recuperação", b.recuperacao && b.recuperacao !== "-" ? b.recuperacao : undefined],
            ];
            return `<div class="cardio">
              <p class="cardio-nome">${esc(atividade ?? b.nome ?? "Aeróbio")}</p>
              ${linhas
                .filter(([, v]) => v)
                .map(([rot, v]) => `<p class="cardio-linha"><span class="cardio-rot">${rot}</span> ${esc(v as string)}</p>`)
                .join("")}
              ${b.observacao ? `<p class="cardio-obs">${esc(b.observacao)}</p>` : ""}
            </div>`;
          })
          .join("")}
      </div>`
    : "";

  return `
    <div class="sessao">
      <p class="sessao-nome">${esc(s.nome)}${s.foco ? ` <span class="foco">${esc(s.foco)}</span>` : ""}</p>
      ${s.blocos.length ? `<div class="quadros">${tabelaForca}${fichaCardio}</div>` : `<p class="vazio">Sessão sem exercícios definidos.</p>`}
    </div>`;
}

function mesoHtml(m: Mesociclo, i: number) {
  const params = m.parametros
    .map((id) => getParam(id)?.nome)
    .filter(Boolean)
    .map((n) => `<span class="tag">${esc(n as string)}</span>`)
    .join("");

  const semanas = agruparSemanas(m.microciclos)
    .map(
      (g) => `
      <div class="semana">
        <p class="semana-tit">${rotuloSemanas(g.semanas)} <span class="tipo">${TIPO_SEMANA[g.micro.tipo]}</span>
          <span class="freq">${g.micro.sessoes.length} ${g.micro.sessoes.length === 1 ? "sessão" : "sessões"} na semana</span></p>
        ${g.micro.nota ? `<p class="nota">${esc(g.micro.nota)}</p>` : ""}
        ${g.micro.sessoes.map(sessaoHtml).join("")}
      </div>`,
    )
    .join("");

  const lista = (t: string, itens: string[]) =>
    itens.length ? `<p class="rot">${t}</p><ul class="crit">${itens.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : "";

  const tags = (t: string, itens: string[]) =>
    itens.length ? `<p class="rot">${t}</p><div class="tags">${itens.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div>` : "";

  // Espelha a tela: Modalidades em foco resolvidas por nome; tipos de exercício como estão.
  const modalidades = (m.modalidades ?? []).map((id) => getModalidade(id)?.nome ?? id);

  return `
  <section class="meso">
    <h2 class="meso-tit"><span class="num">${i + 1}</span> ${esc(m.nome)}
      <span class="range">semanas ${m.semanaInicio} a ${m.semanaFim}</span></h2>
    <p class="meso-foco">${esc(m.foco)}</p>
    <p class="tend">Volume ${TEND_LABEL[m.tendenciaVolume]} · Intensidade ${TEND_LABEL[m.tendenciaIntensidade]} · Complexidade ${TEND_LABEL[m.tendenciaComplexidade]}${
      m.reavaliacao ? ` · reavaliar ao fim da semana ${m.semanaFim}` : ""
    }</p>
    ${tags("Capacidades priorizadas", m.capacidades)}
    ${tags("Modalidades em foco", modalidades)}
    ${tags("Tipos de exercício", m.tiposExercicio)}
    ${params ? `<p class="rot">Acompanhar</p><div class="tags">${params}</div>` : ""}
    ${lista("Progredir quando", m.criteriosProgressao)}
    ${lista("Regredir ou revisar se", m.criteriosRegressao)}
    ${semanas}
  </section>`;
}

function graficoHtml(macro: Macrociclo, nivel?: Nivel) {
  const g = desenharProgressao(macro, 700, 250, nivel);
  if (g.vazio) return "";
  // O PDF não tem as variáveis CSS do app; as cores da pele clínica entram literais.
  // Chaveado por id da série (nunca pelo nome exibido), com fallback na cor de área.
  const cor: Record<string, string> = { vol: "#1b4b66", int: "#9a4f2e", cpx: "#0e7c8a", area: "#1b4b66" };
  // Cores literais da régua de semanas (o PDF não tem as vars de tema): carga = petróleo,
  // descarga = âmbar (mesmo do alívio), teste = teal (mesmo da complexidade).
  const corTick: Record<string, string> = { carga: "#1b4b66", deload: "#f59e0b", teste: "#0e7c8a" };
  const rotuloTick: Record<string, string> = { carga: "Carga", deload: "Descarga", teste: "Teste" };
  const tiposSemana = (["carga", "deload", "teste"] as const).filter((t) => g.microTicks.some((mt) => mt.tipo === t));
  const iconesFase = (f: (typeof g.fases)[number]) =>
    posicoesFocos(f, g.iconRowY)
      .map(
        (p) =>
          `<g transform="${p.transform}" stroke="#475569" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
          p.foco.glifo.paths.map((d) => `<path d="${d}" />`).join("") +
          (p.foco.glifo.circles ?? []).map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" />`).join("") +
          `</g>`,
      )
      .join("");
  // Identidade de fase (Onda 4): tint alternado + rótulo da fase no TOPO da faixa
  // + divisória sólida de 1px na fronteira. O tint sozinho é ~1.16:1 e não lê;
  // quem marca a fase é a divisória e o rótulo. Paridade byte-a-byte com a tela.
  const fases = g.fases
    .map(
      (f) => `
      ${f.indice % 2 === 0 ? `<rect x="${f.x0.toFixed(1)}" y="${g.bandTop}" width="${(f.x1 - f.x0).toFixed(1)}" height="${(g.faixaBottom - g.bandTop).toFixed(1)}" fill="#f2f0ea" opacity="0.6" />` : ""}
      ${f.indice > 0 ? `<line x1="${f.x0.toFixed(1)}" y1="${g.bandTop}" x2="${f.x0.toFixed(1)}" y2="${g.faixaBottom.toFixed(1)}" stroke="#e6e2d8" stroke-width="1" />` : ""}
      <text x="${f.cx.toFixed(1)}" y="10" text-anchor="middle" fill="#1e293b" font-size="10" font-weight="700">${esc(f.nome)}</text>
      ${iconesFase(f)}
      <text x="${f.cx.toFixed(1)}" y="${(g.faixaTop + 12).toFixed(1)}" text-anchor="middle" fill="#94a3b8" font-size="10">${esc(f.spanSemanas)}${f.temDescarga ? " · descarga" : ""}</text>`,
    )
    .join("");
  return `
  <section class="bloco">
    <h2>Progressão ao longo das semanas</h2>
    <p class="legenda-nota">Tendência qualitativa das cargas. As faixas ao pé mostram cada fase e quantas semanas ela dura.</p>
    <svg viewBox="0 0 ${g.largura} ${g.altura}" width="100%" height="230">
      <defs><linearGradient id="volpdf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cor.area}" stop-opacity="0.16" /><stop offset="100%" stop-color="${cor.area}" stop-opacity="0" />
      </linearGradient></defs>
      ${fases}
      ${g.alivios.map((a) => `<rect x="${(a.x - a.w / 2).toFixed(1)}" y="${g.plot.top}" width="${a.w.toFixed(1)}" height="${(g.plot.bottom - g.plot.top).toFixed(1)}" fill="#f59e0b" opacity="0.09" rx="2" />`).join("")}
      <text x="${g.eixo.x.toFixed(1)}" y="${g.eixo.maiorY.toFixed(1)}" text-anchor="end" fill="#94a3b8" font-size="9">maior</text>
      <text x="${g.eixo.x.toFixed(1)}" y="${g.eixo.menorY.toFixed(1)}" text-anchor="end" fill="#94a3b8" font-size="9">menor</text>
      <path d="${g.areaVolume}" fill="url(#volpdf)" stroke="none" />
      ${g.series.map((s) => `<path d="${s.d}" fill="none" stroke="${cor[s.id] ?? cor.area}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`).join("")}
      ${g.microTicks
        .map(
          (t) =>
            `<line x1="${t.x.toFixed(1)}" y1="${g.weekTickTop}" x2="${t.x.toFixed(1)}" y2="${g.weekTickBottom}" stroke="${corTick[t.tipo]}" stroke-width="${t.tipo === "carga" ? 1.5 : 2.5}" stroke-linecap="round" />` +
            (t.rotular ? `<text x="${t.x.toFixed(1)}" y="${g.weekLabelY.toFixed(1)}" text-anchor="middle" fill="#94a3b8" font-size="9">S${t.semana}</text>` : ""),
        )
        .join("")}
    </svg>
    <div class="legenda">
      ${g.series.map((s) => `<span><i style="background:${cor[s.id] ?? cor.area}"></i>${s.nome}</span>`).join("")}
    </div>
    ${
      tiposSemana.length
        ? `<div class="legenda legenda-semanas"><span class="lg-rot">Semanas</span>${tiposSemana
            .map((t) => `<span><i class="tick" style="background:${corTick[t]}"></i>${rotuloTick[t]}</span>`)
            .join("")}</div>`
        : ""
    }
  </section>`;
}

/**
 * Exporta o plano de treino como PDF (via a caixa de impressão do navegador →
 * "Salvar como PDF"), com a marca do profissional, o rastro da decisão e as
 * referências que sustentam as faixas. Deve ser chamada a partir de um clique.
 */
export function exportPlanoPDF({
  aluno,
  plano,
  profissional,
  cref,
  marca,
}: {
  aluno: Aluno;
  plano: PlanoTreino;
  profissional: string;
  cref?: string;
  /** logo, empresa e contato do profissional (Configurações > Sua marca) */
  marca?: MarcaDocumento;
}) {
  const modelo = getModelo(plano.modeloId);
  // Documento que chega ao aluno: o título do plano já nasce com o nome de PROGRAMA do
  // grupo, nunca com o rótulo clínico, e o profissional pode reescrevê-lo. O que o grupo
  // acrescenta aqui são os cuidados, não um rótulo no cabeçalho.
  const tituloDoc = plano.titulo;

  const restr = aluno.restricoes.length ? aluno.restricoes.map((r) => rotuloRestricao(r.tag)).join(", ") : "nenhuma";
  const biblio = bibliografia(plano.refIds);
  const reavaliacoes = plano.macrociclo.mesociclos.filter((m) => m.reavaliacao).map((m) => m.semanaFim);

    // Acento do documento: a cor da marca do profissional, senão a do produto (pele clínica).
  const corMarca = marca?.corPrimaria || "#1b4b66";

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Plano de treino · ${esc(aluno.nome)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px; }
    ${cabecalhoCss(corMarca)}
    h1 { font-size: 22px; margin: 20px 0 2px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 18px; }
    .aluno { background: #f2f0ea; border-radius: 10px; padding: 12px 14px; font-size: 14px; margin-bottom: 18px; }
    .bloco { margin: 16px 0; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: ${corMarca}; margin: 0 0 8px; }
    .rot { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #94a3b8; margin: 10px 0 4px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { background: #f2f0ea; color: #1e293b; border: 1px solid #e6e2d8; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
    ul.crit { margin: 4px 0; padding-left: 18px; font-size: 13px; }
    .legenda { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; font-size: 11px; color: #475569; margin-top: 4px; }
    .legenda i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; }
    .legenda i.tick { width: 3px; height: 11px; border-radius: 2px; }
    .legenda-semanas { gap: 12px; margin-top: 2px; }
    .legenda .lg-rot { color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; font-size: 10px; }
    .legenda-nota { font-size: 11px; color: #94a3b8; margin: 0 0 4px; }
    .meso { margin: 18px 0; padding-top: 12px; border-top: 1px solid #e6e2d8; page-break-inside: avoid; }
    .meso-tit { font-size: 15px; margin: 0 0 2px; color: #1e293b; text-transform: none; letter-spacing: 0; }
    .meso-tit .num { display: inline-flex; width: 20px; height: 20px; border-radius: 6px; background: ${corMarca}; color: #fff; font-size: 12px; align-items: center; justify-content: center; margin-right: 6px; }
    .meso-tit .range { font-size: 12px; font-weight: 400; color: #94a3b8; margin-left: 6px; }
    .meso-foco { font-size: 13px; color: #475569; margin: 2px 0 6px; }
    .tend { font-size: 12px; color: #64748b; margin: 0 0 6px; }
    .semana { margin: 10px 0 0; page-break-inside: avoid; }
    .semana-tit { font-size: 13px; font-weight: 700; margin: 10px 0 4px; }
    .semana-tit .tipo { font-size: 11px; font-weight: 600; color: #b45309; background: #fef4e2; border-radius: 999px; padding: 1px 8px; margin-left: 4px; }
    .semana-tit .freq { font-size: 11px; font-weight: 400; color: #94a3b8; margin-left: 6px; }
    .nota { font-size: 11px; color: #94a3b8; margin: 0 0 4px; }
    .sessao { margin: 6px 0 8px; }
    .sessao-nome { font-size: 12px; font-weight: 700; color: #1e293b; margin: 6px 0 3px; }
    .sessao-nome .foco { font-weight: 400; color: #94a3b8; }
    table.blocos { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.blocos th { text-align: left; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #e6e2d8; padding: 3px 4px; }
    table.blocos td { padding: 3px 4px; border-bottom: 1px solid #e6e2d8; color: #475569; vertical-align: top; }
    table.blocos td.ex { color: #1e293b; font-weight: 600; }
    table.blocos tr.grupo-metodo td { background: #f2f0ea; color: #1e293b; font-size: 11px; padding-top: 5px; }
    table.blocos tr.grupo-metodo .grupo-desc { color: #94a3b8; font-weight: 400; }
    .quadros { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; }
    .quadro { flex: 1 1 260px; min-width: 240px; border: 1px solid #e6e2d8; border-radius: 6px; overflow: hidden; }
    .quadro-tit { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #475569; background: #f2f0ea; margin: 0; padding: 4px 8px; border-bottom: 1px solid #e6e2d8; }
    .quadro table.blocos { padding: 2px 6px 4px; }
    .quadro table.blocos th, .quadro table.blocos td { padding: 3px 6px; }
    .cardio { padding: 5px 8px; border-bottom: 1px solid #e6e2d8; }
    .cardio:last-child { border-bottom: 0; }
    .cardio-nome { font-size: 11px; font-weight: 700; color: #1e293b; margin: 0 0 2px; }
    .cardio-linha { font-size: 11px; color: #475569; margin: 1px 0; }
    .cardio-rot { display: inline-block; min-width: 68px; color: #94a3b8; }
    .cardio-obs { font-size: 10px; color: #94a3b8; margin: 3px 0 0; }
    .vazio { font-size: 11px; color: #94a3b8; }
    .foot { margin-top: 24px; border-top: 1px solid #e6e2d8; padding-top: 12px; font-size: 11px; color: #94a3b8; }
    ol.refs { font-size: 11px; color: #475569; padding-left: 18px; margin: 4px 0; }
    @media print { .page { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>
  <div class="page">
    ${cabecalhoHtml({
      cor: corMarca,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: "Plano de treino",
      no: 1,
      direita: `<div class="sub">${fmt(plano.data)}${
        marca && (marca.site || marca.email || marca.telefone)
          ? `<br>${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}`
          : ""
      }</div>`,
    })}

    <h1>${esc(tituloDoc)}</h1>
    <div class="meta">${plano.semanas} semanas · ${plano.frequenciaSemanal}x por semana · ${esc(modelo.nome)}</div>

    <div class="aluno">
      <strong>${esc(aluno.nome)}</strong>${aluno.idade ? ` · ${aluno.idade} anos` : ""}<br>
      Objetivo: ${esc(plano.objetivo)} · Nível: ${esc(plano.nivel)} · Restrições: ${esc(restr)}
      ${plano.disponibilidade ? `<br>Disponibilidade: ${esc(plano.disponibilidade)}` : ""}
    </div>

    ${graficoHtml(plano.macrociclo, plano.nivel)}

    <section class="bloco">
      <h2>Por que este plano</h2>
      <p style="font-size:13px">${esc(plano.raciocinio)}</p>
      <p class="rot">Como o modelo funciona</p>
      <p style="font-size:13px;color:#475569">${esc(modelo.comoFunciona)}</p>
      <p class="rot">Racional científico</p>
      <p style="font-size:13px;color:#475569">${esc(modelo.racionalCientifico)}</p>
      ${
        reavaliacoes.length
          ? `<p class="rot">Reavaliação prevista</p><p style="font-size:13px;color:#475569">Ao fim das semanas ${reavaliacoes.join(", ")}.</p>`
          : ""
      }
    </section>

    <section class="bloco">
      <h2>Macrociclo: ${esc(plano.macrociclo.objetivoGeral)}</h2>
      ${plano.macrociclo.mesociclos.map(mesoHtml).join("")}
    </section>

    ${
      biblio.length
        ? `<section class="bloco">
            <h2>Base científica</h2>
            <ol class="refs">
              ${biblio
                .map(
                  (b) =>
                    `<li>${esc(b.ref.autores)}. ${esc(b.ref.titulo)}. ${esc(b.ref.fonte)}, ${b.ref.ano}.${
                      b.ref.doi ? ` doi:${esc(b.ref.doi)}` : ""
                    }</li>`,
                )
                .join("")}
            </ol>
          </section>`
        : ""
    }

    <div class="foot">
      As faixas deste plano são referência de diretriz e não substituem a decisão do profissional
      responsável. Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional
      individualizada nem prescrição clínica. Gerado por Prescrição Inteligente.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) {
    alert("Permita pop-ups para exportar o plano em PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
