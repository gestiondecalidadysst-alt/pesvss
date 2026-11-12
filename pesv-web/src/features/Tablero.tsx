// Tablero de cumplimiento: la pantalla que abre un gerente o un auditor.
// Muestra el nivel, el porcentaje global y el estado de cada dominio.

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { DOMINIOS, ESTADO_META, NIVEL_LABEL } from '../lib/dominios';
import { Card, MetricCard, Progress } from '../components/ui';
import type { Resumen, Requisito, EstadoRequisito } from '../types';

export function Tablero() {
  const { orgId = '' } = useParams();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [requisitos, setRequisitos] = useState<Requisito[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.resumen(orgId), api.requisitos()])
      .then(([r, reqs]) => {
        setResumen(r);
        setRequisitos(reqs);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar.'));
  }, [orgId]);

  const porPaso = useMemo(() => new Map(requisitos.map((r) => [r.paso, r])), [requisitos]);

  if (error) return <div className="p-8 text-estado-vencido">{error}</div>;
  if (!resumen) return <div className="p-8 text-slate-500">Cargando…</div>;

  const estados = resumen.estados;
  const aplicables = Object.values(estados).filter((e) => e !== 'NO_APLICA');
  const alDia = Object.values(estados).filter((e) => e === 'CUMPLE').length;
  const vencidas = Object.values(estados).filter((e) => e === 'VENCIDO').length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold m-0">Tablero de cumplimiento</h1>
          <p className="text-sm text-slate-500 m-0">Nivel {NIVEL_LABEL[resumen.nivel]}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <MetricCard label="Cumplimiento" value={`${resumen.porcentaje}%`} />
        <MetricCard label="Requisitos al día" value={`${alDia} / ${aplicables.length}`} />
        <MetricCard label="Vencidas" value={vencidas} danger={vencidas > 0} />
        <MetricCard label="Pasos aplicables" value={aplicables.length} />
      </div>

      <p className="text-base font-medium mb-3">Mapa de cumplimiento por dominio</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DOMINIOS.map((d) => {
          const pasos = d.pasos.filter((p) => estados[p] !== 'NO_APLICA');
          const cumplen = pasos.filter((p) => estados[p] === 'CUMPLE').length;
          const pct = pasos.length ? (cumplen / pasos.length) * 100 : 0;
          return (
            <Card key={d.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{d.nombre}</span>
                <span className="text-xs text-slate-500">
                  {cumplen} de {pasos.length}
                </span>
              </div>
              <Progress pct={pct} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.pasos.map((p) => (
                  <PasoChip key={p} paso={p} nombre={porPaso.get(p)?.nombre ?? `Paso ${p}`} estado={estados[p]} />
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Leyenda />
    </div>
  );
}

function PasoChip({ paso, nombre, estado }: { paso: number; nombre: string; estado: EstadoRequisito }) {
  const m = ESTADO_META[estado ?? 'PENDIENTE'];
  return (
    <span
      title={`Paso ${paso} · ${nombre}`}
      className="text-xs px-2 py-0.5 rounded-md font-mono"
      style={{ background: m.bg, color: m.color }}
    >
      {paso}
    </span>
  );
}

function Leyenda() {
  const items: EstadoRequisito[] = ['CUMPLE', 'EN_PROGRESO', 'VENCIDO', 'PENDIENTE', 'NO_APLICA'];
  return (
    <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-500">
      {items.map((e) => (
        <span key={e} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: ESTADO_META[e].color }} />
          {ESTADO_META[e].label}
        </span>
      ))}
    </div>
  );
}
