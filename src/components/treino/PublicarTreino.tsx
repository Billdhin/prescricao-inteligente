import * as React from "react";
import { Link } from "react-router-dom";
import { Send, Eye, Smartphone, CheckCircle2, X } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos } from "@/lib/store";
import { toast, toastDesfazer } from "@/lib/toast";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { statusAcessoAluno } from "@/lib/backend/supabaseRepo";
import { rascunhoDoAluno, type SituacaoDoTreino } from "@/lib/publicacao";
import type { Aluno } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import { cn } from "@/lib/utils";

/**
 * AS PEÇAS DE PUBLICAR, as mesmas na lista, na ficha e no editor (src/lib/publicacao.ts).
 *
 * Publicar é o único gradiente do produto, por regra do Design System: é o momento em que o
 * treino deixa de ser rascunho do profissional e vira o que o aluno vê. Então todo botão de
 * publicar tem a mesma cara, e nenhum outro botão tem essa cara.
 */

const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));
const primeiro = (a: Aluno) => a.nome.split(" ")[0];

export function BotaoPublicar({
  onClick,
  children,
  className,
  tamanho = "sm",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  tamanho?: "sm" | "md";
}) {
  return (
    <button type="button" onClick={onClick} className={cn(buttonClasses("primary", tamanho), "gradient-publicar text-white", className)}>
      <Send className="h-4 w-4" aria-hidden /> {children}
    </button>
  );
}

/** Onde revisar o rascunho: a edição do treino atual abre pelo plano, o treino novo pelo aluno. */
export function linkDoRascunho(s: SituacaoDoTreino, alunoId: string): string {
  return s.rascunho && s.ativo && s.rascunho.id === s.ativo.id
    ? `/prescrever-treino?plano=${s.rascunho.id}`
    : `/prescrever-treino?aluno=${alunoId}`;
}

/**
 * PUBLICAR DAQUI MESMO, sem abrir o editor. Só para o treino NOVO de quem ainda não tem
 * treino: aí não há diferença a mostrar, e o profissional já revisou ao gerar. Quem já tem
 * treino passa pela antessala de diferenças do editor, que é onde ela mora.
 *
 * O toast traz Desfazer: publicar de um clique precisa de um caminho de volta de um clique.
 */
export function usePublicarAgora() {
  return React.useCallback((aluno: Aluno, onPublicado?: (p: PlanoTreino) => void) => {
    const st = useAlunos.getState();
    const rascunho = rascunhoDoAluno(st.rascunhos, aluno.id);
    if (!rascunho) return;
    const pedidoAntes = st.declaracoes.find((d) => d.alunoId === aluno.id && d.campo === "pedido_treino" && d.status === "pendente");
    const publicado = st.publicarPlano(rascunho);
    onPublicado?.(publicado);
    toastDesfazer(`Treino publicado no app de ${primeiro(aluno)}.`, () => {
      useAlunos.getState().desfazerPublicacao(publicado, rascunho, pedidoAntes);
      toast("Publicação desfeita. O treino voltou a ser rascunho.");
    });
  }, []);
}

/**
 * O TREINO PRONTO QUE AINDA NÃO CHEGOU AO ALUNO, como cartão. Aparece na Visão da ficha e na
 * aba Treino. Diz as três coisas que o profissional precisa para decidir: o que é, desde
 * quando espera, e que o aluno ainda não vê.
 */
