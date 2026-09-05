# Working Day

Plataforma para gestionar jornadas e inscripciones de forma centralizada. Este repositorio reúne el backend y el frontend del proyecto en un solo lugar, con un único comando para levantar todo.

## Estructura del proyecto

```
working-day/
├── back/     → API y lógica de negocio (Node.js + PostgreSQL)
└── front/    → Interfaz de usuario (Next.js)
```

El frontend se comunica únicamente con el backend a través de su API; no accede directamente a la base de datos.

## Requisitos

Antes de empezar, asegúrate de tener instalado:

- Node.js (versión 20 o superior)
- npm
- Docker Desktop (se usa para la base de datos)

## Instalación

1. Clona el repositorio y entra a la carpeta:
   ```bash
   git clone <url-del-repo> working-day
   cd working-day
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```
   Esto instala todo lo necesario para el backend y el frontend en un solo paso, y crea un archivo `.env` con la configuración base.

3. Abre el archivo `.env` que se generó en la raíz del proyecto y completa los valores que falten (credenciales de la base de datos, etc.).

## Cómo levantar el proyecto

```bash
npm run dev
```

Este único comando se encarga de:

- Levantar la base de datos con Docker.
- Preparar la base de datos (migraciones).
- Arrancar el backend y el frontend al mismo tiempo.

Cuando todo esté arriba, la aplicación estará disponible en:

- **Frontend:** http://localhost:3003
- **API (backend):** http://localhost:3000

Para detener la base de datos cuando termines:

```bash
npm run docker:down
```

## Otros comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Levanta todo el proyecto en modo desarrollo |
| `npm run start` | Levanta todo el proyecto en modo producción |
| `npm run build` | Genera la versión de producción del frontend |
| `npm run docker:down` | Apaga la base de datos |
| `npm run verify:concurrency` | Corre una prueba que valida que el control de cupos funciona correctamente, incluso con varias inscripciones al mismo tiempo |

## Problemas comunes

**"El contenedor ya existe" o error similar al levantar Docker**
Suele pasar si ya habías levantado la base de datos antes desde otra ubicación o con otro nombre de proyecto. Solución: elimina el contenedor existente y vuelve a intentar.
```bash
docker rm -f horary-postgres
npm run dev
```

**Faltan dependencias o aparece un error de "módulo no encontrado" al instalar o levantar el proyecto**
Generalmente se soluciona reinstalando todo desde cero:
```bash
rm -rf node_modules back/node_modules front/node_modules
rm -f package-lock.json back/package-lock.json front/package-lock.json
npm install
```

**El proyecto no encuentra las variables de entorno**
Verifica que exista el archivo `.env` en la raíz del proyecto y que tenga todos los valores completos. Si lo borraste por error, vuelve a ejecutar `npm install` para que se regenere a partir de la plantilla, y complétalo de nuevo.

**El frontend carga pero no trae datos / muestra errores de conexión**
Confirma que el backend esté corriendo (revisa la terminal, deberías ver los logs con el prefijo `[back]`) y que la base de datos esté activa. Si acabas de levantar todo por primera vez, dale unos segundos: la base de datos y las migraciones pueden tardar un poco en estar listas.
