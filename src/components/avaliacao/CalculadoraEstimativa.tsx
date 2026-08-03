import * as React from "react";
import { Calculator, Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";
import { estimativas, memoriaDeCalculo, type Estimativa } from "@/lib/avaliacao/estimativas";
import { bibliografia } from "@/data/referencias";
import { cn } from "@/lib/utils";
import type { AvaliacaoTeste, Sexo } from "@/data/alunos";

/**
 * A CALCULADORA das avaliações funcionais, dentro da própria avaliação.
 *
 * Ela existe para fechar um buraco de fluxo, não para ser mais uma tela: o
 * profissional já media distância percorrida e repetições até a fadiga, e saía
 * dali com distância e repetições. O número que a prescrição usa (1RM, VO₂) ficava
 * de fora porque a conta morava fora do app.
 *
 * Três decisões de desenho que valem a pena registrar:
 *
 * 1. **O resultado não fica solto.** "Registrar como teste" grava um
 *    `AvaliacaoTeste` normal, com a memória de cálculo na observação. Meses depois
 *    o histórico mostra o número E de onde ele saiu. Estimativa sem rastro vira
 *    fato inventado na terceira reavaliação.
 * 2. **A fórmula fica na tela**, não escondida no código. Quem assina embaixo tem
 *    direito de ver a conta.
 * 3. **O limite aparece junto com o resultado**, na mesma altura, não em rodapé.
 *    Uma equação de campo que se apresenta sem o limite dela vende precisão que
 *    não tem.
 */
export function CalculadoraEstimativa({
  sexoAluno,
  pesoMedido,
  idadeAluno,
  onRegistrar,
}: {
  /** Sexo declarado do aluno: a equação de caminhada tem o sexo como entrada. */
  sexoAluno?: Sexo;
  /** Peso desta avaliação, quando já digitado: evita pedir de novo o que já foi medido. */
  pesoMedido?: number;
  idadeAluno?: number;
  onRegistrar: (teste: AvaliacaoTeste) => void;
}) {
  const [aberta, setAberta] = React.useState(false);
  const [id, setId] = React.useState(estimativas[0].id);
  const est = estimativas.find((e) => e.id === id) as Estimativa;

  // Valores por estimativa, em texto (o usuário digita vírgula).
  const [bruto, setBruto] = React.useState<Record<string, string>>({});
  const [registrado, setRegistrado] = React.useState(false);

  // Pré-preenche o que a própria avaliação já sabe. Roda ao trocar de estimativa
  // para que os campos de peso e idade nasçam prontos em qualquer uma delas.
  React.useEffect(() => {
    setBruto((b) => {
      const novo = { ...b };
      for (const c of est.campos) {
        if (novo[c.chave] != null && novo[c.chave] !== "") continue;
        if (c.vemDe === "peso" && pesoMedido != null) novo[c.chave] = String(pesoMedido).replace(".", ",");
        if (c.vemDe === "idade" && idadeAluno != null) novo[c.chave] = String(idadeAluno);
        if (c.tipo === "sexo" && sexoAluno) novo[c.chave] = sexoAluno === "M" ? "1" : "0";
      }
      return novo;
    });
    setRegistrado(false);
  }, [est, pesoMedido, idadeAluno, sexoAluno]);

  const valores: Record<string, number> = {};
  for (const c of est.campos) {
    const t = (bruto[c.chave] ?? "").trim();
    if (t !== "") valores[c.chave] = Number(t.replace(",", "."));
  }
  const r = est.calcular(valores);
  const refs = bibliografia(est.refIds);

  const registrar = () => {
    if (r.valor == null) return;
    onRegistrar({
      categoria: est.categoria,
      nome: est.nomeTeste,
      resultado: String(r.valor).replace(".", ","),
      unidade: est.unidade,
      lado: "NA",
      obs: memoriaDeCalculo(est, valores),
    });
    setRegistrado(true);
  };

  if (!aberta) {
    return (
      <button
        type="button"
        onClick={() => setAberta(true)}
        className={cn(buttonClasses("secondary", "sm"), "mt-3")}
      >
        <Calculator className="h-4 w-4" /> Calcular uma estimativa
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-soft p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Calculator className="h-4 w-4 text-primary" /> Estimativa funcional
        </span>
        <button
          type="button"
          onClick={() => setAberta(false)}
          className="text-xs font-semibold text-ink-3 hover:text-ink"
        >
          Fechar
        </button>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">O que estimar</span>
        <select value={id} onChange={(e) => setId(e.target.value as typeof id)} className="input">
          {estimativas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-2 text-sm text-ink-2">{est.oQueMede}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {est.campos.map((c) =>
          c.tipo === "sexo" ? (
            <label key={c.chave} className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{c.rotulo}</span>
              <select
                value={bruto[c.chave] ?? ""}
                onChange={(e) => setBruto((b) => ({ ...b, [c.chave]: e.target.value }))}
                className="input"
              >
                <option value="">Selecione</option>
                <option value="1">Masculino</option>
                <option value="0">Feminino</option>
              </select>
            </label>
          ) : (
            <label key={c.chave} className="block">
              <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-ink">
                <span>{c.rotulo}</span>
                <span className="text-xs font-normal text-ink-2">{c.unidade}</span>
              </span>
              <input
                value={bruto[c.chave] ?? ""}
                onChange={(e) => setBruto((b) => ({ ...b, [c.chave]: e.target.value }))}
                inputMode="decimal"
                placeholder={c.placeholder}
                className="input"
              />
            </label>
          ),
        )}
      </div>

      {/* Resultado, limite e ressalva na MESMA altura: quem lê o número lê o que ele não é. */}
      <div className="mt-3 rounded-control border border-border bg-surface p-3">
        {r.valor == null ? (
          <p className="text-sm text-ink-2">{r.erro ?? "Preencha os campos acima."}</p>
        ) : (
          <>
            <p className="tabular text-sm text-ink-2">
              Estimativa:{" "}
              <span className="font-display text-lg font-bold text-ink">
                {String(r.valor).replace(".", ",")}
              </span>{" "}
              {est.unidade}
            </p>
            {r.ressalva && <p className="mt-1 text-sm text-warning-text">{r.ressalva}</p>}
            <button
              type="button"
              onClick={registrar}
              disabled={registrado}
              className={cn(buttonClasses("primary", "sm"), "mt-2", registrado && "cursor-default opacity-60")}
            >
              {registrado ? <Check className="h-4 w-4" /> : null}
              {registrado ? "Registrado nos testes" : "Registrar como teste"}
            </button>
          </>
        )}
      </div>

      <p className="mt-2 text-2xs text-ink-3">{est.formula}</p>
      <p className="mt-1 text-2xs text-ink-3">
        <span className="font-semibold">O limite:</span> {est.limite}
      </p>

      {refs.length > 0 && (
        <ul className="mt-2 space-y-0.5 border-t border-border pt-2">
          {refs.map(({ n, ref }) => (
            <li key={ref.id} className="text-2xs text-ink-3">
              [{n}] {ref.autores.split(",")[0]} ({ref.ano}), {ref.fonte}.{" "}
              {ref.doi ? (
                <a
                  href={`https://doi.org/${ref.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  doi:{ref.doi}
                </a>
              ) : ref.pmid ? (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  PubMed {ref.pmid}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