export function CartaoRascunho({
  aluno,
  situacao,
  onPublicado,
  id,
}: {
  aluno: Aluno;
  situacao: SituacaoDoTreino;
  onPublicado?: (p: PlanoTreino) => void;
  id?: string;
}) {
  const publicarAgora = usePublicarAgora();
  const guardarRascunho = useAlunos((s) => s.guardarRascunho);
  const descartarRascunho = useAlunos((s) => s.descartarRascunho);
  const r = situacao.rascunho;
  if (!r || (situacao.estado !== "nao-publicado" && situacao.estado !== "alteracoes")) return null;
  const nome = primeiro(aluno);
  const novo = situacao.estado === "nao-publicado";

  const descartar = () => {
    descartarRascunho(aluno.id);
    toastDesfazer(novo ? "Rascunho descartado." : "Alterações descartadas.", () => guardarRascunho(r));
  };

  return (
    <Card id={id} className="scroll-mt-24 border-cta/40 bg-cta-tint p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="cta">{novo ? "Não publicado" : situacao.substitui ? "Treino novo não publicado" : "Alterações não publicadas"}</Pill>
        <span className="text-xs text-ink-2">{novo || situacao.substitui ? `Gerado em ${fmt(r.data)}` : "Editado e não publicado"}</span>
      </div>
      <div className="mt-2 font-display text-lg font-bold text-ink">
        {r.objetivo} · {r.semanas} semanas · {r.frequenciaSemanal}×/sem
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {novo
          ? `${nome} ainda não vê este treino. Ele só chega ao app depois que você publicar.`
          : `${nome} continua vendo a versão atual até você publicar ${situacao.substitui ? "o treino novo" : "as alterações"}.`}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {novo ? (
          <>
            <BotaoPublicar onClick={() => publicarAgora(aluno, onPublicado)}>Publicar no app de {nome}</BotaoPublicar>
            <Link to={linkDoRascunho(situacao, aluno.id)} className={buttonClasses("secondary", "sm")}>
              Revisar antes
            </Link>
          </>
        ) : (
          // Com treino no app, publicar passa pelo quadro do que muda, no editor.
          <Link to={linkDoRascunho(situacao, aluno.id)} className={cn(buttonClasses("primary", "sm"), "gradient-publicar text-white")}>
            <Send className="h-4 w-4" aria-hidden /> Revisar e publicar
          </Link>
        )}
        <button type="button" onClick={descartar} className="min-h-[36px] px-2 text-sm font-semibold text-ink-2 hover:text-ink">
          {novo ? "Descartar" : "Descartar alterações"}
        </button>
      </div>
    </Card>
  );
}

/**
 * DEPOIS DE PUBLICAR: a confirmação diz se o treino de fato CHEGA. Publicar para quem nunca
 * entrou pelo convite não entrega nada, e a tela dizia "já está no perfil" como se estivesse
 * resolvido. Com a nuvem ligada, pergunta se o aluno já tem conta e, se não tem, oferece o
 * convite ali mesmo.
 */
export function AvisoPublicado({ aluno, onConvidar, onFechar }: { aluno: Aluno; onConvidar: () => void; onFechar: () => void }) {
  const { configured } = useCloudAuth();
  const [acesso, setAcesso] = React.useState<"carregando" | "entrou" | "nao-entrou" | "desconhecido">(configured ? "carregando" : "desconhecido");
  React.useEffect(() => {
    if (!configured) return;
    let vivo = true;
    statusAcessoAluno(aluno.id)
      .then((s) => vivo && setAcesso(s.vinculado ? "entrou" : "nao-entrou"))
      .catch(() => vivo && setAcesso("desconhecido"));
    return () => {
      vivo = false;
    };
  }, [configured, aluno.id]);
  const nome = primeiro(aluno);

  return (
    <Card tone="success" className="flex flex-wrap items-center gap-3 p-4" role="status">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-sm text-ink">
        <span className="font-semibold">Treino publicado no app de {nome}.</span>{" "}
        {acesso === "entrou"
          ? `${nome} já pode abrir no celular.`
          : acesso === "nao-entrou"
            ? `${nome} ainda não entrou no app. Envie o convite: é por ele que o treino chega ao celular.`
            : acesso === "carregando"
              ? "Conferindo se já há acesso ao app..."
              : `Aparece no app assim que ${nome} entrar pelo convite.`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {acesso === "nao-entrou" && (
          <button type="button" onClick={onConvidar} className={buttonClasses("primary", "sm")}>
            <Smartphone className="h-4 w-4" aria-hidden /> Enviar convite
          </button>
        )}
        <Link to={`/alunos/${aluno.id}/preview`} className={buttonClasses("secondary", "sm")}>
          <Eye className="h-4 w-4" aria-hidden /> Ver como {nome} vê
        </Link>
        <button type="button" onClick={onFechar} aria-label="Fechar aviso" className="grid h-9 w-9 place-items-center rounded-full text-ink-3 hover:bg-surface hover:text-ink">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </Card>
  );
}
