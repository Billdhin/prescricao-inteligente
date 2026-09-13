/**
 * FICHAS IMPRIMÍVEIS dos parâmetros de monitoramento, na folha A4 do produto.
 *
 * Duas variantes, com propósitos diferentes:
 *  - "escala" (PSE, dispneia, dor, teste da fala): folha de consulta do profissional, com a
 *    escala inteira, como aplicar, como interpretar, o que fazer se estiver alterado e
 *    QUANDO A MEDIDA VALE MENOS. A tela mostra as cinco coisas (SpecialUI); o papel levava
 *    três, e faltava justamente a que evita o mau uso na prancheta.
 *  - "adesao": registro semanal combinado com o aluno, para preencher à mão.
 *
 * O papel, o cabeçalho corrido e as caixas vêm de `pdfPapel`. A ficha de adesão foi medida
 * com régua: linha de 12 mm (a de 9 mm não cabia letra de adulto), seis semanas (um
 * mesociclo, e não quatro), coluna de observação larga e bloco de assinatura, que faltava
 * num documento que o próprio texto chama de combinado entre profissional e aluno.
 */

import type { MonitoringParameter } from "@/data/monitoringParameters";
import { getReferencia } from "@/data/referencias";
import { abrirDocumento } from "@/lib/abrirDocumento";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { escapar as esc, folhaHtml, rotulo } from "@/lib/pdfPapel";
import { semPontoFinal } from "@/lib/pdfTexto";

const AVISO =
  "Conteúdo educacional de apoio à decisão do profissional de Educação Física: não é conduta médica e não substitui avaliação profissional individualizada. Gerado pelo Mapa da Prescrição.";

const dataLonga = (d = new Date()) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(d);

export interface IdentProf {
  nome?: string;
  cref?: string;
  logoDataUrl?: string;
  /** a cor da marca do profissional: sem ela as fichas saíam no azul do produto */
  corPrimaria?: string;
}

const cssFicha = (acento: string) => `
  * { box-sizing: border-box; }
  ${cabecalhoCss(acento)}
  .escala { width: 100%; border-collapse: collapse; }
  .escala td { padding: 1.5mm 2.5mm; border-bottom: 1px solid ${C.linha}; font-size: 9.5pt; vertical-align: top; }
  .escala tr:nth-child(even) td { background: ${C.papelSuave}80; }
  .escala td.v { width: 18mm; font-weight: 800; color: ${acento}; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .duas { display: flex; gap: 6mm; align-items: flex-start; }
  .duas > * { flex: 1; min-width: 0; }
  .campo { display: inline-block; border-bottom: 1px solid ${C.traco}; padding: 0 2mm 0.5mm; font-weight: 700; }
  .linha-campos { font-size: 9.5pt; color: ${C.ink2}; margin: 0 0 3mm; }
  /* registro à mão: 12 mm de altura é o mínimo para letra de adulto com a prancheta no joelho */
  table.registro { width: 100%; border-collapse: collapse; }
  table.registro th { font-size: 7.5pt; letter-spacing: .06em; text-transform: uppercase; color: ${C.ink2};
    background: ${C.papelSuave}; border: 1px solid ${C.borda}; padding: 1.5mm; text-align: center; }
  table.registro th.esq, table.registro td.esq { text-align: left; }
  table.registro td { border: 1px solid ${C.borda}; height: 11mm; }
  table.registro tr:nth-child(even) td { background: ${C.papelSuave}66; }
  table.registro td.sem { font-weight: 700; color: ${acento}; padding: 0 2mm; font-size: 9.5pt; }
  ol.passos { margin: 0 0 2mm; padding-left: 5mm; }
  ol.passos li { margin-bottom: 1.2mm; }
  /* a base consultada não se parte entre folhas: numa ficha de uma página, partir é virar duas */
  .refs-bloco { break-inside: avoid; }
`;

