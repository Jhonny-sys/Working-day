import { pool, AppError } from '@horary/shared';

export async function listJornadas({ estado, fecha, fechaDesde, fechaHasta, filtroCupo }) {
  const conditions = [];
  const params = [];

  if (estado === 'activa') {
    conditions.push('activa = TRUE');
  } else if (estado === 'inactiva') {
    conditions.push('activa = FALSE');
  }

  if (fecha) {
    params.push(fecha);
    conditions.push(`fecha = $${params.length}`);
  }

  if (fechaDesde) {
    params.push(fechaDesde);
    conditions.push(`fecha >= $${params.length}`);
  }

  if (fechaHasta) {
    params.push(fechaHasta);
    conditions.push(`fecha <= $${params.length}`);
  }

  if (filtroCupo === 'con_cupo') {
    conditions.push('cupo_ocupado < cupo_total');
  } else if (filtroCupo === 'sin_cupo') {
    conditions.push('cupo_ocupado >= cupo_total');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT * FROM jornadas ${where} ORDER BY fecha ASC, created_at DESC`,
    params
  );

  return rows;
}

export async function getJornadaById(id) {
  const { rows } = await pool.query('SELECT * FROM jornadas WHERE id = $1', [id]);

  if (!rows[0]) {
    throw new AppError('Jornada no encontrada', 404, 'JORNADA_NOT_FOUND');
  }

  return rows[0];
}

export async function createJornada({ nombre, sede, fecha, cupoTotal, activa }) {
  const { rows } = await pool.query(
    `INSERT INTO jornadas (nombre, sede, fecha, cupo_total, activa)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, sede, fecha, cupoTotal, activa ?? true]
  );

  return rows[0];
}

export async function updateJornada(id, data) {
  const current = await getJornadaById(id);

  const nombre = data.nombre ?? current.nombre;
  const sede = data.sede ?? current.sede;
  const fecha = data.fecha ?? current.fecha;
  const cupoTotal = data.cupoTotal ?? current.cupo_total;
  const activa = data.activa ?? current.activa;

  if (cupoTotal < current.cupo_ocupado) {
    throw new AppError(
      `No se puede reducir el cupo total por debajo del cupo ya ocupado (${current.cupo_ocupado}).`,
      400,
      'CUPO_INVALIDO'
    );
  }

  const { rows } = await pool.query(
    `UPDATE jornadas
     SET nombre = $1, sede = $2, fecha = $3, cupo_total = $4, activa = $5
     WHERE id = $6
     RETURNING *`,
    [nombre, sede, fecha, cupoTotal, activa, id]
  );

  return rows[0];
}

export async function deactivateJornada(id) {
  await getJornadaById(id);

  const { rows } = await pool.query(
    `UPDATE jornadas SET activa = FALSE WHERE id = $1 RETURNING *`,
    [id]
  );

  return rows[0];
}
