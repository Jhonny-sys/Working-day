# Working Day — Sistema de Jornadas e Inscripciones

Aplicación interna para publicar jornadas con cupo limitado y gestionar las inscripciones de las personas que se registran a ellas. Desarrollada como prueba técnica para el cargo de Analista de Aplicaciones y Desarrollo — Cruz Roja Colombiana, Seccional Cundinamarca y Bogotá.

## 1. Tecnologías utilizadas y versiones

### Backend (`back/`)

| Tecnología | Versión |
|---|---|
| Node.js | 20 LTS o superior (recomendado) |
| Arquitectura | Microservicios (API Gateway + 2 servicios de dominio) vía npm workspaces |
| Express | ⚠️ confirmar versión exacta en `back/services/gateway/package.json` |
| PostgreSQL (driver `pg`) | ⚠️ confirmar versión exacta en `back/packages/shared/package.json` |
| concurrently | ^9.1.2 |
| dotenv | ^16.4.7 |

> Nota: el `package.json` raíz del backend (`horary-back`) solo trae `concurrently` y `dotenv` como dependencias propias — Express, el cliente `pg` y la librería de validación viven en `packages/shared` y en cada servicio. Reemplaza las dos filas marcadas con ⚠️ por los valores reales antes de entregar.

### Frontend (`front/`)

| Tecnología | Versión |
|---|---|
| Next.js | ^15.2.4 (App Router) |
| React | ^19.0.0 |
| TypeScript | ^5.8.2 |
| Tailwind CSS | ^3.4.17 |
| ESLint | ^9.22.0 |

### Base de datos

- PostgreSQL, gestionado con Docker Compose para desarrollo local.
- Esquema versionado mediante migraciones SQL propias (no ORM), aplicadas con `back/scripts/migrate.js`.

## 2. Instalación y comandos para ejecutar el proyecto

### Requisitos previos

- Node.js 20 o superior
- npm
- Docker Desktop (para levantar PostgreSQL)

### Instalación

```bash
git clone <url-del-repo> working-day
cd working-day
npm install
```

`npm install`, ejecutado una sola vez desde la raíz, instala las dependencias de los tres microservicios, el paquete compartido (`packages/shared`) y el frontend, y genera un archivo `.env` en la raíz a partir de `.env.example`.

### Levantar el proyecto completo

```bash
npm run dev
```

Este comando:

1. Levanta PostgreSQL en Docker.
2. Aplica las migraciones pendientes.
3. Arranca en paralelo el API Gateway, `jornadas-service`, `inscripciones-service` y el frontend de Next.js.

Disponible en:

- Frontend: `http://localhost:3003`
- API Gateway: `http://localhost:3000`

### Otros comandos

| Comando | Qué hace |
|---|---|
| `npm run start` | Igual que `dev`, en modo producción (requiere `npm run build` antes) |
| `npm run build` | Compila el frontend |
| `npm run docker:down` | Detiene el contenedor de PostgreSQL |
| `npm run verify:concurrency` | Corre el script de prueba de control de cupo bajo concurrencia (ver sección 4) |

## 3. Variables de entorno requeridas

Se configuran en un único archivo `.env` en la raíz del proyecto (plantilla en `.env.example`). Como referencia, las variables típicas que debe cubrir son:

