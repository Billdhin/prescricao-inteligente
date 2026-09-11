import * as React from "react";
import { Check, Circle, Diamond, Heart, Info, Plus, Search, X } from "lucide-react";
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
 * O PASSO "MEDICAMENTOS EM USO" DO PERFIL DO ALUNO, no desenho do protótipo de 10/09/2026.
 *
 * O que mudou em relação ao seletor anterior (`components/gps/FarmacosSelector`), e por quê:
 *
 * - **Grupos abertos, e não acordeão.** Três dos quatro grupos nasciam fechados, e a pergunta
 *   "o aluno toma alguma coisa para o coração?" exigia abrir o grupo para ver que opções havia.
 *   São 11 classes ao todo: cabem abertas, e fechar um grupo só esconde a resposta.
 * - **O cartão mostra o que reconhece a classe.** Na hora de marcar, o profissional está com a
 *   receita ou com a fala do aluno ("ele toma losartana"), e o que casa com isso é o PRINCÍPIO
 *   ATIVO, não o parágrafo sobre a classe. O parágrafo foi para o (i), que abre sem desmarcar,
 *   e para o `title`; o que muda no treino aparece na coluna da direita, que é quando importa.
 * - **O que foi marcado fica no topo, em fichas removíveis.** "Selecionados" era um resumo no
 *   rodapé, abaixo de onze cartões e das perguntas de contexto: para conferir o que tinha sido
 *   declarado era preciso rolar até o fim. Agora a resposta está na primeira linha.
 * - **"Só marcadas"** reduz a tela ao que foi declarado, que é a leitura de quem volta ao
 *   perfil depois de semanas para conferir.
 *
 * As três regras do seletor anterior continuam valendo, e valem mais que o leiaute:
 * 1. Não existe campo de quantidade, esquema de uso, marca nem texto livre. O que o tipo do
 *    dado não comporta, a tela não pergunta e o PDF não imprime.
 * 2. "Não sei ou prefere não informar" é opção de primeira classe, no topo, com o mesmo peso de
 *    uma marcação, e não letra miúda no rodapé: com condição de risco no perfil esse estado leva
 *    o sistema para o lado seguro, e esconder a opção trocaria um dado honesto por um silêncio.
 * 3. O sujeito da frase é a resposta ao esforço ou o profissional, nunca o remédio, e a conduta
 *    sobre a medicação é devolvida a quem a prescreveu (o texto vem do catálogo).
 */
