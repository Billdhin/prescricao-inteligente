import * as React from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, CheckCheck, ChevronLeft, ChevronRight, Plus, Search, ShieldAlert, X } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { GavetaSelecao, type GrupoGaveta, type ItemGaveta } from "@/components/alunos/GavetaSelecao";
import { ObjetivoDuplo } from "@/components/gps/ObjetivoDuplo";
import { parValido } from "@/lib/gps/objetivos";
import { FarmacosSelector } from "@/components/gps/FarmacosSelector";
import { DetalheRestricoes } from "@/components/gps/RestricoesSelector";
import { OQueIssoMudaPainel } from "@/components/alunos/OQueIssoMudaPainel";
import { useAlunos } from "@/lib/store";
import { toast } from "@/lib/toast";
import { EQUIPAMENTOS, type GpsObjetivo } from "@/lib/gps/engine";
import { descricaoOpcao } from "@/data/opcoes-wizard";
import { specialGroups } from "@/data/specialGroups";
import {
  CATALOGO_RESTRICOES,
  GRUPOS_RESTRICAO,
  avaliarSeguranca,
  criarRestricao,
  restricoesAtivas,
  rotuloRestricao,
  type RestricaoTag,
} from "@/lib/gps/restricoes";
import {
  SECOES_PERFIL,
  completudeAluno,
  ehSecaoPerfil,
  secaoInicial,
  vizinhasDaSecao,
  type SecaoPerfilId,
} from "@/lib/gps/perfilAluno";
import type { Aluno } from "@/data/alunos";
import { iniciaisDe } from "@/data/alunos";
import type { Nivel } from "@/data/types";
import { cn } from "@/lib/utils";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
/** Quantas condições aparecem como atalho antes da busca abrir a lista inteira. */
const CONDICOES_ATALHO = 5;

/**
 * PERFIL DO ALUNO: onde a saúde é preenchida, e editada depois.
 *
 * O cadastro virou um modal de quatro campos e tudo o que decide prescrição veio
 * morar aqui, em seis seções que salvam sozinhas. Três escolhas sustentam a tela:
 *
 * 1. **Salva a cada toque.** Não existe botão "salvar" e não existe rascunho: o
 *    aluno é real desde o primeiro campo, e sair no meio não perde nada. É o que
 *    autoriza o rodapé a oferecer "Concluir depois" sem culpa.
 * 2. **A consequência fica ao lado.** A coluna da direita mostra o que cada coisa
 *    declarada muda no motor, no semáforo e no app do aluno. Ela é DERIVADA
 *    (src/lib/gps/oQueIssoMuda.ts): nenhuma frase sobre o aluno é escrita aqui.
 * 3. **Nada disso bloqueia o cuidado.** Perfil incompleto não tranca avaliação nem
 *    treino; quem tranca é a avaliação (gate duro) e a liberação. O perfil só
 *    informa o que falta e o que aquilo mudaria.
 */
