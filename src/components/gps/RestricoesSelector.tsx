import * as React from "react";
import { Search, ShieldAlert, Check, ChevronDown } from "lucide-react";
import { Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  CATALOGO_RESTRICOES,
  GRUPOS_RESTRICAO,
  DISPOSITIVO_OPCOES,
  GRAVIDADE_OPCOES,
  LADO_OPCOES,
  LIBERACAO_OPCOES,
  REGIAO_OPCOES,
  TEMPO_OPCOES,
  agora,
  avaliarSeguranca,
  gatilhosDaTag,
  criarRestricao,
  restricoesAtivas,
  rotuloRestricao,
  type RestricaoCatalogoItem,
  type RestricaoGrupo,
  type RestricaoSelecionada,
  type RestricaoTag,
} from "@/lib/gps/restricoes";

/**
 * Seleção estruturada das restrições físicas do aluno (etapa 4 do Prescrever e
 * cadastro de aluno). Quatro grupos em accordion, cards com checkbox, perguntas
 * condicionais inline, exclusividade de "Nenhuma", "Outra" com texto obrigatório,
 * observação final, alerta de segurança e resumo. Linguagem prudente, não diagnóstica.
 */
export function RestricoesSelector({
  value,
  onChange,
  observacao,
  onObservacao,
  idBase = "restr",
}: {
  value: RestricaoSelecionada[];
  onChange: (next: RestricaoSelecionada[]) => void;
  observacao?: string;
  onObservacao?: (v: string) => void;
  idBase?: string;
}) {
  const [busca, setBusca] = React.useState("");
  const [abertos, setAbertos] = React.useState<Set<RestricaoGrupo>>(
    () => new Set(GRUPOS_RESTRICAO.filter((g) => g.abertoInicial).map((g) => g.id)),
  );

  const selMap = React.useMemo(() => new Map(value.map((r) => [r.tag, r])), [value]);

  const toggle = (tag: RestricaoTag) => {
    if (selMap.has(tag)) {
      onChange(value.filter((r) => r.tag !== tag));
      return;
    }
    // "Nenhuma restrição física" é mutuamente exclusiva com todas as demais.
    if (tag === "nenhuma_restricao") {
      onChange([criarRestricao("nenhuma_restricao")]);
      return;
    }
    const semNenhuma = value.filter((r) => r.tag !== "nenhuma_restricao");
    onChange([...semNenhuma, criarRestricao(tag)]);
  };

  const patch = (tag: RestricaoTag, p: Partial<RestricaoSelecionada>) => {
    onChange(value.map((r) => (r.tag === tag ? { ...r, ...p, atualizadoEm: agora() } : r)));
  };

  const q = busca.trim().toLowerCase();
  const filtra = (it: RestricaoCatalogoItem) =>
    !q || it.titulo.toLowerCase().includes(q) || it.descricao.toLowerCase().includes(q);

  const seguranca = avaliarSeguranca(value);
  const ativas = restricoesAtivas(value);

  return (
    <div className="space-y-4">
      {/* Busca */}
      <label className="relative block">
        <span className="sr-only">Buscar restrição</span>
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar restrição (ex.: joelho, impacto, cirurgia)"
          className="h-10 w-full rounded-control border border-border bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
        />
      </label>

      {/* Grupos em accordion */}
      {GRUPOS_RESTRICAO.map((g) => {
        const itens = CATALOGO_RESTRICOES.filter((it) => it.grupo === g.id && filtra(it));
        if (q && itens.length === 0) return null;
        const aberto = q ? true : abertos.has(g.id);
        const selecionadasNoGrupo = itens.filter((it) => selMap.has(it.tag)).length;
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
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {itens.map((it) => (
                    <RestricaoCard
                      key={it.tag}
                      item={it}
                      sel={selMap.get(it.tag)}
                      onToggle={() => toggle(it.tag)}
                      onPatch={(p) => patch(it.tag, p)}
                      idBase={idBase}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Alerta de segurança */}
      {seguranca.bloqueado && (
        <div className="rounded-xl border border-cta/40 bg-cta/10 p-4" role="alert">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-cta-text">
            <ShieldAlert className="h-4 w-4" /> Confirme a liberação antes de gerar o treino
          </div>
          <ul className="mb-2 space-y-1 text-sm text-ink">
            {seguranca.motivos.map((m) => (
              <li key={m} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                {m}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-2">{seguranca.orientacao}</p>
        </div>
      )}

      {/* Observação final */}
      {onObservacao && (
        <div>
          <label htmlFor={`${idBase}-obs`} className="mb-1 block text-sm font-semibold text-ink">
            Algo mais que o profissional deveria saber?
          </label>
          <textarea
            id={`${idBase}-obs`}
            value={observacao ?? ""}
            onChange={(e) => onObservacao(e.target.value.slice(0, 500))}
            maxLength={500}
            rows={2}
            placeholder="Exemplo: sinto desconforto apenas ao correr, mas consigo caminhar sem dor."
            className="w-full resize-y rounded-control border border-border bg-surface p-2.5 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
          />
        </div>
      )}

      {/* Resumo do que foi selecionado */}
      {ativas.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-soft p-3">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Selecionadas ({ativas.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ativas.map((r) => (
              <Pill key={r.tag} tone="warning">
                {rotuloRestricao(r.tag)}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem informativa (prudência) */}
      <p className="text-xs leading-relaxed text-ink-3">
        Essas informações são usadas para adaptar exercícios, amplitude, impacto, apoio e progressão.
        Elas não representam diagnóstico e não substituem avaliação de um profissional de saúde.
      </p>
    </div>
  );
}

/* ------------------------------- Card ------------------------------------ */

function RestricaoCard({
  item,
  sel,
  onToggle,
  onPatch,
  idBase,
}: {
  item: RestricaoCatalogoItem;
  sel?: RestricaoSelecionada;
  onToggle: () => void;
  onPatch: (p: Partial<RestricaoSelecionada>) => void;
  idBase: string;
}) {
  const selecionado = Boolean(sel);
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors sm:col-span-1",
        // "Nenhuma" e "Outra" ocupam a linha inteira para separar visualmente
        (item.tag === "nenhuma_restricao" || item.tag === "outra_restricao") && "sm:col-span-2",
        selecionado ? "border-primary bg-primary-tint/50" : "border-border bg-surface hover:bg-surface-soft",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selecionado}
        onClick={onToggle}
        className="flex w-full items-start gap-3 text-left"
      >
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
            selecionado ? "border-primary bg-primary text-white" : "border-ink-3/50 bg-surface",
          )}
        >
          {selecionado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-ink">{item.titulo}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">{item.descricao}</span>
        </span>
      </button>

      {selecionado && (
        <div className="mt-3 space-y-3 border-t border-primary/20 pt-3">
          {item.efeitos.length > 0 && (
            <ul className="space-y-1 text-xs text-ink-2">
              {item.efeitos.map((e) => (
                <li key={e} className="flex gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {e}
                </li>
              ))}
            </ul>
          )}
          <PerguntasCondicionais item={item} sel={sel!} onPatch={onPatch} idBase={idBase} />
        </div>
      )}
    </div>
  );
}

/* --------------------------- Perguntas condicionais ----------------------- */

function PerguntasCondicionais({
  item,
  sel,
  onPatch,
  idBase,
}: {
  item: RestricaoCatalogoItem;
  sel: RestricaoSelecionada;
  onPatch: (p: Partial<RestricaoSelecionada>) => void;
  idBase: string;
}) {
  const campos = item.campos ?? [];
  return (
    <div className="space-y-3">
      {campos.includes("gatilhos") && (
        <Campo label="Quando o desconforto costuma aparecer?">
          <div className="flex flex-wrap gap-1.5">
            {gatilhosDaTag(item.tag).map((g) => {
              const on = sel.gatilhos?.includes(g.id) ?? false;
              return (
                <Chip
                  key={g.id}
                  on={on}
                  onClick={() =>
                    onPatch({
                      gatilhos: on
                        ? (sel.gatilhos ?? []).filter((x) => x !== g.id)
                        : [...(sel.gatilhos ?? []), g.id],
                    })
                  }
                >
                  {g.rotulo}
                </Chip>
              );
            })}
          </div>
        </Campo>
      )}

      {campos.includes("lado_regiao") && (
        <>
          <Campo label="Qual lado apresenta maior limitação?">
            <Radios
              name={`${idBase}-${item.tag}-lado`}
              options={LADO_OPCOES}
              value={sel.lado}
              onChange={(v) => onPatch({ lado: v })}
            />
          </Campo>
          <Campo label="Qual região?">
            <Radios
              name={`${idBase}-${item.tag}-regiao`}
              options={REGIAO_OPCOES.map((r) => ({ id: r, rotulo: r }))}
              value={sel.regiao}
              onChange={(v) => onPatch({ regiao: v })}
            />
          </Campo>
        </>
      )}

      {campos.includes("lesao") && (
        <>
          <Campo label="Em qual região?">
            <TextoCurto
              value={sel.regiao ?? ""}
              onChange={(v) => onPatch({ regiao: v })}
              placeholder="Ex.: tornozelo direito"
            />
          </Campo>
          <Campo label="Há quanto tempo ocorreu?">
            <Radios
              name={`${idBase}-${item.tag}-tempo`}
              options={TEMPO_OPCOES}
              value={sel.tempoEvento}
              onChange={(v) => onPatch({ tempoEvento: v })}
            />
          </Campo>
          <Campo label="Ainda existe dor ou perda de função?">
            <Radios
              name={`${idBase}-${item.tag}-dor`}
              options={[{ id: "nao" as const, rotulo: "Não" }, ...GRAVIDADE_OPCOES]}
              value={sel.dorFuncao}
              onChange={(v) => onPatch({ dorFuncao: v })}
            />
          </Campo>
        </>
      )}

      {campos.includes("cirurgia") && (
        <>
          <Campo label="Há quanto tempo ocorreu?">
            <TextoCurto
              value={sel.texto ?? ""}
              onChange={(v) => onPatch({ texto: v })}
              placeholder="Ex.: cirurgia de menisco há 8 semanas"
            />
          </Campo>
          <Campo label="Você possui liberação para realizar exercício físico?" obrigatorio>
            <Radios
              name={`${idBase}-${item.tag}-lib`}
              options={LIBERACAO_OPCOES}
              value={sel.liberacaoMedica}
              onChange={(v) => onPatch({ liberacaoMedica: v })}
            />
          </Campo>
          <Campo label="O profissional de saúde orientou evitar algum movimento ou esforço?">
            <TextoCurto
              value={sel.restricaoProfissional ?? ""}
              onChange={(v) => onPatch({ restricaoProfissional: v })}
              placeholder="Descreva a orientação recebida, se houver."
            />
          </Campo>
        </>
      )}

      {campos.includes("dispositivo") && (
        <Campo label="Qual dispositivo você utiliza?">
          <Radios
            name={`${idBase}-${item.tag}-disp`}
            options={DISPOSITIVO_OPCOES.map((d) => ({ id: d, rotulo: d }))}
            value={sel.dispositivo}
            onChange={(v) => onPatch({ dispositivo: v })}
          />
        </Campo>
      )}

      {campos.includes("texto_obrigatorio") && (
        <Campo label="Descreva a restrição" obrigatorio>
          <textarea
            value={sel.texto ?? ""}
            onChange={(e) => onPatch({ texto: e.target.value.slice(0, 300) })}
            maxLength={300}
            rows={2}
            placeholder="Descreva em quais movimentos ou situações aparece a dificuldade."
            className="w-full resize-y rounded-control border border-border bg-surface p-2 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
          />
        </Campo>
      )}
    </div>
  );
}

/* ------------------------------ Primitivos -------------------------------- */

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-ink-2">
        {label}
        {obrigatorio && <span className="ml-1 text-cta-text">*</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        on
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-ink-2 hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}

function Radios<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { id: T; rotulo: string }[];
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
                ? "border-primary bg-primary text-white"
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

function TextoCurto({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 160))}
      placeholder={placeholder}
      className="h-9 w-full rounded-control border border-border bg-surface px-2.5 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
    />
  );
}