function folha(o: {
  titulo: string;
  docTipo: string;
  /** nó da espinha do cuidado: escala é consulta (0); adesão é acompanhamento (3) */
  no: number;
  corridoEsq: string;
  ident?: IdentProf;
  corpo: string;
}) {
  const cor = o.ident?.corPrimaria || C.marca;
  const prof = o.ident?.nome || "Mapa da Prescrição";
  return folhaHtml({
    titulo: o.titulo,
    cor,
    css: cssFicha(cor),
    corridoEsq: o.corridoEsq,
    corridoDir: `<b>${esc(prof)}</b>${o.ident?.cref ? ` · CREF ${esc(o.ident.cref)}` : ""}`,
    rodapeEsq: "Mapa da Prescrição",
    rodapeDir: esc(dataLonga()),
    rodapeLegal: AVISO,
    corpo: `
      ${cabecalhoHtml({
        cor,
        logoDataUrl: o.ident?.logoDataUrl,
        logoAltura: 36,
        profissional: prof,
        cref: o.ident?.cref,
        docTipo: o.docTipo,
        no: o.no,
        direita: `<div class="sub">${esc(dataLonga())}</div>`,
      })}
      ${o.corpo}`,
  });
}

/** Referências do parâmetro: as verificadas (refIds) e, sem elas, a citação livre do catálogo. */
function referenciasHtml(p: MonitoringParameter) {
  const itens = (p.refIds ?? [])
    .map((id) => getReferencia(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => `<li>${esc(semPontoFinal(r.autores))}. ${esc(semPontoFinal(r.titulo))}. ${esc(semPontoFinal(r.fonte))}, ${r.ano}.</li>`)
    .join("");
  if (itens) return `<div class="refs-bloco">${rotulo("Base consultada")}<ol class="passos legal">${itens}</ol></div>`;
  return p.referencia ? `${rotulo("Base consultada")}<p class="legal">${esc(p.referencia)}</p>` : "";
}

/** Folha de consulta de uma escala (PSE, dispneia, dor, teste da fala). */
export function printEscalaFicha(
  p: MonitoringParameter,
  ctx?: { alunoNome?: string; objetivo?: string },
  ident?: IdentProf,
) {
  const escala = (p.escala ?? [])
    .map((e) => `<tr><td class="v">${esc(e.valor)}</td><td>${esc(e.rotulo)}</td></tr>`)
    .join("");
  const passos = (p.comoAplicar ?? []).map((s) => `<li>${esc(s)}</li>`).join("");

  abrirDocumento(
    folha({
      titulo: `Escala: ${p.nome}`,
      docTipo: "Ficha de escala",
      no: 0,
      corridoEsq: `<b>${esc(p.nome)}</b>${p.sigla ? ` (${esc(p.sigla)})` : ""} · ficha de escala`,
      ident,
      corpo: `
      <h1>${esc(p.nome)}${p.sigla ? ` <span class="sub" style="font-size:13pt">(${esc(p.sigla)})</span>` : ""}</h1>
      <p class="sub">${esc(p.resumo)}</p>
      <p><span class="tag tag-forte">${esc(p.categoria)}</span></p>
      <div class="linha-campos">Aluno(a): <span class="campo" style="min-width:70mm">${esc(ctx?.alunoNome ?? "")}</span>
        &nbsp;&nbsp;Data: <span class="campo" style="min-width:32mm">&nbsp;</span></div>
      <div class="duas">
        <div>
          ${escala ? `${rotulo("Escala de referência")}<table class="escala"><tbody>${escala}</tbody></table>` : ""}
          ${referenciasHtml(p)}
        </div>
        <div>
          ${passos ? `${rotulo("Como aplicar")}<ol class="passos">${passos}</ol>` : ""}
          ${rotulo("Quando usar")}<p>${esc(p.quandoUsar)}</p>
          ${rotulo("Como interpretar")}<p>${esc(p.comoInterpretar)}</p>
          ${rotulo("Se estiver alterado")}<div class="destaque">${esc(p.seAlterado)}</div>
          ${rotulo("Quando a medida vale menos")}<div class="cartao-suave">${esc(p.menosConfiavel)}</div>
        </div>
      </div>`,
    }),
  );
}

/** Registro semanal de adesão, combinado com o aluno e preenchido à mão. */
export function printAdesaoFicha(
  p: MonitoringParameter,
  ctx?: { alunoNome?: string; objetivo?: string },
  ident?: IdentProf,
) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const cab = `<tr><th class="esq" style="width:22mm">Semana</th>${dias
    .map((d) => `<th style="width:11mm">${d}</th>`)
    .join("")}<th style="width:16mm">PSE média</th><th style="width:14mm">Feitas</th><th class="esq">Observações</th></tr>`;
  // seis semanas: um mesociclo inteiro, que é a unidade do plano; quatro deixava a folha pela metade
  const linhas = [1, 2, 3, 4, 5, 6]
    .map(
      (n) =>
        `<tr><td class="sem esq">Semana ${n}</td>${dias.map(() => "<td></td>").join("")}<td></td><td></td><td></td></tr>`,
    )
    .join("");
  const passos = (p.comoAplicar ?? []).map((s) => `<li>${esc(s)}</li>`).join("");

  abrirDocumento(
    folha({
      titulo: `Ficha de adesão${ctx?.alunoNome ? `: ${ctx.alunoNome}` : ""}`,
      docTipo: "Registro semanal de adesão",
      no: 3,
      corridoEsq: `<b>Registro semanal de adesão</b>${ctx?.alunoNome ? ` · ${esc(ctx.alunoNome)}` : ""}`,
      ident,
      corpo: `
      <h1>Ficha semanal de adesão</h1>
      <p class="sub">Registro combinado entre profissional e aluno: marque cada sessão realizada.</p>
      <div class="linha-campos">Aluno(a): <span class="campo" style="min-width:62mm">${esc(ctx?.alunoNome ?? "")}</span>
        &nbsp;&nbsp;Objetivo: <span class="campo" style="min-width:52mm">${esc(ctx?.objetivo ?? "")}</span></div>
      <div class="linha-campos">Meta semanal combinada: <span class="campo" style="min-width:26mm">&nbsp;</span> sessões
        &nbsp;&nbsp;Período: <span class="campo" style="min-width:30mm">&nbsp;</span> a <span class="campo" style="min-width:30mm">&nbsp;</span></div>
      ${rotulo("Registro de 6 semanas")}
      <table class="registro">${cab}${linhas}</table>
      <p class="mini">Marque V na sessão feita, P na parcial e X na não feita. PSE média: esforço percebido de 0 a 10 na semana.</p>
      <div class="duas">
        <div>${passos ? `${rotulo("Como usar")}<ol class="passos">${passos}</ol>` : ""}</div>
        <div>${rotulo("Leitura prática")}<div class="destaque">${esc(p.comoInterpretar)} ${esc(p.seAlterado)}</div></div>
      </div>
      <div class="assinaturas">
        <div><div class="linha-ass"></div><b>${esc(ident?.nome || "Profissional")}</b><div class="mini">Profissional de Educação Física${ident?.cref ? ` · CREF ${esc(ident.cref)}` : ""}</div></div>
        <div><div class="linha-ass"></div><b>${esc(ctx?.alunoNome || "Aluno(a)")}</b><div class="mini">Ciente do combinado</div></div>
      </div>`,
    }),
  );
}

export function printFichaParametro(
  p: MonitoringParameter,
  ctx?: { alunoNome?: string; objetivo?: string },
  ident?: IdentProf,
) {
  // o contexto (nome do aluno) valia só para a adesão: a folha de escala ia para a pasta sem dono
  if (p.ficha === "adesao") printAdesaoFicha(p, ctx, ident);
  else printEscalaFicha(p, ctx, ident);
}
