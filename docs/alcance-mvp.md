# Alcance del MVP

## 1. Objetivo del producto mínimo viable

El MVP valida que un comercio pueda registrar sus operaciones esenciales en un
único sistema y obtener información básica para tomar decisiones. Su alcance
prioriza consistencia, trazabilidad y una experiencia web completa por sobre
integraciones externas o funciones empresariales avanzadas.

## 2. Funcionalidades incluidas

### Acceso

- registro de un comercio y su usuario;
- login con correo y contraseña;
- sesión JWT;
- consulta del usuario autenticado;
- logout simple;
- rutas públicas y protegidas;
- roles iniciales `ADMIN` y `USER`.

### Catálogo

- alta, listado, edición y baja lógica de categorías;
- alta, listado, detalle, edición y baja lógica de productos;
- precios de venta y costo;
- SKU, código de barras, categoría y stock mínimo.

### Inventario

- movimientos `IN`, `OUT` y `ADJUSTMENT`;
- actualización transaccional del stock;
- prevención de stock negativo;
- historial con stock anterior y posterior;
- identificación de productos con stock bajo.

### Ventas

- creación de ventas con múltiples productos;
- cálculo de subtotal, descuento y total en backend;
- validación de disponibilidad;
- descuento automático de stock;
- conservación de precios y costos históricos;
- listado y detalle;
- anulación con restauración de existencias;
- preservación de ventas anuladas.

### Gastos

- alta, listado, edición y baja lógica;
- filtros por fecha y categoría;
- identificación del usuario que registró el gasto.

### Información gerencial

- dashboard con indicadores diarios y mensuales;
- últimas ventas y gastos;
- alerta de stock bajo;
- reportes de ventas, gastos y ganancia estimada;
- filtros por período;
- exportación PDF y Excel.

### Experiencia y operación

- interfaz responsive con Material UI;
- formularios validados;
- estados de carga y vacíos;
- snackbars globales;
- confirmaciones con diálogos;
- formato de fecha argentino;
- configuración para Render, Vercel y PostgreSQL 18.

## 3. Límites funcionales

No forman parte del MVP:

- refresh tokens y revocación de sesiones;
- recuperación de contraseña;
- administración visual de usuarios y permisos;
- clientes, proveedores y compras;
- facturación fiscal;
- medios de pago y Mercado Pago;
- cuentas corrientes;
- múltiples sucursales o depósitos;
- transferencias de stock;
- lectores de código de barras integrados;
- aplicación móvil;
- API pública documentada con OpenAPI;
- auditoría avanzada;
- notificaciones automáticas;
- pruebas automatizadas.

## 4. Supuestos

- cada usuario pertenece a un solo comercio;
- todo el stock se encuentra en una única ubicación lógica;
- la moneda operativa es peso argentino;
- el costo cargado en el producto representa el costo unitario vigente;
- una venta se confirma al registrarse;
- los gastos eliminados no deben participar en reportes;
- el comercio administra la calidad de los datos ingresados.

## 5. Criterios de éxito

El MVP se considera funcional si permite:

1. crear o utilizar una cuenta;
2. cargar categorías y productos;
3. ingresar stock;
4. vender sin generar existencias negativas;
5. anular y restaurar correctamente;
6. registrar gastos;
7. visualizar indicadores;
8. exportar información por período;
9. mantener aislados los datos de cada comercio.

## 6. Limitaciones técnicas actuales

- el JWT se guarda en `localStorage`, aceptable para el prototipo pero no ideal
  frente a ataques XSS;
- el logout no invalida tokens emitidos;
- CORS admite un único origen configurado;
- no hay suite automática de pruebas;
- los listados usan límites fijos, sin paginación completa;
- la aplicación no implementa trabajo offline;
- no existe monitoreo funcional ni auditoría centralizada;
- los reportes se generan en memoria;
- el bundle frontend puede optimizarse con división de código.

## 7. Valor demostrado

Aunque acotado, el MVP cubre un circuito comercial de extremo a extremo:
configuración de catálogo, ingreso de mercadería, venta, anulación, gasto y
análisis. Esto permite defender no solo pantallas CRUD, sino reglas de negocio,
seguridad, transacciones y explotación de información.
