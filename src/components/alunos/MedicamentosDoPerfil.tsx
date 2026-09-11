import * as React from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Circle, Diamond, Heart, Info, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastDesfazer } from "@/lib/toast";
import { getSpecialGroup } from "@/data/specialGroups";
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
 * O PASSO "MEDICAMENTOS EM USO" DO PERFIL DO ALUNO, no desenho do protótipo de 11/09/2026.
 *
 * A tela responde, nesta ordem, as três perguntas que o profissional faz de cabeça:
 *
 * 1. **O aluno usa medicação contínua?** Três respostas em cartão, com o mesmo peso: "Nenhuma
 *    medicação", "Vou marcar as classes" e "Não sei / não informou". "Nenhuma" virou resposta
 *    declarada (`farmacosNenhum`): a lista vazia não dizia isso, porque ao gravar ela volta a
 *    ser "não declarado", e silêncio não é resposta. O "não sei" continua opção de primeira
 *    classe, no topo, porque com condição de risco ele leva o sistema para o lado seguro.
 * 2. **O que é provável para ESTE aluno?** As classes cujo `gruposRelevantes` (do catálogo)
 *    casa com as condições do perfil aparecem primeiro, com "Usa" e "Não usa". É a sugestão
 *    que o catálogo já sabia fazer e a tela não usava; ela não infere condição nem afirma uso,
 *    só pede confirmação. O "Não usa" fica guardado (`farmacosDescartados`) para a pergunta
 *    não voltar aberta.
 * 3. **Mais alguma?** O catálogo inteiro por sistema, com busca, em grupos que abrem e fecham
 *    (com o contador do que já foi marcado em cada um), e as classes em cartões com o (i).
 *
 * As três regras do seletor continuam valendo, e valem mais que o leiaute:
 * 1. Não existe campo de quantidade, esquema de uso, marca nem texto livre. O que o tipo do
 *    dado não comporta, a tela não pergunta e o PDF não imprime.
 * 2. "Não sei ou prefere não informar" é opção de primeira classe, no topo.
 * 3. O sujeito da frase é a resposta ao esforço ou o profissional, nunca o remédio, e a conduta
 *    sobre a medicação é devolvida a quem a prescreveu (o texto vem do catálogo).
 *
 * O protótipo lista duas classes que o catálogo não tem ("Analgésico simples" e "Corticoide
 * sistêmico"). Elas não entram por desenho: classe nova é conteúdo clínico, com o que muda no
 * treino, o que nunca afirmar e a devolução ao prescritor, e isso passa pelo Filipe e pela
 * régua do check:farmacos antes de aparecer aqui.
 */

/** Tudo o que se sabe sobre a medicação do aluno: muda junto, numa chamada só. */
export interface EstadoMedicacao {
  farmacos: FarmacoSelecionado[];
  naoInformado: boolean;
  nenhum: boolean;
  descartados: FarmacoClasseId[];
}

type Modo = "nenhum" | "marcar" | "naosei";

export function MedicamentosDoPerfil({
  value,
  naoInformado = false,
  nenhum = false,
  descartados = [],
  grupos = [],
  nomeAluno,
  linkSaude,
  onChange,
  idBase = "perfil-farm",
}: {
  value: FarmacoSelecionado[];
  /** o profissional declarou que não sabe ou prefere não informar */
  naoInformado?: boolean;
  /** o profissional declarou que o aluno não usa medicação contínua */
  nenhum?: boolean;
  /** classes sugeridas que o profissional respondeu "Não usa" */
  descartados?: FarmacoClasseId[];
  /** condições do perfil (grupo principal e adicionais): de onde saem as classes prováveis */
  grupos?: string[];
  /** primeiro nome do aluno, para a pergunta do topo */
  nomeAluno?: string;
  /** para onde o nome da condição leva (a seção de saúde do perfil) */
  linkSaude?: string;
  /**
   * UMA chamada com TODOS os campos. Eram dois callbacks, e o segundo desfazia o primeiro no
   * mesmo clique (o "não sei" não marcava); os quatro campos são um estado só.
   */
  onChange: (estado: EstadoMedicacao) => void;
  idBase?: string;
}) {
  const [busca, setBusca] = React.useState("");
  // Um (i) aberto por vez: abrir outro fecha este, e a grade não vira um folheto.
  const [infoAberta, setInfoAberta] = React.useState<FarmacoClasseId | null>(null);
  // "Vou marcar" escolhido antes da primeira marcação: a resposta existe na tela antes de
  // existir no dado (sem classe marcada, nada foi declarado ainda).
  const [vouMarcar, setVouMarcar] = React.useState(value.length > 0);
  const [abertos, setAbertos] = React.useState<Set<FarmacoGrupo>>(
    () => new Set(GRUPOS_FARMACO.filter((g) => g.abertoInicial).map((g) => g.id)),
  );

  const selMap = React.useMemo(() => new Map(value.map((f) => [f.classe, f])), [value]);
  const estado: EstadoMedicacao = { farmacos: value, naoInformado, nenhum, descartados };
  const mudar = (p: Partial<EstadoMedicacao>) => onChange({ ...estado, ...p });

  const modo: Modo | null = nenhum ? "nenhum" : naoInformado ? "naosei" : value.length > 0 || vouMarcar ? "marcar" : null;

  const escolher = (m: Modo) => {
    if (m === "marcar") {
      setVouMarcar(true);
      mudar({ nenhum: false, naoInformado: false });
      return;
    }
    // "Nenhuma" e "não sei" apagam as classes marcadas: a declaração contrária venceria em
    // silêncio, então o aviso traz o Desfazer. Tocar de novo na mesma opção volta ao branco.
    const antes = estado;
    setVouMarcar(false);
    if (m === "nenhum") mudar({ farmacos: [], naoInformado: false, nenhum: !nenhum });
    else mudar({ farmacos: [], nenhum: false, naoInformado: !naoInformado });
    if (value.length > 0) {
      toastDesfazer(
        value.length === 1 ? "1 classe desmarcada." : `${value.length} classes desmarcadas.`,
        () => onChange(antes),
      );
    }
  };

  const marcar = (classe: FarmacoClasseId) => {
    if (selMap.has(classe)) return;
    setVouMarcar(true);
    // Declarar uma classe e ao mesmo tempo dizer "nenhuma" ou "não sei" seria contraditório:
    // a declaração vence.
    mudar({
      farmacos: [...value, criarFarmaco(classe)],
      nenhum: false,
      naoInformado: false,
      descartados: descartados.filter((c) => c !== classe),
    });
  };
  const desmarcar = (classe: FarmacoClasseId) => mudar({ farmacos: value.filter((f) => f.classe !== classe) });
  const toggle = (classe: FarmacoClasseId) => (selMap.has(classe) ? desmarcar(classe) : marcar(classe));
  const naoUsa = (classe: FarmacoClasseId) =>
    mudar({
      farmacos: value.filter((f) => f.classe !== classe),
      descartados: descartados.includes(classe) ? descartados.filter((c) => c !== classe) : [...descartados, classe],
    });
  const patch = (classe: FarmacoClasseId, p: Partial<FarmacoSelecionado>) =>
    mudar({ farmacos: value.map((f) => (f.classe === classe ? { ...f, ...p, atualizadoEm: agora() } : f)) });

  /* ---- Prováveis pelo perfil ---- */
  const provaveis = CATALOGO_FARMACOS.filter((it) => it.gruposRelevantes.some((g) => grupos.includes(g)));
  const idsProvaveis = new Set(provaveis.map((p) => p.classe));
  const condicaoDe = (it: FarmacoCatalogoItem) => {
    const slug = grupos.find((g) => it.gruposRelevantes.includes(g));
    return slug ? (getSpecialGroup(slug)?.nome ?? slug) : undefined;
  };
  const condicoes = [...new Set(provaveis.map(condicaoDe).filter(Boolean))] as string[];
  const nProv = provaveis.length;
  const EXTENSO = ["", "esta", "estas duas", "estas três", "estas quatro", "estas cinco", "estas seis"];

  /* ---- Catálogo por sistema ---- */
  const q = busca.trim().toLowerCase();
  const casa = (it: FarmacoCatalogoItem) =>
    !q ||
    it.titulo.toLowerCase().includes(q) ||
    it.descricao.toLowerCase().includes(q) ||
    it.exemplos.some((e) => e.toLowerCase().includes(q));
  const gruposCatalogo = GRUPOS_FARMACO.map((g) => ({
    grupo: g,
    itens: CATALOGO_FARMACOS.filter((it) => it.grupo === g.id && casa(it)),
  })).filter((x) => x.itens.length > 0);

  const alternarGrupo = (g: FarmacoGrupo) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });

  const primeiro = nomeAluno?.split(" ")[0];
  const mostrarCatalogo = modo === "marcar" || modo === null;

  return (
    <div className="space-y-4">
      {/* 1. A PERGUNTA DO TOPO, em três cartões do mesmo tamanho. */}
      <div>
        <p id={`${idBase}-pergunta`} className="mb-2.5 text-2xs font-bold uppercase tracking-[0.12em] text-ink-2">
          {primeiro ? `${primeiro} usa alguma medicação contínua?` : "O aluno usa alguma medicação contínua?"}
        </p>
        <div role="radiogroup" aria-labelledby={`${idBase}-pergunta`} className="grid gap-2.5 sm:grid-cols-3">
          <CartaoModo
            ativo={modo === "nenhum"}
            onClick={() => escolher("nenhum")}
            titulo="Nenhuma medicação"
            dica="Nada contínuo no momento"
          />
          <CartaoModo
            ativo={modo === "marcar"}
            onClick={() => escolher("marcar")}
            titulo="Vou marcar as classes"
            dica="Só a classe, nunca o remédio"
          />
          <CartaoModo
            ativo={modo === "naosei"}
            onClick={() => escolher("naosei")}
            titulo="Não sei / não informou"
            dica="Com condição de risco, o Mapa guia pelo esforço percebido"
          />
        </div>
      </div>

      {modo === "nenhum" && (
        <p role="status" className="rounded-card border border-success/30 bg-success-tint/50 px-4 py-3 text-[13px] leading-normal text-ink-2">
          <b className="font-semibold text-ink">Registrado:</b> {primeiro ?? "o aluno"} não usa medicação contínua. O Mapa segue
          com a frequência cardíaca e as escalas de sempre. Se isso mudar, escolha "Vou marcar as classes".
        </p>
      )}
      {modo === "naosei" && (
        <p role="status" className="rounded-card border border-border bg-surface-soft px-4 py-3 text-[13px] leading-normal text-ink-2">
          <b className="font-semibold text-ink">Registrado.</b> Com condição de risco no perfil, o Mapa passa a guiar a
          intensidade pelo esforço percebido e pelo teste da fala, sem afirmar nada sobre o aluno. Melhor do que deixar em
          branco.
        </p>
      )}

      {/* 2. PROVÁVEIS PELO PERFIL: as classes que o catálogo liga às condições deste aluno. */}
      {mostrarCatalogo && nProv > 0 && (
        <section
          aria-labelledby={`${idBase}-provaveis`}
          className="rounded-card border border-primary/15 bg-primary-tint/60 p-3.5 sm:p-4"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h4 id={`${idBase}-provaveis`} className="text-[15px] font-bold text-ink">
              Prováveis pelo perfil {primeiro ? "de " + primeiro : "do aluno"}
            </h4>
            {condicoes.length > 0 &&
              (linkSaude ? (
                <Link to={linkSaude} className="text-[13px] font-semibold text-primary-texto hover:underline sm:ml-auto">
                  {condicoes.join(" e ").toLowerCase()}
                </Link>
              ) : (
                <span className="text-[13px] font-semibold text-ink-2 sm:ml-auto">{condicoes.join(" e ").toLowerCase()}</span>
              ))}
          </div>
          <p className="mt-1 text-[13px] leading-normal text-ink-2">
            Confirme ou descarte {EXTENSO[nProv] ?? `estas ${nProv}`} e você já pode seguir. O catálogo abaixo é só se houver
            mais.
          </p>
          <ul className="mt-3 space-y-2">
            {provaveis.map((it) => {
              const f = selMap.get(it.classe);
              const usa = Boolean(f);
              const descartada = descartados.includes(it.classe);
              const condicao = condicaoDe(it);
              return (
                <li
                  key={it.classe}
                  className={cn(
                    "rounded-[12px] border bg-surface transition-colors",
                    usa ? "border-2 border-primary" : "border-border",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-3">
                    <span className="min-w-0 flex-1 basis-[220px]">
                      <span className="block text-[15px] font-semibold leading-snug text-ink">{it.titulo}</span>
                      <span className="block text-[12.5px] leading-snug text-ink-2">
                        {condicao ? `Comum em ${condicao.toLowerCase()}` : "Pelo perfil"}
                        {it.exemplos.length > 0 ? ` · ${it.exemplos.slice(0, 2).join(", ")}` : ""}
                      </span>
                    </span>
                    <span role="radiogroup" aria-label={`${it.titulo}: o aluno usa?`} className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={usa}
                        onClick={() => (usa ? desmarcar(it.classe) : marcar(it.classe))}
                        className={cn(
                          "h-10 rounded-control border px-4 text-[13.5px] font-semibold transition-colors",
                          usa ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink hover:border-ink-3",
                        )}
                      >
                        Usa
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={descartada}
                        onClick={() => naoUsa(it.classe)}
                        className={cn(
                          "h-10 rounded-control border px-4 text-[13.5px] font-semibold transition-colors",
                          descartada ? "border-ink bg-ink text-surface" : "border-border bg-surface text-ink-2 hover:border-ink-3 hover:text-ink",
                        )}
                      >
                        Não usa
                      </button>
                    </span>
                  </div>
                  {f && <PerguntasDeContexto item={it} selecionado={f} onPatch={(p) => patch(it.classe, p)} />}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 3. O CATÁLOGO INTEIRO, por sistema, com busca. */}
      {mostrarCatalogo && (
        <>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <h4 className="shrink-0 text-[15px] font-bold text-ink">{nProv > 0 ? "Outras classes" : "Classes por sistema"}</h4>
            <label className="relative min-w-0 flex-1 basis-[240px]">
              <span className="sr-only">Buscar classe ou princípio ativo</span>
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar classe ou princípio ativo..."
                className="h-[44px] w-full rounded-[11px] border border-border bg-surface-soft pl-10 pr-3 text-[13.5px] text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary focus-visible:bg-surface"
              />
            </label>
          </div>

          {gruposCatalogo.length === 0 && (
            <p className="rounded-control border border-dashed border-border p-4 text-sm text-ink-2">
              Nenhuma classe encontrada para "{busca.trim()}". A busca olha o nome da classe e os princípios ativos.
            </p>
          )}

          <div className="space-y-2.5">
            {gruposCatalogo.map(({ grupo, itens }) => {
              // Com busca, todo grupo que tem resultado abre: esconder o que foi procurado atrás
              // de um toque seria a busca respondendo pela metade.
              const aberto = q ? true : abertos.has(grupo.id);
              const marcadas = itens.filter((it) => selMap.has(it.classe)).length;
              const icone = ICONE_GRUPO[grupo.id];
              const nomes = itens.map((it) => it.titulo.replace(/\s*\([^)]*\)/, ""));
              const resumo = nomes.length > 3 ? `${nomes.slice(0, 3).join(" · ")} · +${nomes.length - 3}` : nomes.join(" · ");
              const info = itens.find((it) => it.classe === infoAberta);
              // As perguntas de contexto das marcadas deste grupo que NÃO estão nas prováveis
              // (lá elas já aparecem, logo abaixo do "Usa").
              const marcadasAqui = itens.filter((it) => selMap.has(it.classe) && !idsProvaveis.has(it.classe));
              const idCorpo = `${idBase}-g-${grupo.id}`;
              return (
                <section key={grupo.id} className="overflow-hidden rounded-card border border-border bg-surface">
                  <button
                    type="button"
                    onClick={() => alternarGrupo(grupo.id)}
                    aria-expanded={aberto}
                    aria-controls={idCorpo}
                    disabled={Boolean(q)}
                    className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-soft disabled:cursor-default disabled:hover:bg-transparent sm:px-4"
                  >
                    <span aria-hidden className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px]", icone.fundo, icone.cor)}>
                      {icone.desenho}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold leading-snug text-ink">{grupo.titulo}</span>
                      <span className="block truncate text-[12.5px] text-ink-2">{resumo}</span>
                    </span>
                    {marcadas > 0 && (
                      <span
                        className="tabular grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-on-primary"
                        aria-label={`${marcadas} marcada${marcadas === 1 ? "" : "s"}`}
                      >
                        {marcadas}
                      </span>
                    )}
                    {!q && (
                      <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
                    )}
                  </button>

                  {aberto && (
                    <div id={idCorpo} className="space-y-2.5 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
                      {/* A grade se acomoda à largura do cartão: três colunas na tela larga, duas
                          ao lado do "O que isso muda" num notebook, uma no celular. Os nomes do
                          catálogo são longos ("Bloqueador do receptor de angiotensina (BRA)"):
                          abaixo de 230 px a coluna quebra o nome em quatro linhas. */}
                      <ul className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr))]">
                        {itens.map((it) => (
                          <CartaoClasse
                            key={it.classe}
                            item={it}
                            marcada={selMap.has(it.classe)}
                            onToggle={() => toggle(it.classe)}
                            infoAberta={infoAberta === it.classe}
                            onInfo={() => setInfoAberta((a) => (a === it.classe ? null : it.classe))}
                            idInfo={`${idBase}-${it.classe}-info`}
                          />
                        ))}
                      </ul>
                      {/* O (i) abre o detalhe EMBAIXO da grade, na largura toda: um balão por cima
                          cobria os grupos de baixo, e dentro do cartão ele esticava a linha inteira. */}
                      {info && <DetalheClasse item={info} id={`${idBase}-${info.classe}-info`} onFechar={() => setInfoAberta(null)} />}
                      {marcadasAqui.length > 0 && (
                        <div className="space-y-1 rounded-[12px] bg-surface-soft py-1">
                          {marcadasAqui.map((it) => (
                            <div key={it.classe}>
                              <p className="px-3.5 pt-2 text-[13px] font-semibold text-ink">{it.titulo}</p>
                              <PerguntasDeContexto item={it} selecionado={selMap.get(it.classe)!} onPatch={(p) => patch(it.classe, p)} recuo={false} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}

      <p className="text-xs leading-relaxed text-ink-3">
        Registre apenas a classe em uso: nada de dose, marca ou horário. O sistema usa a informação só para escolher por qual
        instrumento guiar o esforço e quais conferências fazer antes da sessão. A conduta sobre a medicação é do profissional
        de saúde que a prescreveu.
      </p>
    </div>
  );
}

/* ------------------------------ As peças ------------------------------ */

/** Um dos três cartões da pergunta do topo: rádio de verdade, com o título e a consequência. */
function CartaoModo({ ativo, onClick, titulo, dica }: { ativo: boolean; onClick: () => void; titulo: string; dica: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={ativo}
      onClick={onClick}
      className={cn(
        "flex min-h-[64px] items-start gap-3 rounded-control px-3.5 py-3 text-left transition-colors",
        ativo ? "border-2 border-ink bg-surface" : "border border-border bg-surface-soft hover:border-ink-3",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
          ativo ? "border-ink" : "border-ink-3/60 bg-surface",
        )}
      >
        {ativo && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-snug text-ink">{titulo}</span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-2">{dica}</span>
      </span>
    </button>
  );
}

/**
 * O CARTÃO DA CLASSE na grade. Marcar e abrir o (i) são DOIS botões irmãos, e não um dentro do
 * outro: botão dentro de botão é HTML inválido e o leitor de tela anunciaria o (i) como parte
 * do "marcar". Os princípios ativos cabem numa linha; a lista inteira está no `title` e no (i).
 */
function CartaoClasse({
  item,
  marcada,
  onToggle,
  infoAberta,
  onInfo,
  idInfo,
}: {
  item: FarmacoCatalogoItem;
  marcada: boolean;
  onToggle: () => void;
  infoAberta: boolean;
  onInfo: () => void;
  idInfo: string;
}) {
  return (
    <li
      className={cn(
        "flex items-stretch rounded-[14px] border transition-colors",
        marcada ? "border-primary bg-primary-tint/50" : "border-border bg-surface hover:border-ink-3",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={marcada}
        onClick={onToggle}
        className="flex min-h-[64px] min-w-0 flex-1 items-center gap-3 py-3 pl-3.5 text-left"
      >
        <Caixa marcada={marcada} />
        <span className="min-w-0">
          <span className={cn("block text-[15px] font-semibold leading-snug", marcada ? "text-primary-texto" : "text-ink")}>
            {item.titulo}
          </span>
          {item.exemplos.length > 0 && (
            <span className="block truncate text-[12.5px] leading-snug text-ink-2" title={item.exemplos.join(", ")}>
              {item.exemplos.join(", ")}
            </span>
          )}
        </span>
      </button>
      {/* Círculo de 22 px à vista, 44 px de toque em volta. */}
      <button
        type="button"
        onClick={onInfo}
        aria-expanded={infoAberta}
        aria-controls={infoAberta ? idInfo : undefined}
        aria-label={`${infoAberta ? "Fechar" : "Abrir"} o que é ${item.titulo}`}
        className="group flex w-11 shrink-0 items-center justify-center"
      >
        <span
          className={cn(
            "grid h-[22px] w-[22px] place-items-center rounded-full transition-colors",
            infoAberta ? "bg-ink text-surface" : "bg-bg text-ink-2 ring-1 ring-inset ring-border group-hover:text-ink",
          )}
        >
          <Info aria-hidden className="h-3 w-3" />
        </span>
      </button>
    </li>
  );
}

/** O que o (i) mostra: o que a classe é, o que muda no treino e a devolução ao prescritor. */
function DetalheClasse({ item, id, onFechar }: { item: FarmacoCatalogoItem; id: string; onFechar: () => void }) {
  return (
    <div id={id} className="rounded-[12px] border border-border bg-surface-soft p-3.5">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">{item.titulo}</p>
        <button
          type="button"
          onClick={onFechar}
          aria-label={`Fechar o que é ${item.titulo}`}
          className="-m-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 hover:text-ink"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{item.descricao}</p>
      {item.exemplos.length > 0 && (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
          <b className="font-semibold text-ink">Princípios ativos:</b> {item.exemplos.join(", ")}
        </p>
      )}
      {item.efeitos.length > 0 && (
        <ul className="mt-2 space-y-1">
          {item.efeitos.map((e) => (
            <li key={e} className="flex gap-2 text-xs leading-relaxed text-ink-2">
              <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
              {e}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-2xs leading-relaxed text-ink-3">{item.devolucao}</p>
    </div>
  );
}

/** Rótulos curtos das perguntas de contexto: a frase inteira do catálogo fica no `title`. */
const FONTE_CURTA: Record<string, string> = {
  receita: "Receita ou relatório",
  relato_aluno: "O aluno relatou",
  relato_responsavel: "Familiar relatou",
  nao_sei: "Não sei",
};
const MUDANCA_CURTA: Record<string, string> = { sim: "Sim", nao: "Não", nao_sei: "Não sei" };

/**
 * As duas perguntas de contexto só existem para o que foi marcado, e respondê-las não é
 * condição para marcar: ficam logo abaixo da classe, em fichas curtas e opcionais.
 */
function PerguntasDeContexto({
  item,
  selecionado,
  onPatch,
  recuo = true,
}: {
  item: FarmacoCatalogoItem;
  selecionado: FarmacoSelecionado;
  onPatch: (p: Partial<FarmacoSelecionado>) => void;
  recuo?: boolean;
}) {
  return (
    <div className={cn("grid gap-x-3 gap-y-2 pb-3 pr-3.5 sm:grid-cols-[auto_1fr] sm:items-center", recuo ? "pl-3.5" : "pl-3.5 pt-1")}>
      <span className="text-xs font-semibold text-ink-2">De onde veio a informação</span>
      <Radios
        rotulo={`${item.titulo}: de onde veio essa informação`}
        opcoes={FONTE_INFORMACAO_OPCOES}
        curtos={FONTE_CURTA}
        valor={selecionado.fonte}
        onChange={(v) => onPatch({ fonte: v })}
      />
      <span className="text-xs font-semibold text-ink-2">Mudança recente no tratamento</span>
      <Radios
        rotulo={`${item.titulo}: houve mudança recente no tratamento`}
        opcoes={MUDANCA_RECENTE_OPCOES}
        curtos={MUDANCA_CURTA}
        valor={selecionado.mudancaRecente}
        onChange={(v) => onPatch({ mudancaRecente: v })}
      />
    </div>
  );
}

/* ------------------------------ Primitivos ------------------------------ */

/** Os quatro sistemas, cada um com um desenho e uma cor: é o que se reconhece de relance. */
const ICONE_GRUPO: Record<FarmacoGrupo, { desenho: React.ReactNode; cor: string; fundo: string }> = {
  cardiovascular: { desenho: <Heart className="h-4 w-4" fill="currentColor" />, cor: "text-danger", fundo: "bg-danger-tint" },
  glicemia: { desenho: <Circle className="h-3.5 w-3.5" fill="currentColor" />, cor: "text-primary", fundo: "bg-primary-tint" },
  lipidios: { desenho: <Diamond className="h-4 w-4" fill="currentColor" />, cor: "text-analysis", fundo: "bg-analysis-tint" },
  dor_inflamacao: { desenho: <Plus className="h-4 w-4" strokeWidth={3} />, cor: "text-warning", fundo: "bg-warning-tint" },
};

/**
 * "SELECIONADOS": o que foi declarado, em fichas escuras e removíveis.
 *
 * Exportada porque, no perfil, a linha mora na CABEÇA do cartão do passo, fora do miolo que
 * este componente desenha. Tirar uma classe nunca liga o "não sei" nem o "nenhuma".
 */
export function SelecionadosFarmacos({
  value,
  naoInformado = false,
  nenhum = false,
  onChange,
  className,
}: {
  value: FarmacoSelecionado[];
  naoInformado?: boolean;
  nenhum?: boolean;
  onChange: (farmacos: FarmacoSelecionado[], naoInformado: boolean) => void;
  className?: string;
}) {
  const ativos = farmacosAtivos(value);
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs font-semibold text-ink-2">Selecionados:</span>
      {ativos.length > 0 ? (
        ativos.map((f) => (
          <span
            key={f.classe}
            className="inline-flex min-h-[32px] items-center gap-[7px] rounded-full bg-ink pl-3 pr-1 text-[12.5px] font-semibold text-surface"
          >
            {rotuloFarmaco(f.classe)}
            {/* O círculo de 16 px fica sempre à vista (é o que diz "isto sai"); o botão em
                volta guarda os 24 px de toque. */}
            <button
              type="button"
              onClick={() =>
                onChange(
                  value.filter((x) => x.classe !== f.classe),
                  false,
                )
              }
              aria-label={`Remover ${rotuloFarmaco(f.classe)}`}
              className="grid h-6 w-6 place-items-center rounded-full"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-surface/15 transition-colors hover:bg-surface/30">
                <X aria-hidden className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            </button>
          </span>
        ))
      ) : (
        <span className="text-[12.5px] text-ink-3">
          {nenhum ? "nenhuma medicação contínua" : naoInformado ? "não informado" : "nenhuma classe marcada ainda"}
        </span>
      )}
    </div>
  );
}

function Caixa({ marcada }: { marcada: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] transition-colors",
        marcada ? "border-2 border-primary bg-primary text-on-primary" : "border-[1.5px] border-ink-3/60 bg-surface",
      )}
    >
      {marcada && <Check className="h-[11px] w-[11px]" strokeWidth={3.5} />}
    </span>
  );
}

function Radios<T extends string>({
  rotulo,
  opcoes,
  curtos,
  valor,
  onChange,
}: {
  /** o nome do grupo para leitor de tela: a pergunta visível fica fora do grupo */
  rotulo: string;
  opcoes: readonly { id: T; rotulo: string }[];
  /** rótulo visível mais curto; a frase inteira do catálogo fica no nome acessível */
  curtos?: Record<string, string>;
  valor?: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => {
        const on = valor === o.id;
        const curto = curtos?.[o.id];
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            // O nome acessível fica sendo o texto visível (quem dita por voz fala o que vê);
            // a frase inteira aparece no `title`, e a pergunta vem do nome do grupo.
            title={curto ? o.rotulo : undefined}
            onClick={() => onChange(o.id)}
            className={cn(
              "min-h-[32px] rounded-full border px-3 text-xs font-medium transition-colors",
              on ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink-2 hover:border-primary/50",
            )}
          >
            {curto ?? o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
