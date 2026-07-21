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
  const addExecucao = useAlunos((s) => s.addExecucao);
  const user = useUser();

  if (!aluno) return <Navigate to="/alunos" replace />;

  const plano = planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === aluno.id);
  const marca = {
    nome: user.empresa || user.name || "Seu treino",
    logoDataUrl: user.logoDataUrl || undefined,
    corPrimaria: user.corPrimaria || undefined,
  };

  return (
    <StudentApp
      aluno={aluno}
      plano={plano}
      marca={marca}
      avaliacoes={avaliacoes}
      execucoes={execucoesDoAluno}
      onRegistrar={addExecucao}
      preview
      onSair={() => navigate(`/alunos/${aluno.id}`)}
    />
  );
}
