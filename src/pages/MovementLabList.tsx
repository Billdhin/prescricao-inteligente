import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lock, SlidersHorizontal, FlaskConical, GitCompare } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { MuscleThumb, activationFromExercise } from "@/components/anatomy/MuscleMap";
import { getMuscleMapImages, getMuscleMapPose } from "@/data/muscle-map-images";
import { exercises } from "@/data/exercises";
import { useUser, isPremiumUnlocked } from "@/lib/store";
import { cn, withBase } from "@/lib/utils";
import { useListaProgressiva, VerMais } from "@/components/ui/ListaProgressiva";

const ALL = "Todos";

function uniq(list: string[]) {
  return Array.from(new Set(list));
}

/** O comparador compara até 4 lado a lado; a barra daqui respeita o mesmo teto. */
const MAX_COMPARAR = 4;

export function MovementLabList() {
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);

  const [grupo, setGrupo] = React.useState(ALL);
  const [equip, setEquip] = React.useState(ALL);
  const [objetivo, setObjetivo] = React.useState(ALL);
  const [nivel, setNivel] = React.useState(ALL);
  /**
   * Seleção para comparar. O filtro já respondia "quais exercícios têm estas
   * características"; faltava o passo que transforma isso em decisão, que é levar
   * os escolhidos para o comparador. Sem ele, o profissional filtrava, lia a lista
   * e tinha que remontar a mesma escolha na mão do outro lado.
   */
  const [marcados, setMarcados] = React.useState<string[]>([]);
  const alternar = (slug: string) =>
    setMarcados((c) =>
      c.includes(slug) ? c.filter((x) => x !== slug) : c.length < MAX_COMPARAR ? [...c, slug] : c,
    );

  const grupos = uniq(exercises.map((e) => e.grupoMuscular));
  const equipamentos = uniq(exercises.map((e) => e.equipamento));
  const objetivos = uniq(exercises.flatMap((e) => e.objetivo));
  const niveis = ["Iniciante", "Intermediário", "Avançado"];

  const filtered = exercises.filter(
    (e) =>
      (grupo === ALL || e.grupoMuscular === grupo) &&
      (equip === ALL || e.equipamento === equip) &&
      (objetivo === ALL || e.objetivo.includes(objetivo)) &&
      (nivel === ALL || e.nivel === nivel),
  );
  // Os 97 exercícios de uma vez davam 52.900px de altura no celular, setenta e três telas
  // numa rolagem só. A lista passa a abrir em lote. Ver ListaProgressiva.
  const lista = useListaProgressiva(filtered);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Análise do movimento"
        icon={<FlaskConical className="h-3 w-3" />}
        title="Laboratório Visual"
        subtitle="Compare a execução do movimento com uma análise biomecânica lado a lado. Explore hotspots interativos para aprofundar da observação prática à evidência."
      />

      {/* Filtros */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-ink-2" /> Filtros
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Filter label="Grupo muscular" value={grupo} onChange={setGrupo} options={grupos} />
          <Filter label="Equipamento" value={equip} onChange={setEquip} options={equipamentos} />
          <Filter label="Objetivo" value={objetivo} onChange={setObjetivo} options={objetivos} />
          <Filter label="Nível" value={nivel} onChange={setNivel} options={niveis} />
        </div>

        {/* O passo que faltava: do filtro para a comparação, sem remontar a escolha
            do outro lado. "Comparar os N filtrados" só aparece quando o filtro já
            devolveu um conjunto comparável (2 a 4); acima disso, escolher é do
            profissional, porque comparar 9 lado a lado não é comparar. */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <span className="text-sm text-ink-2">
            <strong className="font-semibold text-ink">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "exercício" : "exercícios"} com estes filtros
            {marcados.length > 0 && (
              <>
                {" · "}
                <strong className="font-semibold text-ink">{marcados.length} marcado{marcados.length === 1 ? "" : "s"}</strong>
              </>
            )}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {marcados.length > 0 && (
              <button type="button" onClick={() => setMarcados([])} className={buttonClasses("ghost", "sm")}>
                Limpar seleção
              </button>
            )}
            {marcados.length >= 2 ? (
              <Link to={`/comparador?slugs=${marcados.join(",")}`} className={buttonClasses("primary", "sm")}>
                <GitCompare className="h-4 w-4" /> Comparar {marcados.length} selecionados
              </Link>
            ) : filtered.length >= 2 && filtered.length <= MAX_COMPARAR ? (
              <Link
                to={`/comparador?slugs=${filtered.map((e) => e.slug).join(",")}`}
                className={buttonClasses("secondary", "sm")}
              >
                <GitCompare className="h-4 w-4" /> Comparar os {filtered.length} filtrados
              </Link>
            ) : (
              <span className="text-sm text-ink-3">
                Marque de 2 a {MAX_COMPARAR} exercícios para comparar.
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-ink-2">
          Nenhum exercício encontrado com esses filtros.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.visiveis.map((e) => {
            // Produto 100% pago: sem tranca por exercicio.
            const locked = false;
            return (
              <Card key={e.slug} className="flex flex-col overflow-hidden">
                {/* 4:3, a MESMA proporção em que as fotos são geradas. Antes era uma
                    faixa fixa de 176px, e com object-cover sobre uma foto 4:3 isso
                    cortava quase 25% em cima e embaixo: em exercício de pessoa em pé,
                    o que sumia era a cabeça. O fundador reportou três vezes o mesmo
                    exercício achando que o arquivo estava errado, e o arquivo estava
                    certo; quem cortava era o cartão. */}
                <div className="relative aspect-[4/3] border-b border-border bg-surface-soft">
                  {e.imagem ? (
                    <img src={withBase(e.imagem)} alt={`Execução: ${e.nome}`} className="h-full w-full object-cover" />
                  ) : getMuscleMapImages(e.slug) || getMuscleMapPose(e.slug) ? (
                    <MuscleThumb activation={activationFromExercise(e)} slug={e.slug} className="py-2" />
                  ) : (
                    <SemFigura nome={e.nome} musculo={e.ativacao?.[0]?.musculo} />
                  )}
                  <div className="absolute right-3 top-3">
                    <Pill tone="neutral" className="bg-surface/85">
                      {e.nivel}
                    </Pill>
                  </div>
                  {/* Marcar para comparar: no canto da imagem, fora do caminho do
                      CTA de analisar, que continua sendo a ação principal do card. */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={marcados.includes(e.slug)}
                    aria-label={`Marcar ${e.nome} para comparar`}
                    onClick={() => alternar(e.slug)}
                    disabled={!marcados.includes(e.slug) && marcados.length >= MAX_COMPARAR}
                    className={cn(
                      "absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 transition-colors",
                      marcados.includes(e.slug)
                        ? "border-primary bg-primary text-on-primary"
                        : "border-border bg-surface/85 text-ink-3 hover:text-ink disabled:opacity-40",
                    )}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </button>
                  {locked && (
                    <div className="absolute inset-0 grid place-items-center bg-surface/50 backdrop-blur-[1px]">
                      <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-white shadow-elevated">
                        <Lock className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold text-ink">{e.nome}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill tone="primary">{e.grupoMuscular}</Pill>
                    <Pill tone="neutral">{e.equipamento}</Pill>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-2">{e.resumoPratico}</p>
                  <Link
                    to={`/movement-lab/${e.slug}`}
                    className={cn(buttonClasses("primary"), "mt-4 w-full")}
                  >
                    Analisar movimento <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <VerMais
        faltam={lista.faltam}
        total={lista.total}
        mostrando={lista.visiveis.length}
        onVerMais={lista.verMais}
        rotulo="exercícios"
      />

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional; não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-ink outline-none focus-visible:border-primary"
      >
        <option value={ALL}>Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * O que o cartão mostra quando o exercício NÃO tem foto e nem boneco próprio.
 *
 * Antes caía no `MuscleThumb`, que sem mapa muscular e sem pose renderiza a
 * figura anatômica NEUTRA: um corpo cinza em pé, sem nenhum músculo marcado,
 * idêntico para qualquer exercício. O fundador viu isso e a leitura foi exata:
 * "boneco genérico branco, sem nome do exercício nem nada". Ele estava certo,
 * porque aquela figura não carregava informação nenhuma, e ainda por cima
 * insinuava que o exercício era feito em pé e parado.
 *
 * Enquanto a foto correta não sai (há exercícios em que o gerador não acerta o
 * movimento, e imagem errada é pior que imagem nenhuma), o cartão passa a
 * assumir a ausência em palavras e a dizer o que de fato se sabe: qual é o
 * músculo principal.
 */
function SemFigura({ nome, musculo }: { nome: string; musculo?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-surface-soft px-5 text-center">
      <FlaskConical aria-hidden className="h-6 w-6 text-ink-3" />
      <span className="text-sm font-semibold text-ink-2">Sem foto de execução</span>
      <span className="text-xs leading-relaxed text-ink-3">
        {musculo ? (
          <>
            Ainda não temos uma foto fiel deste movimento. O trabalho principal é de{" "}
            <span className="font-semibold text-ink-2">{musculo.toLowerCase()}</span>, e a análise
            completa está na ficha.
          </>
        ) : (
          <>Ainda não temos uma foto fiel deste movimento. A análise completa está na ficha.</>
        )}
      </span>
      <span className="sr-only">{nome}</span>
    </div>
  );
}
