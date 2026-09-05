import * as service from '../services/tipos-documento.service.js';

export async function listTiposDocumento(_req, res) {
  res.json(await service.listTiposDocumento());
}
