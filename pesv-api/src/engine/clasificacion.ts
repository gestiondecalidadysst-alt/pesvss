// Motor de clasificación de nivel PESV.
// Calcula el nivel (BÁSICO, ESTÁNDAR, AVANZADO) a partir del número de
// vehículos, de conductores y de la misionalidad de la empresa.
//
// IMPORTANTE: los umbrales son parametrizables y están basados en la
// Resolución 40595 de 2022, que distingue entre empresas de transporte y
// de misionalidad diferente. Validar los números exactos contra el texto
// oficial antes de usarlos en producción.

import { NivelPesv, Misionalidad } from '@prisma/client';

export interface UmbralesNivel {
  // Límite superior de vehículos/conductores para seguir siendo BÁSICO.
  maxBasico: { vehiculos: number; conductores: number };
  // Límite superior para ESTÁNDAR. Por encima de esto: AVANZADO.
  maxEstandar: { vehiculos: number; conductores: number };
}

// Umbrales por defecto (PENDIENTE DE VALIDAR contra la norma).
export const UMBRALES: Record<Misionalidad, UmbralesNivel> = {
  TRANSPORTE: {
    maxBasico: { vehiculos: 10, conductores: 19 },
    maxEstandar: { vehiculos: 49, conductores: 49 },
  },
  OTRA: {
    maxBasico: { vehiculos: 10, conductores: 19 },
    maxEstandar: { vehiculos: 49, conductores: 49 },
  },
};

const ORDEN: NivelPesv[] = ['BASICO', 'ESTANDAR', 'AVANZADO'];

/** Devuelve true si `a` es un nivel mayor o igual que `b`. */
export function nivelAlcanza(a: NivelPesv, b: NivelPesv): boolean {
  return ORDEN.indexOf(a) >= ORDEN.indexOf(b);
}

/** El mayor de dos niveles (usado para el ajuste manual a un nivel superior). */
export function nivelMayor(a: NivelPesv, b: NivelPesv): NivelPesv {
  return ORDEN.indexOf(a) >= ORDEN.indexOf(b) ? a : b;
}

/**
 * Calcula el nivel que exige la norma según flota y conductores.
 * El nivel sube con el mayor de los dos factores (vehículos o conductores).
 */
export function calcularNivel(input: {
  numVehiculos: number;
  numConductores: number;
  misionalidad: Misionalidad;
}): NivelPesv {
  const u = UMBRALES[input.misionalidad];
  const porVehiculos = clasificarPorConteo(input.numVehiculos, u.maxBasico.vehiculos, u.maxEstandar.vehiculos);
  const porConductores = clasificarPorConteo(input.numConductores, u.maxBasico.conductores, u.maxEstandar.conductores);
  return nivelMayor(porVehiculos, porConductores);
}

function clasificarPorConteo(valor: number, maxBasico: number, maxEstandar: number): NivelPesv {
  if (valor <= maxBasico) return 'BASICO';
  if (valor <= maxEstandar) return 'ESTANDAR';
  return 'AVANZADO';
}

/**
 * Nivel efectivo de una organización: el calculado por la norma, elevado
 * al ajuste manual si lo hay. Nunca baja del mínimo legal.
 */
export function nivelEfectivo(org: { nivelCalculado: NivelPesv; nivelManual: NivelPesv | null }): NivelPesv {
  if (!org.nivelManual) return org.nivelCalculado;
  return nivelMayor(org.nivelCalculado, org.nivelManual);
}
