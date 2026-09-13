/**
 * O REGISTRO DO SEMÁFORO DE LIBERAÇÃO no papel: o gate pré-sessão que vai para a pasta do
 * aluno, assinado pelos dois.
 *
 * O que mudou em 12/09/2026, depois de comparar o papel com a tela:
 *
 * - O rótulo e a frase do resultado vêm de `data/semaforo` (`resultado.rotulo`,
 *   `fraseResultado`). O papel tinha um dicionário próprio, que é como um documento
 *   assinável passa a discordar da tela sem ninguém perceber.
 * - Cada item traz a RESPOSTA e, quando ela não é verde, a marca de gravidade em texto
 *   (Atenção / Não liberado) além da cor: o documento costuma sair de impressora em tons de
 *   cinza, e severidade só por cor vira informação perdida.
 * - A ação vem com a PERGUNTA que a gerou, como na tela.
 * - A hora impressa é a do REGISTRO do gate, não a da impressão (que vai no rodapé).
 * - A conduta divergente, quando existe, entra no documento: o produto existe para não
 *   deixar "não liberado" convivendo com treino feito sem explicação.
 */

import type { ChecklistSemaforo, ResultadoSemaforo } from "@/data/semaforo";
import { fraseResultado } from "@/data/semaforo";
import { abrirDocumento } from "@/lib/abrirDocumento";
import { getReferencia } from "@/data/referencias";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { escapar as esc, folhaHtml, rotulo } from "@/lib/pdfPapel";
import { semPontoFinal } from "@/lib/pdfTexto";

/** Cor e marca TEXTUAL de cada severidade: sem a marca, a folha em cinza perde o alerta. */
const SEV = {
  verde: { hex: C.sucesso, bg: C.sucessoTint, marca: "ok" },
  amarelo: { hex: C.alerta, bg: C.alertaTint, marca: "atenção" },
  vermelho: { hex: C.perigo, bg: C.perigoTint, marca: "não liberado" },
} as const;

const dataHora = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));

export interface ExtraSemaforo {
  /** quando o gate foi registrado (a impressão pode ser horas depois) */
  registradoEm?: number;
  /** conduta divergente registrada pelo profissional diante do resultado */
  conduta?: string;
}

