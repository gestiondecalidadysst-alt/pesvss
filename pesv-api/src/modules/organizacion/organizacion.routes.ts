// Endpoints de organización: crear, clasificar nivel y ajustarlo manualmente.
import { Router } from 'express';
import { prisma } from '../../db';
import { calcularNivel, nivelEfectivo, nivelMayor } from '../../engine/clasificacion';
import { recalcularEstados, porcentajeCumplimiento } from '../../engine/estado';
import { registrar } from '../../common/audit';

export const organizacionRouter = Router();

// Crear organización y clasificar su nivel automáticamente.
organizacionRouter.post('/', async (req, res) => {
  const { nombre, nit, ciudad, misionalidad, numVehiculos, numConductores } = req.body;
  const nivelCalculado = calcularNivel({
    numVehiculos: numVehiculos ?? 0,
    numConductores: numConductores ?? 0,
    misionalidad: misionalidad ?? 'TRANSPORTE',
  });

  const org = await prisma.organizacion.create({
    data: { nombre, nit, ciudad, misionalidad, numVehiculos, numConductores, nivelCalculado },
  });
  await registrar({ orgId: org.id, accion: 'CREAR', entidad: 'Organizacion', entidadId: org.id, valorNuevo: org });
  const estados = await recalcularEstados(org.id);

  res.status(201).json({ organizacion: org, nivel: nivelEfectivo(org), estados });
});

// Recalcular el nivel tras un cambio de flota o conductores.
organizacionRouter.put('/:id/flota', async (req, res) => {
  const { numVehiculos, numConductores } = req.body;
  const antes = await prisma.organizacion.findUniqueOrThrow({ where: { id: req.params.id } });
  const nivelCalculado = calcularNivel({
    numVehiculos,
    numConductores,
    misionalidad: antes.misionalidad,
  });
  const org = await prisma.organizacion.update({
    where: { id: req.params.id },
    data: { numVehiculos, numConductores, nivelCalculado },
  });
  if (nivelCalculado !== antes.nivelCalculado) {
    await registrar({
      orgId: org.id, accion: 'CAMBIO_NIVEL', entidad: 'Organizacion', entidadId: org.id,
      valorAnterior: { nivel: antes.nivelCalculado }, valorNuevo: { nivel: nivelCalculado },
    });
  }
  const estados = await recalcularEstados(org.id);
  res.json({ organizacion: org, nivel: nivelEfectivo(org), estados });
});

// Ajuste manual a un nivel SUPERIOR (nunca por debajo del mínimo legal).
organizacionRouter.put('/:id/nivel-manual', async (req, res) => {
  const { nivelManual } = req.body as { nivelManual: 'BASICO' | 'ESTANDAR' | 'AVANZADO' };
  const org = await prisma.organizacion.findUniqueOrThrow({ where: { id: req.params.id } });
  const efectivoSolicitado = nivelMayor(org.nivelCalculado, nivelManual);
  if (efectivoSolicitado !== nivelManual) {
    return res.status(400).json({
      error: 'No se puede fijar un nivel inferior al que exige la flota.',
      nivelMinimo: org.nivelCalculado,
    });
  }
  const actualizada = await prisma.organizacion.update({
    where: { id: org.id }, data: { nivelManual },
  });
  await registrar({
    orgId: org.id, accion: 'CAMBIO_NIVEL_MANUAL', entidad: 'Organizacion', entidadId: org.id,
    valorAnterior: { nivelManual: org.nivelManual }, valorNuevo: { nivelManual },
  });
  const estados = await recalcularEstados(org.id);
  res.json({ organizacion: actualizada, nivel: nivelEfectivo(actualizada), estados });
});

// Resumen de cumplimiento (para el tablero).
organizacionRouter.get('/:id/resumen', async (req, res) => {
  const org = await prisma.organizacion.findUniqueOrThrow({ where: { id: req.params.id } });
  const estados = await recalcularEstados(org.id);
  res.json({
    nivel: nivelEfectivo(org),
    porcentaje: porcentajeCumplimiento(estados),
    estados,
  });
});
