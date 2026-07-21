import { getSupabase } from "./supabaseClient";
import type { Aluno, Avaliacao, Prescricao, Liberacao } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Execucao } from "@/data/execucao";
import type { PerfilCampos, Plan } from "@/lib/store";
import { migrarRestricoesLegado } from "@/lib/gps/restricoes";

/**
 * Repositório Supabase dos dados do profissional e do perfil (Fase 5).
 *
 * Mapeia entre o formato do app (camelCase, campos aninhados) e as tabelas
 * (snake_case, JSONB) de supabase/migrations. As tabelas têm RLS por usuário, e
 * o `user_id` é anexado no gravamento a partir da sessão atual, de modo que cada
 * profissional só acessa os próprios dados.
 *
 * ATIVAÇÃO: quando o Supabase estiver configurado e o usuário autenticado, os
 * stores locais (useAlunos/useUser) podem passar a sincronizar por estas funções.
 * O app segue funcionando local sem elas.
 */

async function uid(): Promise<string> {
  const { data } = await getSupabase().auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Sem sessão autenticada.");
  return id;
}

/* --------------------------------- Perfil --------------------------------- */

export interface PerfilRemoto extends PerfilCampos {
  plan: Plan;
  mode: "atender" | "aprender";
  /** 'profissional' (padrao) ou 'aluno' */
  role: "profissional" | "aluno";
  /** para o aluno: a conta do profissional dono (marca) */
  professionalId: string | null;
}

export async function carregarPerfil(): Promise<Partial<PerfilRemoto> | null> {
  const id = await uid();
  const { data, error } = await getSupabase().from("profiles").select("*").eq("id", id).single();
  if (error || !data) return null;
  return {
    name: data.name ?? "",
    cref: data.cref ?? "",
    email: data.email ?? "",
    telefone: data.telefone ?? "",
    empresa: data.empresa ?? "",
    site: data.site ?? "",
    fotoDataUrl: data.foto_url ?? "",
    logoDataUrl: data.logo_url ?? "",
    corPrimaria: data.cor_primaria ?? "",
    plan: (data.plan ?? "free") as Plan,
    mode: (data.mode ?? "atender") as "atender" | "aprender",
    role: (data.role ?? "profissional") as "profissional" | "aluno",
    professionalId: data.professional_id ?? null,
  };
}

export async function salvarPerfil(patch: Partial<PerfilRemoto>): Promise<void> {
  const id = await uid();
  const row: Record<string, unknown> = { id };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.cref !== undefined) row.cref = patch.cref;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.telefone !== undefined) row.telefone = patch.telefone;
  if (patch.empresa !== undefined) row.empresa = patch.empresa;
  if (patch.site !== undefined) row.site = patch.site;
  if (patch.fotoDataUrl !== undefined) row.foto_url = patch.fotoDataUrl;
  if (patch.logoDataUrl !== undefined) row.logo_url = patch.logoDataUrl;
  if (patch.corPrimaria !== undefined) row.cor_primaria = patch.corPrimaria;
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (patch.mode !== undefined) row.mode = patch.mode;
  const { error } = await getSupabase().from("profiles").upsert(row);
  if (error) throw error;
}

/* --------------------------------- Alunos --------------------------------- */

function alunoToRow(a: Aluno, userId: string) {
  return {
    id: a.id,
    user_id: userId,
    nome: a.nome,
    iniciais: a.iniciais,
    idade: a.idade ?? null,
    sexo: a.sexo ?? null,
    objetivo: a.objetivo,
    nivel: a.nivel,
    nivel_desde: a.nivelDesde ? new Date(a.nivelDesde).toISOString() : null,
    restricoes: a.restricoes,
    equipamentos: a.equipamentos,
    observacoes: a.observacoes ?? null,
    status: a.status,
    criado_em: new Date(a.criadoEm).toISOString(),
    ultima_avaliacao_em: a.ultimaAvaliacaoEm ? new Date(a.ultimaAvaliacaoEm).toISOString() : null,
    proxima_reavaliacao_em: a.proximaReavaliacaoEm ? new Date(a.proximaReavaliacaoEm).toISOString() : null,
    grupo_especial: a.grupoEspecial ?? null,
    fase_jornada: a.faseJornada ?? null,
    jornada: {
      condicoesAtencao: a.condicoesAtencao,
      modalidadesPreferenciais: a.modalidadesPreferenciais,
      modalidadesEvitadas: a.modalidadesEvitadas,
      parametrosPrioritarios: a.parametrosPrioritarios,
      criterioProgressao: a.criterioProgressao,
    },
  };
}

