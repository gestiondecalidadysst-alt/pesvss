import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Clasificacion } from './features/Clasificacion';
import { Tablero } from './features/Tablero';
import { Detalle } from './features/Detalle';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-white text-sm font-semibold">V</div>
            <Link to="/" className="font-semibold text-slate-900 no-underline">
              ViaSegura <span className="text-slate-400 font-normal text-sm">· PESV</span>
            </Link>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Clasificacion />} />
          <Route path="/tablero/:orgId" element={<Tablero />} />
          <Route path="/requisito/:orgId/:paso" element={<Detalle />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
