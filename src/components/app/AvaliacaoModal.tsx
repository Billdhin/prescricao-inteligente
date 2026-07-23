import * as React from "react";
import { X, Plus, Trash2, Camera, Info, ChevronDown, Loader2, TrendingUp } from "lucide-react";
import { buttonClasses, Pill } from "@/components/ui/primitives";
import { EvolucaoMini, METRICAS_CHAVE } from "@/components/app/EvolucaoMini";
import { useDialog } from "@/lib/useDialog";
import { arquivoParaDataUrl } from "@/lib/imagem";
import { toast } from "@/lib/toast";
import { uid } from "@/lib/store";
import { cn } from "@/lib/utils";
import type {
  Avaliacao,
  AvaliacaoFoto,
  AvaliacaoPerimetro,
  AvaliacaoTeste,
  MedidaPersonalizada,
  TipoAvaliacao,
} from "@/data/alunos";

/* ------------------------------- opções ------------------------------- */

const TIPOS: { v: TipoAvaliacao; label: string }[] = [
  { v: "inicial", label: "Avaliação inicial" },
  { v: "reavaliacao", label: "Reavaliação" },
  { v: "pontual", label: "Avaliação pontual" },
  { v: "retorno", label: "Retorno após afastamento" },
];

const CONDICOES = ["Em repouso", "Antes do treino", "Após o treino", "Outro"];

const REGIOES_DOR = [
  "Cabeça/pescoço", "Ombro direito", "Ombro esquerdo", "Coluna cervical", "Coluna torácica",
  "Região lombar", "Quadril direito", "Quadril esquerdo", "Joelho direito", "Joelho esquerdo",
  "Tornozelo direito", "Tornozelo esquerdo", "Cotovelo direito", "Cotovelo esquerdo", "Punho/mão", "Outra",
];

const PERIMETRO_REGIOES = [
  "Pescoço", "Ombros", "Tórax", "Cintura", "Abdômen", "Quadril", "Braço relaxado", "Braço contraído",
  "Antebraço", "Coxa proximal", "Coxa medial", "Coxa distal", "Panturrilha", "Outro",
];

const TESTE_CATEGORIAS = [
  "Força", "Resistência muscular", "Capacidade cardiorrespiratória", "Flexibilidade", "Mobilidade",
  "Equilíbrio", "Agilidade", "Velocidade", "Potência", "Funcionalidade", "Teste personalizado",
];

const TESTES_SUGERIDOS: Record<string, string[]> = {
  "Força": ["Dinamometria de preensão manual", "Teste de 1RM", "Teste de 5RM", "Teste de 10RM", "Força isométrica"],
  "Resistência muscular": ["Flexões de braço", "Abdominais em 1 min", "Prancha isométrica", "Repetições até a fadiga"],
  "Capacidade cardiorrespiratória": ["Teste de caminhada de 6 minutos", "Teste de Cooper", "Teste do degrau", "Frequência cardíaca de recuperação", "VO₂ estimado"],
  "Flexibilidade": ["Sentar e alcançar", "Banco de Wells", "Flexibilidade de ombro"],
  "Mobilidade": ["Mobilidade de tornozelo", "Mobilidade de quadril", "Mobilidade de ombro", "Agachamento profundo"],
  "Equilíbrio": ["Apoio unipodal", "Olhos abertos", "Olhos fechados", "Y Balance Test"],
  "Agilidade": ["Shuttle Run", "Teste T", "Illinois"],
  "Velocidade": ["Sprint 20 m", "Sprint 30 m"],
  "Potência": ["Salto vertical", "Salto horizontal", "Teste de impulsão"],
  "Funcionalidade": ["Sentar e levantar em 30 segundos", "Timed Up and Go", "Velocidade de marcha", "Levantar do chão"],
  "Teste personalizado": [],
};

