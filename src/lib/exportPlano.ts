import type { Aluno } from "@/data/alunos";
import type { MarcaDocumento } from "@/lib/store";
import type { Macrociclo, Mesociclo, Microciclo, PlanoTreino, Sessao } from "@/data/periodizacao";
import { getModelo } from "@/data/periodizacao";
import { getParam } from "@/data/monitoringParameters";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { bibliografia } from "@/data/referencias";
import { desenharProgressao } from "@/lib/gps/progressao";

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
        blocos: s.blocos.map((b) => [b.nome, b.series, b.reps, b.intensidade, b.intervalo]),
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

function sessaoHtml(s: Sessao) {
  const linhas = s.blocos
    .map(
      (b) => `
      <tr>
        <td class="ex">${esc(b.nome ?? "")}</td>
        <td>${esc(b.series ?? "")}</td>
        <td>${esc(b.reps ?? "")}</td>
        <td>${esc(b.intensidade ?? "")}</td>
        <td>${esc(b.intervalo && b.intervalo !== "-" ? b.intervalo : "")}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="sessao">
      <p class="sessao-nome">${esc(s.nome)}${s.foco ? ` <span class="foco">${esc(s.foco)}</span>` : ""}</p>
      ${
        s.blocos.length
          ? `<table class="blocos">
              <thead><tr><th>Exercício</th><th>Séries</th><th>Repetições</th><th>Intensidade</th><th>Intervalo</th></tr></thead>
              <tbody>${linhas}</tbody>
            </table>`
          : `<p class="vazio">Sessão sem exercícios definidos.</p>`
      }
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

  return `
  <section class="meso">
    <h2 class="meso-tit"><span class="num">${i + 1}</span> ${esc(m.nome)}
      <span class="range">semanas ${m.semanaInicio} a ${m.semanaFim}</span></h2>
    <p class="meso-foco">${esc(m.foco)}</p>
    <p class="tend">Volume ${m.tendenciaVolume} · Intensidade ${m.tendenciaIntensidade} · Complexidade ${m.tendenciaComplexidade}${
      m.reavaliacao ? ` · reavaliar ao fim da semana ${m.semanaFim}` : ""
    }</p>
    ${m.capacidades.length ? `<p class="rot">Capacidades priorizadas</p><div class="tags">${m.capacidades.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div>` : ""}
    ${params ? `<p class="rot">Acompanhar</p><div class="tags">${params}</div>` : ""}
    ${lista("Progredir quando", m.criteriosProgressao)}
    ${lista("Regredir ou revisar se", m.criteriosRegressao)}
    ${semanas}
  </section>`;
}

function graficoHtml(macro: Macrociclo) {
  const g = desenharProgressao(macro, 660, 170);
  if (g.vazio) return "";
  const padY = 18;
  // O PDF não tem as variáveis CSS do app; as cores entram literais.
  const cores: Record<string, string> = { Volume: "#2563eb", Intensidade: "#c2410c", Complexidade: "#0e7490" };
  return `
  <section class="bloco">
    <h2>Progressão ao longo das semanas</h2>
    <p class="legenda-nota">Tendência qualitativa por semana. As faixas claras marcam semanas de descarga.</p>
    <svg viewBox="0 0 ${g.largura} ${g.altura}" width="100%" height="170">
      ${g.alivios.map((x) => `<rect x="${(x - 6).toFixed(1)}" y="${padY}" width="12" height="${g.altura - padY * 2}" fill="#f1f5f9" rx="2" />`).join("")}
      ${g.series.map((s) => `<path d="${s.d}" fill="none" stroke="${cores[s.nome]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`).join("")}
      ${g.rotulos.map((r) => `<text x="${r.x.toFixed(1)}" y="${g.altura - 2}" text-anchor="middle" fill="#94a3b8" font-size="8">${r.semana}</text>`).join("")}
    </svg>
    <div class="legenda">
      ${g.series.map((s) => `<span><i style="background:${cores[s.nome]}"></i>${s.nome}</span>`).join("")}
    </div>
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

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Plano de treino · ${esc(aluno.nome)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px; }
    .brand { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
    .brand .prof { font-size: 20px; font-weight: 800; color: #2563eb; }
    .brand .sub { font-size: 12px; color: #64748b; }
    h1 { font-size: 22px; margin: 20px 0 2px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 18px; }
    .aluno { background: #f4f6fb; border-radius: 10px; padding: 12px 14px; font-size: 14px; margin-bottom: 18px; }
    .bloco { margin: 16px 0; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: #2563eb; margin: 0 0 8px; }
    .rot { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #94a3b8; margin: 10px 0 4px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { background: #eaf1fe; color: #2563eb; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
    ul.crit { margin: 4px 0; padding-left: 18px; font-size: 13px; }
    .legenda { display: flex; gap: 14px; font-size: 11px; color: #475569; margin-top: 4px; }
    .legenda i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; }
    .legenda-nota { font-size: 11px; color: #94a3b8; margin: 0 0 4px; }
    .meso { margin: 18px 0; padding-top: 12px; border-top: 1px solid #e7ecf3; page-break-inside: avoid; }
    .meso-tit { font-size: 15px; margin: 0 0 2px; color: #1e293b; text-transform: none; letter-spacing: 0; }
    .meso-tit .num { display: inline-flex; width: 20px; height: 20px; border-radius: 6px; background: #2563eb; color: #fff; font-size: 12px; align-items: center; justify-content: center; margin-right: 6px; }
    .meso-tit .range { font-size: 12px; font-weight: 400; color: #94a3b8; margin-left: 6px; }
    .meso-foco { font-size: 13px; color: #475569; margin: 2px 0 6px; }
    .tend { font-size: 12px; color: #64748b; margin: 0 0 6px; }
    .semana { margin: 10px 0 0; page-break-inside: avoid; }
    .semana-tit { font-size: 13px; font-weight: 700; margin: 10px 0 4px; }
    .semana-tit .tipo { font-size: 11px; font-weight: 600; color: #b45309; background: #fef7e8; border-radius: 999px; padding: 1px 8px; margin-left: 4px; }
    .semana-tit .freq { font-size: 11px; font-weight: 400; color: #94a3b8; margin-left: 6px; }
    .nota { font-size: 11px; color: #94a3b8; margin: 0 0 4px; }
    .sessao { margin: 6px 0 8px; }
    .sessao-nome { font-size: 12px; font-weight: 700; color: #1e293b; margin: 6px 0 3px; }
    .sessao-nome .foco { font-weight: 400; color: #94a3b8; }
    table.blocos { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.blocos th { text-align: left; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #e7ecf3; padding: 3px 4px; }
    table.blocos td { padding: 3px 4px; border-bottom: 1px solid #f1f5f9; color: #475569; vertical-align: top; }
    table.blocos td.ex { color: #1e293b; font-weight: 600; }
    .vazio { font-size: 11px; color: #94a3b8; }
    .foot { margin-top: 24px; border-top: 1px solid #e7ecf3; padding-top: 12px; font-size: 11px; color: #94a3b8; }
    ol.refs { font-size: 11px; color: #475569; padding-left: 18px; margin: 4px 0; }
    @media print { .page { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>
  <div class="page">
    <div class="brand">
      <div style="display:flex;align-items:center;gap:12px">
        ${marca?.logoDataUrl ? `<img src="${marca.logoDataUrl}" alt="" style="height:40px;max-width:140px;object-fit:contain" />` : ""}
        <div><div class="prof">${esc(profissional)}</div>${
          cref ? `<div class="sub" style="font-weight:700;color:#2563eb">CREF ${esc(cref)}</div>` : ""
        }${marca?.empresa ? `<div class="sub">${esc(marca.empresa)}</div>` : ""}<div class="sub">Plano de treino</div></div>
      </div>
      <div class="sub" style="text-align:right">${fmt(plano.data)}${
        marca && (marca.site || marca.email || marca.telefone)
          ? `<br>${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}`
          : ""
      }</div>
    </div>

    <h1>${esc(tituloDoc)}</h1>
    <div class="meta">${plano.semanas} semanas · ${plano.frequenciaSemanal}x por semana · ${esc(modelo.nome)}</div>

    <div class="aluno">
      <strong>${esc(aluno.nome)}</strong>${aluno.idade ? ` · ${aluno.idade} anos` : ""}<br>
      Objetivo: ${esc(plano.objetivo)} · Nível: ${esc(plano.nivel)} · Restrições: ${esc(restr)}
      ${plano.disponibilidade ? `<br>Disponibilidade: ${esc(plano.disponibilidade)}` : ""}
    </div>

    ${graficoHtml(plano.macrociclo)}

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
