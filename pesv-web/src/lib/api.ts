// Cliente de la API PESV. El frontend solo conoce estos endpoints;
// nunca asume cómo guarda los datos el backend.

import type { RespuestaOrg, Resumen, Requisito, Misionalidad, DetalleRequisito } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error(cuerpo.error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  crearOrganizacion(data: {
    nombre: string;
    misionalidad: Misionalidad;
    numVehiculos: number;
    numConductores: number;
  }): Promise<RespuestaOrg> {
    return req('/organizaciones', { method: 'POST', body: JSON.stringify(data) });
  },

  resumen(orgId: string): Promise<Resumen> {
    return req(`/organizaciones/${orgId}/resumen`);
  },

  requisitos(): Promise<Requisito[]> {
    return req('/requisitos');
  },

  detalleRequisito(paso: number, orgId: string): Promise<DetalleRequisito> {
    return req(`/requisitos/${paso}/org/${orgId}`);
  },
};
