# Sistema de Gestion Comercial Inteligente

Monorepo inicial para un sistema orientado a pequenos y medianos comercios.

Esta primera fase contiene la arquitectura base, las dependencias, la
configuracion de desarrollo, el modelo inicial de datos y autenticacion JWT.
Todavia no incluye logica comercial.

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

## Autenticacion

La API expone los siguientes endpoints:

| Metodo | Endpoint                | Protegido | Descripcion                      |
| ------ | ----------------------- | --------- | -------------------------------- |
| POST   | `/api/v1/auth/register` | No        | Crea un comercio y usuario USER. |
| POST   | `/api/v1/auth/login`    | No        | Devuelve un JWT y el usuario.    |
| GET    | `/api/v1/auth/me`       | Si        | Devuelve el usuario autenticado. |
| POST   | `/api/v1/auth/logout`   | Si        | Confirma el cierre de sesion.    |

Las rutas protegidas reciben el token mediante:

```http
Authorization: Bearer <JWT>
```

El logout es stateless: no revoca el JWT en el servidor porque esta fase no
incluye refresh tokens ni lista de revocacion. El frontend elimina el token
guardado en `localStorage`, una solucion deliberadamente simple para desarrollo.

### Usuario demo

- Correo: `admin@comercio-demo.local`
- Rol: `ADMIN`
- Contrasena: el valor local de `SEED_ADMIN_PASSWORD` en `backend/.env`

La contrasena no se documenta ni se incorpora al repositorio.

### Probar el login

1. Iniciar backend y frontend:

   ```bash
   npm run dev
   ```

2. Abrir `http://localhost:5173/login`.
3. Ingresar el correo demo y la contrasena configurada en
   `SEED_ADMIN_PASSWORD`.
4. Al autenticar, la aplicacion redirige a la ruta protegida `/`.

Ejemplo de registro:

```json
{
  "businessName": "Mi Comercio",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "email": "usuario@example.com",
  "password": "una-contrasena-segura"
}
```

## Productos, categorias y stock

Todas las rutas de esta seccion requieren un JWT y filtran los datos mediante el
`businessId` de la sesion.

### Endpoints

| Metodo | Endpoint                  | Descripcion                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/v1/categories`      | Lista categorias activas.          |
| POST   | `/api/v1/categories`      | Crea una categoria.                |
| PUT    | `/api/v1/categories/:id`  | Actualiza una categoria.           |
| DELETE | `/api/v1/categories/:id`  | Desactiva una categoria sin items. |
| GET    | `/api/v1/products`        | Lista productos activos.           |
| GET    | `/api/v1/products/:id`    | Obtiene un producto.               |
| POST   | `/api/v1/products`        | Crea un producto con stock cero.   |
| PUT    | `/api/v1/products/:id`    | Actualiza los datos del producto.  |
| DELETE | `/api/v1/products/:id`    | Desactiva el producto.             |
| GET    | `/api/v1/stock-movements` | Lista los ultimos 200 movimientos. |
| POST   | `/api/v1/stock-movements` | Registra y aplica un movimiento.   |

Los tipos de movimiento son:

- `IN`: suma una cantidad positiva.
- `OUT`: resta una cantidad positiva.
- `ADJUSTMENT`: aplica una variacion positiva o negativa.

La API rechaza cualquier movimiento que deje `currentStock` por debajo de cero.
La actualizacion del producto y la creacion del movimiento ocurren en una misma
transaccion.

### Probar la fase

1. Ejecutar `npm run dev`.
2. Iniciar sesion en `http://localhost:5173/login`.
3. Abrir `Categorias` y crear una categoria.
4. Abrir `Productos` y crear un producto. El stock inicial sera cero.
5. Abrir `Stock` y registrar una entrada.
6. Verificar que el stock actualizado aparezca en la pantalla de productos.

Las bajas de productos y categorias son logicas mediante `isActive=false`. Una
categoria con productos activos no puede desactivarse.

## Ventas y gastos

### Endpoints de ventas

| Metodo | Endpoint                   | Descripcion                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/api/v1/sales`            | Lista ventas del comercio.               |
| GET    | `/api/v1/sales/:id`        | Obtiene una venta con sus items.         |
| POST   | `/api/v1/sales`            | Confirma una venta y descuenta stock.    |
| POST   | `/api/v1/sales/:id/cancel` | Anula la venta y restaura todo el stock. |

La creacion recibe productos y cantidades. Los precios, costos, subtotal y total
se calculan en el backend. `SaleItem` conserva el nombre, SKU, precio y costo
historicos. La venta, sus items, la actualizacion de stock y los movimientos
`OUT` se guardan dentro de una misma transaccion.

Una anulacion no elimina la venta: cambia su estado a `CANCELLED`, restaura el
stock y genera movimientos compensatorios `IN`.

Ejemplo:

```json
{
  "items": [
    {
      "productId": "UUID_DEL_PRODUCTO",
      "quantity": 2
    }
  ],
  "discount": 0,
  "notes": "Venta de mostrador"
}
```

### Endpoints de gastos

| Metodo | Endpoint               | Descripcion                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/api/v1/expenses`     | Lista y filtra gastos activos.     |
| GET    | `/api/v1/expenses/:id` | Obtiene un gasto.                  |
| POST   | `/api/v1/expenses`     | Crea un gasto.                     |
| PUT    | `/api/v1/expenses/:id` | Actualiza un gasto.                |
| DELETE | `/api/v1/expenses/:id` | Realiza una baja logica del gasto. |

El listado acepta `dateFrom`, `dateTo` y `category` como query parameters.

### Probar la fase

1. Ejecutar `npm run dev` e iniciar sesion.
2. Abrir `Ventas` y seleccionar `Nueva venta`.
3. Agregar productos y confirmar que las cantidades no superen el stock.
4. Confirmar la venta y verificar el descuento en `Productos` y `Stock`.
5. Abrir el detalle de la venta y anularla para restaurar las existencias.
6. Abrir `Gastos` para crear, filtrar, editar y eliminar registros.

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

Incluye autenticacion, productos, categorias, inventario, ventas confirmadas y
anulables, y gestion de gastos. No incluye refresh tokens, clientes, medios de
pago, facturacion fiscal ni reportes. Consulte
[`docs/architecture.md`](docs/architecture.md) para conocer las decisiones.
