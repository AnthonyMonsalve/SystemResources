# System Resources Monorepo

Estructura base con un frontend React + Vite + TypeScript y un backend NestJS.

## Estructura
- `apps/frontend`: Vite React TypeScript.
- `apps/backend`: NestJS.

## Primeros pasos
- Instalar dependencias: `cd apps/frontend && npm install`, `cd apps/backend && npm install`.
- Copiar los templates de entorno: duplicar `.env.template` en `.env` dentro de cada app y ajustar valores.
- Ejecutar desarrollo: `npm run dev` en `apps/frontend`, `npm run start:dev` en `apps/backend`.

## Base de datos en Docker
- Levantar Postgres: `docker compose up -d`
- Credenciales por defecto: usuario `system_resources`, password `system_resources`, base `system_resources` (ajusta `apps/backend/.env` si cambias algo).

## Servicios en Docker
- Construir y levantar todo: `docker compose up --build`
- Servicios:
  - `frontend`: expone `http://localhost:5173` (Nginx sirve el build de Vite, `VITE_API_BASE_URL` apunta a `http://backend:3000`).
  - `backend`: expone `http://localhost:3000`, se conecta al servicio `postgres` vía `DATABASE_URL`.
  - Swagger del backend: `http://localhost:3000/api/docs`.

## Autenticación (JWT)
- Variables de entorno nuevas (backend): `JWT_SECRET`, `JWT_EXPIRES_IN` (ver `apps/backend/.env.template`).
- Endpoints (`/auth`):
  - `POST /auth/register`: registro (roles soportados: `client`, `admin`, `employee`; por defecto `client`).
  - `POST /auth/login`: login (retorna `access_token` + perfil).
  - `GET /auth/profile`: requiere Bearer token; retorna perfil.
- Usuarios se mantienen en memoria por ahora; reemplazar por persistencia real cuando se integre la base de datos.
