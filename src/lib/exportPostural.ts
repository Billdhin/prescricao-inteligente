import type { MarcaDocumento } from "@/lib/store";
import { abrirDocumento } from "@/lib/abrirDocumento";
import type { Aluno } from "@/data/alunos";
import {
  type AvaliacaoPostural,
  CHECKPOINTS_POSTURAIS,
  ROTULO_VISTA,
  RESSALVA_ACHADOS,
  RESSALVA_MEDIDAS,
  ehReferencia,
  type VistaPostural,
} from "@/data/postural";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { escapar as esc, faixaNumeros, folhaHtml, rotulo } from "@/lib/pdfPapel";

const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

/**
 * LAUDO DE RASTREIO POSTURAL, na folha A4 do produto.
 *
 * O que mudou em 12/09/2026:
 *
 * - A tabela e o laudo diziam a MESMA coisa, palavra por palavra, na mesma página: o laudo
 *   automático repete os achados que a tabela já lista. Agora a tabela é o dado e o laudo é o
 *   texto assinado; quando o laudo é o automático, o papel imprime as ressalvas (fonte única
 *   em `data/postural`) em vez da lista repetida.
 * - As MEDIDAS da análise por visão computacional (`avaliacao.analises`) nunca eram impressas
 *   de forma estruturada: só existiam dentro do texto, e sumiam se o profissional reescrevesse
 *   o laudo. Agora saem em tabela, com a classificação e a confiança de cada uma.
 * - A foto de cada vista fica AO LADO dos achados daquela vista, e não num bloco solto no topo
 *   que empurrava as tabelas para a segunda folha.
 * - Achado fora do padrão sai na cor semântica de atenção, e não na cor da MARCA: gravidade
 *   clínica e identidade visual não podem ser a mesma coisa.
 * - Documento assinável: identificação do aluno, cabeçalho corrido em toda folha e linha de
 *   assinatura do profissional, que faltavam.
 */
