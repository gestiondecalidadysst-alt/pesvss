// Punto de entrada de la API PESV (Fase 1).
import express from 'express';
import { organizacionRouter } from './modules/organizacion/organizacion.routes';
import { requisitosRouter } from './modules/requisitos/requisitos.routes';
import { evidenciasRouter } from './modules/evidencias/evidencias.routes';
import { verificarCadena } from './common/audit';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/organizaciones', organizacionRouter);
app.use('/requisitos', requisitosRouter);
app.use('/evidencias', evidenciasRouter);

// Verificación de integridad de la auditoría de una organización.
app.get('/auditoria/:orgId/verificar', async (req, res) => {
  res.json(await verificarCadena(req.params.orgId));
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`pesv-api escuchando en http://localhost:${PORT}`));
