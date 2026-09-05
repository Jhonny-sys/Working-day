import * as service from '../services/inscripcion.service.js';

function mapInscripcion(row) {
  return {
    id: row.id,
    jornadaId: row.jornada_id,
    nombreCompleto: row.nombre_completo,
    tipoDocumento: row.tipo_documento,
    numeroDocumento: row.numero_documento,
    correo: row.correo,
    estado: row.estado,
    createdAt: row.created_at,
  };
}

export async function createInscripcion(req, res) {
  const row = await service.createInscripcion(req.params.id, req.body);
  res.status(201).json(mapInscripcion(row));
}

export async function listInscripciones(req, res) {
  const rows = await service.listInscripcionesByJornada(req.params.id);
  res.json(rows.map(mapInscripcion));
}

export async function cancelInscripcion(req, res) {
  const row = await service.cancelInscripcion(req.params.id);
  res.json(mapInscripcion(row));
}
