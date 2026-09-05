import { getClient, AppError } from '@horary/shared';

export async function createInscripcion(jornadaId, data) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { rows: jornadaRows } = await client.query(
      `SELECT id, fecha, cupo_total, cupo_ocupado, activa,
              (fecha < CURRENT_DATE) AS fecha_cumplida
       FROM jornadas
       WHERE id = $1
       FOR UPDATE`,
      [jornadaId]
    );

    const jornada = jornadaRows[0];

    if (!jornada) {
      throw new AppError('Jornada no encontrada', 404, 'JORNADA_NOT_FOUND');
    }

    if (!jornada.activa) {
      throw new AppError('No se puede inscribir a una jornada inactiva', 409, 'JORNADA_INACTIVA');
    }

    if (jornada.fecha_cumplida) {
      throw new AppError(
        'No se puede inscribir a una jornada con fecha ya cumplida',
        409,
        'JORNADA_FECHA_CUMPLIDA'
      );
    }

    if (jornada.cupo_ocupado >= jornada.cupo_total) {
      throw new AppError(
        'La jornada no tiene cupo disponible',
        409,
        'SIN_CUPO'
      );
    }

    const { rows: duplicada } = await client.query(
      `SELECT id FROM inscripciones
       WHERE jornada_id = $1
         AND tipo_documento = $2
         AND numero_documento = $3
         AND estado = 'CONFIRMADA'`,
      [jornadaId, data.tipoDocumento, data.numeroDocumento]
    );

    if (duplicada.length > 0) {
      throw new AppError(
        'Esta persona ya tiene una inscripción confirmada en esta jornada',
        409,
        'INSCRIPCION_DUPLICADA'
      );
    }

    const { rows: inserted } = await client.query(
      `INSERT INTO inscripciones
         (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
       VALUES ($1, $2, $3, $4, $5, 'CONFIRMADA')
       RETURNING *`,
      [
        jornadaId,
        data.nombreCompleto,
        data.tipoDocumento,
        data.numeroDocumento,
        data.correo,
      ]
    );

    await client.query(
      `UPDATE jornadas SET cupo_ocupado = cupo_ocupado + 1 WHERE id = $1`,
      [jornadaId]
    );

    await client.query('COMMIT');
    return inserted[0];
  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505') {
      throw new AppError(
        'Esta persona ya tiene una inscripción confirmada en esta jornada',
        409,
        'INSCRIPCION_DUPLICADA'
      );
    }

    throw err;
  } finally {
    client.release();
  }
}

export async function listInscripcionesByJornada(jornadaId) {
  const client = await getClient();

  try {
    const { rows: jornada } = await client.query(
      'SELECT id FROM jornadas WHERE id = $1',
      [jornadaId]
    );

    if (!jornada[0]) {
      throw new AppError('Jornada no encontrada', 404, 'JORNADA_NOT_FOUND');
    }

    const { rows } = await client.query(
      `SELECT * FROM inscripciones
       WHERE jornada_id = $1 AND estado = 'CONFIRMADA'
       ORDER BY created_at ASC`,
      [jornadaId]
    );

    return rows;
  } finally {
    client.release();
  }
}

export async function cancelInscripcion(inscripcionId) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT * FROM inscripciones WHERE id = $1 FOR UPDATE`,
      [inscripcionId]
    );

    const inscripcion = rows[0];

    if (!inscripcion) {
      throw new AppError('Inscripción no encontrada', 404, 'INSCRIPCION_NOT_FOUND');
    }

    if (inscripcion.estado === 'CANCELADA') {
      throw new AppError('La inscripción ya está cancelada', 409, 'INSCRIPCION_YA_CANCELADA');
    }

    const { rows: updated } = await client.query(
      `UPDATE inscripciones SET estado = 'CANCELADA' WHERE id = $1 RETURNING *`,
      [inscripcionId]
    );

    await client.query(
      `UPDATE jornadas SET cupo_ocupado = cupo_ocupado - 1 WHERE id = $1`,
      [inscripcion.jornada_id]
    );

    await client.query('COMMIT');
    return updated[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
