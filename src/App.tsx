import { lazy, Suspense, useEffect, type ComponentType } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { Landing } from "@/pages/Landing";

/*
 * SÓ A LANDING É EAGER. TODO O RESTO DO APP CHEGA SOB DEMANDA.
 *
 * Todas as páginas eram importadas estaticamente, então a rota "/" (a página de VENDAS)
 * baixava o aplicativo inteiro num bundle de 3,0 MB antes de pintar. Quem chegava por um
 * anúncio no celular pagava o preço do Prescrever, do Aprender e do laboratório de
 * movimento sem nunca ter clicado em nada. Com o lazy por página o Vite corta um chunk
 * por rota, e a entrada fica com a landing, o roteador e o React.
 *
 * As páginas exportam por NOME e React.lazy exige default: o helper adapta. O barrel do
 * Aprender vira um chunk único (todas as suas páginas compartilham o módulo), o que é
 * intencional: melhor um chunk do Aprender do que ele inteiro na entrada.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pagina<M extends Record<string, any>>(carregar: () => Promise<M>, nome: keyof M) {
  return lazy(async () => ({ default: (await carregar())[nome] as ComponentType }));
}

/*
 * Até o ThemeApplier é lazy, e o motivo é a CADEIA dele: ele lê a store, a store puxa o
 * cloudSync (cliente Supabase), os seeds e o motor de restrições, e tudo isso entrava no
 * bundle de ENTRADA da página de vendas. O flash de tema escuro já é evitado pelo script
 * inline do index.html, que pinta os neutros essenciais antes do primeiro paint; o
 * ThemeApplier chega dezenas de ms depois e completa a paleta, como sempre fez.
 */
const ThemeApplier = pagina(() => import("@/lib/theme/ThemeApplier"), "ThemeApplier");
const AppLayout = pagina(() => import("@/components/app/AppLayout"), "AppLayout");
const Pricing = pagina(() => import("@/pages/Pricing"), "Pricing");
const Termos = pagina(() => import("@/pages/DocumentoLegal"), "Termos");
const Privacidade = pagina(() => import("@/pages/DocumentoLegal"), "Privacidade");
const CasoPratico = pagina(() => import("@/pages/CasoPratico"), "CasoPratico");
const Dashboard = pagina(() => import("@/pages/Dashboard"), "Dashboard");
const Gps = pagina(() => import("@/pages/Gps"), "Gps");
const PrescreverTreino = pagina(() => import("@/pages/PrescreverTreino"), "PrescreverTreino");
const MovementLabList = pagina(() => import("@/pages/MovementLabList"), "MovementLabList");
const MovementLabDetail = pagina(() => import("@/pages/MovementLabDetail"), "MovementLabDetail");
const TracksList = pagina(() => import("@/pages/TracksList"), "TracksList");
const TrackDetail = pagina(() => import("@/pages/TrackDetail"), "TrackDetail");
const Consultar = pagina(() => import("@/pages/Consultar"), "Consultar");
const Account = pagina(() => import("@/pages/Account"), "Account");
const Alunos = pagina(() => import("@/pages/Alunos"), "Alunos");
const AlunoDetail = pagina(() => import("@/pages/AlunoDetail"), "AlunoDetail");
const AlunoPreview = pagina(() => import("@/pages/AlunoPreview"), "AlunoPreview");
const AlunoPerfil = pagina(() => import("@/pages/AlunoPerfil"), "AlunoPerfil");
const AlunoPortal = pagina(() => import("@/pages/AlunoPortal"), "AlunoPortal");
const Avaliacoes = pagina(() => import("@/pages/Avaliacoes"), "Avaliacoes");
const Protocolos = pagina(() => import("@/pages/Protocolos"), "Protocolos");
const Comparador = pagina(() => import("@/pages/Comparador"), "Comparador");
const SpecialGroups = pagina(() => import("@/pages/SpecialGroups"), "SpecialGroups");
const SpecialGroupDetail = pagina(() => import("@/pages/SpecialGroupDetail"), "SpecialGroupDetail");
const Tutorial = pagina(() => import("@/pages/Tutorial"), "Tutorial");
const TutorialDetail = pagina(() => import("@/pages/TutorialDetail"), "TutorialDetail");
const Support = pagina(() => import("@/pages/Support"), "Support");
const Semaforo = pagina(() => import("@/pages/Semaforo"), "Semaforo");
const Roi = pagina(() => import("@/pages/Roi"), "Roi");
const CasosRcd = pagina(() => import("@/pages/CasosRcd"), "CasosRcd");
const CasoRcdDetail = pagina(() => import("@/pages/CasoRcdDetail"), "CasoRcdDetail");
const AprenderHome = pagina(() => import("@/features/learning/pages"), "AprenderHome");
const MapaConhecimento = pagina(() => import("@/features/learning/pages"), "MapaConhecimento");
const AprenderDisciplinas = pagina(() => import("@/features/learning/pages"), "Disciplinas");
const DisciplinaDetail = pagina(() => import("@/features/learning/pages"), "DisciplinaDetail");
const ModuloDetail = pagina(() => import("@/features/learning/pages"), "ModuloDetail");
const AprenderConteudo = pagina(() => import("@/features/learning/pages"), "Conteudo");
const AprenderCasos = pagina(() => import("@/features/learning/pages"), "Casos");
const AprenderCasoDetail = pagina(() => import("@/features/learning/pages"), "CasoDetail");
const AprenderBiblioteca = pagina(() => import("@/features/learning/pages"), "Biblioteca");
const AprenderSalvos = pagina(() => import("@/features/learning/pages"), "Salvos");
const AprenderProgresso = pagina(() => import("@/features/learning/pages"), "Progresso");

