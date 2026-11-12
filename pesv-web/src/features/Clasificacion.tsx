// Pantalla de clasificación de nivel: lo primero que hace la plataforma.
// Con el número de vehículos, conductores y la misionalidad, el backend
// calcula el nivel (básico/estándar/avanzado) y crea la organización.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { NIVEL_LABEL } from '../lib/dominios';
import { Card, Button } from '../components/ui';
import type { Misionalidad, NivelPesv } from '../types';

export function Clasificacion() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [misionalidad, setMisionalidad] = useState<Misionalidad>('TRANSPORTE');
  const [numVehiculos, setNumVehiculos] = useState(0);
  const [numConductores, setNumConductores] = useState(0);
  const [nivel, setNivel] = useState<NivelPesv | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function clasificar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const r = await api.crearOrganizacion({ nombre, misionalidad, numVehiculos, numConductores });
      setNivel(r.nivel);
      setOrgId(r.organizacion.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo clasificar.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <p className="text-xs uppercase tracking-wide text-brand font-medium">Paso inicial</p>
      <h1 className="text-2xl font-semibold mt-1 mb-1">Clasificación de nivel PESV</h1>
      <p className="text-slate-500 text-sm mb-6">
        El nivel define cuántos pasos debe cumplir la empresa. Se calcula con el número de vehículos y
        conductores, según la Resolución 40595 de 2022.
      </p>

      <Card>
        <form onSubmit={clasificar} className="space-y-4">
          <Campo label="Nombre de la empresa">
            <input className={input} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </Campo>
          <Campo label="Misionalidad">
            <select className={input} value={misionalidad} onChange={(e) => setMisionalidad(e.target.value as Misionalidad)}>
              <option value="TRANSPORTE">Empresa de transporte</option>
              <option value="OTRA">Misionalidad diferente al transporte</option>
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="N.º de vehículos">
              <input type="number" min={0} className={input} value={numVehiculos} onChange={(e) => setNumVehiculos(Number(e.target.value))} />
            </Campo>
            <Campo label="N.º de conductores">
              <input type="number" min={0} className={input} value={numConductores} onChange={(e) => setNumConductores(Number(e.target.value))} />
            </Campo>
          </div>
          {error && <p className="text-sm text-estado-vencido">{error}</p>}
          <Button type="submit" disabled={cargando}>
            {cargando ? 'Calculando…' : 'Clasificar nivel'}
          </Button>
        </form>
      </Card>

      {nivel && orgId && (
        <Card className="mt-5">
          <p className="text-sm text-slate-500 m-0">Nivel calculado</p>
          <p className="text-2xl font-semibold text-brand mt-1 mb-3">{NIVEL_LABEL[nivel]}</p>
          <p className="text-sm text-slate-600 mb-4">
            Se activaron los pasos que aplican a este nivel. Los demás quedan como “No aplica”.
          </p>
          <Button onClick={() => navigate(`/tablero/${orgId}`)}>Ver tablero de cumplimiento</Button>
        </Card>
      )}
    </div>
  );
}

const input =
  'w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
