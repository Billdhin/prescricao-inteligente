import * as React from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import type { Aluno } from "@/data/alunos";
import {
  TELAS_SOBRE_VOCE,
  OBJETIVOS_DO_ALUNO,
  EQUIPAMENTOS_DO_ALUNO,
  ROTULO_CAMPO,
  idDeclaracao,
  type CampoDeclaracao,
  type DeclaracaoAluno,
} from "@/data/declaracoes";
import { corDeContraste } from "@/lib/theme/palettes";
import { cn } from "@/lib/utils";
import { soNumero } from "@/lib/numeroDigitado";

/**
 * "CONTE SOBRE VOCÊ": o aluno responde sobre a própria vida, uma pergunta por tela.
 *
 * Cinco telas, dois a três minutos, barra de progresso e "pular por agora" em todas: a
 * pessoa que abriu o app pela primeira vez veio ver o treino, não preencher formulário,
 * e a que preencher pela metade ainda ajuda. Cada "Continuar" grava a tela (nada se
 * perde se ela fechar), e o fim diz a verdade inteira: o que ela informou vai para o
 * professor revisar, e nada entra no treino sem ele confirmar.
 *
 * Linguagem de aluno, nunca de ficha: "que remédio você toma todo dia? escreva o nome da
 * caixa", e não "classe farmacológica". "Não sei" é resposta, distinta de deixar vazio,
 * porque silêncio não é resposta. E a pessoa nunca lê um rótulo clínico aqui: quem
 * traduz "tomo losartana" em conduta é o professor, do outro lado.
 */