export function MedicamentosDoPerfil({
  value,
  naoInformado = false,
  onChange,
  idBase = "perfil-farm",
  semSelecionados = false,
}: {
  value: FarmacoSelecionado[];
  /** o profissional declarou que não sabe ou prefere não informar */
  naoInformado?: boolean;
  /**
   * UMA chamada com os DOIS campos, e não um callback para cada.
   *
   * Eram dois (`onChange` e `onNaoInformado`), e o "Não sei" não marcava: o clique gravava
   * `naoInformado: true` e logo depois gravava a lista vazia, e a gravação da lista, por
   * regra, limpava o "não sei". A segunda desfazia a primeira no mesmo clique. Os dois campos
   * são um estado só (o que se sabe sobre a medicação), então mudam juntos.
   */
  onChange: (farmacos: FarmacoSelecionado[], naoInformado: boolean) => void;
  idBase?: string;
  /**
   * Quem desenha as fichas de "Selecionados" em outro lugar (a cabeça do cartão do perfil,
   * no desenho de 10/09/2026) liga isto para a linha não aparecer duas vezes.
   */
  semSelecionados?: boolean;
}) {
  const [busca, setBusca] = React.useState("");
  const [soMarcadas, setSoMarcadas] = React.useState(false);
  const [infoAberta, setInfoAberta] = React.useState<FarmacoClasseId | null>(null);

  const selMap = React.useMemo(() => new Map(value.map((f) => [f.classe, f])), [value]);
  const ativos = farmacosAtivos(value);

  const toggle = (classe: FarmacoClasseId) => {
    if (selMap.has(classe)) {
      onChange(
        value.filter((f) => f.classe !== classe),
        false,
      );
      return;
    }
    // Declarar uma classe e ao mesmo tempo dizer que não sabe seria contraditório: a
    // declaração vence, e o "não sei" cai.
    onChange([...value, criarFarmaco(classe)], false);
  };

  // Marcar "não sei" limpa as classes; desmarcar devolve a pergunta ao estado em branco.
  const marcarNaoInformado = () => onChange([], !naoInformado);

  const patch = (classe: FarmacoClasseId, p: Partial<FarmacoSelecionado>) =>
    onChange(
      value.map((f) => (f.classe === classe ? { ...f, ...p, atualizadoEm: agora() } : f)),
      false,
    );

  const q = busca.trim().toLowerCase();
  const casa = (it: FarmacoCatalogoItem) =>
    (!soMarcadas || selMap.has(it.classe)) &&
    (!q ||
      it.titulo.toLowerCase().includes(q) ||
      it.descricao.toLowerCase().includes(q) ||
      it.exemplos.some((e) => e.toLowerCase().includes(q)));

  const grupos = GRUPOS_FARMACO.map((g) => ({
    grupo: g,
    itens: CATALOGO_FARMACOS.filter((it) => it.grupo === g.id && casa(it)),
  })).filter((x) => x.itens.length > 0);

  const comDetalhe = ativos
    .map((f) => ({ f, item: CATALOGO_FARMACOS.find((it) => it.classe === f.classe) }))
    .filter((x): x is { f: FarmacoSelecionado; item: FarmacoCatalogoItem } => Boolean(x.item));

  // Fecha o (i) com Escape ou com um toque fora do cartão dele. Tocar em OUTRO cartão fecha
  // este e segue o gesto normalmente (marca aquele), sem exigir dois toques.
  React.useEffect(() => {
    if (!infoAberta) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setInfoAberta(null);
    const aoTocar = (e: PointerEvent) => {
      const cartao = (e.target as Element | null)?.closest?.("[data-cartao-classe]");
      if (cartao?.getAttribute("data-cartao-classe") !== infoAberta) setInfoAberta(null);
    };
    window.addEventListener("keydown", aoTeclar);
    window.addEventListener("pointerdown", aoTocar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("pointerdown", aoTocar);
    };
  }, [infoAberta]);

  return (
    <div className="space-y-4">
      {!semSelecionados && <SelecionadosFarmacos value={value} naoInformado={naoInformado} onChange={onChange} />}

      {/*
        "NÃO SEI" NO DESENHO DO PROTÓTIPO, MAS NO TOPO.
        O protótipo desenha a caixa tracejada no FIM da lista. Ela fica aqui em cima, antes da
        busca, porque a regra 2 deste componente vale mais que o leiaute: com condição de risco
        o "não sei" leva o sistema para o lado seguro, e no fim de onze cartões ele vira a letra
        miúda que ninguém lê. Do protótipo vem o formato (caixa com título e a explicação à
        vista antes do clique); a frase continua CONDICIONAL, porque o motor só troca o
        instrumento quando há condição de risco no perfil.
      */}
      <button
        type="button"
        role="checkbox"
        aria-checked={naoInformado}
        onClick={marcarNaoInformado}
        className={cn(
          "flex w-full items-start gap-2.5 rounded-control border px-3.5 py-3 text-left transition-colors",
          naoInformado
            ? "border-primary bg-primary-tint/50"
            : "border-dashed border-ink-4 hover:border-ink-3 hover:bg-surface-soft",
        )}
      >
        <span className="mt-px">
          <Caixa marcada={naoInformado} />
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-ink">Não sei, ou o aluno prefere não informar</span>
          <span className="mt-0.5 block text-[12.5px] leading-normal text-ink-2">
            {naoInformado ? "Registrado." : "Melhor do que deixar em branco."} Com condição de risco no perfil, o
            Mapa passa a guiar a intensidade pelo esforço percebido e pelo teste da fala, sem afirmar nada sobre o
            aluno.
          </span>
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-0 flex-1 basis-[240px]">
          <span className="sr-only">Buscar classe ou princípio ativo</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar classe ou princípio ativo..."
            className="h-[42px] w-full rounded-[11px] border border-border bg-surface-soft pl-10 pr-3 text-[13.5px] text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary focus-visible:bg-surface"
          />
        </label>
        {/* Segmentado do protótipo. O botão fica no raio de controle (a família de botão da
            casa), e o trilho sobe para 15 px para acompanhar a curva com o respiro de 3 px. */}
        <div
          role="radiogroup"
          aria-label="Como listar"
          className="inline-flex shrink-0 gap-0.5 rounded-[15px] bg-bg p-[3px] ring-1 ring-inset ring-border"
        >
          {[
            { v: false, rotulo: "Por sistema" },
            { v: true, rotulo: "Só marcadas" },
          ].map((o) => (
            <button
              key={o.rotulo}
              type="button"
              role="radio"
              aria-checked={soMarcadas === o.v}
              onClick={() => setSoMarcadas(o.v)}
              className={cn(
                "h-[34px] rounded-control px-3 text-[12.5px] transition-colors",
                soMarcadas === o.v
                  ? "bg-surface font-bold text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                  : "font-semibold text-ink-2 hover:text-ink",
              )}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      </div>

      {grupos.length === 0 && (
        <p className="rounded-control border border-dashed border-border p-4 text-sm text-ink-2">
          {soMarcadas && !q
            ? "Nenhuma classe marcada ainda. Em \"Por sistema\" aparecem todas."
            : `Nenhuma classe encontrada para "${busca.trim()}". A busca olha o nome da classe e os princípios ativos.`}
        </p>
      )}

      {grupos.map(({ grupo, itens }) => {
        const marcadasNoGrupo = itens.filter((it) => selMap.has(it.classe)).length;
        const icone = ICONE_GRUPO[grupo.id];
        return (
          <section key={grupo.id} aria-labelledby={`${idBase}-g-${grupo.id}`}>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={cn("grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[9px]", icone.fundo, icone.cor)}
              >
                {icone.desenho}
              </span>
              <h4
                id={`${idBase}-g-${grupo.id}`}
                className="shrink-0 text-[13.5px] font-bold tracking-[-0.01em] text-ink"
              >
                {grupo.titulo}
              </h4>
              <span aria-hidden className="h-px min-w-4 flex-1 bg-surface-mute" />
              <span className="shrink-0 whitespace-nowrap text-[11.5px] text-ink-2">
                {marcadasNoGrupo > 0
                  ? `${marcadasNoGrupo} marcada${marcadasNoGrupo === 1 ? "" : "s"}`
                  : `${itens.length} classe${itens.length === 1 ? "" : "s"}`}
              </span>
            </div>
            <div className="mt-2 grid items-stretch gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
              {itens.map((it) => (
                <CartaoClasse
                  key={it.classe}
                  item={it}
                  marcada={selMap.has(it.classe)}
                  onToggle={() => toggle(it.classe)}
                  infoAberta={infoAberta === it.classe}
                  onInfo={() => setInfoAberta((a) => (a === it.classe ? null : it.classe))}
                  idBase={idBase}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Detalhe das marcadas: as duas perguntas de contexto. Ficam depois da lista porque
          só existem para o que foi marcado, e respondê-las não é condição para marcar. */}
      {comDetalhe.length > 0 && (
        <div className="space-y-3 border-t border-surface-mute pt-4">
          <h4 className="text-2xs font-bold uppercase tracking-[0.12em] text-ink-3">Sobre o que foi marcado</h4>
          {comDetalhe.map(({ f, item }) => (
            <div key={f.classe} className="space-y-3 rounded-control border border-border bg-surface p-3.5">
              <p className="font-semibold text-ink">{item.titulo}</p>
              <Pergunta rotulo="De onde veio essa informação?">
                <Radios
                  rotulo={`${item.titulo}: de onde veio essa informação`}
                  opcoes={FONTE_INFORMACAO_OPCOES}
                  valor={f.fonte}
                  onChange={(v) => patch(f.classe, { fonte: v })}
                />
              </Pergunta>
              <Pergunta rotulo="Houve mudança recente no tratamento?">
                <Radios
                  rotulo={`${item.titulo}: houve mudança recente no tratamento`}
                  opcoes={MUDANCA_RECENTE_OPCOES}
                  valor={f.mudancaRecente}
                  onChange={(v) => patch(f.classe, { mudancaRecente: v })}
                />
              </Pergunta>
              <p className="text-2xs leading-relaxed text-ink-3">{item.devolucao}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-3">
        Registre apenas a classe em uso. O sistema não pede nem guarda quantidade, esquema de uso, marca ou
        horário, e usa a informação só para escolher por qual instrumento guiar o esforço e quais conferências
        fazer antes da sessão. A conduta sobre a medicação é do profissional de saúde que a prescreveu.
      </p>
    </div>
  );
}

/* ------------------------------ O cartão ------------------------------ */

/**
 * Um cartão por classe: marcar é o cartão inteiro, e o (i) abre o que a classe é sem marcar.
 *
 * São DOIS botões irmãos, e não um dentro do outro: botão dentro de botão é HTML inválido e o
 * leitor de tela anunciaria o (i) como parte do "marcar". A borda da marcada engrossa por
 * `ring`, e não por `border-2`, para o cartão não crescer um pixel e empurrar a grade.
 */
function CartaoClasse({
  item,
  marcada,
  onToggle,
  infoAberta,
  onInfo,
  idBase,
}: {
  item: FarmacoCatalogoItem;
  marcada: boolean;
  onToggle: () => void;
  infoAberta: boolean;
  onInfo: () => void;
  idBase: string;
}) {
  const idInfo = `${idBase}-${item.classe}-info`;
  return (
    <div className="relative" data-cartao-classe={item.classe}>
      <button
        type="button"
        role="checkbox"
        aria-checked={marcada}
        onClick={onToggle}
        title={item.descricao}
        className={cn(
          // Compacto como no protótipo (46 px, raio 12): onze cartões de 64 px empilhados numa
          // coluna de celular eram três telas de rolagem para responder uma pergunta. O cartão
          // de opção fica no raio de controle; rounded-card é da família permitida, mas 20 px
          // num cartão de 46 px vira pílula.
          "flex h-full min-h-[46px] w-full items-center gap-2.5 rounded-control border py-2.5 pl-3 pr-11 text-left transition-colors",
          marcada
            ? "border-primary bg-primary-tint/50 ring-1 ring-primary"
            : "border-border bg-surface hover:border-ink-4",
        )}
      >
        <Caixa marcada={marcada} />
        <span className="min-w-0">
          <span
            className={cn(
              "block text-[13.5px] font-semibold leading-[1.3]",
              marcada ? "text-primary-texto" : "text-ink",
            )}
          >
            {item.titulo}
          </span>
          {item.exemplos.length > 0 && (
            <span className="block truncate text-xs text-ink-2">{item.exemplos.join(", ")}</span>
          )}
        </span>
      </button>
      {/* O (i) tem o desenho de 22 px do protótipo; o `before` guarda 32 px de toque. */}
      <button
        type="button"
        onClick={onInfo}
        aria-expanded={infoAberta}
        aria-controls={idInfo}
        aria-label={`O que é ${item.titulo}`}
        className={cn(
          "absolute right-3 top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 place-items-center rounded-full transition-colors before:absolute before:-inset-[5px] before:content-['']",
          infoAberta ? "bg-ink text-surface" : "bg-bg text-ink-2 ring-1 ring-inset ring-border hover:text-ink",
        )}
      >
        <Info aria-hidden className="h-3 w-3" />
      </button>
      {infoAberta && (
        <div
          id={idInfo}
          role="note"
          className="absolute left-0 right-0 top-full z-20 mt-2 space-y-2 rounded-control border border-border bg-surface p-4 text-sm shadow-lift"
        >
          <p className="leading-relaxed text-ink-2">{item.descricao}</p>
          {item.exemplos.length > 0 && (
            <p className="text-xs leading-relaxed text-ink-3">
              <b className="font-semibold text-ink-2">Princípios ativos:</b> {item.exemplos.join(", ")}.
            </p>
          )}
          {item.efeitos.length > 0 && (
            <ul className="space-y-1 border-t border-border pt-2">
              {item.efeitos.map((e) => (
                <li key={e} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Primitivos ------------------------------ */

/** Os quatro sistemas, cada um com um desenho e uma cor: é o que se reconhece de relance. */
const ICONE_GRUPO: Record<FarmacoGrupo, { desenho: React.ReactNode; cor: string; fundo: string }> = {
  cardiovascular: { desenho: <Heart className="h-3.5 w-3.5" fill="currentColor" />, cor: "text-danger", fundo: "bg-danger-tint" },
  glicemia: { desenho: <Circle className="h-3 w-3" fill="currentColor" />, cor: "text-primary", fundo: "bg-primary-tint" },
  lipidios: { desenho: <Diamond className="h-3.5 w-3.5" fill="currentColor" />, cor: "text-analysis-text", fundo: "bg-analysis-tint" },
  dor_inflamacao: { desenho: <Plus className="h-3.5 w-3.5" strokeWidth={3} />, cor: "text-warning", fundo: "bg-warning-tint" },
};

/**
 * "SELECIONADOS": o que foi declarado, em fichas escuras e removíveis.
 *
 * Exportada porque, no perfil, a linha mora na CABEÇA do cartão do passo (protótipo de
 * 10/09/2026), fora do miolo que este componente desenha. A remoção é a mesma do cartão:
 * tirar uma classe nunca liga o "não sei".
 */
export function SelecionadosFarmacos({
  value,
  naoInformado = false,
  onChange,
  className,
}: {
  value: FarmacoSelecionado[];
  naoInformado?: boolean;
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
        <span className="text-[12.5px] text-ink-3">{naoInformado ? "não informado" : "nenhuma classe marcada ainda"}</span>
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
        marcada ? "border-2 border-primary bg-primary text-on-primary" : "border-[1.5px] border-ink-4 bg-surface",
      )}
    >
      {marcada && <Check className="h-[11px] w-[11px]" strokeWidth={3.5} />}
    </span>
  );
}

function Pergunta({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-ink-2">{rotulo}</div>
      {children}
    </div>
  );
}

function Radios<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
}: {
  /** o nome do grupo para leitor de tela: a pergunta visível fica fora do grupo */
  rotulo: string;
  opcoes: readonly { id: T; rotulo: string }[];
  valor?: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => {
        const on = valor === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={cn(
              "min-h-[36px] rounded-full border px-3 text-xs font-medium transition-colors",
              on ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink-2 hover:border-primary/50",
            )}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
