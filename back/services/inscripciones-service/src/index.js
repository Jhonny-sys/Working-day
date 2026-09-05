import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { env, errorHandler } from '@horary/shared';
import inscripcionesRoutes from './routes/inscripciones.routes.js';
import metricasRoutes from './routes/metricas.routes.js';
import tiposDocumentoRoutes from './routes/tipos-documento.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = env.inscripciones.port;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ service: 'inscripciones', status: 'ok' }));
app.use('/jornadas', inscripcionesRoutes.jornadasRouter);
app.use('/inscripciones', inscripcionesRoutes.inscripcionesRouter);
app.use('/metricas', metricasRoutes);
app.use('/tipos-documento', tiposDocumentoRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[inscripciones-service] Puerto ${PORT}`);
});
