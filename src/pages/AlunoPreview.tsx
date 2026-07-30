import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Smartphone } from "lucide-react";
import { StudentApp } from "@/components/student/StudentApp";
import { useAlunos, useUser } from "@/lib/store";

/**
 * Prévia do portal do aluno para o PROFISSIONAL: "ver como o aluno vê".
 *
 * É um EXEMPLO, não um app operável. Antes, renderizava o StudentApp inteiro e
 * navegável em tela cheia, e o profissional tinha a impressão de estar usando o
 * app de verdade: qualquer coisa que se comportasse diferente do esperado lia como
 * "bug", quando na verdade era só a prévia. Agora mostra a TELA INICIAL dentro de
 * uma moldura de celular, sem interação no conteúdo (pointer-events desligados). A
 * única ação fica na moldura externa: voltar para o perfil do aluno. O acesso real
 * do aluno (conta própria via Supabase) usa o mesmo StudentApp, aí sim interativo.
 */
export function AlunoPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const aluno = useAlunos((s) => s.alunos.find((a) => a.id === id));
  const planos = useAlunos((s) => s.planos);
  const avaliacoes = useAlunos((s) => s.avaliacoes);
  const execucoes = useAlunos((s) => s.execucoes);
  const sessaoFeedbacks = useAlunos((s) => s.sessaoFeedbacks);
  const liberacoes = useAlunos((s) => s.liberacoes);
  const prescricoes = useAlunos((s) => s.prescricoes);
  const user = useUser();

  if (!aluno) return <Navigate to="/alunos" replace />;

  const plano = planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === aluno.id);
  const feedbacksDoAluno = sessaoFeedbacks.filter((f) => f.alunoId === aluno.id);
  const dataDaPrescricao = (pid: string) => {
    const p = prescricoes.find((x) => x.id === pid);
    return p ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(p.data)) : undefined;
  };
  const marca = {
    nome: user.empresa || user.name || "Seu treino",
    logoDataUrl: user.logoDataUrl || undefined,
    corPrimaria: user.corPrimaria || undefined,
    paleta: user.paleta || undefined,
    modo: user.modo || undefined,
  };

  const voltar = () => navigate(`/alunos/${aluno.id}`);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg">
      {/* Chrome do profissional: a ÚNICA parte interativa desta tela. */}
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button
          type="button"
          onClick={voltar}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para {aluno.nome.split(" ")[0]}
        </button>
        <div className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-ink-2">
          <Smartphone className="h-3.5 w-3.5" /> Prévia
        </div>
      </header>

      {/* Palco: a moldura de celular deixa claro que é uma amostra, não o app real. */}
      <div className="flex flex-1 items-start justify-center overflow-auto px-4 py-8">
        <div className="w-full max-w-[390px]">
          <div className="overflow-hidden rounded-[2.25rem] border-[6px] border-ink shadow-elevated">
            {/* pointer-events-none: é um retrato da tela, não um app para operar.
                aria-hidden porque o conteúdo é ilustrativo; a navegação real do
                profissional está no header acima. */}
            <div className="pointer-events-none select-none" aria-hidden>
              <StudentApp
                aluno={aluno}
                plano={plano}
                marca={marca}
                avaliacoes={avaliacoes}
                execucoes={execucoesDoAluno}
                sessaoFeedbacks={feedbacksDoAluno}
                liberacoes={liberacoes}
                dataDaPrescricao={dataDaPrescricao}
                onRegistrar={() => {}}
                onFeedback={() => {}}
                preview
              />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-ink-3">
            É assim que {aluno.nome.split(" ")[0]} vê o treino de hoje no celular. As demais telas
            (Treinos, Progresso e Perfil) aparecem quando o aluno entra na conta dele.
          </p>
        </div>
      </div>
    </div>
  );
}
