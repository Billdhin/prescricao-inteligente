/**
 * A LINHA DO TEMPO DO ALUNO NÃO ACEITA MOVIMENTO IMPOSSÍVEL.
 *
 * O Filipe: "é possível alterar o tipo de avaliação para avaliação inicial mesmo já tendo
 * avaliação... avalie se tem outras questões no sistema dessa maneira, que podem estar fora
 * da lógica de continuidade".
 *
 * A classe é essa: a tela oferece uma ação que a história do aluno já tornou impossível, ou
 * executa em silêncio uma ação que substitui o que existia. Os dois casos têm o mesmo efeito
 * prático, que é o profissional descobrir depois.
 *
 * O QUE ESTE ARQUIVO TRAVA, e cada item nasceu de um caso medido:
 *
 *   1. AVALIAÇÃO INICIAL É ÚNICA. Inicial é a PRIMEIRA, por definição. Um registro feito hoje,
 *      com histórico já existente, não é a primeira coisa nenhuma, e marcá-lo assim quebra
 *      tudo que lê a linha do tempo: o delta do período, a régua de reavaliação, o "antes" do
 *      gráfico.
 *   2. TREINO NOVO POR CIMA DE TREINO EM ANDAMENTO SE ANUNCIA. Trocar o plano ativo é uma
 *      decisão clínica, e o aluno passa a ver outro treino no app dele.
 *   3. SÓ UM ATIVO POR VEZ. Plano e prescrição arquivam o anterior ao entrar; sem isso o aluno
 *      acumula três "ativos" e ninguém sabe qual vale.
 *   4. AVALIAÇÃO NÃO NASCE NO FUTURO.
 *
 * É varredura de FATO no código, não de intenção: cada asserção procura o mecanismo, e falha
 * quando ele some.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const raiz = join(import.meta.dirname, "..");
const ler = (p: string) => readFileSync(join(raiz, p), "utf8");
const falhas: string[] = [];
const reprovar = (m: string) => falhas.push(m);

/* -------- 1 · avaliação inicial é única -------- */
{
  const modal = ler("src/components/app/AvaliacaoModal.tsx");

  if (!/jaTemInicial/.test(modal))
    reprovar(
      "src/components/app/AvaliacaoModal.tsx: sumiu a noção de que já existe uma inicial. " +
        "Sem ela, o campo volta a oferecer 'Avaliação inicial' para um aluno com dez avaliações.",
    );

  // A opção precisa estar TRAVADA, e não apenas escondida: opção que some deixa o
  // profissional procurando o que ele viu ontem; opção travada com motivo ensina a regra.
  if (!/disabled=\{t\.v === "inicial" && jaTemInicial\}/.test(modal))
    reprovar(
      "src/components/app/AvaliacaoModal.tsx: a opção 'Avaliação inicial' deixou de ser desabilitada " +
        "quando o aluno já tem histórico.",
    );

  // E o padrão do campo não pode nascer em "inicial" para quem já tem histórico, senão
  // basta não tocar no seletor para gravar o tipo impossível.
  if (!/useState<TipoAvaliacao>\(jaTemInicial \? "reavaliacao" : "inicial"\)/.test(modal))
    reprovar(
      "src/components/app/AvaliacaoModal.tsx: o tipo padrão voltou a ignorar o histórico. " +
        "Travar a opção não basta se o campo já abre selecionado nela.",
    );
}

/* -------- 2 · treino novo por cima de treino em andamento se anuncia -------- */
{
  const tela = ler("src/pages/PrescreverTreino.tsx");

  if (!/planoAtivoDoAluno/.test(tela) || !/treinoNaoAnunciado/.test(tela))
    reprovar(
      "src/pages/PrescreverTreino.tsx: a tela voltou a só enxergar o plano que chegou por link. " +
        "Escolhendo o aluno pela lista, ela gera plano novo sem saber que já existe um em andamento.",
    );

  /*
   * A condição é cobrada DENTRO do corpo de `gerar`, e não no arquivo inteiro, porque a mesma
   * expressão aparece no rótulo do botão ("Gerar de novo"). Procurando no arquivo, a asserção
   * dava verde com o `gerar` já regredido: o rótulo sozinho a satisfazia. Foi exatamente
   * assim que ela falhou na primeira falsificação, e é o mesmo erro de sempre, o guardrail
   * cobrando a presença de um texto em vez do comportamento.
   */
  const corpoGerar = tela.slice(tela.indexOf("const gerar = () => {"), tela.indexOf("const carregarExemplo"));
  if (!corpoGerar.includes("planoSalvoDoAluno || treinoNaoAnunciado"))
    reprovar(
      "src/pages/PrescreverTreino.tsx: 'Gerar' parou de confirmar quando o aluno já tem treino ativo. " +
        "O plano em andamento seria arquivado sem ninguém dizer que existia.",
    );

  // E precisa existir a saída para EDITAR o que já existe, senão o aviso é só um obstáculo.
  if (!tela.includes("to={`/prescrever-treino?plano=${planoAtivoDoAluno.id}`}"))
    reprovar(
      "src/pages/PrescreverTreino.tsx: o aviso de treino existente perdeu o caminho de editar. " +
        "Avisar sem oferecer a alternativa só transforma a informação em obstáculo.",
    );

  // De onde se veio: chegando por um aluno, a volta precisa estar escrita.
  if (!/Voltar para \{aluno\.nome/.test(tela))
    reprovar(
      "src/pages/PrescreverTreino.tsx: sumiu o caminho de volta para a ficha do aluno. " +
        "Quem entra aqui pela edição do treino de um aluno fica sem saída.",
    );
}

/* -------- 3 · só um ativo por vez -------- */
{
  const store = ler("src/lib/store.ts");
  for (const [fn, campo, ativo] of [
    ["addPlano", "planos", "ativo"],
    ["addPrescricao", "prescricoes", "ativa"],
  ] as const) {
    const corpo = store.slice(store.indexOf(`${fn}: (p) =>`), store.indexOf(`${fn}: (p) =>`) + 1200);
    if (!corpo.includes(`x.status === "${ativo}"`))
      reprovar(
        `src/lib/store.ts: ${fn} parou de arquivar o ${campo.slice(0, -1)} anterior. ` +
          `O aluno passa a ter dois "${ativo}" ao mesmo tempo e ninguém sabe qual vale.`,
      );
  }
}

/* -------- 4 · avaliação não nasce no futuro -------- */
{
  const modal = ler("src/components/app/AvaliacaoModal.tsx");
  if (!/type="date"[^/]*max=\{hoje\}/.test(modal))
    reprovar(
      'src/components/app/AvaliacaoModal.tsx: o campo de data perdeu o teto de hoje. Avaliação com data ' +
        "futura entra na frente da última na linha do tempo e vira a base de comparação de tudo.",
    );
}

/* ------------------------------- resultado ------------------------------- */

if (falhas.length) {
  console.error(`\n[check:continuidade] REPROVOU com ${falhas.length} problema(s):\n`);
  for (const f of falhas) console.error("  - " + f);
  console.error("\nA história do aluno decide o que a tela pode oferecer.\n");
  process.exit(1);
}

console.log(
  "[check:continuidade] ok: a inicial é única, treino novo por cima de treino ativo se anuncia e tem " +
    "saída para editar, só um plano e uma prescrição ficam ativos, e avaliação não nasce no futuro.",
);