export function SobreVoce({
  aluno,
  cor,
  declaracoes,
  onDeclarar,
  onFechar,
  primeiraVez,
}: {
  aluno: Aluno;
  cor: string;
  /** o que já foi respondido antes (pré-preenche e mostra o status) */
  declaracoes: DeclaracaoAluno[];
  /** grava uma resposta; ausente na prévia do profissional (a tela mostra, não grava) */
  onDeclarar?: (d: DeclaracaoAluno) => void;
  onFechar: () => void;
  /** primeiro acesso: abre com a frase de consentimento e o convite */
  primeiraVez?: boolean;
}) {
  const tinta = corDeContraste(cor);
  const [tela, setTela] = React.useState(0);
  const [fim, setFim] = React.useState(false);
  const atual = TELAS_SOBRE_VOCE[tela];
  const total = TELAS_SOBRE_VOCE.length;

  // Respostas em edição, começando pelo que já foi declarado.
  const inicial = React.useMemo(() => {
    const m: Partial<Record<CampoDeclaracao, { valor: string; naoSei: boolean }>> = {};
    for (const d of declaracoes) if (d.alunoId === aluno.id) m[d.campo] = { valor: d.valor, naoSei: !!d.naoSei };
    return m;
  }, [declaracoes, aluno.id]);
  const [resp, setResp] = React.useState(inicial);
  const get = (c: CampoDeclaracao) => resp[c] ?? { valor: "", naoSei: false };
  const set = (c: CampoDeclaracao, valor: string, naoSei = false) => setResp((r) => ({ ...r, [c]: { valor, naoSei } }));

  const gravarTela = () => {
    if (!onDeclarar) return;
    for (const campo of atual.campos) {
      const r = resp[campo];
      if (!r || (!r.valor.trim() && !r.naoSei)) continue; // vazio não é resposta: não grava
      onDeclarar({
        id: idDeclaracao(aluno.id, campo),
        alunoId: aluno.id,
        campo,
        valor: r.naoSei ? "" : r.valor.trim(),
        naoSei: r.naoSei || undefined,
        status: "pendente",
        declaradaEm: Date.now(),
      });
    }
  };
  const continuar = () => {
    gravarTela();
    if (tela + 1 >= total) setFim(true);
    else setTela(tela + 1);
  };

  const Campo = ({ campo }: { campo: CampoDeclaracao }) => {
    const r = get(campo);
    const naoSei = (
      <button
        type="button"
        onClick={() => set(campo, "", !r.naoSei)}
        aria-pressed={r.naoSei}
        className={cn(
          "mt-2 inline-flex min-h-[40px] items-center rounded-full border px-3 text-xs font-semibold",
          r.naoSei ? "border-transparent" : "border-border text-ink-2",
        )}
        style={r.naoSei ? { background: cor, color: tinta } : undefined}
      >
        Não sei informar
      </button>
    );
    const rotulo = <label className="block text-sm font-semibold text-ink">{PERGUNTA[campo]}</label>;

    if (campo === "sexo") {
      return (
        <div className="space-y-2">
          {rotulo}
          <div className="flex flex-wrap gap-2">
            {[
              ["F", "Feminino"],
              ["M", "Masculino"],
              ["Outro", "Outro"],
            ].map(([v, t]) => (
              <Opcao key={v} ativa={r.valor === v && !r.naoSei} onClick={() => set(campo, v)} cor={cor} tinta={tinta}>
                {t}
              </Opcao>
            ))}
          </div>
        </div>
      );
    }
    if (campo === "objetivo") {
      return (
        <div className="space-y-2">
          {rotulo}
          <div className="grid gap-2">
            {OBJETIVOS_DO_ALUNO.map((o) => (
              <Opcao key={o.id} ativa={r.valor === o.id} onClick={() => set(campo, o.id)} cor={cor} tinta={tinta} larga>
                {o.rotulo}
              </Opcao>
            ))}
          </div>
        </div>
      );
    }
    if (campo === "equipamentos") {
      const ids = (() => {
        try {
          const v = JSON.parse(r.valor || "[]");
          return Array.isArray(v) ? (v as string[]) : [];
        } catch {
          return [];
        }
      })();
      const alternar = (id: string) => set(campo, JSON.stringify(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
      return (
        <div className="space-y-2">
          {rotulo}
          <p className="text-xs text-ink-2">Marque tudo que você tem à mão. Pode ser mais de um.</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPAMENTOS_DO_ALUNO.map((e) => (
              <Opcao key={e.id} ativa={ids.includes(e.id)} onClick={() => alternar(e.id)} cor={cor} tinta={tinta}>
                {e.rotulo}
              </Opcao>
            ))}
          </div>
        </div>
      );
    }
    if (campo === "liberacao") {
      return (
        <div className="space-y-2">
          {rotulo}
          <div className="flex flex-wrap gap-2">
            {["Tenho liberação do médico para treinar", "Ainda não tenho", "Nunca precisei"].map((t) => (
              <Opcao key={t} ativa={r.valor.startsWith(t)} onClick={() => set(campo, t)} cor={cor} tinta={tinta}>
                {t}
              </Opcao>
            ))}
          </div>
          {naoSei}
        </div>
      );
    }
    const longo = campo === "saude" || campo === "remedios" || campo === "disponibilidade";
    return (
      <div className="space-y-2">
        {rotulo}
        {DICA[campo] && <p className="text-xs text-ink-2">{DICA[campo]}</p>}
        {longo ? (
          <textarea
            value={r.naoSei ? "" : r.valor}
            onChange={(e) => set(campo, e.target.value)}
            rows={3}
            disabled={r.naoSei}
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-base text-ink disabled:opacity-50"
            placeholder={PLACEHOLDER[campo]}
          />
        ) : campo === "idade" ? (
          <input
            value={r.valor}
            onChange={(e) => set("idade", soNumero(e.target.value, true))}
            inputMode="numeric"
            className="h-12 w-full rounded-card border border-border bg-surface px-3 text-base text-ink"
            placeholder={PLACEHOLDER.idade}
          />
        ) : (
          <input
            value={r.naoSei ? "" : r.valor}
            onChange={(e) => set(campo, e.target.value)}
            inputMode={campo === "telefone" ? "tel" : "text"}
            disabled={r.naoSei}
            className="h-12 w-full rounded-card border border-border bg-surface px-3 text-base text-ink disabled:opacity-50"
            placeholder={PLACEHOLDER[campo]}
          />
        )}
        {(campo === "remedios" || campo === "saude") && naoSei}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface" role="dialog" aria-modal="true" aria-labelledby="sobre-voce-titulo">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-4 py-5">
        {fim ? (
          <div className="my-auto space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: cor, color: tinta }}>
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h2 id="sobre-voce-titulo" className="font-display text-xl font-bold text-ink">
              Obrigado. O que você informou vai para o seu professor revisar.
            </h2>
            <p className="text-sm text-ink-2">
              Nada entra no seu treino sem ele confirmar. Você pode atualizar essas respostas quando algo mudar, na aba Perfil.
            </p>
            <button
              onClick={onFechar}
              className="inline-flex h-12 w-full items-center justify-center rounded-full text-base font-bold"
              style={{ background: cor, color: tinta }}
            >
              Ver meu treino
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-ink-2">
                {tela + 1} de {total}
              </span>
              <button onClick={onFechar} className="min-h-[40px] text-xs font-semibold text-ink-2 underline-offset-2 hover:underline">
                Pular por agora
              </button>
            </div>
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft" aria-hidden>
              <div className="h-full rounded-full transition-all" style={{ width: `${((tela + 1) / total) * 100}%`, background: cor }} />
            </div>

            {tela === 0 && primeiraVez && (
              <p className="mb-4 rounded-card border border-border bg-surface-soft p-3 text-xs text-ink-2">
                Conte sobre você para o seu professor montar o seu treino. Leva uns dois minutos. O que você responder fica visível só para
                ele, serve para a sua prescrição e você pode mudar depois.
              </p>
            )}

            <h2 id="sobre-voce-titulo" className="mb-4 font-display text-xl font-bold text-ink">
              {atual.titulo}
            </h2>
            <div className="space-y-5">
              {atual.campos.map((c) => (
                <Campo key={c} campo={c} />
              ))}
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={continuar}
                className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full text-base font-bold"
                style={{ background: cor, color: tinta }}
              >
                {tela + 1 >= total ? "Enviar para o meu professor" : "Continuar"} <ChevronRight className="h-4 w-4" />
              </button>
              {!onDeclarar && <p className="mt-2 text-center text-2xs text-ink-3">Prévia: aqui o aluno grava as respostas.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Opcao({ ativa, onClick, cor, tinta, larga, children }: { ativa: boolean; onClick: () => void; cor: string; tinta: string; larga?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      className={cn(
        "inline-flex min-h-[44px] items-center rounded-full border px-3.5 text-sm font-semibold transition-colors",
        larga && "w-full justify-start rounded-card",
        ativa ? "border-transparent" : "border-border bg-surface text-ink",
      )}
      style={ativa ? { background: cor, color: tinta } : undefined}
    >
      {children}
    </button>
  );
}

const PERGUNTA: Record<CampoDeclaracao, string> = {
  idade: "Quantos anos você tem?",
  sexo: "Sexo",
  telefone: "Um telefone para o seu professor falar com você",
  objetivo: "O que você mais quer com o treino?",
  disponibilidade: "Quantos dias por semana você consegue treinar, e quanto tempo por vez?",
  equipamentos: "Onde você vai treinar e o que tem lá?",
  remedios: "Você toma algum remédio todo dia?",
  saude: "Algum médico já te disse que você tem alguma condição? Sente alguma dor? Já operou algo? Há quanto tempo parou de treinar?",
  liberacao: "Você tem liberação do médico para treinar?",
};

const DICA: Partial<Record<CampoDeclaracao, string>> = {
  remedios: "Escreva o nome que está na caixa, um por linha. Não precisa saber para que serve.",
  saude: "Escreva do seu jeito. Seu professor vai ler e conversar com você sobre isso.",
  disponibilidade: "Por exemplo: 3 dias, uns 45 minutos.",
};

const PLACEHOLDER: Partial<Record<CampoDeclaracao, string>> = {
  idade: "Ex.: 34",
  telefone: "Ex.: (11) 99999-0000",
  disponibilidade: "Ex.: 3 dias, 45 min",
  remedios: "Ex.: losartana, metformina",
  saude: "Ex.: pressão alta desde 2022; dor no joelho direito ao agachar; parei há 8 meses",
};

/** Resumo do status para o cartão do Perfil: quantas respostas, quantas já confirmadas. */
export function resumoSobreVoce(declaracoes: DeclaracaoAluno[], alunoId: string): { respondidas: number; confirmadas: number; total: number } {
  const minhas = declaracoes.filter((d) => d.alunoId === alunoId);
  return {
    respondidas: minhas.length,
    confirmadas: minhas.filter((d) => d.status === "confirmada").length,
    total: Object.keys(ROTULO_CAMPO).length,
  };
}
