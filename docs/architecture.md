# Arquitectura inicial

## Enfoque

El sistema parte como un monolito modular compuesto por una API REST y una SPA.
Esta forma reduce la complejidad operativa y mantiene limites claros entre las
funcionalidades comerciales.

## Backend

Cada modulo de `backend/src/modules` puede incorporar progresivamente:

- rutas HTTP;
- controladores;
- servicios con reglas de negocio;
- repositorios Prisma;
- esquemas Zod;
- tipos propios.

La infraestructura transversal vive en `config`, `middlewares`, `shared` e
`infrastructure`. El modulo `auth` implementa sesiones JWT sin refresh tokens,
hash bcrypt y autorizacion por roles.

## Frontend

La aplicacion se organiza por funcionalidades dentro de `src/features`.
`src/app` contiene proveedores globales, mientras que `routes`, `layouts`,
`components` y `pages` contienen elementos compartidos. TanStack Query maneja
estado remoto y React Hook Form con Zod se reservara para formularios.

## Persistencia

Todas las entidades comerciales pertenecen a `Business`. Las ventas conservan
en `SaleItem` los valores historicos del producto. El inventario dispone de
`StockMovement` como registro de movimientos y de `Product.currentStock` como
valor de consulta, que en fases posteriores deberan actualizarse dentro de la
misma transaccion.

El proyecto utiliza la configuracion de Prisma 7: `prisma.config.ts` obtiene la
URL de conexion desde el entorno y Prisma Client usa el adaptador oficial de
PostgreSQL.

Los movimientos de stock son la evidencia historica de cada cambio. La API
actualiza `Product.currentStock` y crea `StockMovement` dentro de una misma
transaccion, con control de concurrencia optimista y rechazo de stock negativo.
Productos y categorias utilizan bajas logicas.

## Limites de esta fase

No se incluyen refresh tokens, recuperacion de contrasena, operaciones CRUD
comerciales, reglas de stock, reportes, pruebas automatizadas ni pantallas de
gestion.
