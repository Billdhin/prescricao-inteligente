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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
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
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/tracks" element={<TracksList />} />
          <Route path="/tracks/:slug" element={<TrackDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="/history" element={<History />} />
          <Route path="/protocols" element={<Protocolos />} />
          <Route path="/assessments" element={<Avaliacoes />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
