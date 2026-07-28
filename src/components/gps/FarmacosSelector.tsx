import * as React from "react";
import { Search, Check, ChevronDown, Pill as PillIcon, HelpCircle } from "lucide-react";
import { Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  CATALOGO_FARMACOS,
  GRUPOS_FARMACO,
  FONTE_INFORMACAO_OPCOES,
  MUDANCA_RECENTE_OPCOES,
  agora,
  criarFarmaco,
  farmacosAtivos,
  rotuloFarmaco,
  type FarmacoCatalogoItem,
  type FarmacoClasseId,
  type FarmacoGrupo,
  type FarmacoSelecionado,
} from "@/data/farmacos";

/**
 * Seleção estruturada das CLASSES de medicação em uso do aluno (cadastro de aluno). Espelha o
 * RestricoesSelector: grupos em acordeão, cards com checkbox, detalhe das selecionadas com as
 * perguntas de contexto, resumo e mensagem de prudência.
 *
 * Três regras que este componente carrega e que valem mais que o leiaute:
 * 1. Não existe campo de quantidade, esquema de uso, marca nem texto livre. O que o tipo do
 *    dado não comporta, a tela não pergunta e o PDF não imprime.
 * 2. "Não sei" e "prefiro não informar" são OPÇÃO DE PRIMEIRA CLASSE, no topo e com o mesmo
 *    peso visual dos grupos, e não letra miúda no rodapé: com condição de risco no perfil,
 *    esse estado leva o sistema para o lado seguro, então esconder a opção seria trocar um
 *    dado honesto por um silêncio.
 * 3. O sujeito da frase é sempre a resposta ao esforço ou o profissional, nunca o remédio, e a
 *    conduta sobre a medicação é devolvida a quem a prescreveu (o texto vem do catálogo).
 *
 * DECISÃO DE PRODUTO: "não sei" e "prefiro não informar" aparecem numa opção só, que nomeia os
 * dois casos, porque o dado do aluno tem UM estado para eles (`farmacosNaoInformado`). Dois
 * botões para um booleano ficariam os dois acesos ao mesmo tempo, ou pediriam um campo novo
 * que ninguém leria. Pelo mesmo motivo não existe "nenhuma medicação": lista vazia e "ainda não
 * perguntei" são indistinguíveis no tipo, e afirmar que o aluno não usa nada seria inventar.
 */
