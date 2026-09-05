-- Esquema inicial: jornadas e inscripciones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE jornadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  sede VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  cupo_total INTEGER NOT NULL CHECK (cupo_total >= 0),
  cupo_ocupado INTEGER NOT NULL DEFAULT 0 CHECK (cupo_ocupado >= 0),
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cupo_ocupado_lte_total CHECK (cupo_ocupado <= cupo_total)
);

CREATE TABLE inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id UUID NOT NULL REFERENCES jornadas(id) ON DELETE RESTRICT,
  nombre_completo VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(20) NOT NULL,
  numero_documento VARCHAR(50) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA'
    CHECK (estado IN ('CONFIRMADA', 'CANCELADA')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Regla: una persona no puede tener dos inscripciones CONFIRMADAS en la misma jornada
CREATE UNIQUE INDEX idx_inscripciones_unica_confirmada
  ON inscripciones (jornada_id, tipo_documento, numero_documento)
  WHERE estado = 'CONFIRMADA';

-- Índice 1: listar inscripciones confirmadas de una jornada ordenadas por fecha
CREATE INDEX idx_inscripciones_jornada_fecha
  ON inscripciones (jornada_id, created_at DESC)
  WHERE estado = 'CONFIRMADA';

-- Índice 2: filtrar jornadas por estado activo y rango de fechas (listado y métricas)
CREATE INDEX idx_jornadas_activa_fecha
  ON jornadas (activa, fecha);