const ms = (iso: string | null | undefined) => (iso ? new Date(iso).getTime() : undefined);

function rowToAluno(r: Record<string, any>): Aluno {
  const j = r.jornada ?? {};
  return {
    id: r.id,
    nome: r.nome,
    iniciais: r.iniciais ?? "",
    idade: r.idade ?? undefined,
    sexo: r.sexo ?? undefined,
    objetivo: r.objetivo,
    nivel: r.nivel,
    nivelDesde: ms(r.nivel_desde),
    // linhas antigas na nuvem podem trazer restricoes string[]: normaliza no modelo novo
    restricoes: migrarRestricoesLegado(r.restricoes),
    equipamentos: r.equipamentos ?? [],
    observacoes: r.observacoes ?? undefined,
    status: r.status,
    criadoEm: ms(r.criado_em) ?? Date.now(),
    ultimaAvaliacaoEm: ms(r.ultima_avaliacao_em),
    proximaReavaliacaoEm: ms(r.proxima_reavaliacao_em),
    grupoEspecial: r.grupo_especial ?? undefined,
    faseJornada: r.fase_jornada ?? undefined,
    condicoesAtencao: j.condicoesAtencao,
    modalidadesPreferenciais: j.modalidadesPreferenciais,
    modalidadesEvitadas: j.modalidadesEvitadas,
    parametrosPrioritarios: j.parametrosPrioritarios,
    criterioProgressao: j.criterioProgressao,
  };
}

export async function listarAlunos(): Promise<Aluno[]> {
  const { data, error } = await getSupabase().from("alunos").select("*").order("criado_em", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToAluno);
}

export async function salvarAluno(a: Aluno): Promise<void> {
  const { error } = await getSupabase().from("alunos").upsert(alunoToRow(a, await uid()));
  if (error) throw error;
}

export async function removerAluno(id: string): Promise<void> {
  const sb = getSupabase();
  const u = await uid();
  await sb.from("avaliacoes").delete().eq("user_id", u).eq("aluno_id", id);
  await sb.from("prescricoes").delete().eq("user_id", u).eq("aluno_id", id);
  await sb.from("liberacoes").delete().eq("user_id", u).eq("aluno_id", id);
  const { error } = await sb.from("alunos").delete().eq("user_id", u).eq("id", id);
  if (error) throw error;
}

/* ------------------------------- Avaliações ------------------------------- */

export async function salvarAvaliacao(av: Avaliacao): Promise<void> {
  const { error } = await getSupabase().from("avaliacoes").upsert({
    id: av.id,
    user_id: await uid(),
    aluno_id: av.alunoId,
    data: new Date(av.data).toISOString(),
    medidas: av.medidas,
    dor_escala: av.dorEscala ?? null,
    observacoes: av.observacoes ?? null,
    tipo: av.tipo ?? null,
    condicao: av.condicao ?? null,
    regioes_dor: av.regioesDor ?? null,
    perimetros: av.perimetros ?? null,
    testes: av.testes ?? null,
    fotos: av.fotos ?? null,
    personalizadas: av.personalizadas ?? null,
  });
  if (error) throw error;
}

export async function listarAvaliacoes(): Promise<Avaliacao[]> {
  const { data, error } = await getSupabase().from("avaliacoes").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, any>) => ({
    id: r.id,
    alunoId: r.aluno_id,
    data: ms(r.data) ?? Date.now(),
    medidas: r.medidas ?? {},
    dorEscala: r.dor_escala ?? undefined,
    observacoes: r.observacoes ?? undefined,
    tipo: r.tipo ?? undefined,
    condicao: r.condicao ?? undefined,
    regioesDor: r.regioes_dor ?? undefined,
    perimetros: r.perimetros ?? undefined,
    testes: r.testes ?? undefined,
    fotos: r.fotos ?? undefined,
    personalizadas: r.personalizadas ?? undefined,
  }));
}

/* ------------------------------- Prescrições ------------------------------ */