```
# Base de datos
PGHOST=
PGPORT=
PGUSER=
PGPASSWORD=
PGDATABASE=

# Puertos de los servicios
GATEWAY_PORT=3000
JORNADAS_PORT=3001
INSCRIPCIONES_PORT=3002
PORT=3003

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> Ajusta los nombres exactos a los que uses en tu `.env.example` real. Ninguna credencial va incluida en el repositorio; solo la plantilla con las claves vacías o con valores de ejemplo no sensibles.

## 4. Cómo ejecutar la migración y el script de prueba de concurrencia

### Migración

```bash
npm run migrate
```

(ya incluido dentro de `npm run dev` / `npm run start`, no es necesario correrlo aparte en el flujo normal). Aplica, en orden, los archivos SQL de `back/migrations/` sobre una base de datos vacía, dejando el esquema completo con sus llaves, restricciones e índices.

### Script de prueba de concurrencia

```bash
npm run verify:concurrency
```

Ejecuta `back/scripts/concurrency-check.js`, que:

1. Crea una jornada de prueba persistida en la base de datos, con un cupo limitado (`LIMITED_CAPACITY`).
2. Lanza en paralelo, con `Promise.all`, un número configurable de solicitudes de inscripción (`TOTAL_REQUESTS`) contra esa misma jornada.
3. Cada solicitud (`attemptInscription`) toma un cliente propio del pool, abre una transacción, bloquea la fila de la jornada (`SELECT ... FOR UPDATE`) antes de validar el cupo disponible, inserta la inscripción y actualiza el cupo ocupado dentro de esa misma transacción, y libera el cliente en un bloque `finally`.
4. Al finalizar, imprime cuántas solicitudes fueron confirmadas, cuántas rechazadas, y en cuánto quedó el cupo ocupado — permitiendo verificar en un vistazo que, de diez solicitudes simultáneas sobre tres cupos, se confirman exactamente tres y se rechazan siete.

La jornada y las inscripciones generadas quedan persistidas en la base de datos; el script imprime el ID de la jornada creada para poder inspeccionarla después.

## 5. Decisiones técnicas y alternativas descartadas

- **Microservicios (Gateway + jornadas-service + inscripciones-service) en vez de monolito.** Se separó el dominio de inscripciones — que concentra el requisito más delicado de la prueba, el control de concurrencia sobre el cupo — del de gestión de jornadas, para poder razonar y ajustar ese punto crítico de forma aislada. Se descartó el monolito porque mezclar ambas responsabilidades en el mismo proceso dificulta acotar dónde ocurre el bloqueo de filas y complica escalar cada pieza de forma independiente en el futuro.

- **Cliente `pg` directo con pool explícito, en vez de un ORM (Prisma, Sequelize, TypeORM).** El requisito de bloquear la fila de la jornada con `SELECT ... FOR UPDATE` dentro de una transacción exige control fino sobre el SQL ejecutado y el ciclo de vida de la conexión. Se descartó un ORM porque su capa de abstracción sobre transacciones y locks introduce comportamiento menos predecible justo en el punto que la prueba evalúa con mayor peso.

- **Migraciones SQL versionadas con script propio, en vez de sincronización automática de esquema.** Cumple el requisito explícito de poder aplicar el esquema desde cero sobre una base vacía, sin depender de que un ORM infiera la estructura por introspección.

- **Monorepo con npm workspaces, en vez de repositorios separados por servicio.** Permite compartir el pool de conexiones y utilidades comunes desde `packages/shared` entre los tres servicios sin publicarlo como paquete privado, e instalar y levantar todo el proyecto con un solo comando.

- **Next.js App Router con Server Components por defecto y Client Components solo donde hay interactividad** (formulario de inscripción, cancelar inscripción, filtros). Se prioriza no exponer la URL del backend al navegador — las peticiones al API pasan por el servidor de Next.js — y reducir el JavaScript enviado al cliente. Se descartó dejar todo como Client Component porque contradice el requisito explícito de justificar el uso deliberado de cada tipo.

- **Tailwind CSS para el diseño responsivo**, priorizando velocidad de implementación de una interfaz funcional para personal no técnico por sobre un sistema de diseño elaborado.

## 6. Supuestos ante lo que el enunciado no especifica

- El enunciado no define los valores válidos de `tipoDocumento`; se asumió un conjunto fijo de tipos comunes en Colombia (cédula de ciudadanía, cédula de extranjería, tarjeta de identidad, pasaporte).
- No se especifica si cancelar una inscripción requiere identificar a quién la cancela; al no haber autenticación en el alcance de esta prueba (ver sección 7), se asumió que cualquier persona con el identificador de la inscripción puede cancelarla.
- No se especifica si `GET /api/jornadas` requiere paginación; se asumió que no, dado el volumen esperado de jornadas de una sola institución operando de forma manual hasta ahora.
- No se especifica la granularidad de "fecha ya cumplida"; se asumió comparación por fecha calendario (no por hora exacta) contra la fecha del servidor.

## 7. Qué se dejó fuera y cómo se resolvería

- **Autenticación y autorización de los endpoints.** Actualmente cualquier cliente con acceso a la URL del Gateway puede crear, editar o eliminar jornadas y gestionar inscripciones, sin distinguir roles. Se resolvería agregando autenticación (JWT o sesión) y restringiendo las operaciones de administración (crear/editar/eliminar jornadas) a personal autorizado, dejando la inscripción pública o con una verificación más liviana.
- **Cifrado de datos sensibles y de las comunicaciones internas.** Los datos personales (nombre, documento, correo) viajan y se almacenan sin cifrado adicional más allá del que provea el hosting o la conexión de base de datos. Se resolvería habilitando TLS en la conexión a PostgreSQL, evaluando cifrado a nivel de columna para el número de documento, y asegurando la comunicación entre el Gateway y los microservicios internos.
- **Logs estructurados**, tanto a nivel de aplicación como de base de datos. Hoy cada servicio solo emite salida de consola por defecto. Se resolvería incorporando una librería de logging estructurado (por ejemplo Pino), con un identificador de solicitud (`request-id`) propagado desde el Gateway hacia los microservicios para poder trazar una petición de punta a punta, y habilitando logging de consultas en PostgreSQL para detectar consultas lentas.

## 8. Parte de la solución que se considera más frágil

La ausencia de autenticación y cifrado en las comunicaciones es la parte más delicada de la solución actual. Al no haber verificación de identidad entre el cliente y el Gateway, ni entre el Gateway y los microservicios internos, cualquier proceso capaz de alcanzar esos puertos podría invocar directamente `jornadas-service` o `inscripciones-service` saltándose el punto de entrada esperado, o suplantar solicitudes legítimas. En un entorno productivo real esto se resolvería con autenticación de usuarios de cara al Gateway y un mecanismo de confianza entre servicios internos (por ejemplo, un token compartido o mTLS), pero queda fuera del alcance implementado en esta prueba.

## 9. Base de datos: justificación de índices

```sql
-- Restricción de unicidad de negocio: evita dos inscripciones CONFIRMADAS
-- de la misma persona en la misma jornada.
CREATE UNIQUE INDEX idx_inscripciones_unica_confirmada
  ON inscripciones (jornada_id, tipo_documento, numero_documento)
  WHERE estado = 'CONFIRMADA';

-- Índice 1: acelera el listado de inscripciones confirmadas de una jornada
-- ordenadas por fecha de registro (consulta de queries.sql y de la página de detalle).
CREATE INDEX idx_inscripciones_jornada_fecha
  ON inscripciones (jornada_id, created_at DESC)
  WHERE estado = 'CONFIRMADA';

-- Índice 2: acelera el filtrado de jornadas activas dentro de un rango de fechas,
-- usado tanto en el listado principal como en el endpoint de métricas.
CREATE INDEX idx_jornadas_activa_fecha
  ON jornadas (activa, fecha);
```

## 10. Estado de los puntos opcionales

Para dejar constancia clara de qué se alcanzó a cubrir de la sección "Opcional, pero valorado":

| Punto opcional | Estado |
|---|---|
| `docker-compose.yml` que levante app + base de datos con un comando | Parcial — el `docker-compose.yml` actual levanta PostgreSQL; el backend y el frontend se arrancan con `npm run dev`, no están dockerizados |
| Documentación de despliegue en Ubuntu desde cero | No incluida |
| Pruebas unitarias sobre al menos un módulo del backend | No incluidas |
| CI básico en GitHub Actions / GitLab CI | No incluido |
| Despliegue en servicio gratuito con URL pública | No incluido |