// Motor de estado derivado.
// El estado de un requisito NO lo marca una persona: se calcula a partir
// del nivel de la empresa, de las evidencias vigentes y de que sus
// dependencias (entradas) estén cumplidas.

import { PrismaClient, EstadoRequisito, NivelPesv } from '@prisma/client';
import { nivelAlcanza, nivelEfectivo } from './clasificacion';

const prisma = new PrismaClient();

/**
 * Recalcula el estado de TODOS los requisitos de una organización y lo
 * persiste. Devuelve el mapa paso -> estado.
 *
 * Reglas:
 *  - NO_APLICA  : el requisito aplica a un nivel superior al de la empresa.
 *  - CUMPLE     : tiene evidencia vigente Y todas sus entradas cumplen.
 *  - VENCIDO    : tenía evidencia pero ya venció.
 *  - EN_PROGRESO: hay evidencia pero falta alguna entrada, o faltan entradas.
 *  - PENDIENTE  : no se ha trabajado nada.
 */
export async function recalcularEstados(orgId: string): Promise<Record<number, EstadoRequisito>> {
  const org = await prisma.organizacion.findUniqueOrThrow({ where: { id: orgId } });
  const nivel: NivelPesv = nivelEfectivo(org);

  const requisitos = await prisma.requisito.findMany({ include: { entradas: true } });
  const evidencias = await prisma.evidencia.findMany({ where: { orgId } });

  const ahora = new Date();
  const resultado: Record<number, EstadoRequisito> = {};

  // Primera pasada: estado base por evidencia y aplicabilidad.
  for (const req of requisitos) {
    if (!nivelAlcanza(nivel, req.nivelMinimo)) {
      resultado[req.paso] = 'NO_APLICA';
      continue;
    }
    const evs = evidencias.filter((e) => e.paso === req.paso);
    if (evs.length === 0) {
      resultado[req.paso] = 'PENDIENTE';
    } else if (evs.every((e) => e.vigenteHasta && e.vigenteHasta < ahora)) {
      resultado[req.paso] = 'VENCIDO';
    } else {
      resultado[req.paso] = 'TIENE_EVIDENCIA' as EstadoRequisito; // marcador temporal
    }
  }

  // Segunda pasada: resolver dependencias (una entrada no cumplida baja a EN_PROGRESO).
  for (const req of requisitos) {
    if (resultado[req.paso] === 'NO_APLICA') continue;
    const entradasAplicables = req.entradas.filter(
      (dep) => resultado[dep.origenPaso] !== 'NO_APLICA',
    );
    const todasCumplen = entradasAplicables.every(
      (dep) => resultado[dep.origenPaso] === ('TIENE_EVIDENCIA' as EstadoRequisito),
    );

    if (resultado[req.paso] === ('TIENE_EVIDENCIA' as EstadoRequisito)) {
      resultado[req.paso] = todasCumplen ? 'CUMPLE' : 'EN_PROGRESO';
    } else if (resultado[req.paso] === 'PENDIENTE' && entradasAplicables.some(
      (dep) => resultado[dep.origenPaso] === 'CUMPLE' || resultado[dep.origenPaso] === ('TIENE_EVIDENCIA' as EstadoRequisito),
    )) {
      resultado[req.paso] = 'EN_PROGRESO';
    }
  }

  // Limpiar marcador temporal que haya quedado sin dependientes.
  for (const paso of Object.keys(resultado).map(Number)) {
    if (resultado[paso] === ('TIENE_EVIDENCIA' as EstadoRequisito)) {
      resultado[paso] = 'CUMPLE';
    }
  }

  // Persistir.
  for (const paso of Object.keys(resultado).map(Number)) {
    await prisma.requisitoEstado.upsert({
      where: { orgId_paso: { orgId, paso } },
      update: { estado: resultado[paso], calculadoAt: ahora },
      create: { orgId, paso, estado: resultado[paso] },
    });
  }

  return resultado;
}

/** Porcentaje de cumplimiento: cumplen / (aplicables). */
export function porcentajeCumplimiento(estados: Record<number, EstadoRequisito>): number {
  const aplicables = Object.values(estados).filter((e) => e !== 'NO_APLICA');
  if (aplicables.length === 0) return 0;
  const cumplen = aplicables.filter((e) => e === 'CUMPLE').length;
  return Math.round((cumplen / aplicables.length) * 100);
}
