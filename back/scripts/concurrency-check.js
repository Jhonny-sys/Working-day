import { getClient, pool } from '@horary/shared';

const TOTAL_REQUESTS = 10;
const LIMITED_CAPACITY = 3;

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

async function createJornada() {
  const { rows } = await pool.query(
    `INSERT INTO jornadas (nombre, sede, fecha, cupo_total, activa)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa`,
    ['Verificación concurrencia', 'Sede técnica', futureDate(), LIMITED_CAPACITY]
  );
  return rows[0];
}

async function attemptInscription(jornadaId, index) {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT id, cupo_total, cupo_ocupado, activa, (fecha < CURRENT_DATE) AS fecha_cumplida
       FROM jornadas WHERE id = $1 FOR UPDATE`,
      [jornadaId]
    );
    const jornada = rows[0];

    if (!jornada.activa) throw new Error('JORNADA_INACTIVA');
    if (jornada.fecha_cumplida) throw new Error('JORNADA_FECHA_CUMPLIDA');
    if (jornada.cupo_ocupado >= jornada.cupo_total) throw new Error('SIN_CUPO');

    await client.query(
      `INSERT INTO inscripciones
        (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
       VALUES ($1, $2, 'CC', $3, $4, 'CONFIRMADA')`,
      [jornadaId, `Persona concurrencia ${index}`, `90000000${index}`, `concurrencia${index}@example.com`]
    );
    await client.query('UPDATE jornadas SET cupo_ocupado = cupo_ocupado + 1 WHERE id = $1', [jornadaId]);
    await client.query('COMMIT');
    return { confirmed: true };
  } catch (error) {
    await client.query('ROLLBACK');
    return { confirmed: false, reason: error.message };
  } finally {
    client.release();
  }
}

async function main() {
  console.log('=== Verificación de concurrencia de cupos ===');
  console.log(`Solicitudes paralelas: ${TOTAL_REQUESTS}`);
  console.log(`Cupo disponible: ${LIMITED_CAPACITY}`);

  const jornada = await createJornada();
  console.log('\nJornada persistida:');
  console.log(`ID: ${jornada.id}`);
  console.log(`Nombre: ${jornada.nombre}`);
  console.log(`Fecha: ${jornada.fecha.toISOString().slice(0, 10)}`);
  console.log(`Cupo: ${jornada.cupo_total}`);

  const results = await Promise.all(
    Array.from({ length: TOTAL_REQUESTS }, (_, index) => attemptInscription(jornada.id, index + 1))
  );
  const confirmed = results.filter((result) => result.confirmed).length;
  const rejected = results.length - confirmed;
  const { rows } = await pool.query('SELECT cupo_ocupado, cupo_total FROM jornadas WHERE id = $1', [jornada.id]);
  const finalJornada = rows[0];

  console.log('\nResultado:');
  console.log(`Confirmadas: ${confirmed}`);
  console.log(`Rechazadas: ${rejected}`);
  console.log(`Cupo ocupado final: ${finalJornada.cupo_ocupado}/${finalJornada.cupo_total}`);
  console.log(`\nLos datos permanecen en PostgreSQL para consultarlos con el ID: ${jornada.id}`);

  if (confirmed !== LIMITED_CAPACITY || rejected !== TOTAL_REQUESTS - LIMITED_CAPACITY || Number(finalJornada.cupo_ocupado) !== LIMITED_CAPACITY) {
    throw new Error('La verificación falló: los resultados no respetan el cupo disponible.');
  }
  console.log('VERIFICACIÓN EXITOSA: 3 confirmadas, 7 rechazadas y 3 cupos ocupados.');
}

main()
  .catch((error) => {
    console.error(`\nVERIFICACIÓN FALLIDA: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
