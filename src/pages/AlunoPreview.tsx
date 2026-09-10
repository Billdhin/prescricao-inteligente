import * as React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Smartphone, MousePointerClick } from "lucide-react";
import { StudentApp } from "@/components/student/StudentApp";
import { useAlunos, useUser } from "@/lib/store";
import { aplicarPaleta, PALETA_ALUNO, temaAlunoSalvo } from "@/lib/theme/palettes";

/**
 * Prévia do portal do aluno para o PROFISSIONAL: "ver como o aluno vê".
 *
 * É um EXEMPLO, não um app operável. Antes, renderizava o StudentApp inteiro e
 * navegável em tela cheia, e o profissional tinha a impressão de estar usando o
 * app de verdade: qualquer coisa que se comportasse diferente do esperado lia como
 * "bug", quando na verdade era só a prévia. Agora mostra a TELA INICIAL dentro de
 * uma moldura de celular, sem toque no conteúdo. A única ação fica fora do aparelho:
 * voltar para o perfil do aluno. O acesso real do aluno (conta própria via Supabase)
 * usa o mesmo StudentApp, aí sim interativo.
 */
export function AlunoPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const aluno = useAlunos((s) => s.alunos.find((a) => a.id === id));
  const planos = useAlunos((s) => s.planos);
  const avaliacoes = useAlunos((s) => s.avaliacoes);
  const execucoes = useAlunos((s) => s.execucoes);
  const sessaoFeedbacks = useAlunos((s) => s.sessaoFeedbacks);
  const liberacoes = useAlunos((s) => s.liberacoes);
  const prescricoes = useAlunos((s) => s.prescricoes);
  const user = useUser();

  if (!aluno) return <Navigate to="/alunos" replace />;

  const plano = planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === aluno.id);
  const feedbacksDoAluno = sessaoFeedbacks.filter((f) => f.alunoId === aluno.id);
  const dataDaPrescricao = (pid: string) => {
    const p = prescricoes.find((x) => x.id === pid);
    return p ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(p.data)) : undefined;
  };
  const marca = {
    nome: user.empresa || user.name || "Seu treino",
    logoDataUrl: user.logoDataUrl || undefined,
    fotoDataUrl: user.fotoDataUrl || undefined,
    corPrimaria: user.corPrimaria || undefined,
    paleta: user.paleta || undefined,
    modo: user.modo || undefined,
  };

  const primeiroNome = aluno.nome.split(" ")[0];
  const voltar = () => navigate(`/alunos/${aluno.id}`);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg">
      {/* Chrome do profissional: a ÚNICA parte interativa desta tela. */}
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button
          type="button"
          onClick={voltar}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para {primeiroNome}
        </button>
        <div className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-ink-2">
          <Smartphone className="h-3.5 w-3.5" /> Prévia
        </div>
      </header>

      {/* Palco: o aparelho à esquerda, e o que se está vendo explicado ao lado. */}
      <div className="flex-1 px-4 py-6 md:py-8">
        <div className="mx-auto grid w-full max-w-5xl items-center justify-items-center gap-8 lg:grid-cols-[auto_minmax(0,24rem)]">
          <Aparelho corMarca={marca.corPrimaria}>
            <StudentApp
              aluno={aluno}
              plano={plano}
              marca={marca}
              avaliacoes={avaliacoes}
              execucoes={execucoesDoAluno}
              sessaoFeedbacks={feedbacksDoAluno}
              liberacoes={liberacoes}
              dataDaPrescricao={dataDaPrescricao}
              onRegistrar={() => {}}
              onFeedback={() => {}}
              preview
            />
          </Aparelho>

          <div className="w-full max-w-md rounded-card border border-border bg-surface p-5 shadow-soft">
            <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-3">Como funciona</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              É assim que {primeiroNome} vê o treino de hoje no celular, com a sua marca. Esta prévia é somente
              leitura: as demais telas (Treinos, Progresso e Perfil) e o registro série a série aparecem quando o
              aluno entra na conta dele, criada pelo convite.
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-ink-2">
              <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              Role a tela do celular para ver o dia inteiro, como o aluno faria com o dedo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={voltar}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-control px-4 text-sm font-semibold transition-[filter] hover:brightness-[1.15]"
                style={{ background: "#0B1628", color: "#F3F1EA" }}
              >
                Voltar para {primeiroNome}
              </button>
              <button
                type="button"
                onClick={() => navigate("/alunos")}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-control border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
              >
                Trocar aluno
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * O APARELHO: moldura, tela de altura fixa, barra de status e rolagem por dentro.
 *
 * ## Por que a prévia parecia quebrada
 *
 * 1. A moldura não tinha altura. O app inteiro virava uma torre mais alta que a janela,
 *    cortada no rodapé, e o "celular" rolava junto com a página.
 * 2. A barra de abas do app é `position: fixed`, porque no celular de verdade ela gruda no
 *    rodapé da TELA. Aqui a tela era a janela do profissional: a barra saía da moldura e
 *    colava no pé da página, por cima do botão "Começar", com a largura errada.
 * 3. O `pointer-events: none` que impede tocar no conteúdo também impedia ROLAR a tela
 *    do celular com a roda do mouse.
 *
 * ## Como o aparelho resolve
 *
 * - A tela tem o tamanho de um celular de 6,1" (390 x 844) SEMPRE, e o aparelho inteiro é
 *   reduzido por igual para caber na janela. Antes só a ALTURA encolhia: numa janela de
 *   860 px o aparelho ficava 370 x 708, e num notebook ainda mais atarracado, com proporção
 *   de tablet. O profissional reclamou exatamente disso. Escalar o conjunto preserva a
 *   proporção, e o conteúdo continua diagramado na largura real de um celular.
 * - A tela leva um `transform`. Isso não é enfeite: um ancestral com transform vira o
 *   bloco de referência de todo `position: fixed` dentro dele, então a barra de abas passa
 *   a grudar no rodapé DA TELA DO CELULAR, exatamente como no aparelho. E como quem rola é
 *   uma camada interna, e não a tela, a barra fica parada enquanto o conteúdo corre.
 * - O conteúdo continua sem toque, mas a camada de rolagem por fora dele aceita a roda do
 *   mouse: a roda passa pelo conteúdo "morto" e cai nela.
 * - A tela recebe a mesma pele do app do aluno (`PALETA_ALUNO`, no tema que ele escolheu),
 *   para a barra de status ter a cor da tela que está embaixo dela.
 */
