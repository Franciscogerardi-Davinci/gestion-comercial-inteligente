# Sistema de Gestión Comercial Inteligente

Monorepo de un MVP universitario para gestionar la operación diaria de pequeños
y medianos comercios.

## Requisitos

- Node.js 24 o superior
- npm 11 o superior
- PostgreSQL 18

## Estructura

```text
.
|-- backend/   API REST con Express, TypeScript, Prisma y PostgreSQL
|-- frontend/  SPA con React, Vite y Material UI
`-- docs/      Documentación técnica
```

## Instalación desde cero

1. Instalar las dependencias del monorepo:

   ```bash
   npm install
   ```

2. Crear la base de datos local `gestion_comercial` en PostgreSQL:

   ```sql
   CREATE DATABASE gestion_comercial;
   ```

3. Crear los archivos de entorno:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

4. Completar `backend/.env`:

   ```dotenv
   DATABASE_URL="postgresql://postgres:<PASSWORD_URL_ENCODED>@localhost:5432/gestion_comercial?schema=public"
   JWT_SECRET="<SECRETO_ALEATORIO_LARGO>"
   APP_TIME_ZONE="America/Argentina/Buenos_Aires"
   SEED_ADMIN_PASSWORD="<CONTRASEÑA_ADMIN_DE_DESARROLLO>"
   ```

   Reemplazar únicamente los valores entre `<...>`. La contraseña de
   PostgreSQL debe codificarse para URL si contiene caracteres reservados como
   `@`, `:`, `/`, `?`, `#` o `%`. Nunca publicar ni versionar este archivo.

5. Generar Prisma Client y aplicar las migraciones existentes:

   ```bash
   npm run prisma:generate
   npm run prisma:deploy
   ```

6. Cargar los datos de demostración:

   ```bash
   npm run prisma:seed
   ```

   El seed es idempotente y crea un comercio, un usuario administrador,
   categorías, productos, gastos y movimientos iniciales.

7. Iniciar backend y frontend:

   ```bash
   npm run dev
   ```

## Ejecución

| Servicio | Comando                 | URL                     |
| -------- | ----------------------- | ----------------------- |
| Ambos    | `npm run dev`           | Backend y frontend      |
| Backend  | `npm run dev:backend`   | `http://localhost:3000` |
| Frontend | `npm run dev:frontend`  | `http://localhost:5173` |
| Studio   | `npm run prisma:studio` | URL indicada por Prisma |

El endpoint de salud del backend es `GET http://localhost:3000/api/health`.

## Usuario demo

- Correo: `admin@comercio-demo.local`
- Rol: `ADMIN`
- Contraseña: valor local de `SEED_ADMIN_PASSWORD` en `backend/.env`

La contraseña no está incluida en el repositorio.

## Cómo probar el acceso

1. Ejecutar `npm run dev`.
2. Abrir `http://localhost:5173/login`.
3. Ingresar el correo demo y la contraseña configurada para el seed.
4. La aplicación redirige al dashboard después de autenticar.

El frontend guarda el JWT en `localStorage` únicamente como solución simple
para este MVP. El logout elimina el token del navegador; no existe revocación
del lado del servidor.

## API

Todas las rutas, excepto registro y login, requieren:

```http
Authorization: Bearer <JWT>
```

Los recursos comerciales siempre se filtran por el `businessId` del usuario
autenticado.

### Autenticación

| Método | Endpoint                | Descripción                      |
| ------ | ----------------------- | -------------------------------- |
| POST   | `/api/v1/auth/register` | Crea un comercio y usuario USER. |
| POST   | `/api/v1/auth/login`    | Devuelve un JWT y el usuario.    |
| GET    | `/api/v1/auth/me`       | Devuelve el usuario autenticado. |
| POST   | `/api/v1/auth/logout`   | Confirma el cierre de sesión.    |

### Catálogo y stock

