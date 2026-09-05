import * as service from '../services/metricas.service.js';

export async function getMetricas(_req, res) {
  const metricas = await service.getMetricas();
  res.json(metricas);
}
