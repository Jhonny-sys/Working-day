import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { env, errorHandler } from '@horary/shared';
import jornadasRoutes from './routes/jornadas.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = env.jornadas.port;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ service: 'jornadas', status: 'ok' }));
app.use('/jornadas', jornadasRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[jornadas-service] Puerto ${PORT}`);
});
