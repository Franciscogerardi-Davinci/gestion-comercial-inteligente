# Sistema de Gestion Comercial Inteligente

Monorepo inicial para un sistema orientado a pequenos y medianos comercios.

Esta primera fase contiene la arquitectura base, las dependencias, la
configuracion de desarrollo y el modelo inicial de datos. Todavia no incluye
logica de negocio ni pantallas funcionales.

## Requisitos

- Node.js 24 o superior
- npm 11 o superior
- PostgreSQL 18

## Estructura

```text
.
|-- backend/   API REST con Express, TypeScript y Prisma
|-- frontend/  SPA con React, Vite y Material UI
`-- docs/      Documentacion tecnica
```

## Configuracion inicial

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear los archivos de entorno:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

3. Completar `backend/.env` sin publicar ni versionar credenciales:

   ```dotenv
   DATABASE_URL="postgresql://postgres:<PASSWORD_URL_ENCODED>@localhost:5432/gestion_comercial?schema=public"
   SEED_ADMIN_PASSWORD="<PASSWORD_ADMIN_DE_DESARROLLO>"
   ```

   Reemplace solamente los valores entre `<...>`. La contrasena de PostgreSQL
   debe codificarse para URL si contiene caracteres reservados como `@`, `:`,
   `/`, `?`, `#` o `%`. `backend/.env` esta excluido por `.gitignore`.

4. Generar el cliente Prisma:

   ```bash
   npm run prisma:generate
   ```

5. Crear y aplicar la primera migracion:

   ```bash
   npm run prisma:migrate -- --name init
   ```

6. Cargar los datos iniciales:

   ```bash
   npm run prisma:seed
   ```

   El seed es idempotente e incorpora un comercio de demostracion, un usuario
   `ADMIN`, tres categorias, tres productos, dos gastos y sus movimientos de
   stock iniciales. El correo del usuario es `admin@comercio-demo.local` y su
   contrasena se toma exclusivamente de `SEED_ADMIN_PASSWORD`.

7. Inspeccionar los datos:

   ```bash
   npm run prisma:studio
   ```

## Ejecucion

Backend:

```bash
npm run dev:backend
```

Disponible en `http://localhost:3000`. El endpoint tecnico de comprobacion es
`GET /api/health`.

Frontend:

```bash
npm run dev:frontend
```

Disponible normalmente en `http://localhost:5173`.

Ambos proyectos:

```bash
npm run dev
```

## Scripts

- `npm run dev`: inicia backend y frontend en paralelo.
- `npm run build`: compila ambos proyectos.
- `npm run lint`: ejecuta ESLint en todo el monorepo.
- `npm run format`: aplica Prettier.
- `npm run format:check`: comprueba el formato.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:validate`: valida el esquema Prisma.
- `npm run prisma:migrate -- --name <nombre>`: crea y aplica una migracion.
- `npm run prisma:seed`: carga datos iniciales de desarrollo.
- `npm run prisma:studio`: abre Prisma Studio.

## Alcance de la fase

Incluye autenticacion JWT como dependencia y estructura, pero no implementa
registro, login, refresh tokens ni reglas comerciales. Consulte
[`docs/architecture.md`](docs/architecture.md) para conocer las decisiones
iniciales.
