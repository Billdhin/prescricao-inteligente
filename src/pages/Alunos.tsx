import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus, Search, CheckCircle2 } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos } from "@/lib/store";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { AlunoFormModal } from "@/components/app/AlunoFormModal";
import { ConviteAlunoModal } from "@/components/app/ConviteAlunoModal";
import { useCloudAuth } from "@/lib/backend/cloudAuth";

import type { Aluno } from "@/data/alunos";
import { getSpecialGroup } from "@/data/specialGroups";
import { semanaAtual } from "@/data/periodizacao";
import {
  proximoPasso,
  dataReavaliacao,
  linkDoPasso,
  ETAPAS,
  ROTULO_ETAPA,
  type CicloCtx,
  type ProximoPasso,
  type EtapaCiclo,
} from "@/lib/gps/proximoPasso";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;

/** Prioridade de triagem: atenção primeiro (vencida > pendência de rotina > em dia). */
function prioridade(chip: ProximoPasso["chip"]): number {
  if (!chip) return 3;
  if (chip.tone === "warning") return 0;
  if (chip.tone === "cta") return 1;
  return 2;
}

/** Os valores que o `?filtro=` aceita. Qualquer outro cai em "todos", para uma URL
 *  digitada errado não quebrar a lista nem esconder aluno sem explicação. */
const FILTROS_VALIDOS = new Set<string>(["todos", "pausados", ...ETAPAS]);

