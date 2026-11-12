// Seed del catálogo PESV: los 24 pasos de la Resolución 40595 de 2022,
// su nivel mínimo de aplicación y las aristas de entradas/salidas
// (qué paso alimenta a cuál).
//
// Nota: la aplicabilidad por nivel está basada en la Resolución 40595.
// Validar contra el texto oficial antes de producción.

import { PrismaClient, NivelPesv } from '@prisma/client';

const prisma = new PrismaClient();

// paso, nombre, nivel mínimo desde el que aplica
const REQUISITOS: [number, string, NivelPesv][] = [
  [1, 'Líder del diseño e implementación del PESV', 'BASICO'],
  [2, 'Comité de seguridad vial', 'ESTANDAR'],
  [3, 'Política de seguridad vial', 'BASICO'],
  [4, 'Liderazgo, compromiso y corresponsabilidad', 'BASICO'],
  [5, 'Diagnóstico', 'BASICO'],
  [6, 'Caracterización, evaluación y control de riesgos (IPVER)', 'BASICO'],
  [7, 'Objetivos y metas del PESV', 'BASICO'],
  [8, 'Programas de gestión de riesgos críticos', 'BASICO'],
  [9, 'Plan anual de trabajo', 'BASICO'],
  [10, 'Competencia y plan anual de formación', 'BASICO'],
  [11, 'Responsabilidad y comportamiento seguro', 'AVANZADO'],
  [12, 'Preparación y respuesta ante emergencias viales', 'BASICO'],
  [13, 'Investigación interna de siniestros viales', 'ESTANDAR'],
  [14, 'Vías seguras administradas por la organización', 'BASICO'],
  [15, 'Planificación de desplazamientos laborales', 'BASICO'],
  [16, 'Inspección de vehículos y equipos', 'BASICO'],
  [17, 'Mantenimiento y control de vehículos seguros', 'BASICO'],
  [18, 'Gestión del cambio y de contratistas', 'ESTANDAR'],
  [19, 'Archivo y retención documental', 'ESTANDAR'],
  [20, 'Indicadores y reporte de autogestión PESV', 'BASICO'],
  [21, 'Registro y análisis estadístico de siniestros', 'AVANZADO'],
  [22, 'Auditoría anual', 'BASICO'],
  [23, 'Mejora continua, acciones preventivas y correctivas', 'BASICO'],
  [24, 'Mecanismos de comunicación y participación', 'BASICO'],
];

// Aristas del grafo: [pasoOrigen, pasoDestino, tipoDato]
// "el origen produce <tipoDato>, que es entrada del destino".
const DEPENDENCIAS: [number, number, string][] = [
  [3, 7, 'marco de la política'],
  [5, 6, 'colaboradores y flota'],
  [5, 10, 'colaboradores y cargos'],
  [6, 8, 'riesgos críticos'],
  [6, 9, 'controles y medidas'],
  [6, 20, 'variación de riesgos'],
  [8, 9, 'actividades de los programas'],
  [7, 20, 'metas'],
  [9, 20, 'cumplimiento del plan'],
  [10, 11, 'roles y competencias'],
  [16, 20, 'inspecciones'],
  [17, 20, 'mantenimientos'],
  [13, 6, 'causas de siniestros'],
  [13, 20, 'siniestralidad y costos'],
  [18, 6, 'cambios a evaluar'],
  [20, 23, 'KPIs'],
  [20, 22, 'resultados para auditar'],
  [22, 23, 'hallazgos de auditoría'],
  [23, 9, 'planes de acción'], // retroalimentación: no conformidad -> plan
];

async function main() {
  for (const [paso, nombre, nivelMinimo] of REQUISITOS) {
    await prisma.requisito.upsert({
      where: { paso },
      update: { nombre, nivelMinimo },
      create: { paso, nombre, nivelMinimo },
    });
  }

  for (const [origenPaso, destinoPaso, tipoDato] of DEPENDENCIAS) {
    await prisma.requisitoDependencia.upsert({
      where: { origenPaso_destinoPaso: { origenPaso, destinoPaso } },
      update: { tipoDato },
      create: { origenPaso, destinoPaso, tipoDato },
    });
  }

  console.log(
    `Catálogo cargado: ${REQUISITOS.length} requisitos, ${DEPENDENCIAS.length} dependencias.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