export function AlunoPerfil() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const alunos = useAlunos((s) => s.alunos);
  const updateAluno = useAlunos((s) => s.updateAluno);
  const aluno = alunos.find((a) => a.id === id);

  const [secao, setSecao] = React.useState<SecaoPerfilId>(() => {
    const p = params.get("secao");
    if (p && ehSecaoPerfil(p)) return p;
    return aluno ? secaoInicial(aluno) : "basicos";
  });

  // O deep-link `?secao=` abre a seção pedida e some da barra de endereço, para não
  // fixar a seção quando o profissional navegar dentro da própria página.
  React.useEffect(() => {
    if (params.get("secao")) {
      params.delete("secao");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  if (!aluno) return <Navigate to="/alunos" replace />;

  const patch = (p: Partial<Aluno>) => updateAluno(aluno.id, p);
  const completude = completudeAluno(aluno);
  const indice = SECOES_PERFIL.findIndex((s) => s.id === secao);
  const { anterior, proxima } = vizinhasDaSecao(secao);
  const atual = SECOES_PERFIL[indice];

  return (
    <div className="mx-auto max-w-[1240px] space-y-5">
      <CabecalhoPerfil aluno={aluno} feitas={completude.feitas} total={completude.total} />

      {/* Trilho de seções: desktop mostra as seis; mobile mostra passo e barra. */}
      <TrilhoSecoes
        secaoAtiva={secao}
        onSecao={setSecao}
        completude={completude}
        indice={indice}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div>
            {/* O "passo N de 6" vive COLADO no título da seção, que é o objeto a
                que ele se refere. Ele já foi um número solto no canto direito do
                trilho, a meia tela de distância do que estava contando. */}
            <div className="text-2xs font-bold uppercase tracking-[0.14em] text-analysis-text">
              Passo {indice + 1} de {completude.total}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">{atual.titulo}</h2>
            <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-2">{atual.resumo}</p>
          </div>

          {secao === "basicos" && <SecaoBasicos aluno={aluno} onPatch={patch} />}
          {secao === "objetivo" && <SecaoObjetivo aluno={aluno} onPatch={patch} />}
          {secao === "saude" && <SecaoSaude aluno={aluno} onPatch={patch} onIrPara={setSecao} />}
          {secao === "medicamentos" && <SecaoMedicamentos aluno={aluno} onPatch={patch} />}
          {secao === "equipamentos" && <SecaoEquipamentos aluno={aluno} onPatch={patch} />}
          {secao === "notas" && <SecaoNotas aluno={aluno} onPatch={patch} />}

          {/* Rodapé de navegação: anterior, sair sem culpa, próxima */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {anterior ? (
              <button
                type="button"
                onClick={() => setSecao(anterior.id)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink"
              >
                <ChevronLeft aria-hidden className="h-4 w-4" /> {anterior.titulo}
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(`/alunos/${aluno.id}`)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Concluir depois
              </button>
              {proxima ? (
                <button type="button" onClick={() => setSecao(proxima.id)} className={buttonClasses("primary")}>
                  {proxima.titulo} <ChevronRight aria-hidden className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/alunos/${aluno.id}`)}
                  className={buttonClasses("primary")}
                >
                  Ver o aluno <ChevronRight aria-hidden className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <OQueIssoMudaPainel aluno={aluno} />
      </div>
    </div>
  );
}

/* ------------------------------- Cabeçalho -------------------------------- */

function CabecalhoPerfil({ aluno, feitas, total }: { aluno: Aluno; feitas: number; total: number }) {
  const criadoHa = tempoDesde(aluno.criadoEm);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        to={`/alunos/${aluno.id}`}
        aria-label="Voltar para o aluno"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-2 hover:text-ink"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-2xl font-bold text-ink">{aluno.nome}</h1>
        {/* O quanto está preenchido é DITO por extenso aqui, e desenhado como
            barra no card da lateral. O percentual solto ("33% preenchido") era o
            mesmo número em outra unidade, e ainda encostava no "2 de 6" do trilho
            querendo dizer outra coisa. */}
        <p className="truncate text-sm text-ink-2">
          Perfil do aluno ·{" "}
          <span className="font-semibold text-ink">
            {feitas} de {total} seções preenchidas
          </span>
          {criadoHa && ` · criado ${criadoHa}`}
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint px-3 py-1.5 text-xs font-bold text-success-text">
        <CheckCheck aria-hidden className="h-3.5 w-3.5" /> Salvo automaticamente
      </span>
      <Link to={`/alunos/${aluno.id}?avaliar=1`} className={buttonClasses("primary", "sm")}>
        Registrar avaliação <ChevronRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}

function tempoDesde(ts: number): string {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} d`;
}

/* ----------------------------- Trilho de seções --------------------------- */

function TrilhoSecoes({
  secaoAtiva,
  onSecao,
  completude,
  indice,
}: {
  secaoAtiva: SecaoPerfilId;
  onSecao: (s: SecaoPerfilId) => void;
  completude: ReturnType<typeof completudeAluno>;
  indice: number;
}) {
  return (
    <div>
      {/* Mobile: barra segmentada no lugar da fila de seis pílulas, que não cabe a
          390. O "Passo N de 6" NÃO se repete aqui: ele já é o eyebrow do título da
          seção, logo abaixo, e dois deles na mesma dobra é a mesma frase duas vezes. */}
      <div className="mb-3 lg:hidden">
        <div
          className="flex gap-1.5"
          role="img"
          aria-label={`${completude.feitas} de ${completude.total} seções preenchidas`}
        >
          {completude.secoes.map((s, i) => (
            <span
              key={s.secao.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                s.feita ? "bg-success" : i === indice ? "bg-primary" : "bg-surface-soft",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {completude.secoes.map((s, i) => {
          const ativo = s.secao.id === secaoAtiva;
          return (
            <button
              key={s.secao.id}
              type="button"
              onClick={() => onSecao(s.secao.id)}
              aria-current={ativo ? "step" : undefined}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                ativo
                  ? "border-ink bg-ink font-bold text-surface"
                  : s.feita
                    ? "border-success/40 bg-success-tint font-semibold text-success-text"
                    : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
                // A 390 a fila vira rolagem horizontal natural do flex-wrap
                "max-lg:hidden",
              )}
            >
              {s.feita ? (
                <Check aria-hidden className="h-4 w-4" />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-2xs font-bold",
                    ativo ? "bg-surface/20 text-surface" : "bg-surface-soft text-ink-2",
                  )}
                >
                  {i + 1}
                </span>
              )}
              {s.secao.titulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Seções --------------------------------- */

function Campo({ label, children, dica }: { label: string; children: React.ReactNode; dica?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-ink-3">{dica}</span>}
    </label>
  );
}

function SecaoBasicos({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const idadeForaDaFaixa = aluno.idade != null && (aluno.idade < 12 || aluno.idade > 100);
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <Campo label="Nome">
        <input
          value={aluno.nome}
          onChange={(e) => onPatch({ nome: e.target.value, iniciais: iniciaisDe(e.target.value) })}
          className="input"
        />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Idade" dica="Entra na classificação por faixa etária e nas escalas de referência.">
          <input
            value={aluno.idade != null ? String(aluno.idade) : ""}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 3);
              onPatch({ idade: v ? Number(v) : undefined });
            }}
            inputMode="numeric"
            aria-invalid={idadeForaDaFaixa}
            placeholder="Ex.: 34"
            className="input"
          />
          {idadeForaDaFaixa && (
            <span className="mt-1 block text-xs text-warning">Idade fora da faixa esperada (12 a 100).</span>
          )}
        </Campo>
        <Campo label="WhatsApp" dica="Usado para enviar o convite do app do aluno.">
          <input
            value={aluno.telefone ?? ""}
            onChange={(e) => onPatch({ telefone: e.target.value || undefined })}
            inputMode="tel"
            placeholder="Ex.: (11) 99999-0000"
            className="input"
          />
        </Campo>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink">Nível</legend>
        <div className="flex flex-wrap gap-2">
          {NIVEIS.map((n) => (
            <ChipEscolha
              key={n}
              ativo={aluno.nivel === n}
              onClick={() =>
                onPatch({ nivel: n, nivelDesde: aluno.nivel === n ? aluno.nivelDesde : Date.now() })
              }
            >
              {n}
            </ChipEscolha>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-3">
          Trocar o nível reinicia a contagem de tempo nele, que é o que alimenta a sugestão de progressão.
        </p>
      </fieldset>
    </Card>
  );
}

function SecaoObjetivo({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  // O par escolhido vive em estado local até ser VÁLIDO. A matriz oferece os pares
  // incompatíveis de propósito (com o veredito ao lado, que é o conteúdo), mas um
  // par incompatível não pode virar dado do aluno: ele contradiz a si mesmo no
  // prontuário e no plano. Então a tela mostra o veredito e não grava.
  const [par, setPar] = React.useState<{ o: GpsObjetivo; s?: GpsObjetivo }>({
    o: aluno.objetivo,
    s: aluno.objetivoSecundario,
  });
  const valido = parValido(par.o, par.s);

  const trocar = (o: GpsObjetivo, s?: GpsObjetivo) => {
    setPar({ o, s });
    if (parValido(o, s)) onPatch({ objetivo: o, objetivoSecundario: s });
  };

  return (
    <Card className="space-y-3 p-4 sm:p-5">
      <ObjetivoDuplo objetivo={par.o} objetivoSecundario={par.s} onChange={trocar} />
      {!valido && (
        <p className="rounded-card border border-danger/30 bg-danger-tint p-3 text-sm text-danger-text" role="alert">
          Este par não foi salvo. O objetivo do aluno segue{" "}
          <strong className="font-bold">{aluno.objetivo}</strong>
          {aluno.objetivoSecundario ? ` com ${aluno.objetivoSecundario.toLowerCase()}` : " sozinho"}. Escolha
          outro segundo objetivo, ou nenhum.
        </p>
      )}
    </Card>
  );
}

function SecaoSaude({
  aluno,
  onPatch,
  onIrPara,
}: {
  aluno: Aluno;
  onPatch: (p: Partial<Aluno>) => void;
  onIrPara: (s: SecaoPerfilId) => void;
}) {
  return (
    <div className="space-y-4">
      <CondicaoDeSaude aluno={aluno} onPatch={onPatch} />
      <RestricoesFisicas aluno={aluno} onPatch={onPatch} />
      {/* Ponte para a próxima seção: a medicação muda como ler FC e glicemia, e é a
          pergunta que mais some quando não é feita na mesma conversa da saúde. */}
      <Card variant="soft" className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink">Medicamentos em uso</h3>
          <p className="text-sm text-ink-2">Só a classe. Ajuda a ler frequência cardíaca e glicemia.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onIrPara("medicamentos")} className={buttonClasses("secondary", "sm")}>
            Preencher
          </button>
          <button
            type="button"
            onClick={() => onPatch({ farmacosNaoInformado: true })}
            className={cn(buttonClasses("ghost", "sm"), aluno.farmacosNaoInformado && "text-success-text")}
          >
            {aluno.farmacosNaoInformado ? "Marcado: não informado" : "Não sei / não informar"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function CondicaoDeSaude({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const alunos = useAlunos((s) => s.alunos);
  const [busca, setBusca] = React.useState("");
  const [verTodas, setVerTodas] = React.useState(false);

  // "Mais usadas por você" só pode ser dito quando existe uso: a frequência sai da
  // carteira do próprio profissional. Sem histórico, o rótulo muda de propósito.
  const frequencia = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alunos) if (a.grupoEspecial) m.set(a.grupoEspecial, (m.get(a.grupoEspecial) ?? 0) + 1);
    return m;
  }, [alunos]);
  const temHistorico = frequencia.size > 0;

  const ordenadas = React.useMemo(
    () =>
      [...specialGroups].sort(
        (a, b) => (frequencia.get(b.slug) ?? 0) - (frequencia.get(a.slug) ?? 0) || a.nome.localeCompare(b.nome),
      ),
    [frequencia],
  );

  const q = busca.trim().toLowerCase();
  const lista = q
    ? ordenadas.filter((g) => g.nome.toLowerCase().includes(q) || g.descricaoCurta.toLowerCase().includes(q))
    : verTodas
      ? ordenadas
      : ordenadas.slice(0, CONDICOES_ATALHO);

  /**
   * Marcar e desmarcar condição, agora com MAIS DE UMA por aluno.
   *
   * O feedback de campo foi direto: "a parada de não poder colocar várias condições do
   * indivíduo". O modelo de dados já suportava (`grupoEspecial` + `condicoesAtencao`) e o
   * motor já sabia fundir regras pela mais conservadora; só a tela obrigava a escolher uma.
   *
   * A PRIMEIRA marcada vira a principal, porque é ela que dá o esqueleto de fases do
   * macrociclo (uma jornada clínica não se funde com outra). As demais entram como
   * condições de atenção e pesam em tudo o mais. Ao desmarcar a principal, a próxima da
   * lista assume, para o aluno nunca ficar com atenção sem principal.
   */
  const selecionadas = [aluno.grupoEspecial, ...(aluno.condicoesAtencao ?? [])].filter(Boolean) as string[];

  const alternar = (slug: string) => {
    const novas = selecionadas.includes(slug)
      ? selecionadas.filter((s) => s !== slug)
      : [...selecionadas, slug];
    onPatch({
      grupoEspecial: novas[0],
      condicoesAtencao: novas.slice(1).length ? novas.slice(1) : undefined,
      semCondicaoDeclarada: novas.length ? undefined : true,
      sugestoesDispensadas: undefined,
    });
  };

  return (
    <Card className="space-y-3 p-4 sm:p-5">
      {/* Título em cima, apoio embaixo: as duas coisas na mesma linha brigavam por
          espaço e empurravam o link para fora do card em telas médias. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink">Condições de saúde</h3>
          <p className="text-sm text-ink-2">
            Pode marcar mais de uma. Onde elas divergem, o plano aplica sempre a mais
            conservadora, e a primeira marcada dá o esqueleto de fases do treino.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVerTodas((v) => !v)}
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-ink-2 underline decoration-border underline-offset-4 hover:text-ink hover:decoration-ink-3"
        >
          {verTodas ? "Mostrar menos" : `Ver as ${specialGroups.length}`}
        </button>
      </div>

      <label className="relative block">
        <span className="sr-only">Buscar condição</span>
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar condição (ex.: hipertensão, diabetes...)"
          className="h-12 w-full rounded-control border border-border bg-surface pl-10 pr-3 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <ChipEscolha
          ativo={aluno.semCondicaoDeclarada === true && selecionadas.length === 0}
          onClick={() =>
            onPatch({ grupoEspecial: undefined, condicoesAtencao: undefined, semCondicaoDeclarada: true })
          }
        >
          Sem condição
        </ChipEscolha>
        {lista.map((g) => (
          <ChipEscolha key={g.slug} ativo={selecionadas.includes(g.slug)} onClick={() => alternar(g.slug)}>
            {/* A principal se identifica na própria etiqueta: sem isso, com duas marcadas
                ninguém saberia qual delas dá as fases do macrociclo. */}
            {g.nome}
            {aluno.grupoEspecial === g.slug && selecionadas.length > 1 ? " · principal" : ""}
          </ChipEscolha>
        ))}
      </div>

      <p className="text-xs text-ink-3">
        {q
          ? `${lista.length} de ${specialGroups.length} condições.`
          : temHistorico
            ? "Mais usadas por você. A busca abre a lista completa."
            : "A busca abre a lista completa."}{" "}
        Em branco, a avaliação sugere pelo IMC, pressão e idade medidos.
      </p>
    </Card>
  );
}

/** Os 4 grupos do catálogo viram os 4 filtros da gaveta: mesma fonte, mesma ordem,
 *  e o rótulo curto vem declarado de lá (nunca recortado do título aqui). */
const GRUPOS_GAVETA_RESTRICAO: GrupoGaveta[] = GRUPOS_RESTRICAO.map((g) => ({
  id: g.id,
  filtro: g.curto,
  titulo: g.titulo,
}));

const ITENS_GAVETA_RESTRICAO: ItemGaveta[] = CATALOGO_RESTRICOES.map((it) => ({
  id: it.tag,
  grupo: it.grupo,
  titulo: it.titulo,
  descricao: it.descricao,
  // A consequência mostrada é a que o motor de fato aplica, autorada junto da regra.
  consequencia: it.efeitos.length ? `O motor ${it.efeitos[0].toLowerCase()}` : undefined,
  exclusivo: it.tag === "nenhuma_restricao",
}));

function RestricoesFisicas({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const [gaveta, setGaveta] = React.useState<string | null>(null);
  const ativas = restricoesAtivas(aluno.restricoes);
  const seguranca = avaliarSeguranca(aluno.restricoes);
  const marcouNenhuma = aluno.restricoes.some((r) => r.tag === "nenhuma_restricao");

  const aplicar = (ids: string[]) => {
    const tags = ids as RestricaoTag[];
    // Preserva o que já foi detalhado (gatilhos, lado, liberação): reconstruir do
    // zero apagaria respostas que o profissional já tinha dado.
    const anteriores = new Map(aluno.restricoes.map((r) => [r.tag, r]));
    onPatch({ restricoes: tags.map((t) => anteriores.get(t) ?? criarRestricao(t)) });
    setGaveta(null);
  };

  return (
    <Card className="space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-bold text-ink">Restrições físicas</h3>
            {ativas.length > 0 && (
              <Pill tone="warning">
                {ativas.length} marcada{ativas.length === 1 ? "" : "s"}
              </Pill>
            )}
            {marcouNenhuma && <Pill tone="success">Nenhuma</Pill>}
          </div>
          <p className="text-sm text-ink-2">Mudam o que o motor escolhe, a amplitude e o apoio.</p>
        </div>
        <button
          type="button"
          onClick={() => setGaveta(GRUPOS_GAVETA_RESTRICAO[0].id)}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold text-primary hover:underline"
        >
          <Plus aria-hidden className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {(ativas.length > 0 || marcouNenhuma) && (
        <div className="flex flex-wrap gap-2">
          {aluno.restricoes.map((r) => (
            <span
              key={r.tag}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold",
                r.tag === "nenhuma_restricao"
                  ? "border-success/40 bg-success-tint text-success-text"
                  : "border-warning/40 bg-warning-tint text-warning-text",
              )}
            >
              {rotuloRestricao(r.tag)}
              <button
                type="button"
                aria-label={`Remover ${rotuloRestricao(r.tag)}`}
                onClick={() => onPatch({ restricoes: aluno.restricoes.filter((x) => x.tag !== r.tag) })}
                className="opacity-70 hover:opacity-100"
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* As quatro portas do catálogo: cada uma abre a gaveta no seu filtro */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {GRUPOS_GAVETA_RESTRICAO.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGaveta(g.id)}
            className="flex min-h-[48px] items-center justify-between gap-2 rounded-card border border-border bg-surface px-4 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-soft hover:text-ink"
          >
            {g.filtro}
            <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
          </button>
        ))}
      </div>

      {/* Detalhe do que foi marcado: gatilhos, lado, gravidade, liberação. Fica aqui
          (e não na gaveta) porque é sobre ESTE aluno, não sobre o catálogo. */}
      <DetalheRestricoes
        restricoes={aluno.restricoes}
        onChange={(next) => onPatch({ restricoes: next })}
        idBase="perfil-restr"
      />

      {seguranca.bloqueado && (
        <div className="rounded-card border border-cta/40 bg-cta/10 p-4" role="alert">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-cta-text">
            <ShieldAlert aria-hidden className="h-4 w-4" /> Confirme a liberação antes de gerar o treino
          </div>
          <ul className="mb-2 space-y-1 text-sm text-ink">
            {seguranca.motivos.map((m) => (
              <li key={m} className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                {m}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-2">{seguranca.orientacao}</p>
        </div>
      )}

      {gaveta && (
        <GavetaSelecao
          titulo="Restrições físicas"
          instrucao="Marque o que limita movimento hoje."
          grupos={GRUPOS_GAVETA_RESTRICAO}
          itens={ITENS_GAVETA_RESTRICAO}
          grupoInicial={gaveta}
          selecionados={aluno.restricoes.map((r) => r.tag)}
          rotuloAplicar={["restrição", "restrições"]}
          aviso="Usado para adaptar exercício, amplitude, impacto e apoio. Não é diagnóstico nem substitui avaliação de profissional de saúde."
          onAplicar={aplicar}
          onFechar={() => setGaveta(null)}
        />
      )}
    </Card>
  );
}

function SecaoMedicamentos({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  return (
    <Card className="p-4 sm:p-5">
      <FarmacosSelector
        value={aluno.farmacos ?? []}
        onChange={(f) => onPatch({ farmacos: f.length ? f : undefined, farmacosNaoInformado: undefined })}
        naoInformado={Boolean(aluno.farmacosNaoInformado)}
        onNaoInformado={(v) => onPatch({ farmacosNaoInformado: v || undefined })}
        idBase="perfil-farm"
      />
    </Card>
  );
}

const KIT_ACADEMIA = ["Máquina", "Barra", "Halter", "Polia", "Peso corporal"];

function SecaoEquipamentos({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const confirmar = () => {
    const feitas = new Set(aluno.perfilConfirmado ?? []);
    feitas.add("equipamentos");
    onPatch({ perfilConfirmado: [...feitas] });
    toast("Equipamentos confirmados");
  };
  const confirmado = (aluno.perfilConfirmado ?? []).includes("equipamentos");
  const alternar = (eq: string) =>
    onPatch({
      equipamentos: aluno.equipamentos.includes(eq)
        ? aluno.equipamentos.filter((x) => x !== eq)
        : [...aluno.equipamentos, eq],
    });

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <button type="button" onClick={() => onPatch({ equipamentos: [...KIT_ACADEMIA] })} className="text-primary hover:underline">
          Kit típico de academia
        </button>
        <button type="button" onClick={() => onPatch({ equipamentos: [...EQUIPAMENTOS] })} className="text-primary hover:underline">
          Marcar todos
        </button>
        <button type="button" onClick={() => onPatch({ equipamentos: ["Peso corporal"] })} className="text-ink-3 hover:underline">
          Só peso corporal
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {EQUIPAMENTOS.map((eq) => (
          <ChipEscolha key={eq} ativo={aluno.equipamentos.includes(eq)} onClick={() => alternar(eq)} titulo={descricaoOpcao(eq)}>
            {eq}
          </ChipEscolha>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-ink-3">
          O aluno nasce com o kit típico marcado. Confirmar é o que transforma um padrão razoável
          numa informação sobre este local de treino.
        </p>
        <button
          type="button"
          onClick={confirmar}
          disabled={confirmado || aluno.equipamentos.length === 0}
          className={buttonClasses(confirmado ? "ghost" : "primary", "sm")}
        >
          {confirmado ? "Confirmado" : "Confirmar equipamentos"}
        </button>
      </div>
    </Card>
  );
}

function SecaoNotas({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const confirmado = (aluno.perfilConfirmado ?? []).includes("notas");
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <Campo
        label="Observações"
        dica="Histórico, rotina, combinados. Isto não vai para o app do aluno nem para o PDF."
      >
        <textarea
          value={aluno.observacoes ?? ""}
          onChange={(e) => onPatch({ observacoes: e.target.value || undefined })}
          rows={5}
          placeholder="Ex.: treina cedo antes do trabalho, prefere não usar esteira."
          className="input resize-y"
        />
      </Campo>
      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={() => {
            const feitas = new Set(aluno.perfilConfirmado ?? []);
            feitas.add("notas");
            onPatch({ perfilConfirmado: [...feitas] });
            toast("Perfil concluído");
          }}
          disabled={confirmado}
          className={buttonClasses(confirmado ? "ghost" : "primary", "sm")}
        >
          {confirmado ? "Concluído" : "Nada mais a declarar"}
        </button>
      </div>
    </Card>
  );
}

/* -------------------------------- Primitivo -------------------------------- */

function ChipEscolha({
  ativo,
  onClick,
  children,
  titulo,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={titulo}
      className={cn(
        "min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors",
        ativo
          ? "border-primary bg-primary-tint font-bold text-primary"
          : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
      )}
    >
      {ativo && <span aria-hidden>✓ </span>}
      {children}
    </button>
  );
}

export default AlunoPerfil;