export async function salvarPrescricao(p: Prescricao): Promise<void> {
  const { error } = await getSupabase().from("prescricoes").upsert({
    id: p.id,
    user_id: await uid(),
    aluno_id: p.alunoId,
    data: new Date(p.data).toISOString(),
    titulo: p.titulo,
    answers: p.answers,
    itens: p.itens,
    observacoes: p.observacoes ?? null,
    status: p.status,
    jornada: {
      grupoEspecial: p.grupoEspecial,
      modalidadePrincipal: p.modalidadePrincipal,
      modalidadesSecundarias: p.modalidadesSecundarias,
      faseJornada: p.faseJornada,
      frequenciaSemanal: p.frequenciaSemanal,
      estrutura: p.estrutura,
      parametrosControle: p.parametrosControle,
      criteriosProgressao: p.criteriosProgressao,
      criteriosRegressao: p.criteriosRegressao,
      raciocinio: p.raciocinio,
    },
    prontuario: p.prontuario ?? null,
  });
  if (error) throw error;
}

/** Plano de treino (periodização). O macrociclo vai como documento jsonb. */
export async function salvarPlano(p: PlanoTreino): Promise<void> {
  const { error } = await getSupabase().from("planos").upsert({
    id: p.id,
    user_id: await uid(),
    aluno_id: p.alunoId,
    data: new Date(p.data).toISOString(),
    titulo: p.titulo,
    objetivo: p.objetivo,
    nivel: p.nivel,
    semanas: p.semanas,
    frequencia: p.frequenciaSemanal,
    disponibilidade: p.disponibilidade ?? null,
    modelo_id: p.modeloId,
    modelo_alt_id: p.modeloAltId ?? null,
    grupo_especial: p.grupoEspecial ?? null,
    macrociclo: p.macrociclo,
    alternativa: p.alternativa ?? null,
    raciocinio: p.raciocinio,
    ref_ids: p.refIds,
    status: p.status,
  });
  if (error) throw error;
}

export async function removerPlano(id: string): Promise<void> {
  const { error } = await getSupabase().from("planos").delete().eq("id", id);
  if (error) throw error;
}

export async function listarPlanos(): Promise<PlanoTreino[]> {
  const { data, error } = await getSupabase().from("planos").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, any>) => ({
    id: r.id,
    alunoId: r.aluno_id,
    data: new Date(r.data).getTime(),
    titulo: r.titulo ?? "",
    objetivo: r.objetivo,
    nivel: r.nivel,
    semanas: r.semanas ?? 0,
    frequenciaSemanal: r.frequencia ?? 0,
    disponibilidade: r.disponibilidade ?? undefined,
    modeloId: r.modelo_id,
    modeloAltId: r.modelo_alt_id ?? undefined,
    grupoEspecial: r.grupo_especial ?? undefined,
    macrociclo: r.macrociclo,
    alternativa: r.alternativa ?? undefined,
    raciocinio: r.raciocinio ?? "",
    refIds: r.ref_ids ?? [],
    status: r.status,
  })) as PlanoTreino[];
}

export async function listarPrescricoes(): Promise<Prescricao[]> {
  const { data, error } = await getSupabase().from("prescricoes").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, any>) => {
    const j = r.jornada ?? {};
    return {
      id: r.id,
      alunoId: r.aluno_id,
      data: ms(r.data) ?? Date.now(),
      titulo: r.titulo,
      answers: { ...(r.answers ?? {}), restricoes: migrarRestricoesLegado(r.answers?.restricoes) },
      itens: r.itens ?? [],
      observacoes: r.observacoes ?? undefined,
      status: r.status,
      grupoEspecial: j.grupoEspecial,
      modalidadePrincipal: j.modalidadePrincipal,
      modalidadesSecundarias: j.modalidadesSecundarias,
      faseJornada: j.faseJornada,
      frequenciaSemanal: j.frequenciaSemanal,
      estrutura: j.estrutura,
      parametrosControle: j.parametrosControle,
      criteriosProgressao: j.criteriosProgressao,
      criteriosRegressao: j.criteriosRegressao,
      raciocinio: j.raciocinio,
      prontuario: r.prontuario ?? undefined,
    } as Prescricao;
  });
}

/* ------------------------------- Liberações ------------------------------- */

