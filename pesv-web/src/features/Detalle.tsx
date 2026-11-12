// Detalle de un requisito: el corazón del sistema. Muestra las entradas
// (de qué pasos recibe datos), las salidas (a qué pasos alimenta), el
// estado calculado y las evidencias con su huella.

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, StatusPill } from '../components/ui';
import type { DetalleRequisito, Requisito } from '../types';

export function Detalle() {
  const { orgId = '', paso = '' } = useParams();
  const [data, setData] = useState<DetalleRequisito | null>(null);
  const [nombres, setNombres] = useState<Map<number, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.detalleRequisito(Number(paso), orgId), api.requisitos()])
      .then(([d, reqs]: [DetalleRequisito, Requisito[]]) => {
        setData(d);
        setNombres(new Map(reqs.map((r) => [r.paso, r.nombre])));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar.'));
  }, [orgId, paso]);

  const estado = data?.estado?.estado ?? 'PENDIENTE';
  const evidenciaVigente = useMemo(() => {
    const ev = data?.evidencias?.[0];
    if (!ev) return null;
    const vencida = ev.vigenteHasta && new Date(ev.vigenteHasta) < new Date();
    return { ...ev, vencida };
  }, [data]);

  if (error) return <div className="p-8 text-estado-vencido">{error}</div>;
  if (!data) return <div className="p-8 text-slate-500">Cargando…</div>;

  const { requisito } = data;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to={`/tablero/${orgId}`} className="text-sm text-info no-underline">
        ← Volver al tablero
      </Link>

      <div className="flex items-start justify-between mt-3 mb-1">
        <div>
          <p className="text-xs text-slate-400 m-0">Paso {requisito.paso}</p>
          <h1 className="text-xl font-semibold m-0">{requisito.nombre}</h1>
        </div>
        <StatusPill estado={estado} />
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Estado calculado automáticamente a partir de las entradas y la evidencia.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <ListaFlujo
          titulo="Entradas"
          vacio="No recibe datos de otros pasos."
          items={requisito.entradas.map((e) => ({
            paso: e.origenPaso,
            nombre: nombres.get(e.origenPaso) ?? `Paso ${e.origenPaso}`,
            dato: e.tipoDato,
          }))}
          direccion="in"
        />
        <ListaFlujo
          titulo="Salidas"
          vacio="No alimenta otros pasos."
          items={requisito.salidas.map((s) => ({
            paso: s.destinoPaso,
            nombre: nombres.get(s.destinoPaso) ?? `Paso ${s.destinoPaso}`,
            dato: s.tipoDato,
          }))}
          direccion="out"
        />
      </div>

      <p className="text-sm font-medium mb-2">Evidencia</p>
      <Card className="mb-5 !p-0">
        {evidenciaVigente ? (
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm m-0">{evidenciaVigente.nombreArchivo}</p>
              <p className="text-xs text-slate-400 font-mono m-0">
                SHA-256 {evidenciaVigente.hashSha256.slice(0, 8)}… · v{evidenciaVigente.version}
              </p>
            </div>
            <StatusPill estado={evidenciaVigente.vencida ? 'VENCIDO' : 'CUMPLE'} />
          </div>
        ) : (
          <p className="text-sm text-slate-400 p-3 m-0">No hay evidencias registradas para este paso.</p>
        )}
      </Card>
    </div>
  );
}

function ListaFlujo({
  titulo,
  vacio,
  items,
  direccion,
}: {
  titulo: string;
  vacio: string;
  items: { paso: number; nombre: string; dato: string }[];
  direccion: 'in' | 'out';
}) {
  return (
    <div className="bg-slate-100 rounded-lg p-3.5">
      <p className="text-xs font-medium text-slate-500 mb-2">{titulo}</p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 m-0">{vacio}</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={`${it.paso}-${it.dato}`} className="text-sm flex items-start gap-1.5">
              <span className="text-slate-400">{direccion === 'in' ? '↙' : '→'}</span>
              <span>
                <span className="text-slate-700">{it.dato}</span>
                <span className="text-slate-400"> · paso {it.paso}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
