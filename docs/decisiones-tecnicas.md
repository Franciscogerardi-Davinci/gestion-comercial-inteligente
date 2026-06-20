# Decisiones técnicas

## 1. Monorepo con npm workspaces

**Decisión:** mantener `backend`, `frontend` y `docs` en un único repositorio.

**Justificación:** simplifica instalación, scripts, revisión académica y
coordinación de contratos. Permite ejecutar build y lint desde la raíz.

**Compromiso:** frontend y backend continúan siendo aplicaciones desplegables
por separado.

## 2. Node.js, Express y TypeScript

Node.js permite usar TypeScript en ambos extremos. Express ofrece una base
simple para construir una API REST y explicitar rutas, middlewares y servicios.
TypeScript reduce errores de integración y mejora la mantenibilidad.

Se eligió un monolito modular en lugar de microservicios porque el dominio y la
carga del MVP no justifican la complejidad distribuida.

## 3. React y Vite

React permite componer una interfaz por componentes y administrar pantallas
dinámicas sin recargas completas. Vite ofrece un entorno de desarrollo rápido y
un build estático compatible con Vercel.

React Router separa rutas públicas, protegidas y de detalle.

## 4. Material UI

MUI proporciona componentes consistentes, responsive y accesibles. El tema
centralizado define tipografía, colores, bordes, sombras y estados. Esto reduce
CSS ad hoc y produce una interfaz adecuada para exposición y uso cotidiano.

## 5. PostgreSQL 18

Se eligió una base relacional porque ventas, ítems, productos y movimientos
requieren integridad referencial y transacciones. PostgreSQL aporta tipos
numéricos precisos, restricciones, índices y buen soporte para consultas
agregadas.

## 6. Prisma ORM

Prisma centraliza el esquema, las relaciones, migraciones y consultas tipadas.
Reduce errores de SQL repetitivo sin eliminar el diseño relacional. Las
transacciones `$transaction` mantienen atómicas las operaciones de venta y
stock.

Los importes y cantidades usan `Decimal`, evitando errores propios de números
de punto flotante.

## 7. API REST y JSON consistente

REST se adapta al dominio basado en recursos y es fácil de consumir, probar y
exponer en una defensa. Los endpoints se agrupan bajo `/api/v1`.

Las respuestas consistentes facilitan el manejo de datos y errores en el
frontend. Un middleware central transforma validaciones, conflictos, errores
JWT y fallos inesperados.

## 8. Zod en ambas aplicaciones

Zod valida datos en los límites del sistema:

- en frontend, mejora la respuesta al usuario;
- en backend, evita confiar en el cliente;
- en configuración, detecta variables faltantes al iniciar.

La validación duplicada es intencional: la del cliente mejora UX y la del
servidor protege la integridad.

## 9. JWT y bcrypt

Las contraseñas se procesan con bcrypt y factor de costo 12. El JWT firmado
transporta identidad, comercio y rol con expiración.

Para el MVP, el token se almacena en `localStorage` y no hay refresh token. Es
una solución simple, pero se reconoce como limitación de seguridad.

El middleware consulta nuevamente usuario y comercio para detectar cuentas
desactivadas y no confiar únicamente en datos antiguos del token.

## 10. Aislamiento por comercio

`Business` se utiliza como frontera lógica. Los servicios no reciben un
`businessId` elegido por el navegador: lo obtienen de la sesión autenticada.
Cada lectura o escritura incorpora ese filtro.

Esta decisión prepara el sistema para múltiples comercios dentro de la misma
instancia, aunque no implementa múltiples sucursales por comercio.

## 11. Stock actual más historial

Se mantienen dos representaciones complementarias:

- `Product.currentStock` para consultas rápidas;
- `StockMovement` para trazabilidad.

Ambas se actualizan en la misma transacción. Calcular siempre el stock sumando
todo el historial sería más costoso; guardar solo el valor actual impediría
auditar su origen.

## 12. Baja lógica

Productos, categorías y gastos se desactivan en lugar de eliminarse cuando es
necesario conservar referencias e historia. Las ventas nunca se borran: se
anulan con estado y movimientos compensatorios.

## 13. Valores históricos

Precio, costo, nombre y SKU se copian a `SaleItem`. Es una desnormalización
controlada para garantizar reportes históricos correctos.

La ganancia se calcula así:

`ganancia bruta = ventas confirmadas - costos históricos`

`ganancia estimada = ganancia bruta - gastos activos`

## 14. TanStack Query, Axios y React Hook Form

- TanStack Query separa estado remoto de estado visual.
- Axios centraliza autenticación y manejo de `401`.
- React Hook Form reduce renders y estructura formularios.
- Los snackbars globales evitan repetir lógica de notificación.

## 15. PDFKit y ExcelJS

Los reportes se generan en backend para aplicar las mismas reglas y filtros que
la consulta JSON. PDFKit produce documentos imprimibles y ExcelJS archivos
editables por el usuario.

## 16. Decisiones de despliegue

- Vercel aloja la SPA.
- Render ejecuta API y PostgreSQL.
- `DATABASE_URL` permanece únicamente en backend.
- Prisma aplica migraciones con `migrate deploy`.
- Node.js 24 se fija para reproducibilidad.

Esta combinación reduce administración de infraestructura y es apropiada para
una demostración universitaria.