export function exportPosturalPDF({
  aluno,
  avaliacao,
  profissional,
  cref,
  marca,
}: {
  aluno: Aluno;
  avaliacao: AvaliacaoPostural;
  profissional: string;
  cref?: string;
  marca?: MarcaDocumento;
}) {
  const cor = marca?.corPrimaria || C.marca;
  const porId = new Map(CHECKPOINTS_POSTURAIS.map((c) => [c.id, c]));
  const vistas: VistaPostural[] = ["anterior", "lateral", "posterior"];
  const laudoProprio = avaliacao.resumo?.trim();
  const temFoto = vistas.some((v) => avaliacao.fotos?.[v]);

  const desvios = avaliacao.observacoes.filter((o) => {
    const cp = porId.get(o.checkpointId);
    return cp && !ehReferencia(cp, o.achado);
  });
  const medidas = vistas.flatMap((v) => (avaliacao.analises?.[v]?.medidas ?? []).map((m) => ({ v, m })));
  const vistasObservadas = vistas.filter((v) => avaliacao.observacoes.some((o) => porId.get(o.checkpointId)?.vista === v));

  const blocos = vistas
    .map((v) => {
      const obs = avaliacao.observacoes.filter((o) => porId.get(o.checkpointId)?.vista === v);
      if (obs.length === 0) return "";
      const foto = avaliacao.fotos?.[v];
      const linhas = obs
        .map((o) => {
          const cp = porId.get(o.checkpointId)!;
          const ref = ehReferencia(cp, o.achado);
          // gravidade na família semântica; a cor da marca é identidade, não achado clínico
          const achado = ref
            ? `<span class="sub">${esc(o.achado)}</span>`
            : `<b style="color:${C.alerta}">${esc(o.achado)}</b>`;
          const nota = o.nota ? `<div class="mini">${esc(o.nota)}</div>` : "";
          return `<tr><td>${esc(cp.regiao)}</td><td>${achado}${nota}</td></tr>`;
        })
        .join("");
      return `<div class="vista">
        ${rotulo(ROTULO_VISTA[v])}
        <div class="vista-corpo">
          ${foto ? `<img class="foto" src="${foto}" alt="" />` : ""}
          <table class="dados">
            <thead><tr><th style="width:34%">Região</th><th>Achado</th></tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>`;
    })
    .join("");

  const medidasHtml = medidas.length
    ? `${rotulo("Medidas estimadas por imagem")}
       <table class="dados">
         <thead><tr><th>Vista</th><th>Medida</th><th class="num">Valor</th><th>Classificação</th><th class="num">Confiança</th></tr></thead>
         <tbody>${medidas
           .map(
             ({ v, m }) =>
               `<tr><td>${esc(ROTULO_VISTA[v])}</td><td>${esc(m.rotulo)}</td><td class="num">${esc(m.valor)}</td><td>${esc(
                 m.classificacao ?? "inconclusivo, ajustar manualmente",
               )}</td><td class="num">${Math.round(m.confianca * 100)}%</td></tr>`,
           )
           .join("")}</tbody>
       </table>
       <p class="mini">${esc(RESSALVA_MEDIDAS)}</p>`
    : "";

  // O laudo automático repete a tabela: nesse caso o papel imprime a ressalva, não a repetição.
  const laudoBloco = laudoProprio
    ? `${rotulo("Laudo do profissional")}<div class="destaque laudo">${esc(laudoProprio)}</div>`
    : `${rotulo("Leitura do rastreio")}<div class="destaque laudo">${
        desvios.length === 0
          ? "Nas vistas observadas, os pontos avaliados ficaram dentro do padrão de referência. Sem achados a destacar neste rastreio."
          : `${desvios.length} ${desvios.length === 1 ? "ponto ficou" : "pontos ficaram"} fora do padrão de referência, listados acima por vista. ${RESSALVA_ACHADOS}`
      }</div>`;
  // com foto, o laudo vem depois das vistas; sem foto, ele ocupa a coluna vaga da grade
  const laudoHtml = temFoto ? laudoBloco : "";
  const laudoNaGrade = temFoto ? "" : `<div class="vista">${laudoBloco}</div>`;

  const css = `
    * { box-sizing: border-box; }
    /*
     * O rastreio fecha em UMA folha. Com a densidade padrão do papel ele terminava a folha 1
     * no último achado e jogava só a linha de assinatura para uma folha 2 vazia: laudo
     * assinável cuja assinatura chega separada do laudo. São 15 linhas de achado, então o
     * que resolve é o passo da linha, não a margem.
     */
    table.dados td { padding: 1.4mm 2.5mm; }
    .rotulo { margin: 3.5mm 0 1.5mm; }
    .numeros { margin-bottom: 3mm; }
    .numeros > div { padding: 2.2mm 3mm; }
    .assinaturas { margin-top: 3mm; }
    ${cabecalhoCss(cor)}
    .vistas { display: flex; flex-wrap: wrap; gap: 0 6mm; }
    .vista { break-inside: avoid; margin-bottom: 1mm; }
    .vistas.lado-a-lado > .vista { flex: 1 1 44%; min-width: 0; }
    .vista-corpo { display: flex; gap: 4mm; align-items: flex-start; }
    .vista-corpo .foto { width: 38mm; border-radius: 8px; border: 1px solid ${C.borda}; object-fit: cover; }
    .vista-corpo table { flex: 1; }
    .laudo { white-space: pre-line; color: ${C.ink}; }
    .aluno { display: flex; flex-wrap: wrap; gap: 2mm 6mm; background: ${C.papelSuave}; border-radius: 10px; padding: 3mm 4mm; margin: 0 0 4mm; font-size: 9.5pt; }
    .aluno b { font-weight: 700; }
  `;

  abrirDocumento(
    folhaHtml({
      titulo: `Rastreio postural · ${aluno.nome}`,
      cor,
      css,
      corridoEsq: `<b>Rastreio postural</b> · ${esc(aluno.nome)}`,
      corridoDir: `${esc(profissional)}${cref ? ` · CREF ${esc(cref)}` : ""}`,
      rodapeEsq: `Rastreio de ${esc(fmt(avaliacao.data))}`,
      rodapeDir: `Impresso em ${esc(fmt(Date.now()))}`,
      rodapeLegal:
        "Rastreio visual de apoio à conduta do profissional responsável. Não constitui diagnóstico nem medição por imagem. Gerado pelo Mapa da Prescrição.",
      corpo: `
    ${cabecalhoHtml({
      cor,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: "Rastreio postural",
      no: 0,
      direita: `<div class="sub">Rastreio de ${esc(fmt(avaliacao.data))}</div>`,
    })}

    <h1>Rastreio postural de ${esc(aluno.nome)}</h1>
    <p class="sub">Rastreio visual assistido. Não substitui exame nem medição instrumental.</p>

    <div class="aluno">
      <span><b>${esc(aluno.nome)}</b>${aluno.idade ? ` · ${aluno.idade} anos` : ""}</span>
      <span>Objetivo: <b>${esc(aluno.objetivo ?? "não declarado")}</b></span>
      <span>Rastreio de <b>${esc(fmt(avaliacao.data))}</b></span>
    </div>

    ${faixaNumeros([
      { rot: "Fora do padrão", valor: String(desvios.length), obs: `de ${avaliacao.observacoes.length} pontos observados` },
      { rot: "Vistas observadas", valor: String(vistasObservadas.length), obs: vistasObservadas.map((v) => ROTULO_VISTA[v].toLowerCase()).join(", ") || "nenhuma" },
      { rot: "Medidas por imagem", valor: String(medidas.length), obs: medidas.length ? "estimativas de triagem" : "sem análise automática" },
    ])}

    <div class="vistas${temFoto ? "" : " lado-a-lado"}">${blocos}${laudoNaGrade}</div>
    ${medidasHtml}
    ${laudoHtml}

    <div class="assinaturas">
      <div>
        <div class="linha-ass"></div>
        <b>${esc(profissional)}</b>
        <div class="mini">Profissional de Educação Física${cref ? ` · CREF ${esc(cref)}` : ""}</div>
      </div>
      <div>
        <div class="linha-ass"></div>
        <b>Data</b>
        <div class="mini">Assinatura do rastreio</div>
      </div>
    </div>`,
    }),
  );
}
