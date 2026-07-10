import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { Landing } from "@/pages/Landing";
import { Pricing } from "@/pages/Pricing";
import { Dashboard } from "@/pages/Dashboard";
import { Gps } from "@/pages/Gps";
import { MovementLabList } from "@/pages/MovementLabList";
import { MovementLabDetail } from "@/pages/MovementLabDetail";
import { CasesList } from "@/pages/CasesList";
import { CaseSolve } from "@/pages/CaseSolve";
import { Favorites } from "@/pages/Favorites";
import { TracksList } from "@/pages/TracksList";
import { TrackDetail } from "@/pages/TrackDetail";
import { Library } from "@/pages/Library";
import { History } from "@/pages/History";
import { Account } from "@/pages/Account";
import { Alunos } from "@/pages/Alunos";
import { AlunoDetail } from "@/pages/AlunoDetail";
import { Avaliacoes } from "@/pages/Avaliacoes";
import { Protocolos } from "@/pages/Protocolos";
import { Comparador } from "@/pages/Comparador";
import { SpecialGroups } from "@/pages/SpecialGroups";
import { SpecialGroupDetail } from "@/pages/SpecialGroupDetail";
import { Tutorial } from "@/pages/Tutorial";
import { TutorialDetail } from "@/pages/TutorialDetail";
import { Support } from "@/pages/Support";
import { Semaforo } from "@/pages/Semaforo";
import { Roi } from "@/pages/Roi";
import { CasosRcd } from "@/pages/CasosRcd";
import { CasoRcdDetail } from "@/pages/CasoRcdDetail";
import {
  AprenderHome,
  MapaConhecimento,
  Disciplinas as AprenderDisciplinas,
  DisciplinaDetail,
  ModuloDetail,
  Conteudo as AprenderConteudo,
  Casos as AprenderCasos,
  CasoDetail as AprenderCasoDetail,
  Biblioteca as AprenderBiblioteca,
  Consulta as AprenderConsulta,
  Salvos as AprenderSalvos,
  Progresso as AprenderProgresso,
} from "@/features/learning/pages";

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

export default function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ScrollToTop />
      <Routes>
        {/* Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/planos" element={<Navigate to="/pricing" replace />} />
        <Route path="/demo" element={<Navigate to="/movement-lab" replace />} />
        <Route path="/roi" element={<Roi />} />
        <Route path="/casos-rcd" element={<CasosRcd />} />
        <Route path="/casos-rcd/:slug" element={<CasoRcdDetail />} />

        {/* App (dentro do shell) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gps" element={<Gps />} />
          <Route path="/movement-lab" element={<MovementLabList />} />
          <Route path="/movement-lab/:slug" element={<MovementLabDetail />} />
          <Route path="/comparador" element={<Comparador />} />
          <Route path="/cases" element={<CasesList />} />
          <Route path="/cases/:slug" element={<CaseSolve />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/alunos/:id" element={<AlunoDetail />} />
          <Route path="/special-groups" element={<SpecialGroups />} />
          <Route path="/special-groups/:slug" element={<SpecialGroupDetail />} />
          <Route path="/decisao" element={<DecisaoRedirect />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/tracks" element={<TracksList />} />
          <Route path="/tracks/:slug" element={<TrackDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="/history" element={<History />} />
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
          <Route path="/aprender/consulta" element={<AprenderConsulta />} />
          <Route path="/aprender/salvos" element={<AprenderSalvos />} />
          <Route path="/aprender/progresso" element={<AprenderProgresso />} />
          <Route path="/aprender/trilhas" element={<Navigate to="/tracks" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
