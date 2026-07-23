import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calculator, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { SeloRCD } from "@/components/rcd/SeloRCD";

const PRECO_PRO = 59;
const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Campo numérico que aceita digitação livre. Corrigir o valor a cada tecla
 * prendia o campo no limite: com 3 em "sessões/semana", digitar 5 virava 35 e
 * caía para 7. Aqui o valor só é aplicado enquanto o que foi digitado é válido,
 * e o limite é ajustado quando o campo perde o foco.
 */
function CampoNumero({
  valor,
  onValor,
  min,
  max,
  className,
}: {
  valor: number;
  onValor: (n: number) => void;
  min: number;
  max: number;
  className: string;
}) {
  const [texto, setTexto] = React.useState(String(valor));
  React.useEffect(() => setTexto(String(valor)), [valor]);
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={texto}
      onChange={(e) => {
        const txt = e.target.value;
        setTexto(txt);
        const n = Number(txt);
        if (txt.trim() !== "" && Number.isFinite(n) && n >= min && n <= max) onValor(Math.round(n));
      }}
      onBlur={() => {
        const n = Number(texto);
        const final =
          texto.trim() !== "" && Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : valor;
        setTexto(String(final));
        onValor(final);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={className}
    />
  );
}

/**
 * /roi — Calculadora de ROI da Especialização (pública, sem cadastro).
 * Transforma um dado de mercado (especialistas em públicos especiais cobram
 * 15–30% a mais por sessão) em argumento pessoal e concreto: quanto o
 * profissional deixa na mesa e quantos meses de assinatura isso paga.
 */
export function Roi() {
  const [alunos, setAlunos] = React.useState(4);
  const [valorSessao, setValorSessao] = React.useState(120);
  const [sessoesSemana, setSessoesSemana] = React.useState(2);
  const [premio, setPremio] = React.useState(20);

  React.useEffect(() => {
    document.title = "Quanto vale sua especialização? | Prescrição Inteligente";
  }, []);

  // 4,33 semanas/mês em média
  const receitaAtual = alunos * valorSessao * sessoesSemana * 4.33;
  const ganhoExtra = receitaAtual * (premio / 100);
  const mesesPagos = ganhoExtra > 0 ? ganhoExtra / PRECO_PRO : 0;

  const num =
    "input tabular text-center font-bold";

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <div className="text-center">
          <Pill tone="primary" icon={<Calculator className="h-3 w-3" />} className="mb-3">
            Calculadora aberta, sem cadastro
          </Pill>
          <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
            Quanto vale a sua especialização?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-2">
            Profissionais especializados em públicos específicos (idosos, comorbidades) costumam
            cobrar <strong className="text-ink">15% a 30% a mais</strong> por sessão. Veja o que
            isso significa na SUA carteira.
          </p>
        </div>

        <Card className="mt-8 p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block text-center">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Alunos com condição especial
              </span>
              <CampoNumero valor={alunos} onValor={setAlunos} min={0} max={99} className={num} />
            </label>
            <label className="block text-center">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Valor da sessão (R$)</span>
              <CampoNumero valor={valorSessao} onValor={setValorSessao} min={0} max={2000} className={num} />
            </label>
            <label className="block text-center">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Sessões/semana por aluno</span>
              <CampoNumero valor={sessoesSemana} onValor={setSessoesSemana} min={1} max={7} className={num} />
            </label>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">Prêmio de especialista</span>
              <span className="tabular font-bold text-primary">+{premio}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={30}
              step={1}
              value={premio}
              onChange={(e) => setPremio(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
              aria-label="Prêmio de especialista (15 a 30%)"
            />
            <div className="flex justify-between text-xs text-ink-3">
              <span>15% (conservador)</span>
              <span>30% (consolidado)</span>
            </div>
          </div>
        </Card>

        <Card variant="raised" className="mt-4 overflow-hidden">
          <div className="gradient-brand px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
            O que a especialização vale para você
          </div>
          <div className="grid gap-4 p-6 text-center sm:grid-cols-3">
            <div>
              <div className="tabular font-display text-3xl font-extrabold text-ink">{fmtBRL(ganhoExtra)}</div>
              <div className="mt-1 text-sm text-ink-2">a mais por mês, na carteira atual</div>
            </div>
            <div>
              <div className="tabular font-display text-3xl font-extrabold text-ink">{fmtBRL(ganhoExtra * 12)}</div>
              <div className="mt-1 text-sm text-ink-2">a mais por ano</div>
            </div>
            <div>
              <div className="tabular font-display text-3xl font-extrabold text-success">
                {mesesPagos >= 1 ? `${Math.floor(mesesPagos)}×` : "–"}
              </div>
              <div className="mt-1 text-sm text-ink-2">
                {mesesPagos >= 1
                  ? `o ganho de UM mês paga ${Math.floor(mesesPagos)} ${Math.floor(mesesPagos) === 1 ? "mês" : "meses"} do plano Profissional (R$ ${PRECO_PRO}/mês)`
                  : "ajuste os valores acima para ver o retorno"}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <div className="mb-3 flex justify-center">
            <SeloRCD />
          </div>
          <p className="mx-auto max-w-lg text-sm text-ink-2">
            O prêmio de especialista se sustenta em UMA coisa: segurança demonstrável. É
            exatamente o que o Raciocínio Clínico Documentado entrega: cada decisão justificada,
            registrada e assinável.
          </p>
          <Link to="/dashboard" className={buttonClasses("primary") + " mt-4"}>
            Começar agora <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-xs text-ink-3">
            Estimativa educacional baseada na sua carteira e no padrão de mercado (15–30% de
            prêmio por especialização em públicos específicos). Não é promessa de resultado.
          </p>
        </div>
      </div>
    </div>
  );
}
