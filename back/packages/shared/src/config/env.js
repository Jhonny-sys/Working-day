import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
dotenv.config({ path: path.join(packageRoot, '.env') });

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno requerida: ${name}`);
  return value;
}

function requiredPort(name) {
  const value = Number(required(name));
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`La variable ${name} debe ser un puerto valido`);
  }
  return value;
}

export const env = {
  postgres: {
    host: required('POSTGRES_HOST'),
    port: requiredPort('POSTGRES_PORT'),
    database: required('POSTGRES_DB'),
    user: required('POSTGRES_USER'),
    password: required('POSTGRES_PASSWORD'),
  },
  gateway: {
    port: requiredPort('GATEWAY_PORT'),
    jornadasUrl: required('JORNADAS_SERVICE_URL'),
    inscripcionesUrl: required('INSCRIPCIONES_SERVICE_URL'),
  },
  jornadas: { port: requiredPort('JORNADAS_SERVICE_PORT') },
  inscripciones: { port: requiredPort('INSCRIPCIONES_SERVICE_PORT') },
};
