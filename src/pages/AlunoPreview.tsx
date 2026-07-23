import { useParams, useNavigate, Navigate } from "react-router-dom";
import { StudentApp } from "@/components/student/StudentApp";
import { useAlunos, useUser } from "@/lib/store";

/**
 * Prévia do portal do aluno para o PROFISSIONAL: "ver como o aluno vê".
 * Renderiza o StudentApp com os dados locais do aluno e a marca do profissional.
 * O acesso real do aluno (conta própria via Supabase) usa o mesmo StudentApp,
 * alimentado pela sessão dele.
 */
export function AlunoPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const aluno = useAlunos((s) => s.alunos.find((a) => a.id === id));
  const planos = useAlunos((s) => s.planos);
  const avaliacoes = useAlunos((s) => s.avaliacoes);
  const execucoes = useAlunos((s) => s.execucoes);
  const liberacoes = useAlunos((s) => s.liberacoes);
  const prescricoes = useAlunos((s) => s.prescricoes);
  const user = useUser();

  if (!aluno) return <Navigate to="/alunos" replace />;

  const plano = planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === aluno.id);
  // Resolve a data de origem das sessões personalizadas (selo "Personalizado em DD/MM").
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

  return (
    <StudentApp
      aluno={aluno}
      plano={plano}
      marca={marca}
      avaliacoes={avaliacoes}
      execucoes={execucoesDoAluno}
      liberacoes={liberacoes}
      dataDaPrescricao={dataDaPrescricao}
      // Prévia é só para o profissional VER como o aluno vê: registrar aqui não
      // pode sujar as execuções reais do aluno. Por isso o registro é no-op.
      onRegistrar={() => {}}
      preview
      onSair={() => navigate(`/alunos/${aluno.id}`)}
    />
  );
}