export function Alunos() {
  const { alunos, addAluno, loadExamples, avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes } = useAlunos();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // Busca e filtro na URL: ver o bloco de comentário acima do componente.
  const q = params.get("busca") ?? "";
  const trocarParam = React.useCallback(
    (chave: string, valor: string, padrao: string) => {
      setParams(
        (atuais) => {
          const p = new URLSearchParams(atuais);
          if (!valor || valor === padrao) p.delete(chave);
          else p.set(chave, valor);
          return p;
        },
        { replace: true },
      );
    },
    [setParams],
  );
  const setQ = React.useCallback((v: string) => trocarParam("busca", v, ""), [trocarParam]);
  const [novo, setNovo] = React.useState(params.get("novo") === "1");
  // O aluno recém-criado cujo cadastro o PRÓPRIO aluno vai completar, pelo convite.
  const [convidado, setConvidado] = React.useState<Aluno | null>(null);
  const acessoOnline = useCloudAuth((s) => s.configured);

  // Reage a MUDANÇA de params (não só ao mount): clicar em "Cadastrar aluno" no
  // menu já estando em /alunos precisa reabrir o modal.
  React.useEffect(() => {
    if (params.get("novo") === "1") {
      setNovo(true);
      params.delete("novo");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, setParams]);

  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes };

  // Deriva o próximo passo de cada aluno uma vez, para chip + ordenação + resumo.
  const comPasso = React.useMemo(
    () =>
      alunos.map((a) => ({
        aluno: a,
        passo: proximoPasso(a, ctx),
        temPlanoAtivo: planos.some((p) => p.alunoId === a.id && p.status === "ativo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes],
  );

  const ativos = comPasso.filter((x) => x.aluno.status === "ativo").length;

  // FILTRO POR ETAPA DO CICLO. O predicado sai de `passo.etapa`, o mesmo campo
  // que já mandava no chip e na ordenação: nenhum dado novo, e nunca uma
  // contagem que discorde da linha correspondente.
  // "pausados" é o aluno INATIVO: não é etapa do ciclo (ele saiu do ciclo), mas
  // o mockup lista o chip junto, e é onde o profissional procura por ele.
  const filtroBruto = params.get("filtro") ?? "todos";
  const filtro = (FILTROS_VALIDOS.has(filtroBruto) ? filtroBruto : "todos") as EtapaCiclo | "todos" | "pausados";
  const setFiltro = React.useCallback(
    (v: EtapaCiclo | "todos" | "pausados") => trocarParam("filtro", v, "todos"),
    [trocarParam],
  );
  const pausados = comPasso.filter((x) => x.aluno.status !== "ativo").length;
  const contagem = React.useMemo(() => {
    const m = new Map<EtapaCiclo, number>();
    for (const x of comPasso) {
      if (x.aluno.status !== "ativo") continue;
      m.set(x.passo.etapa, (m.get(x.passo.etapa) ?? 0) + 1);
    }
    return m;
  }, [comPasso]);

  // "Treinos 7d": DIAS distintos com registro nos últimos 7 dias, por aluno; a
  // mesma definição de treino do painel e do app do aluno (nunca execuções
  // soltas, que inflariam o número).
  const treinos7d = React.useMemo(() => {
    const corte = Date.now() - 7 * DIA;
    const dias = new Map<string, Set<number>>();
    for (const e of execucoes) {
      if (!e.alunoId || e.concluidoEm < corte) continue;
      const s = dias.get(e.alunoId) ?? new Set<number>();
      s.add(Math.floor(e.concluidoEm / DIA));
      dias.set(e.alunoId, s);
    }
    return new Map([...dias.entries()].map(([id, s]) => [id, s.size]));
  }, [execucoes]);

  const filtrados = comPasso
    .filter(({ aluno: a, passo }) =>
      filtro === "todos"
        ? true
        : filtro === "pausados"
          ? a.status !== "ativo"
          : a.status === "ativo" && passo.etapa === filtro,
    )
    .filter(({ aluno: a }) =>
      [a.nome, a.objetivo, a.nivel, ...a.restricoes.map((r) => rotuloRestricao(r.tag))]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .sort((x, y) => {
      // inativos ao fim; depois por atenção; depois por nome
      if ((x.aluno.status === "ativo") !== (y.aluno.status === "ativo")) return x.aluno.status === "ativo" ? -1 : 1;
      const p = prioridade(x.passo.chip) - prioridade(y.passo.chip);
      if (p !== 0) return p;
      return x.aluno.nome.localeCompare(y.aluno.nome);
    });

  return (
    <div className="space-y-5">
      {/* Cabeçalho do protótipo: sobrelinha "Carteira", H1 grande com a contagem
          colada em cinza, busca à direita. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Carteira</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-[-0.03em] text-ink md:text-4xl">
            Meus alunos{" "}
            {alunos.length > 0 && <span className="tabular font-semibold text-ink-3">· {ativos}</span>}
          </h1>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar aluno..."
            aria-label="Buscar aluno por nome, objetivo ou restrição"
            className="h-11 w-full rounded-control border border-border bg-surface pl-10 pr-4 text-sm outline-none focus-visible:border-primary"
          />
        </div>
        {/* Só no mobile: a topbar já mostra "Cadastrar aluno" a partir de sm, e dois
            primários escuros idênticos na mesma dobra eram ruído. Abaixo de sm a topbar
            esconde o dela, então este cobre o vão. */}
        <button onClick={() => setNovo(true)} className={cn(buttonClasses("primary"), "sm:hidden")}>
          <UserPlus className="h-4 w-4" /> Cadastrar aluno
        </button>
      </div>

      {alunos.length === 0 ? (
        <EmptyAlunos onNovo={() => setNovo(true)} onExemplos={loadExamples} />
      ) : (
        <>
          {/* Filtro por etapa: responde "quem estou atendendo agora" sem abrir
              aluno por aluno. Só aparecem as etapas que existem hoje na carteira;
              filtro com zero é botão que promete e entrega tela vazia. */}
          <div role="group" aria-label="Filtrar por etapa do cuidado" className="flex flex-wrap gap-1.5">
            <ChipFiltro ativo={filtro === "todos"} onClick={() => setFiltro("todos")}>
              Todos
            </ChipFiltro>
            {ETAPAS.filter((e) => (contagem.get(e) ?? 0) > 0).map((e) => (
              <ChipFiltro key={e} ativo={filtro === e} onClick={() => setFiltro(e)}>
                {ROTULO_ETAPA[e]} · {contagem.get(e)}
              </ChipFiltro>
            ))}
            {pausados > 0 && (
              <ChipFiltro ativo={filtro === "pausados"} onClick={() => setFiltro("pausados")}>
                Pausados · {pausados}
              </ChipFiltro>
            )}
          </div>

          {filtrados.length === 0 ? (
            <Card className="grid place-items-center gap-3 p-10 text-center">
              {/* A frase diz o que de fato esvaziou a lista: com filtro ligado, o
                  culpado é o filtro, e "nenhum aluno encontrado para ''" mentiria. */}
              <p className="text-ink-2">
                {q.trim()
                  ? <>Nenhum aluno encontrado para “{q}”.</>
                  : <>Nenhum aluno nesta etapa do cuidado.</>}
              </p>
              {filtro !== "todos" && (
                <button onClick={() => setFiltro("todos")} className={buttonClasses("secondary", "sm")}>
                  Ver todos os alunos
                </button>
              )}
            </Card>
          ) : (
            <>
              {/* A TABELA do protótipo: um cartão só, cabeçalho de colunas em
                  caixa alta (desktop), uma linha por aluno e a porta de cadastro
                  fechando a lista. */}
              <Card className="overflow-hidden p-0">
                <div
                  className="hidden gap-3.5 border-b border-surface-mute px-5 py-3 text-2xs font-semibold uppercase tracking-[0.1em] text-ink-3 lg:grid"
                  style={{ gridTemplateColumns: COLUNAS_LISTA }}
                >
                  <span>Aluno</span>
                  <span>Próximo passo</span>
                  <span>Semana</span>
                  <span>Treinos na semana</span>
                  <span>Reavaliação</span>
                  <span />
                </div>
                {filtrados.map(({ aluno, passo }) => (
                  <LinhaTabela
                    key={aluno.id}
                    aluno={aluno}
                    passo={passo}
                    planoAtivo={planos.find((p) => p.alunoId === aluno.id && p.status === "ativo")}
                    treinos7d={treinos7d.get(aluno.id) ?? 0}
                  />
                ))}
                <button
                  onClick={() => setNovo(true)}
                  className="flex w-full items-center gap-3 bg-surface-soft px-5 py-3.5 text-left transition-colors hover:bg-bg"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control border-2 border-dashed border-border text-lg text-ink-2">
                    +
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">Cadastrar aluno</span>
                    {/* O que o modal de fato pergunta hoje. A condição de saúde saiu
                        daqui e foi para o perfil, então prometê-la seria mentir na porta. */}
                    <span className="block text-xs text-ink-2">Nome, idade, nível e objetivo. Leva 20 segundos.</span>
                  </span>
                </button>
              </Card>
              {/* A porta dos exemplos fora da carteira vazia: quem já tem alunos reais
                  também precisa dos dois casos de demonstração (gravação, apresentação).
                  Carregar MESCLA sem tocar no que existe, e a linha some quando os
                  exemplos já estão aqui, porque botão que não faz nada é ruído. */}
              {!alunos.some((a) => a.id.startsWith("al-vsl-")) && (
                <button
                  onClick={loadExamples}
                  className="mx-auto block text-sm text-ink-2 underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                >
                  Carregar alunos de exemplo
                </button>
              )}
            </>
          )}
        </>
      )}

      {novo && (
        <AlunoFormModal
          conviteDisponivel={acessoOnline}
          onClose={() => setNovo(false)}
          onSave={(a, proximo) => {
            addAluno(a);
            setNovo(false);
            // "Criar e gerar o link": o convite abre com o link pronto, e ao fechar o
            // profissional cai na ficha do aluno, onde as respostas vão chegar.
            if (proximo === "convite") {
              setConvidado(a);
              return;
            }
            // "Criar e abrir perfil": abre o perfil, na seção que de fato falta (a saúde),
            // não numa tela de boas-vindas.
            navigate(`/alunos/${a.id}/perfil`, { state: { recemCriado: true } });
          }}
        />
      )}

      {convidado && (
        <ConviteAlunoModal
          aluno={convidado}
          origem="cadastro"
          onClose={() => {
            const id = convidado.id;
            setConvidado(null);
            navigate(`/alunos/${id}`);
          }}
        />
      )}
    </div>
  );
}

/** As colunas do desktop, na proporção do protótipo. */
const COLUNAS_LISTA = "minmax(0,2fr) minmax(0,1.6fr) 90px 90px 110px minmax(90px,auto)";

/**
 * Uma linha da tabela do protótipo. A linha inteira abre o aluno; a coluna
 * "Próximo passo" mostra a MESMA frase de `proximoPasso()` que manda no chip e
 * na ordenação (fonte única), com o ponto na cor da urgência. No mobile as
 * colunas de dado somem e a frase desce para debaixo do nome.
 */
function LinhaTabela({
  aluno,
  passo,
  planoAtivo,
  treinos7d,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  planoAtivo?: import("@/data/periodizacao").PlanoTreino;
  treinos7d: number;
}) {
  const restr = aluno.restricoes;
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const reav = dataReavaliacao(aluno, planoAtivo);
  const reavTexto = reav ? textoReav(reav.em) : null;
  const reavVencida = reav != null && reav.em < Date.now();
  const semana = planoAtivo ? `S${semanaAtual(planoAtivo)} de ${planoAtivo.semanas}` : null;
  // Quantas sessões o plano prevê por semana. Sem plano ativo não há alvo, e a coluna
  // mostra só o que foi feito.
  const alvoSemanal = planoAtivo?.frequenciaSemanal ?? 0;
  const pontoCor =
    passo.chip == null
      ? "var(--success-fill)"
      : passo.chip.tone === "warning"
        ? "var(--danger-fill)"
        : passo.chip.tone === "cta"
          ? "var(--warning-fill)"
          : "var(--analysis-fill)";

  return (
    <div className="relative grid items-center gap-x-3.5 gap-y-1.5 border-b border-surface-mute px-5 py-3.5 transition-colors hover:bg-surface-soft lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_90px_90px_110px_minmax(90px,auto)]">
      {/* A linha inteira abre o aluno (link esticado pelo before); o CHIP da
          direita é um segundo link, para o DESTINO do próximo passo
          (passo.cta.to quando o passo declara um; senão o lugar padrão da ação).
          A lista nunca sugere sem levar. */}
      <Link
        to={`/alunos/${aluno.id}`}
        className="flex min-w-0 items-center gap-3 outline-none before:absolute before:inset-0 focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-primary"
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold"
          style={{ background: "#0B1628", color: "#F3F1EA" }}
        >
          {aluno.iniciais}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <b className="truncate text-sm font-semibold text-ink">{aluno.nome}</b>
            {aluno.status !== "ativo" && <Pill tone="neutral">Saiu</Pill>}
          </span>
          <span className="block truncate text-xs text-ink-2">
            {aluno.objetivo} · {aluno.nivel}
            {grupo ? ` · ${grupo.nome}` : ""}
            {restr.length > 0 ? ` · ${restr.length} ${restr.length === 1 ? "restrição" : "restrições"}` : ""}
          </span>
        </span>
      </Link>
      <span className="flex min-w-0 items-center gap-2 pl-[52px] lg:pl-0">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: pontoCor }} />
        <span className="truncate text-[13px] text-ink">{passo.frase}</span>
      </span>
      <span className="tabular hidden text-sm font-semibold text-ink lg:block">{semana ?? "·"}</span>
      {/*
        TREINOS DA SEMANA contra a FREQUÊNCIA PRESCRITA, que é o único denominador honesto
        que este produto tem: sem plano ativo não existe "quantos deveriam ser", e aí a
        coluna volta a ser o número seco. O rótulo carrega a conta ("3 de 4"), porque uma
        barra sozinha não diz contra o que ela está cheia.
      */}
      <span className="hidden lg:block">
        {alvoSemanal ? (
          <span
            className="block"
            role="img"
            aria-label={`${treinos7d} ${treinos7d === 1 ? "treino registrado" : "treinos registrados"} nos últimos 7 dias; o plano prevê ${alvoSemanal} por semana`}
          >
            <span className="tabular block text-sm font-semibold text-ink">
              {treinos7d <= alvoSemanal ? `${treinos7d} de ${alvoSemanal}` : `${treinos7d} · prevê ${alvoSemanal}`}
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-mute">
              <span
                className={cn("block h-full rounded-full", treinos7d >= alvoSemanal ? "bg-success-fill" : "bg-primary")}
                style={{ width: `${Math.min(100, Math.round((treinos7d / alvoSemanal) * 100))}%` }}
              />
            </span>
          </span>
        ) : (
          <span className="tabular text-sm font-semibold text-ink">{treinos7d > 0 ? treinos7d : "·"}</span>
        )}
      </span>
      <span className={cn("hidden text-[13px] font-semibold lg:block", reavVencida ? "text-danger" : "text-ink-2")}>
        {reavTexto ?? "·"}
      </span>
      <span className="relative hidden justify-self-end lg:block">
        {passo.chip ? (
          <Link
            to={passo.cta.to ?? linkDoPasso(aluno.id, passo.cta.kind)}
            title={passo.cta.label}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Pill tone={passo.chip.tone}>{passo.chip.label}</Pill>
          </Link>
        ) : (
          <Pill tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
            Em dia
          </Pill>
        )}
      </span>
    </div>
  );
}

/** Chip de filtro: pílula, com o ativo em ink sólido (a forma diz o estado). */
function ChipFiltro({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "min-h-[36px] rounded-full border px-3 text-sm font-semibold transition-colors",
        ativo
          ? "border-ink bg-ink text-surface"
          : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function textoReav(em: number): string {
  const dias = Math.round((em - Date.now()) / DIA);
  if (dias < 0) return "vencida";
  if (dias === 0) return "hoje";
  return `em ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function EmptyAlunos({ onNovo, onExemplos }: { onNovo: () => void; onExemplos: () => void }) {
  return (
    <Card variant="raised" className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
      <span className="grid h-16 w-16 place-items-center rounded-card bg-primary-tint text-primary">
        <UserPlus className="h-8 w-8" />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Comece pelo seu primeiro aluno</h2>
        <p className="mx-auto mt-1 max-w-md text-ink-2">
          Cadastre um aluno para avaliar, prescrever com justificativa e acompanhar a evolução: cada
          decisão com o raciocínio científico por trás.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={onNovo} className={buttonClasses("primary")}>
          <UserPlus className="h-4 w-4" /> Cadastrar aluno
        </button>
        <button onClick={onExemplos} className={buttonClasses("secondary")}>
          Carregar exemplos
        </button>
      </div>
      <p className="text-xs text-ink-3">
        Os exemplos são dados de demonstração. Você apaga cada um pelo menu do próprio aluno.
      </p>
    </Card>
  );
}