/*
 * O TEMA NÃO MONTA NA LANDING. A cadeia do ThemeApplier (store -> cloudSync -> Supabase,
 * seeds e motor) é ~585 KB que a página de VENDAS baixava depois do paint sem usar: a
 * landing tem paleta própria fixa (fundo claro do protótipo) e não lê token de tema. O
 * flash escuro de quem entra direto numa rota do app segue coberto pelo script inline do
 * index.html; ao navegar da landing para dentro, isto monta e completa a paleta.
 */
function TemaForaDaLanding() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <Suspense fallback={null}>
      <ThemeApplier />
    </Suspense>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// A antiga "Decisão rápida" foi fundida no fluxo "Prescrever" (/gps).
// Mantém o link antigo funcionando, preservando ?aluno/?grupo/?fase.
function DecisaoRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/gps${search}`} replace />;
}

// Casos foram para o acervo do Aprender; preserva o slug para não cair na lista.
function CasoSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={slug ? `/aprender/casos/${slug}` : "/aprender/casos"} replace />;
}

// Glossário e Consulta rápida foram fundidos em "Consultar". Preserva o ?q= dos
// deep links de resposta rápida (Home, mocks) para a busca já abrir preenchida.
function ConsultarRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/consultar${search}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ScrollToTop />
      <TemaForaDaLanding />
      {/* Fallback NEUTRO de propósito: o chunk de uma página chega em dezenas de ms no
          segundo acesso (cache) e um spinner piscando a cada navegação seria pior que o
          vazio. O fundo segue o tema, então não há flash branco no escuro. */}
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "rgb(var(--bg-rgb, 247 246 243))" }} />}>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        {/* Documentos legais. Rotas PÚBLICAS de propósito: quem ainda não criou conta
            precisa poder ler os Termos e a Política ANTES de aceitar no cadastro. */}
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/lgpd" element={<Navigate to="/privacidade" replace />} />
        <Route path="/planos" element={<Navigate to="/pricing" replace />} />
        <Route path="/demo" element={<Navigate to="/movement-lab" replace />} />
        <Route path="/roi" element={<Roi />} />
        <Route path="/casos-rcd" element={<CasosRcd />} />
        <Route path="/casos-rcd/:slug" element={<CasoRcdDetail />} />

        {/* Portal do aluno em tela cheia (prévia do profissional; sem o shell). */}
        <Route path="/alunos/:id/preview" element={<AlunoPreview />} />
        {/* Portal real do aluno: cadastro/login por convite + app com a marca. */}
        <Route path="/aluno" element={<AlunoPortal />} />

        {/* App (dentro do shell) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gps" element={<Gps />} />
          <Route path="/prescrever-treino" element={<PrescreverTreino />} />
          <Route path="/movement-lab" element={<MovementLabList />} />
          <Route path="/movement-lab/:slug" element={<MovementLabDetail />} />
          <Route path="/comparador" element={<Comparador />} />
          {/* Casos foram consolidados no acervo unico do Aprender. */}
          <Route path="/cases" element={<Navigate to="/aprender/casos" replace />} />
          <Route path="/cases/:slug" element={<CasoSlugRedirect />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/alunos/:id" element={<AlunoDetail />} />
          <Route path="/alunos/:id/perfil" element={<AlunoPerfil />} />
          <Route path="/special-groups" element={<SpecialGroups />} />
          {/* Os 10 casos de decisao de src/data/cases.ts voltaram a ter destino: os
              links dos grupos e das trilhas caiam todos em "Caso nao encontrado". */}
          <Route path="/casos-praticos/:slug" element={<CasoPratico />} />
          <Route path="/special-groups/:slug" element={<SpecialGroupDetail />} />
          <Route path="/decisao" element={<DecisaoRedirect />} />
          {/* Favoritos de exercício foram fundidos no "Salvos" do Aprender. */}
          <Route path="/favorites" element={<Navigate to="/aprender/salvos" replace />} />
          <Route path="/tracks" element={<TracksList />} />
          <Route path="/tracks/:slug" element={<TrackDetail />} />
          <Route path="/consultar" element={<Consultar />} />
          {/* Glossário virou a aba Glossário de Consultar */}
          <Route path="/library" element={<ConsultarRedirect />} />
          {/* Historico foi fundido em "Meu progresso". */}
          <Route path="/history" element={<Navigate to="/aprender/progresso" replace />} />
          <Route path="/protocols" element={<Protocolos />} />
          <Route path="/assessments" element={<Avaliacoes />} />
          <Route path="/semaforo" element={<Semaforo />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/tutorial/:slug" element={<TutorialDetail />} />
          <Route path="/suporte" element={<Support />} />
          <Route path="/account" element={<Account />} />

          {/* Aprender: corpo científico do produto */}
          <Route path="/aprender" element={<AprenderHome />} />
          <Route path="/aprender/mapa" element={<MapaConhecimento />} />
          <Route path="/aprender/disciplinas" element={<AprenderDisciplinas />} />
          <Route path="/aprender/disciplinas/:disciplineSlug" element={<DisciplinaDetail />} />
          <Route path="/aprender/disciplinas/:disciplineSlug/:moduleSlug" element={<ModuloDetail />} />
          <Route path="/aprender/conteudos/:lessonSlug" element={<AprenderConteudo />} />
          <Route path="/aprender/casos" element={<AprenderCasos />} />
          <Route path="/aprender/casos/:caseSlug" element={<AprenderCasoDetail />} />
          <Route path="/aprender/biblioteca" element={<AprenderBiblioteca />} />
          {/* Consulta rápida virou a aba Resposta rápida de Consultar */}
          <Route path="/aprender/consulta" element={<ConsultarRedirect />} />
          <Route path="/aprender/salvos" element={<AprenderSalvos />} />
          <Route path="/aprender/progresso" element={<AprenderProgresso />} />
          <Route path="/aprender/trilhas" element={<Navigate to="/tracks" replace />} />
          {/* Beco de rota DENTRO do shell: uma URL desconhecida de quem já está no app
              volta ao painel, em vez de expulsar para a Landing. Não há predicado
              "logado"; o * externo abaixo segue servindo os links externos. */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
