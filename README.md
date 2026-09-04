# Horary Front

Frontend de Horary para la gestión de jornadas e inscripciones. Está construido con Next.js, React y TypeScript, y consume exclusivamente el API Gateway del backend.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- `Horary-back` ejecutándose en `http://localhost:3000`

## Instalación

Este proyecto es independiente de `Horary-back`.

```bash
cd Horary-front
printf 'NEXT_PUBLIC_API_URL=http://localhost:3000\n' > .env.local
npm install
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:3003
```

Para generar y ejecutar una versión de producción:

```bash
npm run build
npm run start
```

El puerto puede cambiarse mediante la variable `PORT`:

```bash
PORT=3010 npm run dev
```

## Variables de entorno

Configura las variables en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` apunta al API Gateway de Horary. No se guardan credenciales de PostgreSQL en el frontend.

La única plantilla `.env.example` del proyecto está en `Horary-back` y se mantiene ignorada por Git. El frontend solo necesita crear `.env.local` con la variable pública indicada.

## Arquitectura del frontend

```text
src/
├── app/
│   ├── layout.tsx          Layout y metadata global
│   ├── page.tsx            Dashboard principal
│   └── globals.css         Estilos globales y responsive
├── components/
│   └── CreateJornadaModal.tsx
├── services/
│   └── horary-api.ts       Cliente HTTP del backend
└── types/
    └── horary.ts           Tipos de jornadas, métricas y formularios
```

### Responsabilidades

- `app/page.tsx`: coordina el estado del dashboard, carga métricas y muestra las jornadas activas.
- `components`: contiene componentes visuales reutilizables, como el modal de creación.
- `services`: concentra las peticiones HTTP al gateway.
- `types`: define los contratos usados por la interfaz.
- `app/globals.css`: contiene la identidad visual, layout y breakpoints responsive.

## Funcionalidades

- Visualización de jornadas activas.
- Resumen de jornadas, inscripciones y ocupación global.
- Creación de jornadas desde un modal.
- Desactivación de jornadas.
- Actualización manual de información.
- Diseño responsive para escritorio y dispositivos móviles.
- Mensajes de estado cuando la API no está disponible o una operación falla.

## Backend requerido

En otra terminal, inicia el backend:

```bash
cd Horary-back
cp .env.example .env
npm install
npm run dev
```

El frontend consume estas rutas a través del gateway:

- `GET /api/jornadas`
- `POST /api/jornadas`
- `DELETE /api/jornadas/:id`
- `GET /api/metricas`

El frontend no se conecta directamente a PostgreSQL ni a los microservicios internos.