function Aparelho({ corMarca, children }: { corMarca?: string; children: React.ReactNode }) {
  const telaRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (telaRef.current) aplicarPaleta(telaRef.current, PALETA_ALUNO, temaAlunoSalvo() === "escuro", corMarca);
  }, [corMarca]);

  const escala = useEscalaQueCabe();
  const [hora, setHora] = React.useState(() => horaAgora());
  React.useEffect(() => {
    const t = window.setInterval(() => setHora(horaAgora()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    // A caixa externa ocupa o tamanho JÁ reduzido, para o layout em volta não reservar o
    // espaço do aparelho em tamanho cheio; o aparelho em si é desenhado em 1:1 e reduzido.
    <div className="shrink-0" style={{ width: APARELHO_L * escala, height: APARELHO_A * escala }}>
    <div className="relative" style={{ width: APARELHO_L, height: APARELHO_A, transform: `scale(${escala})`, transformOrigin: "top left" }}>
      {/* Botões laterais: volume à esquerda, energia à direita. */}
      <span aria-hidden className="absolute -left-[3px] top-[120px] h-8 w-[3px] rounded-l-sm" style={{ background: "#1C2433" }} />
      <span aria-hidden className="absolute -left-[3px] top-[168px] h-14 w-[3px] rounded-l-sm" style={{ background: "#1C2433" }} />
      <span aria-hidden className="absolute -left-[3px] top-[232px] h-14 w-[3px] rounded-l-sm" style={{ background: "#1C2433" }} />
      <span aria-hidden className="absolute -right-[3px] top-[190px] h-20 w-[3px] rounded-r-sm" style={{ background: "#1C2433" }} />

      <div
        className="h-full rounded-[56px] p-[11px]"
        style={{
          background: "linear-gradient(145deg, #1C2433, #0A0F18 55%)",
          boxShadow: "0 50px 90px -40px rgba(11,22,40,.65), inset 0 0 0 1.5px rgba(255,255,255,.07)",
        }}
      >
        <div
          ref={telaRef}
          // A área segura de baixo que o aparelho tem e a janela não: a barra de abas do app
          // usa env(safe-area-inset-bottom), que no computador vale zero, e os rótulos
          // encostavam na curva da tela. Aqui ela ganha o respiro do celular de verdade.
          className="relative flex flex-col overflow-hidden rounded-[44px] bg-bg [&_nav[aria-label='Navegação_do_app']]:pb-6"
          style={{
            height: TELA_A,
            // Bloco de referência do `position: fixed` do app: a barra de abas gruda aqui.
            transform: "translateZ(0)",
          }}
        >
          <BarraDeStatus hora={hora} />

          {/* Quem rola é esta camada, e não a tela: a barra de abas fica parada. */}
          <div
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            aria-label="Tela do app do aluno (prévia, role para ver o restante)"
          >
            {/* Retrato da tela, não um app para operar: sem toque e fora da árvore de
                acessibilidade. A roda do mouse atravessa e cai na camada de rolagem. */}
            <div className="pointer-events-none min-h-full select-none" aria-hidden>
              {children}
            </div>
          </div>

          {/* O indicador de início, por cima da barra de abas, como no aparelho. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-[7px] left-1/2 z-40 h-[5px] w-[130px] -translate-x-1/2 rounded-full bg-ink opacity-80"
          />

          {/* A ilha no alto da tela, por cima do conteúdo, como no aparelho. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[11px] z-40 h-[30px] w-[108px] -translate-x-1/2 rounded-full"
            style={{ background: "#05080D" }}
          />
        </div>
      </div>
    </div>
    </div>
  );
}

/** A tela de um celular de 6,1" em pontos (390 x 844), e o aparelho com a moldura de 11 px. */
const TELA_L = 390;
const TELA_A = 844;
const APARELHO_L = TELA_L + 22;
const APARELHO_A = TELA_A + 22;

/**
 * Quanto o aparelho precisa encolher para caber inteiro na janela, sem nunca crescer. Desconta
 * o cabeçalho da prévia e o respiro do palco na altura, e a margem lateral na largura (a
 * prévia aberta no próprio celular do profissional). Abaixo de 70% o texto do app cai para perto de
 * 10 px e deixa de ser legível; numa janela muito baixa a página rola um pouco, o que é melhor do
 * que um celular que ninguém consegue ler. Num notebook de 768 px de altura ele cabe inteiro.
 */
function useEscalaQueCabe(): number {
  const calcular = () => {
    if (typeof window === "undefined") return 1;
    const altura = (window.innerHeight - 140) / APARELHO_A;
    const largura = (window.innerWidth - 32) / APARELHO_L;
    return Math.max(0.7, Math.min(1, altura, largura));
  };
  const [escala, setEscala] = React.useState(calcular);
  React.useEffect(() => {
    const aoMudar = () => setEscala(calcular());
    window.addEventListener("resize", aoMudar);
    return () => window.removeEventListener("resize", aoMudar);
  }, []);
  return escala;
}

function horaAgora(): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

/** Hora real à esquerda, sinal, wi-fi e bateria à direita, na cor da tela do app. */
function BarraDeStatus({ hora }: { hora: string }) {
  return (
    <div className="relative z-30 flex h-[52px] shrink-0 items-center justify-between bg-bg px-8 pt-1.5 text-ink">
      <span className="tabular text-[15px] font-semibold">{hora}</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        {/* sinal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wi-fi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.3 10.3 0 0 0 8 .4C5.2.4 2.7 1.5.8 3.3L2 4.6a8.5 8.5 0 0 1 6-2.4Z" />
          <path d="M8 5.8c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4a6.7 6.7 0 0 0-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Z" />
          <circle cx="8" cy="10" r="1.7" />
        </svg>
        {/* bateria */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45" />
        </svg>
      </span>
    </div>
  );
}
