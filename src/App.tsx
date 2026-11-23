import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
const QueuesPage = lazy(() => import("./pages/QueuesPage").then((m) => ({ default: m.QueuesPage })));
const TransportPage = lazy(() => import("./pages/TransportPage").then((m) => ({ default: m.TransportPage })));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="transporte" element={<Suspense fallback={<p>Cargando transporte…</p>}><TransportPage /></Suspense>} />
          <Route path="colas" element={<Suspense fallback={<p>Cargando colas…</p>}><QueuesPage /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
