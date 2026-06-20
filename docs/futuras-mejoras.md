# Futuras mejoras

## 1. Criterio de evolución

Las mejoras se priorizan según riesgo, valor para el comercio y dependencia
técnica. No todas requieren transformar la arquitectura: el monolito modular
puede crecer antes de considerar servicios separados.

## 2. Prioridad alta

### Seguridad de sesión

- migrar a cookies `HttpOnly`, `Secure` y `SameSite`;
- incorporar access y refresh tokens con rotación;
- revocar sesiones y cerrar todos los dispositivos;
- recuperar y cambiar contraseñas;
- aplicar políticas de contraseña y segundo factor opcional.

### Pruebas y calidad

- pruebas unitarias de cálculos y validaciones;
- pruebas de integración con PostgreSQL;
- pruebas end-to-end de venta, anulación y reportes;
- pipeline CI para build, lint, migraciones y tests;
- datos de prueba reproducibles.

### Operación en producción

- logs estructurados con identificador de petición;
- monitoreo de errores, latencia y disponibilidad;
- alertas y health checks ampliados;
- copias de seguridad y simulacros de restauración;
- política de migraciones y rollback;
- actualización controlada de dependencias vulnerables.

### Administración de usuarios

- CRUD de usuarios;
- asignación efectiva de roles y permisos;
- invitaciones por correo;
- auditoría de accesos y acciones sensibles.

## 3. Prioridad media

### Comercial

- clientes y datos de contacto;
- medios de pago;
- cuentas corrientes;
- presupuestos y comprobantes;
- descuentos por ítem;
- devoluciones parciales;
- integración con Mercado Pago;
- facturación fiscal según normativa aplicable.

### Compras y proveedores

- proveedores;
- órdenes y recepción de compras;
- actualización del costo por compra;
- cuentas a pagar;
- relación automática entre recepción y entrada de stock.

### Inventario

- múltiples sucursales y depósitos;
- transferencias entre ubicaciones;
- reservas de stock;
- lotes, vencimientos y números de serie;
- inventarios físicos y conciliación;
- lector de códigos de barras;
- alertas configurables de reposición.

### Reportes

- comparación entre períodos;
- márgenes por producto y categoría;
- productos más vendidos;
- rotación de inventario;
- evolución temporal mediante gráficos;
- exportaciones con identidad visual del comercio;
- reportes programados.

## 4. Prioridad baja o evolutiva

- aplicación móvil o PWA con capacidades offline;
- personalización de moneda, impuestos y zona horaria por comercio;
- temas y branding por negocio;
- importación masiva desde Excel;
- API pública con OpenAPI;
- webhooks e integraciones contables;
- pronóstico de demanda y sugerencias de reposición;
- panel multiempresa para estudios contables.

## 5. Mejoras técnicas específicas

### Rendimiento

- paginación por cursor en listados;
- índices revisados con métricas reales;
- división de código y lazy loading en frontend;
- streaming o almacenamiento temporal para exportaciones grandes;
- caché selectiva para indicadores.

### Modelo de datos

- entidad normalizada para categorías de gasto;
- moneda y configuración fiscal en `Business`;
- entidad `Branch` o `Warehouse`;
- auditoría con actor, acción, recurso y cambios;
- versionado o historial de costos;
- estados más completos para ventas y devoluciones.

### Experiencia de usuario

- búsqueda global;
- atajos de teclado para venta rápida;
- tablas con ordenamiento y paginación;
- onboarding guiado;
- impresión de comprobantes;
- preferencias persistentes por usuario;
- mayor soporte de accesibilidad.

## 6. Posible evolución arquitectónica

No se recomienda adoptar microservicios solo por crecimiento funcional. Primero
deberían fortalecerse modularidad, pruebas y observabilidad.

Una separación futura tendría sentido si aparecen necesidades independientes,
por ejemplo:

- generación asíncrona de reportes pesados;
- servicio de notificaciones;
- integración fiscal;
- sincronización de múltiples sucursales;
- procesamiento de pagos.

En ese escenario podrían incorporarse colas de mensajes y trabajadores, sin
fragmentar prematuramente el núcleo transaccional de ventas y stock.

## 7. Hoja de ruta sugerida

1. Seguridad de sesiones y pruebas automáticas.
2. Monitoreo, backups y operación confiable.
3. Usuarios, permisos y auditoría.
4. Clientes, proveedores y compras.
5. Sucursales y depósitos.
6. Integraciones de pago y fiscales.
7. Analítica avanzada y aplicación móvil.
