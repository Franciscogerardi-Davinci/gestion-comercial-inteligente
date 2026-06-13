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
- Despliegue, monitoreo y copias de seguridad automatizadas.
- Aplicación móvil.

Las decisiones de arquitectura se documentan en
[`docs/architecture.md`](docs/architecture.md).
