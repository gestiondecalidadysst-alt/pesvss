// Endpoint de carga de evidencias.
// Calcula la huella SHA-256 del archivo, guarda la evidencia con su versión,
// registra el evento en auditoría y recalcula el estado del requisito.

import { Router } from 'express';
import { createHash } from 'crypto';
import multer from 'multer';
import { prisma } from '../../db';
import { registrar } from '../../common/audit';
import { recalcularEstados } from '../../engine/estado';

export const evidenciasRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

evidenciasRouter.post('/', upload.single('archivo'), async (req, res) => {
  const { orgId, paso, firmantePor, vigenteHasta } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo.' });

  const hashSha256 = createHash('sha256').update(req.file.buffer).digest('hex');

  // La versión sube respecto a la última evidencia del mismo paso.
  const ultima = await prisma.evidencia.findFirst({
    where: { orgId, paso: Number(paso) }, orderBy: { version: 'desc' },
  });
  const version = (ultima?.version ?? 0) + 1;

  // En producción, el buffer se sube a S3/MinIO y aquí se guarda su ruta.
  const rutaArchivo = `pesv/${orgId}/paso_${paso}_v${version}_${Date.now()}`;

  const evidencia = await prisma.evidencia.create({
    data: {
      orgId,
      paso: Number(paso),
      nombreArchivo: req.file.originalname,
      rutaArchivo,
      hashSha256,
      version,
      firmantePor,
      firmadoAt: new Date(),
      vigenteHasta: vigenteHasta ? new Date(vigenteHasta) : null,
    },
  });

  await registrar({
    orgId, accion: 'CREAR', entidad: 'Evidencia', entidadId: evidencia.id,
    valorNuevo: { paso: Number(paso), hashSha256, version },
  });

  const estados = await recalcularEstados(orgId);
  res.status(201).json({ evidencia, estados });
});
