// Endpoints del catálogo de requisitos y del grafo de dependencias.
import { Router } from 'express';
import { prisma } from '../../db';

export const requisitosRouter = Router();

// Catálogo completo con sus entradas y salidas (el grafo).
requisitosRouter.get('/', async (_req, res) => {
  const requisitos = await prisma.requisito.findMany({
    orderBy: { paso: 'asc' },
    include: {
      entradas: { select: { origenPaso: true, tipoDato: true } },
      salidas: { select: { destinoPaso: true, tipoDato: true } },
    },
  });
  res.json(requisitos);
});

// Detalle de un requisito para una organización: su estado y sus
// entradas/salidas (la pantalla de detalle del mockup).
requisitosRouter.get('/:paso/org/:orgId', async (req, res) => {
  const paso = Number(req.params.paso);
  const [requisito, estado, evidencias] = await Promise.all([
    prisma.requisito.findUniqueOrThrow({
      where: { paso },
      include: { entradas: true, salidas: true },
    }),
    prisma.requisitoEstado.findUnique({
      where: { orgId_paso: { orgId: req.params.orgId, paso } },
    }),
    prisma.evidencia.findMany({
      where: { orgId: req.params.orgId, paso }, orderBy: { version: 'desc' },
    }),
  ]);
  res.json({ requisito, estado, evidencias });
});
