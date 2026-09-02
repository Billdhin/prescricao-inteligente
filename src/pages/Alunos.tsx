import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus, Search, AlertTriangle, CheckCircle2, Stethoscope, ArrowRight } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos } from "@/lib/store";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { AlunoFormModal } from "@/components/app/AlunoFormModal";
import { tempoDesde } from "@/data/alunos";
import type { Aluno } from "@/data/alunos";
import { getSpecialGroup } from "@/data/specialGroups";
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
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Cabeçalho do mockup: o título com a contagem colada, a busca na mesma
          linha e a ação primária à direita. O card de "resumo de triagem" saiu:
          os mesmos números já vivem nos chips de filtro, e repetir contagem em
          dois lugares é o caminho mais curto para elas discordarem. */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          Meus alunos
          {alunos.length > 0 && (
            <span className="tabular rounded-full bg-surface-soft px-2.5 py-0.5 text-sm font-bold text-ink-2">
              {ativos}
            </span>
          )}
        </h1>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar aluno..."
            aria-label="Buscar aluno por nome, objetivo ou restrição"
            className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none focus-visible:border-primary"
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
            <div className="space-y-3">
              {filtrados.map(({ aluno, passo }) => (
                <AlunoRow key={aluno.id} aluno={aluno} passo={passo} planoAtivo={planos.find((p) => p.alunoId === aluno.id && p.status === "ativo")} />
              ))}
              {/* O cartão tracejado que fecha a lista no mockup: a porta de
                  cadastro onde o olho já está, com o custo declarado. */}
              <button
                onClick={() => setNovo(true)}
                className="flex w-full items-center gap-3 rounded-card border-2 border-dashed border-border bg-surface p-4 text-left transition-colors hover:border-primary hover:bg-surface-soft"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-primary-tint text-primary">
                  <UserPlus className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display font-semibold text-ink">Cadastrar aluno</span>
                  {/* O que o modal de fato pergunta hoje. A condição de saúde saiu
                      daqui e foi para o perfil, então prometê-la seria mentir na porta. */}
                  <span className="block text-sm text-ink-2">Nome, idade, nível e objetivo. Leva 20 segundos.</span>
                </span>
              </button>
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
            </div>
          )}
        </>
      )}

      {novo && (
        <AlunoFormModal
          onClose={() => setNovo(false)}
          onSave={(a) => {
            addAluno(a);
            setNovo(false);
            // O botão promete "Criar e abrir perfil": ele abre o perfil, e na seção
            // que de fato falta (a saúde), não numa tela de boas-vindas.
            navigate(`/alunos/${a.id}/perfil`, { state: { recemCriado: true } });
          }}
        />
      )}
    </div>
  );
}

function AlunoRow({ aluno, passo, planoAtivo }: { aluno: Aluno; passo: ProximoPasso; planoAtivo?: import("@/data/periodizacao").PlanoTreino }) {
  const restr = aluno.restricoes;
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const reav = dataReavaliacao(aluno, planoAtivo);
  const reavTexto = reav ? textoReav(reav.em) : null;

  return (
    <Card variant="base" interactive className="group overflow-hidden p-0">
      <div className="flex items-center gap-4 p-4">
      <Link to={`/alunos/${aluno.id}`} className="flex min-w-0 flex-1 items-center gap-4 outline-none">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card gradient-brand font-display font-bold text-white">
          {aluno.iniciais}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display font-semibold text-ink group-hover:text-primary">{aluno.nome}</p>
            {aluno.status !== "ativo" && <Pill tone="neutral">Saiu</Pill>}
          </div>
          {/* Taxonomia de pill: o nome é a âncora (semibold, dieta de peso). Metadado
              não acionável (objetivo, nível) veste TEXTO simples, nunca pill. Só o que
              é clínico (condição = analysis + ícone) ou alerta (restrição = warning)
              ganha pill. */}
          <p className="mt-1 text-sm text-ink-2">
            {aluno.objetivo} · {aluno.nivel}
          </p>
          {(grupo || restr.length > 0) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {grupo && (
                <Pill tone="analysis" icon={<Stethoscope className="h-3 w-3" />}>
                  {grupo.nome}
                </Pill>
              )}
              {restr.length > 0 && (
                <Pill
                  tone="warning"
                  icon={<AlertTriangle className="h-3 w-3" />}
                  className="cursor-default"
                >
                  <span title={restr.map((r) => rotuloRestricao(r.tag)).join(", ")}>
                    {restr.length} {restr.length === 1 ? "restrição" : "restrições"}
                  </span>
                </Pill>
              )}
            </div>
          )}
          <p className="tabular mt-1 truncate text-xs text-ink-3">
            {aluno.ultimaAvaliacaoEm ? `Última avaliação ${tempoDesde(aluno.ultimaAvaliacaoEm).texto}` : "Sem avaliação"}
            {reavTexto ? ` · próxima reavaliação ${reavTexto}` : ""}
          </p>
        </div>
      </Link>

      {/* Estado (some no mobile para não apertar) */}
      <div className="hidden shrink-0 sm:block">
        {passo.chip ? (
          <Pill tone={passo.chip.tone}>{passo.chip.label}</Pill>
        ) : (
          <Pill tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
            Em dia
          </Pill>
        )}
      </div>
      </div>
      <LinhaProximoPasso aluno={aluno} passo={passo} />
    </Card>
  );
}

/**
 * A LINHA DO PRÓXIMO PASSO. `proximoPasso()` já devolvia `frase` e `cta.label`
 * junto do chip, e a lista jogava os dois fora: o profissional lia "Sem treino"
 * e tinha que abrir o aluno para descobrir o que fazer. Agora a frase aparece e
 * o botão diz a ação pelo nome, indo direto ao lugar dela (`linkDoPasso`).
 *
 * Some quando o aluno está em dia (`chip` nulo): botão que não precisa ser
 * apertado é ruído.
 */
function LinhaProximoPasso({ aluno, passo }: { aluno: Aluno; passo: ProximoPasso }) {
  if (!passo.chip) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="min-w-0 flex-1 text-sm text-ink-2">
        <span className="font-semibold text-ink">Próximo passo:</span> {passo.frase}
      </p>
      <Link
        to={passo.cta.to ?? linkDoPasso(aluno.id, passo.cta.kind)}
        className={cn(buttonClasses(passo.tone === "success" ? "secondary" : "primary", "sm"), "shrink-0")}
      >
        {passo.cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
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
