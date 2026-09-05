import { pool } from '@horary/shared';

export async function getMetricas() {
  const { rows: jornadasActivas } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM jornadas WHERE activa = TRUE`
  );

  const { rows: inscripciones } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM inscripciones i
     INNER JOIN jornadas j ON j.id = i.jornada_id
     WHERE i.estado = 'CONFIRMADA' AND j.activa = TRUE`
  );

  const { rows: cupos } = await pool.query(
    `SELECT
       COALESCE(SUM(cupo_total), 0)::int AS cupo_total,
       COALESCE(SUM(cupo_ocupado), 0)::int AS cupo_ocupado
     FROM jornadas
     WHERE activa = TRUE`
  );

  const { rows: ultima } = await pool.query(
    `SELECT i.created_at FROM inscripciones i
     INNER JOIN jornadas j ON j.id = i.jornada_id
     WHERE i.estado = 'CONFIRMADA' AND j.activa = TRUE
     ORDER BY created_at DESC
     LIMIT 1`
  );

  const cupoTotal = cupos[0].cupo_total;
  const cupoOcupado = cupos[0].cupo_ocupado;
  const porcentajeOcupacionGlobal =
    cupoTotal === 0 ? 0 : Number(((cupoOcupado / cupoTotal) * 100).toFixed(2));

  return {
    totalJornadasActivas: jornadasActivas[0].total,
    totalInscripcionesConfirmadas: inscripciones[0].total,
    porcentajeOcupacionGlobal,
    ultimaInscripcionRegistrada: ultima[0]?.created_at ?? null,
  };
}
