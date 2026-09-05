import * as service from '../services/jornadas.service.js';

function mapJornada(row) {
  const fecha = row.fecha instanceof Date ? row.fecha.toISOString().slice(0, 10) : String(row.fecha).slice(0, 10);
  return {
    id: row.id,
    nombre: row.nombre,
    sede: row.sede,
    fecha,
    cupoTotal: row.cupo_total,
    cupoOcupado: row.cupo_ocupado,
    cupoDisponible: row.cupo_total - row.cupo_ocupado,
    activa: row.activa,
    createdAt: row.created_at,
  };
}

export async function listJornadas(req, res) {
  const rows = await service.listJornadas(req.query);
  res.json(rows.map(mapJornada));
}

export async function getJornada(req, res) {
  const row = await service.getJornadaById(req.params.id);
  res.json(mapJornada(row));
}

export async function createJornada(req, res) {
  const row = await service.createJornada(req.body);
  res.status(201).json(mapJornada(row));
}

export async function updateJornada(req, res) {
  const row = await service.updateJornada(req.params.id, req.body);
  res.json(mapJornada(row));
}

export async function deleteJornada(req, res) {
  const row = await service.deactivateJornada(req.params.id);
  res.json(mapJornada(row));
}
