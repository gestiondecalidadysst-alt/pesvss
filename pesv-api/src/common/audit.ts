// Registro de auditoría encadenado por hash.
// Cada evento guarda el hash del evento anterior de la misma organización,
// de modo que alterar o borrar un evento pasado rompe la cadena.

import { createHash } from 'crypto';
import { prisma } from '../db';

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export interface EventoAuditoria {
  orgId: string;
  usuarioId?: string;
  accion: string; // "CREAR" | "EDITAR" | "CAMBIO_NIVEL" | ...
  entidad: string; // "Evidencia" | "Organizacion" | ...
  entidadId?: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
}

export async function registrar(evento: EventoAuditoria) {
  const previo = await prisma.auditLog.findFirst({
    where: { orgId: evento.orgId },
    orderBy: { createdAt: 'desc' },
  });
  const hashPrevio = previo?.hash ?? null;

  const cuerpo = JSON.stringify({
    orgId: evento.orgId,
    usuarioId: evento.usuarioId ?? null,
    accion: evento.accion,
    entidad: evento.entidad,
    entidadId: evento.entidadId ?? null,
    valorAnterior: evento.valorAnterior ?? null,
    valorNuevo: evento.valorNuevo ?? null,
    hashPrevio,
  });
  const hash = sha256((hashPrevio ?? '') + cuerpo);

  return prisma.auditLog.create({
    data: {
      orgId: evento.orgId,
      usuarioId: evento.usuarioId,
      accion: evento.accion,
      entidad: evento.entidad,
      entidadId: evento.entidadId,
      valorAnterior: evento.valorAnterior as any,
      valorNuevo: evento.valorNuevo as any,
      hashPrevio,
      hash,
    },
  });
}

/** Verifica que la cadena de auditoría de una organización no fue alterada. */
export async function verificarCadena(orgId: string): Promise<{ integra: boolean; rotoEn?: string }> {
  const eventos = await prisma.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: 'asc' },
  });
  let hashPrevio: string | null = null;
  for (const e of eventos) {
    const cuerpo = JSON.stringify({
      orgId: e.orgId,
      usuarioId: e.usuarioId ?? null,
      accion: e.accion,
      entidad: e.entidad,
      entidadId: e.entidadId ?? null,
      valorAnterior: e.valorAnterior ?? null,
      valorNuevo: e.valorNuevo ?? null,
      hashPrevio,
    });
    const esperado = sha256((hashPrevio ?? '') + cuerpo);
    if (esperado !== e.hash) return { integra: false, rotoEn: e.id };
    hashPrevio = e.hash;
  }
  return { integra: true };
}
