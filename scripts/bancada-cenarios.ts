/**
 * BANCADA DE CENÁRIOS: procura o defeito que os guardrails não procuram.
 *
 * Os 25 checks passam. Isso prova que nenhuma regra conhecida foi violada, e não prova que
 * o plano faz sentido. Esta bancada gera muitos alunos e lê o RESULTADO, procurando
 * incoerência entre o que o plano DIZ e o que ele PRESCREVE, que é a classe de defeito que
 * mais apareceu na história deste motor.
 *
 * As asserções aqui nasceram das superfícies criadas na rodada de evidência (banda aeróbia,
 * formato intervalado, ênfase de modalidade, horizonte mínimo), porque campo novo é onde a
 * incoerência nova mora. Ela não substitui guardrail: é varredura exploratória, roda à mão.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { specialGroups } from "@/data/specialGroups";

type Achado = { cenario: string; classe: string; detalhe: string };
const achados: Achado[] = [];
const anotar = (cenario: string, classe: string, detalhe: string) => achados.push({ cenario, classe, detalhe });

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular", "Retorno ao treino"] as const;
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"] as const;
const SEMANAS = [4, 8, 12, 24];
const FREQS = [2, 3, 5];

let planos = 0;

for (const g of [undefined, ...specialGroups.map((s) => s.slug)]) {
  for (const objetivo of OBJETIVOS) {
    for (const nivel of NIVEIS) {
      for (const semanas of SEMANAS) {
        for (const frequencia of FREQS) {
          const cen = `${g ?? "sem-condicao"}/${objetivo}/${nivel}/${semanas}sem/${frequencia}x`;
          let plano;
          try {
            plano = gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial: g });
          } catch (e) {
            anotar(cen, "EXPLODIU", String(e).slice(0, 120));
            continue;
          }
          planos++;
          const regra = g ? groupGpsRules[g] : undefined;

          const blocos = plano.principal.mesociclos.flatMap((m) =>
            m.microciclos.flatMap((mi) => mi.sessoes.flatMap((s) => s.blocos)),
          );
          const aer = blocos.filter((b) => b.duracaoAlvo != null || b.formato);
          const forca = blocos.filter((b) => b.seriesAlvo != null);

          /* 1. Alvo impossível: número que o aluno não consegue executar. */
          for (const b of forca) {
            if (b.seriesAlvo != null && (b.seriesAlvo < 1 || b.seriesAlvo > 10))
              anotar(cen, "DOSE ABSURDA", `seriesAlvo=${b.seriesAlvo}`);
            if (b.repsAlvo != null && (b.repsAlvo < 1 || b.repsAlvo > 60))
              anotar(cen, "DOSE ABSURDA", `repsAlvo=${b.repsAlvo}`);
            if (b.rirAlvo != null && (b.rirAlvo < 0 || b.rirAlvo > 10))
              anotar(cen, "DOSE ABSURDA", `rirAlvo=${b.rirAlvo}`);
            if (b.intervaloAlvoSeg != null && b.intervaloAlvoSeg > 600)
              anotar(cen, "DOSE ABSURDA", `intervalo=${b.intervaloAlvoSeg}s`);
          }

          /* 2. O TEXTO da intensidade aeróbia tem que bater com o RPE prescrito. */
          for (const b of aer) {
            if (b.rpeAlvo == null || !b.intensidade) continue;
            const faixa = b.intensidade.match(/RPE (\d+) a (\d+)/);
            if (!faixa) continue;
            const [, lo, hi] = faixa;
            if (b.rpeAlvo < Number(lo) || b.rpeAlvo > Number(hi))
              anotar(cen, "TEXTO CONTRADIZ NUMERO", `intensidade diz "${lo} a ${hi}" e o alvo e ${b.rpeAlvo}`);
          }

          /* 3. Formato intervalado só onde a condição declara. */
          const temIntervalado = aer.some((b) => b.formato === "Intervalado");
          const declarouIntervalado = Boolean(regra?.modAerobio?.intervaladoIndicado);
          if (temIntervalado && !declarouIntervalado)
            anotar(cen, "INTERVALADO SEM RESPALDO", "plano traz bloco Intervalado e a condicao nao declara");

          /*
           * 4. A banda aeróbia declarada é TETO, e o bloco não pode passar dela.
           *
           * Esta asserção já esteve invertida, e vale registrar porque a bancada errar é a
           * pior classe de erro aqui. Ela cobrava que a banda declarada APARECESSE no texto,
           * o que só faz sentido se `bandaMax` for um valor. Ele é um teto: o nome do campo
           * diz, a fusão entre condições pega a menor e o comentário da declaração diz
           * "admitir e não obrigar". Sob a semântica certa, uma condição que declara
           * `vigorosa` num objetivo cuja faixa é moderada NÃO sobe para vigorosa, e a
           * bancada acusava justamente o comportamento correto.
           *
           * O que ela cobra agora é a direção: nenhum bloco aeróbio pode ficar ACIMA do teto
           * declarado. Uma condição que declara `leve` tem de puxar para baixo; uma que
           * declara `vigorosa` no máximo mantém.
           */
          const banda = regra?.modAerobio?.bandaMax;
          if (banda && aer.length) {
            const ORD: Record<string, number> = { Leve: 0, Moderada: 1, Vigorosa: 2 };
            const teto = { leve: 0, moderada: 1, vigorosa: 2 }[banda];
            for (const b of aer) {
              const rotulo = (b.intensidade ?? "").split(":")[0].trim();
              const n = ORD[rotulo];
              if (n != null && n > teto)
                anotar(cen, "BANDA ESTOUROU O TETO", `condicao admite ate ${banda} e o bloco saiu "${rotulo}"`);
            }
          }

          /*
           * 5 e 6, sobre a ênfase de modalidade. As duas asserções comparam com o plano sem
           * condição, e a primeira versão delas comparava TOTAIS, o que produziu dois falsos
           * positivos que valem registrar porque ensinam a ler o resultado:
           *
           * - "ênfase subtraiu força" acusou obesidade grau 3, que tem 32 sessões contra 33
           *   do base porque descarrega a cada 3 semanas e a semana de descarga tem uma
           *   sessão a menos. Menos sessões, menos blocos: era a descarga funcionando. Por
           *   isso agora a comparação é POR SESSÃO.
           * - "ênfase inerte" acusou o Emagrecimento, em que TODA sessão já tem aeróbio,
           *   porque ali o aeróbio é a base do objetivo e não um complemento. Não há onde
           *   acrescentar, e a ênfase ser inerte é o comportamento certo. Por isso a
           *   asserção agora só cobra acréscimo quando havia espaço.
           */
          const base = regra?.enfaseModalidade && frequencia >= 3 ? gerarPlano({ objetivo, nivel, semanas, frequencia }) : null;
          if (base) {
            const bb = base.principal.mesociclos.flatMap((m) => m.microciclos.flatMap((mi) => mi.sessoes.flatMap((s) => s.blocos)));
            const sessoesBase = base.principal.mesociclos.flatMap((m) => m.microciclos.flatMap((mi) => mi.sessoes)).length;
            const sessoes = plano.principal.mesociclos.flatMap((m) => m.microciclos.flatMap((mi) => mi.sessoes)).length;
            const aerBase = bb.filter((b) => b.duracaoAlvo != null || b.formato).length;
            const forcaBase = bb.filter((b) => b.seriesAlvo != null).length;

            // Por sessão, para a cadência de descarga não contaminar a leitura.
            const porSessao = (n: number, s: number) => (s ? n / s : 0);
            if (porSessao(forca.length, sessoes) < porSessao(forcaBase, sessoesBase) - 1e-9)
              anotar(cen, "ENFASE SUBTRAIU FORCA", `${porSessao(forca.length, sessoes).toFixed(2)} contra ${porSessao(forcaBase, sessoesBase).toFixed(2)} blocos de forca por sessao`);

            // Só cobra acréscimo se havia espaço: base com aeróbio em TODA sessão está cheia.
            const havia = aerBase < sessoesBase;
            if (regra?.enfaseModalidade?.prioridade === "aerobio" && havia && aer.length <= aerBase)
              anotar(cen, "ENFASE INERTE", `enfase aerobia nao acrescentou com espaco livre (${aer.length} x ${aerBase} em ${sessoesBase} sessoes)`);
          }

          /* 7. Aviso de horizonte: aparece quando deve e cala quando não deve. */
          const min = regra?.horizonteMinimoSemanas;
          const temAviso = /Sobre a duração/.test(plano.raciocinio);
          if (min && semanas < min && !temAviso) anotar(cen, "AVISO FALTOU", `horizonte ${semanas} < ${min}`);
          if (temAviso && (!min || semanas >= min)) anotar(cen, "AVISO SOBROU", `avisou com ${semanas} semanas`);

          /* 8. Documento do aluno não pode nomear a condição clínica. */
          if (g) {
            const grupo = specialGroups.find((s) => s.slug === g);
            const clinico = grupo?.nome ?? "";
            if (clinico && plano.raciocinio.includes(clinico) && grupo?.rotuloAluno !== clinico)
              anotar(cen, "ROTULO CLINICO NO TEXTO", `raciocinio nomeia "${clinico}"`);
          }

          /* 9. Nenhum plano pode sair sem nada para o aluno fazer. */
          if (!forca.length && !aer.length) anotar(cen, "PLANO VAZIO", "nenhum bloco gerado");
        }
      }
    }
  }
}

/* ------------------------------- relatório -------------------------------- */

console.log(`\nBANCADA: ${planos} planos gerados.\n`);
if (!achados.length) {
  console.log("Nenhum achado nas 9 classes varridas.\n");
} else {
  const porClasse = new Map<string, Achado[]>();
  for (const a of achados) porClasse.set(a.classe, [...(porClasse.get(a.classe) ?? []), a]);
  for (const [classe, lista] of porClasse) {
    console.log(`${classe}: ${lista.length} ocorrência(s)`);
    for (const a of lista.slice(0, 4)) console.log(`   ${a.cenario}  ->  ${a.detalhe}`);
    if (lista.length > 4) console.log(`   ... e mais ${lista.length - 4}`);
    console.log("");
  }
}