export async function salvarLiberacao(l: Liberacao): Promise<void> {
  const { error } = await getSupabase().from("liberacoes").upsert({
    id: l.id,
    user_id: await uid(),
    aluno_id: l.alunoId ?? null,
    grupo_slug: l.grupoSlug,
    data: new Date(l.data).toISOString(),
    respostas: l.respostas,
    resultado: l.resultado,
    ajustes: l.ajustes,
  });
  if (error) throw error;
}

export async function listarLiberacoes(): Promise<Liberacao[]> {
  const { data, error } = await getSupabase().from("liberacoes").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, any>) => ({
    id: r.id,
    alunoId: r.aluno_id ?? undefined,
    grupoSlug: r.grupo_slug,
    data: ms(r.data) ?? Date.now(),
    respostas: r.respostas ?? {},
    resultado: r.resultado,
    ajustes: r.ajustes ?? [],
  }));
}

/* ------------------------- Portal do aluno (convite/execução) ------------------------- */

/** O profissional gera um convite para o aluno reivindicar a conta. Retorna o token. */
export async function criarConvite(alunoId: string): Promise<string> {
  const u = await uid();
  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await getSupabase()
    .from("convites")
    .insert({ token, aluno_id: alunoId, professional_id: u });
  if (error) throw error;
  return token;
}

/** O aluno recém-cadastrado reivindica o convite (vincula a conta ao registro). */
export async function reivindicarConvite(token: string): Promise<void> {
  const { error } = await getSupabase().rpc("claim_convite", { p_token: token });
  if (error) throw error;
}

/** Marca do profissional (nome, logo, cor) para o portal do aluno. */
export async function carregarMarcaProfissional(
  professionalId: string,
): Promise<{ nome: string; logoDataUrl?: string; corPrimaria?: string }> {
  const { data } = await getSupabase()
    .from("profiles")
    .select("name,empresa,logo_url,cor_primaria")
    .eq("id", professionalId)
    .single();
  return {
    nome: (data?.empresa || data?.name || "Seu treino") as string,
    logoDataUrl: data?.logo_url || undefined,
    corPrimaria: data?.cor_primaria || undefined,
  };
}

function execToRow(e: Execucao, professionalId: string) {
  return {
    id: e.id,
    aluno_id: e.alunoId,
    professional_id: professionalId,
    plano_id: e.planoId ?? null,
    semana: e.semana ?? null,
    sessao_ref: e.sessaoRef ?? null,
    bloco_ref: e.blocoRef ?? null,
    exercicio_slug: e.exercicioSlug ?? null,
    carga_feita: e.cargaFeita ?? null,
    reps_feitas: e.repsFeitas ?? null,
    rpe: e.rpe ?? null,
    concluido_em: new Date(e.concluidoEm).toISOString(),
  };
}

function execFromRow(r: Record<string, any>): Execucao {
  return {
    id: r.id,
    alunoId: r.aluno_id,
    planoId: r.plano_id ?? undefined,
    semana: r.semana ?? 0,
    sessaoRef: r.sessao_ref ?? "",
    blocoRef: r.bloco_ref ?? "",
    exercicioSlug: r.exercicio_slug ?? undefined,
    cargaFeita: r.carga_feita != null ? Number(r.carga_feita) : undefined,
    repsFeitas: r.reps_feitas ?? undefined,
    rpe: r.rpe ?? undefined,
    concluidoEm: r.concluido_em ? new Date(r.concluido_em).getTime() : Date.now(),
  };
}

/**
 * Grava uma execução. professionalId: o dono do aluno (o aluno passa o do seu
 * profissional; o profissional passa o proprio). A RLS garante que so o vinculado
 * insere e so o dono le.
 */
export async function salvarExecucao(e: Execucao, professionalId: string): Promise<void> {
  const { error } = await getSupabase().from("execucoes").upsert(execToRow(e, professionalId));
  if (error) throw error;
}

/** Execuções visiveis pela RLS (do proprio aluno, ou dos alunos do profissional). */
export async function listarExecucoes(): Promise<Execucao[]> {
  const { data, error } = await getSupabase()
    .from("execucoes")
    .select("*")
    .order("concluido_em", { ascending: false });
  if (error) return [];
  return (data ?? []).map(execFromRow);
}
