-- 1. Inscripciones confirmadas de una jornada, ordenadas por fecha de registro
-- Parámetro: :jornada_id (UUID)
SELECT
  i.id,
  i.nombre_completo,
  i.tipo_documento,
  i.numero_documento,
  i.correo,
  i.estado,
  i.created_at
FROM inscripciones i
WHERE i.jornada_id = :jornada_id
  AND i.estado = 'CONFIRMADA'
ORDER BY i.created_at ASC;

-- 2. Conteo de inscripciones agrupadas por estado y por jornada
SELECT
  j.id AS jornada_id,
  j.nombre AS jornada_nombre,
  i.estado,
  COUNT(*) AS total
FROM jornadas j
LEFT JOIN inscripciones i ON i.jornada_id = j.id
GROUP BY j.id, j.nombre, i.estado
ORDER BY j.nombre, i.estado;

-- 3. Ocupación por sede en un rango de fechas
-- Parámetros: :fecha_desde (DATE), :fecha_hasta (DATE)
SELECT
  j.sede,
  COALESCE(SUM(j.cupo_total), 0) AS cupo_publicado,
  COALESCE(SUM(j.cupo_ocupado), 0) AS cupo_ocupado,
  COALESCE(SUM(j.cupo_total - j.cupo_ocupado), 0) AS cupo_disponible,
  CASE
    WHEN COALESCE(SUM(j.cupo_total), 0) = 0 THEN 0
    ELSE ROUND(
      (COALESCE(SUM(j.cupo_ocupado), 0)::NUMERIC / SUM(j.cupo_total)::NUMERIC) * 100,
      2
    )
  END AS porcentaje_ocupacion
FROM jornadas j
WHERE j.fecha BETWEEN :fecha_desde AND :fecha_hasta
GROUP BY j.sede
ORDER BY j.sede;
