# Horary

Prueba tecnica de gestion de jornadas e inscripciones con Node.js, Express, PostgreSQL y Next.js.

## Arquitectura

`Horary-back` y `Horary-front` son proyectos independientes. El backend contiene tres procesos Express:

- `services/gateway`: API Gateway publico en `:3000`. El frontend solo conoce este proceso.
- `services/jornadas-service`: propietario de la lectura y gestion de jornadas en `:3001`.
- `services/inscripciones-service`: propietario de inscripciones y metricas en `:3002`.
- `packages/shared`: pool PostgreSQL, validaciones Zod y middleware compartido.
- `migrations`: esquema versionado ejecutado antes de levantar la aplicacion.

Cada microservicio mantiene la misma responsabilidad interna: `routes` define el contrato HTTP, `controllers` traduce request/response, `services` contiene las reglas de negocio y `packages/shared` concentra infraestructura transversal, configuracion, errores, validaciones y utilidades. Asi las credenciales y decisiones de negocio no quedan mezcladas en los entrypoints.

El gateway enruta `/api/jornadas` al servicio de jornadas y `/api/inscripciones`, `/api/metricas` y las inscripciones de una jornada al servicio correspondiente. Todos los procesos leen las credenciales desde `Horary-back/.env`; no hay secretos en el codigo.

## Arranque desde cero

Requisitos: Node.js 20+, npm 10+ y Docker Desktop.

Backend, en una terminal:

```bash
cd Horary-back
cp .env.example .env
npm install
npm run dev
```

Frontend, en otra terminal:

```bash
cd Horary-front
cp .env.example .env.local
npm install
npm run dev
```

El backend levanta PostgreSQL, aplica migraciones y arranca los microservicios. El frontend arranca Next.js por separado. URLs: panel `http://localhost:3003`, gateway `http://localhost:3000/health`.

Para detener PostgreSQL: `npm run docker:down`.

## Verificacion de concurrencia

El control de cupos se garantiza en `services/inscripciones-service`: cada inscripcion abre una transaccion y bloquea la fila de la jornada con `SELECT ... FOR UPDATE`. La validacion del cupo, el `INSERT` y el incremento de `cupo_ocupado` ocurren dentro de esa misma transaccion.

Con PostgreSQL levantado y las variables de `Horary-back/.env` configuradas, ejecute:

```bash
npm run verify:concurrency
```

El script trabaja directamente contra PostgreSQL, sin depender del Gateway ni de los microservicios. Crea una jornada persistente con 3 cupos y lanza 10 transacciones de inscripcion en paralelo. Debe imprimir exactamente:

```text
Confirmadas: 3
Rechazadas: 7
Cupo ocupado final: 3/3
VERIFICACIÓN EXITOSA: 3 confirmadas, 7 rechazadas y 3 cupos ocupados.
```

La jornada y sus inscripciones permanecen en PostgreSQL. El script imprime el ID de la jornada para consultarla posteriormente mediante el API o directamente en la base de datos.

## Variables de entorno

Los archivos `.env.example` son plantillas. El archivo operativo es `Horary-back/.env` y debe permanecer fuera de control de versiones. Para Next.js, `Horary-front/.env.local` puede definir `NEXT_PUBLIC_API_URL`; por defecto usa `http://localhost:3000`.