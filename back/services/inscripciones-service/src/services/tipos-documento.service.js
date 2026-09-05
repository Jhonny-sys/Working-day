import { pool } from '@horary/shared';

export async function listTiposDocumento() {
  const { rows } = await pool.query(
    `SELECT codigo, nombre, categoria FROM tipos_documento WHERE activo = TRUE ORDER BY categoria ASC, id ASC`
  );
  return rows;
}