| Método | Endpoint                  | Descripción                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/v1/categories`      | Lista categorías activas.          |
| POST   | `/api/v1/categories`      | Crea una categoría.                |
| PUT    | `/api/v1/categories/:id`  | Actualiza una categoría.           |
| DELETE | `/api/v1/categories/:id`  | Desactiva una categoría sin ítems. |
| GET    | `/api/v1/products`        | Lista productos activos.           |
| GET    | `/api/v1/products/:id`    | Obtiene un producto.               |
| POST   | `/api/v1/products`        | Crea un producto con stock cero.   |
| PUT    | `/api/v1/products/:id`    | Actualiza un producto.             |
| DELETE | `/api/v1/products/:id`    | Desactiva un producto.             |
| GET    | `/api/v1/stock-movements` | Lista los últimos 200 movimientos. |
| POST   | `/api/v1/stock-movements` | Registra y aplica un movimiento.   |

Los movimientos `IN`, `OUT` y `ADJUSTMENT` actualizan el stock en una
transacción y nunca permiten existencias negativas.

### Ventas y gastos

| Método | Endpoint                   | Descripción                           |
| ------ | -------------------------- | ------------------------------------- |
| GET    | `/api/v1/sales`            | Lista ventas del comercio.            |
| GET    | `/api/v1/sales/:id`        | Obtiene una venta con sus ítems.      |
| POST   | `/api/v1/sales`            | Confirma una venta y descuenta stock. |
| POST   | `/api/v1/sales/:id/cancel` | Anula una venta y restaura el stock.  |
| GET    | `/api/v1/expenses`         | Lista y filtra gastos activos.        |
| GET    | `/api/v1/expenses/:id`     | Obtiene un gasto.                     |
| POST   | `/api/v1/expenses`         | Crea un gasto.                        |
| PUT    | `/api/v1/expenses/:id`     | Actualiza un gasto.                   |
| DELETE | `/api/v1/expenses/:id`     | Realiza la baja lógica de un gasto.   |

El listado de gastos acepta `dateFrom`, `dateTo` y `category`. Las ventas
conservan precio y costo históricos; su creación y anulación usan transacciones
de base de datos.

### Dashboard y reportes

| Método | Endpoint                                | Descripción            |
| ------ | --------------------------------------- | ---------------------- |
| GET    | `/api/v1/dashboard/summary`             | Indicadores generales. |
| GET    | `/api/v1/reports/sales`                 | Reporte de ventas.     |
| GET    | `/api/v1/reports/expenses`              | Reporte de gastos.     |
| GET    | `/api/v1/reports/profit`                | Resumen de ganancia.   |
| GET    | `/api/v1/reports/sales/export/pdf`      | Ventas en PDF.         |
| GET    | `/api/v1/reports/sales/export/excel`    | Ventas en XLSX.        |
| GET    | `/api/v1/reports/expenses/export/pdf`   | Gastos en PDF.         |
| GET    | `/api/v1/reports/expenses/export/excel` | Gastos en XLSX.        |

Los reportes aceptan `dateFrom` y `dateTo` en formato `YYYY-MM-DD`. No incluyen
ventas anuladas y calculan costos con los valores históricos de `SaleItem`.

## Despliegue

La configuración propuesta usa Render para la API y PostgreSQL, y Vercel para
la SPA. El repositorio fija Node.js 24 mediante `.node-version` y `engines`.

### Backend y PostgreSQL en Render

El archivo [`render.yaml`](render.yaml) define:

- Un Web Service Node llamado `gestion-comercial-api`.
- Una base PostgreSQL 18 llamada `gestion-comercial-db`.
- Build con instalación reproducible, generación de Prisma Client y
  compilación del backend.
- Migraciones con `prisma migrate deploy` antes de iniciar el proceso.
- Inicio con `npm run start --workspace backend`.
- Health check en `/api/health`.
- Generación automática de `JWT_SECRET` y conexión privada a PostgreSQL.

Para desplegar:

1. Publicar el repositorio en GitHub, GitLab o Bitbucket.
2. En Render, elegir **New > Blueprint** y conectar el repositorio.
3. Confirmar los recursos detectados desde `render.yaml`.
4. Cuando Render solicite `CORS_ORIGIN`, ingresar el origen HTTPS exacto del
   frontend, por ejemplo `https://mi-comercio.vercel.app`, sin barra final.
5. Crear el Blueprint y esperar que finalicen build, migraciones y health
   check.
6. Verificar `https://<servicio>.onrender.com/api/health`.

El plan `free` del Blueprint es adecuado para una demostración académica. Para
un uso comercial real se recomienda seleccionar planes con persistencia,
copias de seguridad y disponibilidad acordes a la carga.

No ejecutar `prisma migrate dev` en producción. El seed tampoco se ejecuta
automáticamente: si se necesitan datos demo, definir temporalmente
`SEED_ADMIN_PASSWORD`, ejecutar `npm run prisma:seed` desde un entorno
administrativo conectado a la base y luego retirar esa variable.

En el plan gratuito, las migraciones forman parte del `startCommand` porque
Render reserva `preDeployCommand` para Web Services pagos. Al pasar a un plan
pago, se recomienda mover `npm run prisma:deploy` a `preDeployCommand` y dejar
el inicio dedicado exclusivamente al servidor.

### Frontend en Vercel

1. Importar el mismo repositorio en Vercel.
2. Configurar **Root Directory** como `frontend`.
3. Seleccionar el preset **Vite**.
4. Usar `npm run build` como Build Command y `dist` como Output Directory.
5. Crear `VITE_API_URL` para Production con
   `https://<servicio-render>.onrender.com/api`.