const UNIDADES_TESTE = ["kg", "repetições", "segundos", "minutos", "metros", "centímetros", "watts", "bpm", "mL/kg/min", "nível", "pontos"];
const TIPOS_FOTO = ["Frente", "Costas", "Perfil direito", "Perfil esquerdo", "Outra"];
const CATEGORIAS_PERSONALIZADA = ["Composição corporal", "Perímetro", "Sinal fisiológico", "Teste físico", "Bem-estar", "Outro"];

const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(",", ".")));
const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

/* ------------------------------- componente ------------------------------- */

export function AvaliacaoModal({
  onClose,
  onSave,
  alunoId,
  anterior,
  historico,
}: {
  onClose: () => void;
  onSave: (av: Avaliacao) => void;
  alunoId: string;
  /** avaliação mais recente do aluno, para a comparação e o pré-preenchimento dos campos */
  anterior?: Avaliacao;
  /** série completa de avaliações (ascendente), para o painel "Como estava antes" */
  historico?: Avaliacao[];
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [data, setData] = React.useState(hoje);
  const [tipo, setTipo] = React.useState<TipoAvaliacao>(anterior ? "reavaliacao" : "inicial");
  const [condicao, setCondicao] = React.useState("");
  // medidas numéricas em string (uma chave por medida). Reavaliação de verdade: os
  // campos nascem preenchidos com a última avaliação, e o profissional digita por cima
  // só do que mudou. Sem anterior, começa em branco (a altura já entra, como antes).
  const [med, setMed] = React.useState<Record<string, string>>(() => {
    const paraInput = (n: number) => String(n).replace(".", ",");
    const inicial: Record<string, string> = {};
    const m = anterior?.medidas;
    if (m) {
      for (const k of ["peso", "percentualGordura", "altura", "massaMuscular", "cintura", "quadril", "fcRepouso", "pressaoSistolica", "pressaoDiastolica", "fadiga", "sono"]) {
        if (m[k] != null) inicial[k] = paraInput(m[k] as number);
      }
      if (anterior?.dorEscala != null) inicial.dor = String(anterior.dorEscala);
    }
    if (inicial.altura == null) inicial.altura = m?.altura != null ? paraInput(m.altura) : "";
    return inicial;
  });
  const [regioesDor, setRegioesDor] = React.useState<string[]>([]);
  // Perímetros também vêm da última avaliação (mesmas regiões a re-medir).
  const [perimetros, setPerimetros] = React.useState<AvaliacaoPerimetro[]>(() =>
    anterior?.perimetros ? anterior.perimetros.map((p) => ({ ...p })) : [],
  );
  const [testes, setTestes] = React.useState<AvaliacaoTeste[]>([]);
  const [fotos, setFotos] = React.useState<AvaliacaoFoto[]>([]);
  const [personalizadas, setPersonalizadas] = React.useState<MedidaPersonalizada[]>([]);
  const [obs, setObs] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);
  const dialogRef = useDialog<HTMLDivElement>(() => tentarFechar());

  const setM = (k: string, v: string) => setMed((m) => ({ ...m, [k]: v }));

  // IMC e RCQ derivados
  const pesoN = num(med.peso ?? "");
  const alturaN = num(med.altura ?? "");
  const imc = pesoN != null && alturaN != null && alturaN > 0 ? pesoN / (alturaN / 100) ** 2 : undefined;
  const cinturaN = num(med.cintura ?? "");
  const quadrilN = num(med.quadril ?? "");
  const rcq = cinturaN != null && quadrilN != null && quadrilN > 0 ? cinturaN / quadrilN : undefined;

  const algumaMedida = Object.values(med).some((v) => v.trim() !== "");
  const temConteudo =
    algumaMedida ||
    regioesDor.length > 0 ||
    obs.trim() !== "" ||
    perimetros.some((p) => p.valor != null || p.valorEsq != null) ||
    testes.some((t) => t.nome.trim() !== "" && t.resultado.trim() !== "") ||
    fotos.length > 0 ||
    personalizadas.some((p) => p.nome.trim() !== "" && p.valor.trim() !== "");

  const sujo =
    temConteudo || tipo !== (anterior ? "reavaliacao" : "inicial") || condicao !== "" || data !== hoje;

  const tentarFechar = () => {
    if (sujo && !window.confirm("Deseja sair sem salvar as alterações?")) return;
    onClose();
  };

  const salvar = () => {
    if (!temConteudo || salvando) return;
    setSalvando(true);
    const ts = data ? new Date(`${data}T12:00:00`).getTime() : Date.now();
    const medidas: Avaliacao["medidas"] = {};
    for (const k of ["peso", "percentualGordura", "altura", "massaMuscular", "cintura", "quadril", "fcRepouso", "pressaoSistolica", "pressaoDiastolica", "fadiga", "sono"]) {
      const v = num(med[k] ?? "");
      if (v != null) medidas[k] = v;
    }
    if (imc != null) medidas.imc = +imc.toFixed(1);
    if (rcq != null) medidas.rcq = +rcq.toFixed(2);

    const av: Avaliacao = {
      id: uid(),
      alunoId,
      data: Math.min(ts, Date.now()),
      medidas,
      dorEscala: num(med.dor ?? ""),
      observacoes: obs.trim() || undefined,
      tipo,
      condicao: condicao || undefined,
      regioesDor: regioesDor.length ? regioesDor : undefined,
      perimetros: perimetros.filter((p) => p.valor != null || p.valorEsq != null),
      testes: testes.filter((t) => t.nome.trim() !== "" && t.resultado.trim() !== ""),
      fotos: fotos.length ? fotos : undefined,
      personalizadas: personalizadas.filter((p) => p.nome.trim() !== "" && p.valor.trim() !== ""),
    };
    // limpa arrays vazios para não poluir o registro
    if (!av.perimetros?.length) delete av.perimetros;
    if (!av.testes?.length) delete av.testes;
    if (!av.personalizadas?.length) delete av.personalizadas;
    onSave(av);
  };

  const antMed = anterior?.medidas;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 backdrop-blur-sm sm:p-4" onClick={tentarFechar}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Registrar avaliação"
        className="flex max-h-modal w-full max-w-xl flex-col overflow-hidden rounded-card bg-surface shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2 border-b border-border p-4 sm:p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Registrar avaliação</h2>
            <p className="text-sm text-ink-2">Registre as medidas e o desempenho atual do aluno.</p>
          </div>
          <button onClick={tentarFechar} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 sm:p-5">
          {/* Como estava antes: em reavaliação, a trajetória fica à vista enquanto se
              registra o novo ponto (mini-gráfico das métricas-chave). */}
          {anterior && historico && historico.length > 0 && (
            <div className="rounded-xl border border-analysis/30 bg-analysis-tint p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-analysis">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-ink">Como estava antes</h3>
                  <p className="text-xs text-ink-2">
                    Última avaliação em {fmtData(anterior.data)}. Registre os novos valores abaixo.
                  </p>
                </div>
              </div>
              <EvolucaoMini avals={historico} metricas={METRICAS_CHAVE} valorUnico />
            </div>
          )}

          {/* Resumo rápido: sempre visível */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Data da avaliação" className="sm:col-span-1">
              <input type="date" value={data} max={hoje} onChange={(e) => setData(e.target.value)} className="input" />
            </Campo>
            <Campo label="Tipo de avaliação">
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAvaliacao)} className="input">
                {TIPOS.map((t) => (
                  <option key={t.v} value={t.v}>{t.label}</option>
                ))}
              </select>
            </Campo>
            <NumInput label="Peso (kg)" mkey="peso" med={med} setM={setM} placeholder="Ex.: 70,5" anterior={antMed?.peso} anteriorData={anterior?.data} unidade="kg" />
            <NumInput label="% de gordura" mkey="percentualGordura" med={med} setM={setM} placeholder="Ex.: 28" anterior={antMed?.percentualGordura} anteriorData={anterior?.data} unidade="pontos" />
            <NumInput label="Cintura (cm)" mkey="cintura" med={med} setM={setM} placeholder="Ex.: 84" anterior={antMed?.cintura} anteriorData={anterior?.data} unidade="cm" />
            <NumInput label="Dor percebida (0 a 10)" mkey="dor" med={med} setM={setM} placeholder="Ex.: 2" max10 anterior={anterior?.dorEscala} anteriorData={anterior?.data} unidade="" />
            <Campo label="Observações" className="sm:col-span-2">
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Evolução, queixas, limitações, resposta ao treinamento, ajustes necessários..." className="input" />
            </Campo>
          </div>

          <div className="pt-1 text-xs font-semibold uppercase tracking-wider text-ink-3">Adicionar mais informações</div>

          {/* Composição corporal detalhada */}
          <Secao titulo="Composição corporal" defaultOpen>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumInput label="Altura (cm)" mkey="altura" med={med} setM={setM} placeholder="Ex.: 172" anterior={antMed?.altura} anteriorData={anterior?.data} unidade="cm" />
              <Campo label="IMC (automático)">
                <div className="input flex items-center bg-surface-soft text-ink-2">
                  {imc != null ? `${fmtNum(+imc.toFixed(1))} kg/m²` : "peso e altura"}
                </div>
              </Campo>
              <NumInput label="Massa muscular (kg)" mkey="massaMuscular" med={med} setM={setM} placeholder="Ex.: 32" anterior={antMed?.massaMuscular} anteriorData={anterior?.data} unidade="kg" />
            </div>
          </Secao>

          {/* Perímetros */}
          <Secao titulo="Perímetros corporais">
            <div className="grid gap-3 sm:grid-cols-2">
              <NumInput label="Quadril (cm)" mkey="quadril" med={med} setM={setM} placeholder="Ex.: 98" anterior={antMed?.quadril} anteriorData={anterior?.data} unidade="cm" />
              <Campo label="Relação cintura-quadril">
                <div className="input flex items-center bg-surface-soft text-ink-2">
                  {rcq != null ? rcq.toFixed(2).replace(".", ",") : "cintura e quadril"}
                </div>
              </Campo>
            </div>
            <ListaDinamica
              itens={perimetros}
              vazio="Nenhum perímetro extra. Use o botão para adicionar."
              onAdd={() => setPerimetros((p) => [...p, { regiao: "Braço contraído", lado: "NA" }])}
              addLabel="Adicionar perímetro"
              render={(p, i) => (
                <PerimetroRow
                  p={p}
                  onChange={(patch) => setPerimetros((arr) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                  onRemove={() => setPerimetros((arr) => arr.filter((_, j) => j !== i))}
                />
              )}
            />
          </Secao>

          {/* Sinais fisiológicos */}
          <Secao titulo="Sinais fisiológicos">
            <div className="grid gap-3 sm:grid-cols-2">
              <NumInput label="FC de repouso (bpm)" mkey="fcRepouso" med={med} setM={setM} placeholder="Ex.: 68" anterior={antMed?.fcRepouso} anteriorData={anterior?.data} unidade="bpm" />
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="PA sistólica" mkey="pressaoSistolica" med={med} setM={setM} placeholder="120" anterior={antMed?.pressaoSistolica} anteriorData={anterior?.data} unidade="mmHg" />
                <NumInput label="PA diastólica" mkey="pressaoDiastolica" med={med} setM={setM} placeholder="80" anterior={antMed?.pressaoDiastolica} anteriorData={anterior?.data} unidade="mmHg" />
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-3">
              O sistema apenas registra os valores. Valores que fujam do habitual podem exigir atenção de profissional
              de saúde, conforme o contexto do aluno.
            </p>
          </Secao>

          {/* Dor e bem-estar */}
          <Secao titulo="Dor e bem-estar">
            <Campo label="Região da dor">
              <div className="flex flex-wrap gap-1.5">
                {REGIOES_DOR.map((r) => {
                  const on = regioesDor.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setRegioesDor((arr) => (on ? arr.filter((x) => x !== r) : [...arr, r]))}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        on ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </Campo>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <NumInput label="Nível de fadiga (0 a 10)" mkey="fadiga" med={med} setM={setM} placeholder="Ex.: 4" max10 anterior={antMed?.fadiga} anteriorData={anterior?.data} />
              <NumInput label="Qualidade do sono (0 a 10)" mkey="sono" med={med} setM={setM} placeholder="Ex.: 7" max10 anterior={antMed?.sono} anteriorData={anterior?.data} />
            </div>
            <p className="mt-2 text-xs text-ink-3">
              O registro de dor serve para acompanhamento e não substitui avaliação de profissional de saúde.
            </p>
          </Secao>

          {/* Testes físicos */}
          <Secao titulo="Testes físicos e funcionais">
            <ListaDinamica
              itens={testes}
              vazio="Nenhum teste registrado. Use o botão para adicionar."
              onAdd={() => setTestes((t) => [...t, { categoria: "Força", nome: "", resultado: "", unidade: "repetições", lado: "NA" }])}
              addLabel="Adicionar teste"
              render={(t, i) => (
                <TesteRow
                  t={t}
                  onChange={(patch) => setTestes((arr) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                  onRemove={() => setTestes((arr) => arr.filter((_, j) => j !== i))}
                />
              )}
            />
          </Secao>

          {/* Fotos */}
          <Secao titulo="Fotos de evolução">
            <FotosBloco fotos={fotos} setFotos={setFotos} />
          </Secao>

          {/* Medidas personalizadas */}
          <Secao titulo="Medidas personalizadas">
            <ListaDinamica
              itens={personalizadas}
              vazio="Cada protocolo é diferente. Adicione medidas próprias aqui."
              onAdd={() => setPersonalizadas((p) => [...p, { nome: "", valor: "", unidade: "", categoria: "Outro" }])}
              addLabel="Adicionar medida personalizada"
              render={(p, i) => (
                <PersonalizadaRow
                  p={p}
                  onChange={(patch) => setPersonalizadas((arr) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                  onRemove={() => setPersonalizadas((arr) => arr.filter((_, j) => j !== i))}
                />
              )}
            />
          </Secao>
        </div>

        {/* Rodapé fixo */}
        <div className="border-t border-border p-4">
          {!temConteudo && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-[color:var(--cta-text)]">
              <Info className="h-3.5 w-3.5" /> Preencha ao menos uma medida, teste, foto ou observação.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={tentarFechar} className={buttonClasses("secondary", "sm")}>
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!temConteudo || salvando}
              className={cn(buttonClasses("primary", "sm"), (!temConteudo || salvando) && "cursor-not-allowed opacity-50")}
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {salvando ? "Salvando" : "Salvar avaliação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- subcomponentes ------------------------------- */

function Campo({ label, hint, className, children }: { label: string; hint?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      {/* Rótulo e "antes: X" colados na mesma linha (nunca justify-between). */}
      <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-ink">
        <span>{label}</span>
        {hint}
      </span>
      {children}
    </label>
  );
}

function NumInput({
  label, mkey, med, setM, placeholder, unidade, anterior, anteriorData, max10,
}: {
  label: string;
  mkey: string;
  med: Record<string, string>;
  setM: (k: string, v: string) => void;
  placeholder?: string;
  unidade?: string;
  anterior?: number;
  anteriorData?: number;
  max10?: boolean;
}) {
  const val = med[mkey] ?? "";
  const atual = num(val);
  // "antes: X" discreto ao lado do rótulo, quando há avaliação anterior desta medida.
  const hint =
    anterior != null ? (
      <span className="text-xs font-normal text-ink-2">
        antes: {fmtNum(anterior)}
        {unidade ? ` ${unidade}` : ""}
      </span>
    ) : undefined;
  return (
    <Campo label={label} hint={hint}>
      <input
        value={val}
        onChange={(e) => {
          let v = e.target.value;
          if (max10) v = v.replace(/[^\d]/g, "").slice(0, 2);
          setM(mkey, v);
        }}
        inputMode={max10 ? "numeric" : "decimal"}
        placeholder={placeholder}
        className="input"
      />
      {/* Delta ao vivo só quando o valor muda: pré-carregado e intocado não vira ruído. */}
      {atual != null && anterior != null && atual !== anterior && (
        <ComparaLinha atual={atual} anterior={anterior} unidade={unidade ?? ""} dataAnterior={anteriorData} />
      )}
    </Campo>
  );
}

/** Comparação com a avaliação anterior, em linguagem neutra. */
function ComparaLinha({ atual, anterior, unidade, dataAnterior }: { atual: number; anterior: number; unidade: string; dataAnterior?: number }) {
  const d = +(atual - anterior).toFixed(2);
  const verbo = d > 0 ? "Aumentou" : d < 0 ? "Reduziu" : "Manteve-se";
  const u = unidade ? ` ${unidade}` : "";
  return (
    <span className="mt-1 block text-xs text-ink-3">
      {verbo}
      {d !== 0 ? ` ${fmtNum(Math.abs(d))}${u}` : ""}
      {dataAnterior ? ` desde ${fmtData(dataAnterior)}` : ""}
    </span>
  );
}

/** Acordeão local com estado próprio (permite abrir por padrão). */
function Secao({ titulo, defaultOpen, children }: { titulo: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="font-semibold text-ink">{titulo}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

function ListaDinamica<T>({
  itens, vazio, onAdd, addLabel, render,
}: {
  itens: T[];
  vazio: string;
  onAdd: () => void;
  addLabel: string;
  render: (item: T, i: number) => React.ReactNode;
}) {
  return (
    <div className="mt-3 space-y-2">
      {itens.length === 0 ? (
        <p className="text-xs text-ink-3">{vazio}</p>
      ) : (
        itens.map((it, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface-soft p-3">
            {render(it, i)}
          </div>
        ))
      )}
      <button type="button" onClick={onAdd} className={cn(buttonClasses("ghost", "sm"), "text-primary")}>
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

function LadoSelect({ value, onChange, ambos }: { value?: string; onChange: (v: string) => void; ambos?: boolean }) {
  return (
    <select value={value ?? "NA"} onChange={(e) => onChange(e.target.value)} className="input">
      <option value="D">Direito</option>
      <option value="E">Esquerdo</option>
      {ambos ? <option value="Ambos">Ambos</option> : <option value="Bilateral">Bilateral</option>}
      <option value="NA">Não aplicável</option>
    </select>
  );
}

function BotaoRemover({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="rounded-md p-2 text-ink-3 hover:bg-surface hover:text-[color:var(--cta-text)]">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function PerimetroRow({ p, onChange, onRemove }: { p: AvaliacaoPerimetro; onChange: (patch: Partial<AvaliacaoPerimetro>) => void; onRemove: () => void }) {
  const ambos = p.lado === "Ambos";
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <select value={p.regiao} onChange={(e) => onChange({ regiao: e.target.value })} className="input">
            {PERIMETRO_REGIOES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <LadoSelect value={p.lado} onChange={(v) => onChange({ lado: v as AvaliacaoPerimetro["lado"] })} ambos />
        </div>
        <BotaoRemover onClick={onRemove} label="Remover perímetro" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          inputMode="decimal"
          placeholder={ambos ? "Direito (cm)" : "Valor (cm)"}
          value={p.valor != null ? String(p.valor) : ""}
          onChange={(e) => onChange({ valor: num(e.target.value) })}
          className="input"
        />
        {ambos && (
          <input
            inputMode="decimal"
            placeholder="Esquerdo (cm)"
            value={p.valorEsq != null ? String(p.valorEsq) : ""}
            onChange={(e) => onChange({ valorEsq: num(e.target.value) })}
            className="input"
          />
        )}
      </div>
      {ambos && p.valor != null && p.valorEsq != null && (
        <p className="text-xs text-ink-3">
          Diferença entre lados: {fmtNum(Math.abs(p.valor - p.valorEsq))} cm
          {p.valor > 0 ? ` (${((Math.abs(p.valor - p.valorEsq) / Math.max(p.valor, p.valorEsq)) * 100).toFixed(1).replace(".", ",")}%)` : ""}
        </p>
      )}
    </div>
  );
}

function TesteRow({ t, onChange, onRemove }: { t: AvaliacaoTeste; onChange: (patch: Partial<AvaliacaoTeste>) => void; onRemove: () => void }) {
  const listId = React.useId();
  const sugestoes = TESTES_SUGERIDOS[t.categoria] ?? [];
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <select value={t.categoria} onChange={(e) => onChange({ categoria: e.target.value })} className="input">
            {TESTE_CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            list={listId}
            value={t.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            placeholder="Nome do teste"
            className="input"
          />
          <datalist id={listId}>
            {sugestoes.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <BotaoRemover onClick={onRemove} label="Remover teste" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={t.resultado} onChange={(e) => onChange({ resultado: e.target.value })} placeholder="Resultado" className="input" />
        <select value={t.unidade ?? ""} onChange={(e) => onChange({ unidade: e.target.value })} className="input">
          <option value="">Unidade</option>
          {UNIDADES_TESTE.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <LadoSelect value={t.lado} onChange={(v) => onChange({ lado: v as AvaliacaoTeste["lado"] })} />
      </div>
    </div>
  );
}

function PersonalizadaRow({ p, onChange, onRemove }: { p: MedidaPersonalizada; onChange: (patch: Partial<MedidaPersonalizada>) => void; onRemove: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <input value={p.nome} onChange={(e) => onChange({ nome: e.target.value })} placeholder="Nome (ex.: Amplitude de dorsiflexão)" className="input flex-1" />
        <BotaoRemover onClick={onRemove} label="Remover medida personalizada" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={p.valor} onChange={(e) => onChange({ valor: e.target.value })} placeholder="Valor" className="input" />
        <input value={p.unidade ?? ""} onChange={(e) => onChange({ unidade: e.target.value })} placeholder="Unidade" className="input" />
        <select value={p.categoria ?? "Outro"} onChange={(e) => onChange({ categoria: e.target.value })} className="input">
          {CATEGORIAS_PERSONALIZADA.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const MAX_FOTOS = 6;

function FotosBloco({ fotos, setFotos }: { fotos: AvaliacaoFoto[]; setFotos: React.Dispatch<React.SetStateAction<AvaliacaoFoto[]>> }) {
  const [tipoFoto, setTipoFoto] = React.useState(TIPOS_FOTO[0]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const escolher = async (file?: File) => {
    if (!file) return;
    // Teto de fotos por avaliação: as imagens ficam no armazenamento local (data
    // URL) e sem limite estouram a cota, com perda silenciosa (N7).
    if (fotos.length >= MAX_FOTOS) {
      toast(`Máximo de ${MAX_FOTOS} fotos por avaliação.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    try {
      const dataUrl = await arquivoParaDataUrl(file, { maxW: 900, maxH: 1200, modo: "contain", qualidade: 0.7, formato: "jpeg" });
      setFotos((f) => [...f, { id: uid(), tipo: tipoFoto, dataUrl }]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível carregar a foto.");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-lg border border-border">
              <img src={f.dataUrl} alt={f.tipo} className="aspect-[3/4] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-2xs text-white">{f.tipo}</span>
              <button
                type="button"
                onClick={() => setFotos((arr) => arr.filter((x) => x.id !== f.id))}
                aria-label={`Remover foto ${f.tipo}`}
                className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white hover:bg-black/75"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink">Posição</span>
          <select value={tipoFoto} onChange={(e) => setTipoFoto(e.target.value)} className="input h-9 py-1 text-sm">
            {TIPOS_FOTO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => escolher(e.target.files?.[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} className={buttonClasses("secondary", "sm")}>
          <Camera className="h-4 w-4" /> Adicionar foto
        </button>
      </div>
      <p className="text-xs text-ink-3">
        As fotos ficam privadas neste dispositivo. Não use as imagens em materiais externos sem autorização específica do aluno.
      </p>
    </div>
  );
}
