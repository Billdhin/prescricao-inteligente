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

      {/* Palco (protótipo 08/09): a moldura de celular navy à esquerda deixa
          claro que é uma amostra, não o app real; o card "Como funciona" ao
          lado explica o que se está vendo. */}
      <div className="flex-1 overflow-auto px-4 py-8">
        <div className="mx-auto grid w-full max-w-4xl items-start justify-items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="w-full max-w-[390px]">
            {/* A mesma moldura do app do aluno: navy #0A0F18, raio 44, padding 9. */}
            <div
              className="rounded-[44px] p-[9px]"
              style={{ background: "#0A0F18", boxShadow: "0 40px 70px -34px rgba(0,0,0,.6)" }}
            >
              <div className="overflow-hidden rounded-[36px]" style={{ background: "#0B1628" }}>
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
            </div>
          </div>

          <div className="w-full rounded-card border border-border bg-surface p-5 shadow-soft">
            <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-3">Como funciona</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              É assim que {aluno.nome.split(" ")[0]} vê o treino de hoje no celular, com a sua marca.
              Esta prévia é somente leitura: as demais telas (Treinos, Progresso e Perfil) e o registro
              série a série aparecem quando o aluno entra na conta dele, criada pelo convite.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={voltar}
                className="inline-flex h-9 items-center gap-2 rounded-control px-4 text-sm font-semibold transition-[filter] hover:brightness-[1.15]"
                style={{ background: "#0B1628", color: "#F3F1EA" }}
              >
                Voltar para {aluno.nome.split(" ")[0]}
              </button>
              <button
                type="button"
                onClick={() => navigate("/alunos")}
                className="inline-flex h-9 items-center gap-2 rounded-control border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
              >
                Trocar aluno
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
