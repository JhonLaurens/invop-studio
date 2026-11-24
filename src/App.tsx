import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { PageSkeleton } from "./components/Skeleton";

function NotFound() {
  return (
    <div className="page">
      <h1>Página no encontrada</h1>
      <p>Esa dirección no corresponde a un módulo de Estudio IO.</p>
      <Link className="btn primary" to="/">Inicio</Link>
    </div>
  );
}

const QueuesPage = lazy(() => import("./pages/QueuesPage").then((m) => ({ default: m.QueuesPage })));
const TransportPage = lazy(() => import("./pages/TransportPage").then((m) => ({ default: m.TransportPage })));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="transporte"
            element={
              <Suspense fallback={<PageSkeleton title="transporte" />}>
                <TransportPage />
              </Suspense>
            }
          />
          <Route
            path="colas"
            element={
              <Suspense fallback={<PageSkeleton title="colas" />}>
                <QueuesPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}