6. Desplegar y comprobar el acceso directo a rutas como `/login` y
   `/products`.

[`frontend/vercel.json`](frontend/vercel.json) redirige las rutas de la SPA a
`index.html`, evitando errores 404 al recargar una ruta de React Router.

Las variables con prefijo `VITE_` son públicas y quedan incluidas en el bundle.
Nunca deben contener contraseñas, tokens ni `DATABASE_URL`. Cuando cambie
`VITE_API_URL`, es necesario volver a desplegar el frontend.

### Variables de producción

| Servicio | Variable              | Uso                                            |
| -------- | --------------------- | ---------------------------------------------- |
| Backend  | `NODE_ENV`            | Debe valer `production`.                       |
| Backend  | `PORT`                | La asigna Render; no debe fijarse manualmente. |
| Backend  | `DATABASE_URL`        | URL privada de PostgreSQL; es secreta.         |
| Backend  | `JWT_SECRET`          | Secreto largo generado por Render.             |
| Backend  | `JWT_EXPIRES_IN`      | Vigencia del JWT, por defecto `15m`.           |
| Backend  | `CORS_ORIGIN`         | Origen HTTPS exacto del frontend.              |
| Backend  | `APP_TIME_ZONE`       | `America/Argentina/Buenos_Aires`.              |
| Seed     | `SEED_ADMIN_PASSWORD` | Solo para una carga manual de datos demo.      |
| Frontend | `VITE_API_URL`        | URL pública de la API terminada en `/api`.     |

La base debe estar en la misma región que el backend y el backend debe usar su
URL interna. `DATABASE_URL` nunca se configura en Vercel ni se versiona. Para
administración remota, usar la URL externa solo de manera temporal y respetar
las opciones SSL indicadas por el proveedor. Prisma Studio no debe exponerse
como servicio público.

### Checklist de deploy

- [ ] Los builds local y de CI finalizan sin errores.
- [ ] `npm run prisma:validate` valida el esquema.
- [ ] No hay archivos `.env`, credenciales ni URLs con contraseña versionados.
- [ ] Render detecta PostgreSQL 18 y el Web Service desde `render.yaml`.
- [ ] `DATABASE_URL` referencia la conexión privada de Render.
- [ ] `JWT_SECRET` es único, largo y distinto de cualquier valor local.
- [ ] Las migraciones de producción usan `npm run prisma:deploy`.
- [ ] El health check `/api/health` responde correctamente.
- [ ] `CORS_ORIGIN` coincide exactamente con el dominio de Vercel.
- [ ] Vercel usa `frontend` como Root Directory.
- [ ] `VITE_API_URL` apunta al backend HTTPS e incluye `/api`.
- [ ] Login, navegación, venta, anulación y exportaciones se prueban en producción.
- [ ] Se revisan logs, métricas, retención y copias de seguridad del proveedor.
- [ ] Se documenta un procedimiento de restauración antes de usar datos reales.

## Scripts

- `npm run dev`: inicia backend y frontend.
- `npm run build`: compila ambos proyectos.
- `npm run lint`: ejecuta ESLint.
- `npm run format`: aplica Prettier.
- `npm run format:check`: comprueba el formato.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:validate`: valida el esquema.
- `npm run prisma:deploy`: aplica migraciones existentes.
- `npm run prisma:migrate -- --name <nombre>`: crea una migración de desarrollo.
- `npm run prisma:seed`: carga datos iniciales.
- `npm run prisma:studio`: abre Prisma Studio.

## Alcance del MVP

- Registro, login, sesión autenticada y logout simple con JWT.
- Aislamiento de datos por comercio.
- Gestión de categorías y productos con bajas lógicas.
- Movimientos de stock y prevención de stock negativo.
- Creación, consulta y anulación de ventas.
- Gestión y filtrado de gastos.
- Dashboard con indicadores, stock bajo y actividad reciente.
- Reportes de ventas, gastos y ganancia.
- Exportación de reportes a PDF y Excel.
- Interfaz responsive con React y Material UI.

## Funcionalidades futuras

- Refresh tokens, recuperación de contraseña y revocación de sesiones.
- Administración de usuarios y permisos desde la interfaz.
- Clientes, proveedores, compras y cuentas corrientes.
- Medios de pago y conciliación.
- Integración con Mercado Pago.
- Facturación fiscal.
- Múltiples sucursales.
- Auditoría avanzada.
- API OpenAPI y documentación interactiva.
- Tests automáticos de backend y frontend.
- Monitoreo, alertas y copias de seguridad automatizadas.
- Aplicación móvil.

Las decisiones de arquitectura se documentan en
[`docs/arquitectura.md`](docs/arquitectura.md).