export function printSemaforo(
  grupoNome: string,
  checklist: ChecklistSemaforo,
  respostas: Record<string, string>,
  resultado: ResultadoSemaforo,
  alunoNome?: string,
  profissional?: string,
  cref?: string,
  logoDataUrl?: string,
  /**
   * A cor da marca do profissional. Sem ela o semáforo era o ÚNICO documento em azul do
   * produto enquanto o plano, a evolução e o prontuário saíam na cor dele: dois papéis do
   * mesmo profissional, na mesma pasta, com duas identidades.
   */
  corPrimaria?: string,
  extra?: ExtraSemaforo,
) {
  const acento = corPrimaria || C.marca;
  const sev = SEV[resultado.cor];
  const agora = Date.now();
  const quando = extra?.registradoEm ?? agora;

  const linhas = checklist.itens
    .map((item, i) => {
      const op = item.opcoes.find((o) => o.valor === respostas[item.id]);
      if (!op) return "";
      const s = SEV[op.cor];
      const fundo = op.cor === "verde" ? "" : ` style="background:${s.bg}"`;
      return `<tr>
        <td class="num-item">${i + 1}</td>
        <td>${esc(item.pergunta)}</td>
        <td${fundo}><span class="ponto" style="background:${s.hex}"></span><b>${esc(op.rotulo)}</b>${
          op.cor === "verde" ? "" : `<span class="sev" style="color:${s.hex}"> · ${s.marca}</span>`
        }</td>
      </tr>`;
    })
    .join("");

  const acoes = resultado.ajustes
    .map((a) => `<li><b>${esc(a.acao)}</b><span class="mini"> (${esc(a.pergunta)})</span></li>`)
    .join("");

  const refs = resultado.refs
    .map(getReferencia)
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => `<li>${esc(semPontoFinal(r.autores))}. ${esc(semPontoFinal(r.titulo))}. ${esc(semPontoFinal(r.fonte))}, ${r.ano}.</li>`)
    .join("");

  // O checklist geral não é gate próprio da condição: a tela avisa, e o papel calava.
  const avisoGeral =
    checklist.grupoSlug === "geral"
      ? `<div class="cartao-suave" style="margin:0 0 4mm"><b>Checklist geral do dia.</b> Os itens abaixo não são um gate próprio desta condição: são o checklist geral. Use o julgamento clínico e, na dúvida, adie a sessão e encaminhe.</div>`
      : "";

  const condutaHtml = extra?.conduta
    ? `${rotulo("Conduta registrada pelo profissional")}
       <div class="destaque"><b>Decidiu diferente do que o semáforo indicou.</b> ${esc(extra.conduta)}</div>`
    : "";

  const css = `
    * { box-sizing: border-box; }
    ${cabecalhoCss(acento)}
    .resultado { border-radius: 12px; padding: 4mm 5mm; margin: 4mm 0 5mm; background: ${sev.bg}; border: 1px solid ${sev.hex}44; break-inside: avoid; }
    .resultado .titulo { font-size: 16pt; font-weight: 800; color: ${sev.hex}; line-height: 1.2; }
    .resultado p { margin: 1mm 0 0; color: ${C.ink2}; }
    table.itens { width: 100%; border-collapse: collapse; }
    table.itens thead { display: table-header-group; }
    table.itens th { text-align: left; font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase; color: ${C.ink2};
      background: ${C.papelSuave}; padding: 2mm 2.5mm; border-bottom: 1px solid ${C.borda}; }
    table.itens td { padding: 2mm 2.5mm; border-bottom: 1px solid ${C.linha}; font-size: 9.5pt; vertical-align: top; }
    table.itens tr { break-inside: avoid; }
    td.num-item { width: 7mm; color: ${C.ink2}; font-variant-numeric: tabular-nums; }
    .ponto { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }
    .sev { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    ul.acoes { margin: 0; padding-left: 5mm; }
    ul.acoes li { margin-bottom: 1.5mm; }
    ol.refs { margin: 0; padding-left: 5mm; }
    ol.refs li { margin-bottom: 1mm; }
  `;

  abrirDocumento(
    folhaHtml({
      titulo: `Semáforo de Liberação · ${grupoNome}`,
      cor: acento,
      css,
      corridoEsq: `<b>Semáforo de Liberação</b>${alunoNome ? ` · ${esc(alunoNome)}` : ""}`,
      corridoDir: `${esc(profissional || "Mapa da Prescrição")}${cref ? ` · CREF ${esc(cref)}` : ""}`,
      rodapeEsq: `Registrado em ${esc(dataHora(quando))}`,
      rodapeDir: `Impresso em ${esc(dataHora(agora))}`,
      rodapeLegal:
        "Conteúdo educacional de apoio à decisão do profissional de Educação Física; não é conduta médica e não substitui avaliação profissional individualizada. A decisão de liberar, ajustar ou adiar a sessão é do profissional habilitado. Gerado pelo Mapa da Prescrição (Motor RCD).",
      corpo: `
    ${cabecalhoHtml({
      cor: acento,
      logoDataUrl,
      logoAltura: 38,
      profissional: profissional || "Motor RCD · Raciocínio Clínico Documentado",
      cref,
      // o carimbo "Motor RCD" já sai no bloco direito: repetir aqui era a mesma palavra duas vezes
      docTipo: "Semáforo de Liberação: gate pré-sessão",
      no: 2,
      direita: `<div class="sub">Registrado em ${esc(dataHora(quando))}</div>`,
    })}

    <h1>${esc(grupoNome)}${alunoNome ? `: ${esc(alunoNome)}` : ""}</h1>
    <p class="sub">Checklist de segurança pré-sessão respondido pelo profissional.</p>

    <div class="resultado">
      <div class="titulo">${esc(resultado.rotulo)}</div>
      <p>${esc(fraseResultado(resultado.cor))}</p>
      ${acoes ? `<ul class="acoes" style="margin-top:2.5mm">${acoes}</ul>` : ""}
    </div>

    ${avisoGeral}
    ${rotulo("Itens verificados")}
    <table class="itens"><thead><tr><th>#</th><th>Pergunta</th><th>Resposta</th></tr></thead><tbody>${linhas}</tbody></table>

    ${condutaHtml}
    ${refs ? `${rotulo("Base consultada")}<ol class="refs legal">${refs}</ol>` : ""}

    <div class="destaque" style="margin-top:6mm">
      Ao assinar, profissional e aluno registram que a conduta do dia foi conversada e
      compreendida: o resultado acima, os ajustes indicados e, se for o caso, a orientação de
      adiar a sessão ou procurar avaliação de saúde.
    </div>
    <div class="assinaturas">
      <div>
        <div class="linha-ass"></div>
        <b>${esc(profissional || "Profissional responsável")}</b>
        <div class="mini">Profissional de Educação Física${cref ? ` · CREF ${esc(cref)}` : ""}</div>
      </div>
      <div>
        <div class="linha-ass"></div>
        <b>${esc(alunoNome || "Aluno")}</b>
        <div class="mini">Ciente da conduta do dia</div>
      </div>
    </div>
`,
    }),
  );
}