export function FarmacosSelector({
  value,
  onChange,
  naoInformado,
  onNaoInformado,
  idBase = "farm",
}: {
  value: FarmacoSelecionado[];
  onChange: (next: FarmacoSelecionado[]) => void;
  /** o profissional declarou que não sabe ou prefere não informar */
  naoInformado?: boolean;
  onNaoInformado?: (v: boolean) => void;
  idBase?: string;
}) {
  const [busca, setBusca] = React.useState("");
  const [abertos, setAbertos] = React.useState<Set<FarmacoGrupo>>(
    () => new Set(GRUPOS_FARMACO.filter((g) => g.abertoInicial).map((g) => g.id)),
  );

  const selMap = React.useMemo(() => new Map(value.map((f) => [f.classe, f])), [value]);

  const toggle = (classe: FarmacoClasseId) => {
    if (selMap.has(classe)) {
      onChange(value.filter((f) => f.classe !== classe));
      return;
    }
    // Declarar uma classe e ao mesmo tempo dizer que não sabe seria contraditório: a
    // declaração vence, e o "não sei" cai.
    onNaoInformado?.(false);
    onChange([...value, criarFarmaco(classe)]);
  };

  const marcarNaoInformado = () => {
    const proximo = !naoInformado;
    onNaoInformado?.(proximo);
    if (proximo) onChange([]);
  };

  const patch = (classe: FarmacoClasseId, p: Partial<FarmacoSelecionado>) => {
    onChange(value.map((f) => (f.classe === classe ? { ...f, ...p, atualizadoEm: agora() } : f)));
  };

  const q = busca.trim().toLowerCase();
  const filtra = (it: FarmacoCatalogoItem) =>
    !q ||
    it.titulo.toLowerCase().includes(q) ||
    it.descricao.toLowerCase().includes(q) ||
    it.exemplos.some((e) => e.toLowerCase().includes(q));

  const ativos = farmacosAtivos(value);

  // Selecionadas: vão para a seção "Detalhe das selecionadas", em coluna única, com os
  // efeitos no treino e as perguntas de contexto (origem da informação e mudança recente).
  const comDetalhe = React.useMemo(
    () =>
      ativos
        .map((f) => ({ f, item: CATALOGO_FARMACOS.find((it) => it.classe === f.classe) }))
        .filter((x): x is { f: FarmacoSelecionado; item: FarmacoCatalogoItem } => Boolean(x.item)),
    [ativos],
  );

  return (
    <div className="space-y-4">
      {/* Busca */}
      <label className="relative block">
        <span className="sr-only">Buscar classe de medicação</span>
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar classe (ex.: pressão, glicemia, colesterol)"
          className="h-10 w-full rounded-control border border-border bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
        />
      </label>

      {/* "Não sei ou prefiro não informar": opção de primeira classe, no topo. */}
      {onNaoInformado && (
        <button
          type="button"
          role="checkbox"
          aria-checked={Boolean(naoInformado)}
          onClick={marcarNaoInformado}
          className={cn(
            "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
            naoInformado ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
              naoInformado ? "border-primary bg-primary text-on-primary" : "border-ink-3/50 bg-surface",
            )}
          >
            {naoInformado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              <HelpCircle className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
              Não sei ou o aluno prefere não informar
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">
              Responder isto é melhor que deixar em branco. Com condição de risco no perfil, o sistema passa a
              guiar a intensidade pelo esforço percebido e pelo teste da fala, sem afirmar nada sobre o aluno.
            </span>
          </span>
        </button>
      )}

      {/* Grupos em acordeão */}
      {GRUPOS_FARMACO.map((g) => {
        const itens = CATALOGO_FARMACOS.filter((it) => it.grupo === g.id && filtra(it));
        if (q && itens.length === 0) return null;
        const aberto = q ? true : abertos.has(g.id);
        const selecionadasNoGrupo = itens.filter((it) => selMap.has(it.classe)).length;
        const painelId = `${idBase}-grp-${g.id}`;
        return (
          <div key={g.id} className="overflow-hidden rounded-xl border border-border bg-surface">
            <button
              type="button"
              onClick={() =>
                setAbertos((prev) => {
                  const next = new Set(prev);
                  next.has(g.id) ? next.delete(g.id) : next.add(g.id);
                  return next;
                })
              }
              aria-expanded={aberto}
              aria-controls={painelId}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold text-ink">{g.titulo}</span>
                {selecionadasNoGrupo > 0 && (
                  <Pill tone="primary">
                    {selecionadasNoGrupo} {selecionadasNoGrupo === 1 ? "selecionada" : "selecionadas"}
                  </Pill>
                )}
              </span>
              <ChevronDown
                aria-hidden
                className={cn("h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")}
              />
            </button>
            {aberto && (
              <div id={painelId} role="region" aria-label={g.titulo} className="border-t border-border p-3">
                <div className="grid items-stretch gap-2.5 sm:grid-cols-2">
                  {itens.map((it) => (
                    <FarmacoCard
                      key={it.classe}
                      item={it}
                      selecionado={selMap.has(it.classe)}
                      onToggle={() => toggle(it.classe)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Detalhe das selecionadas: o que muda no treino e as perguntas de contexto. */}
      {comDetalhe.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Detalhe das selecionadas</div>
          {comDetalhe.map(({ f, item }) => (
            <RefinarCard
              key={f.classe}
              item={item}
              sel={f}
              onPatch={(p) => patch(f.classe, p)}
              idBase={idBase}
            />
          ))}
        </div>
      )}

      {/* Resumo do que foi selecionado */}
      {ativos.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-soft p-3">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Selecionadas ({ativos.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ativos.map((f) => (
              <Pill key={f.classe} tone="primary">
                {rotuloFarmaco(f.classe)}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem informativa (prudência e fronteira de escopo) */}
      <p className="text-xs leading-relaxed text-ink-3">
        Registre apenas a CLASSE em uso. O sistema não pede nem guarda quantidade, esquema de uso, marca ou
        horário, e usa a informação só para escolher por qual instrumento guiar o esforço e quais conferências
        fazer antes da sessão. A conduta sobre a medicação é do profissional de saúde que a prescreveu.
      </p>
    </div>
  );
}

/* ------------------------------- Card ------------------------------------ */

/** Card da GRADE: só escolhe (marca e desmarca). Altura uniforme, sem expansão inline. */
function FarmacoCard({
  item,
  selecionado,
  onToggle,
}: {
  item: FarmacoCatalogoItem;
  selecionado: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selecionado}
      onClick={onToggle}
      className={cn(
        "flex h-full w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors sm:col-span-1",
        selecionado ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
          selecionado ? "border-primary bg-primary text-on-primary" : "border-ink-3/50 bg-surface",
        )}
      >
        {selecionado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{item.titulo}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">{item.descricao}</span>
        {item.exemplos.length > 0 && (
          <span className="mt-1.5 block text-2xs leading-relaxed text-ink-3">
            Princípios ativos comuns: {item.exemplos.join(", ")}.
          </span>
        )}
      </span>
    </button>
  );
}

/** Card da seção "Detalhe das selecionadas": efeitos no treino e perguntas de contexto. */
function RefinarCard({
  item,
  sel,
  onPatch,
  idBase,
}: {
  item: FarmacoCatalogoItem;
  sel: FarmacoSelecionado;
  onPatch: (p: Partial<FarmacoSelecionado>) => void;
  idBase: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <PillIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="font-semibold text-ink">{item.titulo}</span>
      </div>
      {item.efeitos.length > 0 && (
        <ul className="mb-3 space-y-1 text-xs text-ink-2">
          {item.efeitos.map((e) => (
            <li key={e} className="flex gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {e}
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-3">
        <Campo label="De onde veio essa informação?">
          <Radios
            name={`${idBase}-${item.classe}-fonte`}
            options={FONTE_INFORMACAO_OPCOES}
            value={sel.fonte}
            onChange={(v) => onPatch({ fonte: v })}
          />
        </Campo>
        <Campo label="Houve mudança recente no tratamento?">
          <Radios
            name={`${idBase}-${item.classe}-mudanca`}
            options={MUDANCA_RECENTE_OPCOES}
            value={sel.mudancaRecente}
            onChange={(v) => onPatch({ mudancaRecente: v })}
          />
        </Campo>
      </div>
      <p className="mt-3 text-2xs leading-relaxed text-ink-3">{item.devolucao}</p>
    </div>
  );
}

/* ------------------------------ Primitivos -------------------------------- */

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-ink-2">{label}</div>
      {children}
    </div>
  );
}

function Radios<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly { id: T; rotulo: string }[];
  value?: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              on
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-surface text-ink-2 hover:border-primary/50",
            )}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
