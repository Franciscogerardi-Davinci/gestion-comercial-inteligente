var PAGE_NAME = "Sistema de Gestión Comercial Inteligente";
var FONT = { family: "Inter", style: "Regular" };
var FONT_MEDIUM = { family: "Inter", style: "Medium" };
var FONT_BOLD = { family: "Inter", style: "Bold" };

var C = {
  ink: rgb("#172A4D"),
  text: rgb("#2B3445"),
  muted: rgb("#667085"),
  line: rgb("#D8DEE8"),
  soft: rgb("#F4F7FB"),
  paper: rgb("#FFFFFF"),
  primary: rgb("#3157A4"),
  accent: rgb("#0F8B8D"),
  success: rgb("#1F8A5B"),
  warning: rgb("#D98524"),
  error: rgb("#C7372F"),
  sidebar: rgb("#172A4D")
};

var navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Categorías", path: "/categories" },
  { label: "Productos", path: "/products" },
  { label: "Movimientos de stock", path: "/stock-movements" },
  { label: "Ventas", path: "/sales" },
  { label: "Gastos", path: "/expenses" },
  { label: "Reportes", path: "/reports" }
];

var screens = [
  {
    name: "Login",
    path: "/login",
    layout: "auth",
    title: "Bienvenido",
    description: "Ingrese sus credenciales para acceder al panel de gestión.",
    form: ["Correo electrónico", "Contraseña"],
    primary: "Ingresar",
    link: "¿No tiene una cuenta? Registrarse",
    states: ["Error de servidor", "Toast: Sesión iniciada correctamente"]
  },
  {
    name: "Crear cuenta",
    path: "/register",
    layout: "auth",
    title: "Crear cuenta",
    description: "Configure su comercio y comience a organizar la operación.",
    form: ["Nombre del comercio", "Nombre", "Apellido", "Correo electrónico", "Contraseña", "Confirmar contraseña"],
    primary: "Registrarse",
    link: "¿Ya tiene una cuenta? Iniciar sesión",
    states: ["Error de servidor", "Toast: Comercio y usuario creados correctamente"]
  },
  {
    name: "Dashboard",
    path: "/",
    title: "Dashboard",
    description: "Indicadores del período y actividad reciente.",
    kpis: ["Ventas del día", "Operaciones del mes", "Gastos del mes", "Ganancia estimada", "Ventas del mes"],
    onboarding: true,
    tables: [
      { title: "Productos con stock bajo", columns: ["Producto", "SKU", "Stock", "Mínimo"], empty: "No hay productos con stock bajo." },
      { title: "Últimas ventas", columns: ["Fecha", "Estado", "Total"], empty: "Todavía no hay ventas registradas." },
      { title: "Últimos gastos", columns: ["Fecha", "Categoría", "Importe"], empty: "Todavía no hay gastos registrados." }
    ],
    states: ["Loading: Preparando el dashboard", "Error API"]
  },
  {
    name: "Categorías",
    path: "/categories",
    title: "Categorías",
    description: "Organice el catálogo de productos.",
    action: "Nueva categoría",
    tables: [
      { title: "Listado de categorías", columns: ["Nombre", "Descripción", "Productos", "Acciones"], empty: "Todavía no hay categorías registradas." }
    ],
    modal: { title: "Nueva / Editar categoría", fields: ["Nombre", "Descripción"], actions: ["Cancelar", "Guardar"] },
    confirm: "Desactivar categoría",
    states: ["Loading: Cargando categorías", "Alert de error", "Toast success/error"]
  },
  {
    name: "Productos",
    path: "/products",
    title: "Productos",
    description: "Administre precios, categorías y niveles de stock.",
    action: "Nuevo producto",
    tables: [
      { title: "Listado de productos", columns: ["Producto", "Categoría", "SKU", "Precio", "Stock", "Mínimo", "Acciones"], empty: "Todavía no hay productos registrados." }
    ],
    modal: {
      title: "Nuevo / Editar producto",
      fields: ["Nombre", "Categoría", "Descripción", "SKU", "Código de barras", "Precio de venta", "Costo", "Stock mínimo"],
      selects: ["Categoría"],
      actions: ["Cancelar", "Guardar"]
    },
    confirm: "Desactivar producto",
    states: ["Loading: Cargando productos", "Alert de error", "Toast success/error"]
  },
  {
    name: "Movimientos de stock",
    path: "/stock-movements",
    title: "Movimientos de stock",
    description: "Registre entradas, salidas y ajustes manuales.",
    action: "Nuevo movimiento",
    tables: [
      { title: "Historial de movimientos", columns: ["Fecha", "Producto", "Tipo", "Cantidad", "Anterior", "Posterior", "Motivo", "Usuario"], empty: "Todavía no hay movimientos de stock." }
    ],
    modal: {
      title: "Nuevo movimiento",
      fields: ["Producto", "Tipo", "Cantidad / Variación (+/-)", "Motivo"],
      selects: ["Producto", "Tipo: Entrada, Salida, Ajuste"],
      actions: ["Cancelar", "Registrar"]
    },
    states: ["Loading: Cargando movimientos de stock", "Validación de stock", "Toast success/error"]
  },
  {
    name: "Ventas",
    path: "/sales",
    title: "Ventas",
    description: "Consulte ventas confirmadas y anuladas.",
    action: "Nueva venta",
    tables: [
      { title: "Listado de ventas", columns: ["Fecha", "Estado", "Usuario", "Items", "Total", "Detalle"], empty: "Todavía no hay ventas registradas." }
    ],
    states: ["Loading: Cargando ventas", "Chips: Confirmada / Anulada", "Link al detalle"]
  },
  {
    name: "Nueva venta",
    path: "/sales/new",
    title: "Nueva venta",
    description: "Seleccione productos y cantidades.",
    saleBuilder: true,
    form: ["Producto", "Cantidad", "Notas", "Descuento"],
    primary: "Confirmar venta",
    states: ["Error: Agregue al menos un producto", "Stock insuficiente", "Toast: Venta confirmada"]
  },
  {
    name: "Detalle de venta",
    path: "/sales/:id",
    title: "Venta {id}",
    description: "Fecha, usuario, estado y detalle de la venta.",
    action: "Anular venta",
    tables: [
      { title: "Items de la venta", columns: ["Producto", "SKU", "Cantidad", "Precio histórico", "Costo histórico", "Subtotal"], empty: "" }
    ],
    summary: ["Subtotal", "Descuento", "Total", "Notas"],
    confirm: "Anular venta",
    states: ["Chip: Confirmada / Anulada", "Stock restaurado al anular", "Toast success/error"]
  },
  {
    name: "Gastos",
    path: "/expenses",
    title: "Gastos",
    description: "Registre y filtre los egresos del comercio.",
    action: "Nuevo gasto",
    filters: ["Desde", "Hasta", "Categoría", "Aplicar filtros", "Limpiar filtros"],
    tables: [
      { title: "Listado de gastos", columns: ["Fecha", "Categoría", "Descripción", "Usuario", "Importe", "Acciones"], empty: "No hay gastos para los filtros seleccionados." }
    ],
    modal: { title: "Nuevo / Editar gasto", fields: ["Categoría", "Descripción", "Importe", "Fecha"], actions: ["Cancelar", "Guardar"] },
    confirm: "Eliminar gasto",
    states: ["Loading: Cargando gastos", "Alert de error", "Toast success/error"]
  },
  {
    name: "Reportes",
    path: "/reports",
    title: "Reportes",
    description: "Analice ventas, costos históricos, gastos y ganancia estimada.",
    filters: ["Desde", "Hasta", "Aplicar filtros", "Limpiar filtros"],
    kpis: ["Ventas", "Costo histórico", "Ganancia bruta", "Gastos", "Ganancia estimada"],
    tables: [
      { title: "Ventas", columns: ["Fecha", "Venta", "Items", "Total", "Costo", "Ganancia bruta"], empty: "No hay ventas en el período seleccionado.", actions: ["PDF", "Excel"] },
      { title: "Gastos", columns: ["Fecha", "Categoría", "Descripción", "Importe"], empty: "No hay gastos en el período seleccionado.", actions: ["PDF", "Excel"] }
    ],
    states: ["Loading: Generando reportes", "Error descarga", "Toast descarga correcta"]
  }
];

main();

async function main() {
  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_MEDIUM);
  await figma.loadFontAsync(FONT_BOLD);

  var page = getOrCreatePage(PAGE_NAME);
  figma.currentPage = page;
  clearPage(page);

  var components = createComponentLibrary(page);
  createInventoryBoard(page);

  var desktopX = 0;
  var mobileX = 1520;
  var startY = 760;
  var desktopY = startY;
  var mobileY = startY;
  var desktopGapY = 980;
  var mobileGapY = 930;

  for (var i = 0; i < screens.length; i++) {
    var d = buildScreen(screens[i], "desktop", components);
    d.x = desktopX;
    d.y = desktopY;
    desktopY += desktopGapY;
    page.appendChild(d);

    var m = buildScreen(screens[i], "mobile", components);
    m.x = mobileX;
    m.y = mobileY;
    mobileY += mobileGapY;
    page.appendChild(m);
  }

  figma.viewport.scrollAndZoomIntoView(page.children);
  figma.notify("Wireframes generados: " + screens.length + " pantallas reales en desktop y mobile.");
  figma.closePlugin();
}

function getOrCreatePage(name) {
  for (var i = 0; i < figma.root.children.length; i++) {
    if (figma.root.children[i].name === name) return figma.root.children[i];
  }
  var page = figma.createPage();
  page.name = name;
  return page;
}

function clearPage(page) {
  while (page.children.length) page.children[0].remove();
}

function createComponentLibrary(page) {
  var wrap = frame("Componentes reutilizables detectados", 0, 0, 2820, 610, C.soft);
  wrap.layoutMode = "HORIZONTAL";
  wrap.itemSpacing = 24;
  wrap.paddingLeft = 24;
  wrap.paddingRight = 24;
  wrap.paddingTop = 24;
  wrap.paddingBottom = 24;
  wrap.counterAxisAlignItems = "MIN";
  page.appendChild(wrap);

  var titleCol = frame("Inventario de componentes", 0, 0, 300, 560, C.paper);
  titleCol.layoutMode = "VERTICAL";
  titleCol.itemSpacing = 12;
  titleCol.paddingLeft = 20;
  titleCol.paddingRight = 20;
  titleCol.paddingTop = 20;
  titleCol.paddingBottom = 20;
  titleCol.strokes = [paint(C.line)];
  titleCol.appendChild(text("Componentes", 24, C.ink, FONT_BOLD));
  [
    "Sidebar",
    "Navbar",
    "Header",
    "Botones",
    "Inputs",
    "Selects",
    "Tablas",
    "KPI Cards",
    "Modales",
    "Toasts",
    "Estados vacíos",
    "Alerts"
  ].forEach(function (item) {
    titleCol.appendChild(chip(item, C.soft, C.text));
  });
  wrap.appendChild(titleCol);

  var components = {};
  components.sidebar = component("Sidebar", function (c) {
    c.resize(264, 520);
    drawSidebar(c, "Dashboard", false);
  });
  components.navbar = component("Navbar", function (c) {
    c.resize(760, 72);
    drawNavbar(c, 760);
  });
  components.header = component("Header", function (c) {
    c.resize(760, 96);
    drawPageHeader(c, "PageHeader", "Título y descripción de pantalla", "Acción");
  });
  components.button = component("Button", function (c) {
    c.resize(160, 44);
    c.appendChild(button("Botón primario", 0, 0, 160, "primary"));
  });
  components.input = component("Input", function (c) {
    c.resize(260, 58);
    c.appendChild(input("Label", 0, 0, 260));
  });
  components.select = component("Select", function (c) {
    c.resize(260, 58);
    c.appendChild(selectBox("Select", 0, 0, 260));
  });
  components.table = component("Table", function (c) {
    c.resize(520, 250);
    c.appendChild(tableBlock("Tabla", ["Columna", "Columna", "Columna", "Acciones"], 0, 0, 520, 230, ""));
  });
  components.kpi = component("KPI Card", function (c) {
    c.resize(210, 98);
    c.appendChild(kpiCard("Indicador", "$ 125.000", 0, 0, 210));
  });
  components.modal = component("Modal", function (c) {
    c.resize(420, 290);
    c.appendChild(modalBlock("Modal", ["Campo", "Campo multilínea"], 0, 0, 420, 290));
  });
  components.toast = component("Toast", function (c) {
    c.resize(330, 56);
    c.appendChild(toast("Operación realizada correctamente.", "success", 0, 0));
  });

  var names = ["sidebar", "navbar", "header", "button", "input", "select", "table", "kpi", "modal", "toast"];
  names.forEach(function (key) {
    wrap.appendChild(components[key]);
  });
  return components;
}

function createInventoryBoard(page) {
  var board = frame("Análisis del repositorio", 0, 640, 2820, 100, C.paper);
  board.layoutMode = "VERTICAL";
  board.itemSpacing = 8;
  board.paddingLeft = 24;
  board.paddingRight = 24;
  board.paddingTop = 16;
  board.strokes = [paint(C.line)];
  board.appendChild(text("Inventario completo: /login, /register, /, /categories, /products, /stock-movements, /sales, /sales/new, /sales/:id, /expenses, /reports.", 18, C.ink, FONT_BOLD));
  board.appendChild(text("Navegación real: AuthLayout para login/registro; AppLayout con sidebar y navbar para Dashboard, Categorías, Productos, Movimientos de stock, Ventas, Gastos y Reportes. No se detectaron pantallas de Clientes, Empleados, Configuración o Perfil.", 13, C.muted, FONT));
  page.appendChild(board);
}

function buildScreen(screen, mode, components) {
  var isMobile = mode === "mobile";
  var w = isMobile ? 390 : 1440;
  var h = isMobile ? 844 : 900;
  var root = frame(screen.name + " - " + (isMobile ? "Mobile" : "Desktop") + " (" + screen.path + ")", 0, 0, w, h, C.soft);
  root.clipsContent = true;

  if (screen.layout === "auth") {
    drawAuthScreen(root, screen, isMobile);
    return root;
  }

  var sidebarW = isMobile ? 0 : 264;
  if (!isMobile) drawSidebar(root, screen.name, false);
  drawNavbar(root, w - sidebarW, sidebarW, isMobile);

  var content = frame("Contenido", sidebarW + (isMobile ? 16 : 32), isMobile ? 88 : 104, w - sidebarW - (isMobile ? 32 : 64), h - (isMobile ? 110 : 132), C.soft);
  content.layoutMode = "VERTICAL";
  content.itemSpacing = 20;
  content.counterAxisSizingMode = "FIXED";
  content.clipsContent = true;
  root.appendChild(content);

  drawPageHeader(content, screen.title, screen.description, screen.action);
  if (screen.filters) content.appendChild(filtersBar(screen.filters, content.width));
  if (screen.onboarding && !isMobile) content.appendChild(onboardingBlock(content.width));
  if (screen.kpis) content.appendChild(kpiGrid(screen.kpis, content.width, isMobile));
  if (screen.saleBuilder) {
    content.appendChild(saleBuilder(content.width, isMobile));
  }
  if (screen.tables) {
    for (var i = 0; i < screen.tables.length; i++) {
      content.appendChild(tableBlock(screen.tables[i].title, screen.tables[i].columns, 0, 0, content.width, isMobile ? 170 : 210, screen.tables[i].empty, screen.tables[i].actions));
    }
  }
  if (screen.summary) content.appendChild(summaryPanel(screen.summary, content.width, isMobile));
  if (screen.modal && !isMobile) root.appendChild(modalBlock(screen.modal.title, screen.modal.fields, w - 500, 210, 440, 360));
  if (screen.confirm && !isMobile) root.appendChild(confirmModal(screen.confirm, w - 460, 600));
  if (screen.states && !isMobile) root.appendChild(toast(screen.states[screen.states.length - 1], screen.states.join(" ").indexOf("error") >= 0 ? "error" : "success", w - 390, h - 86));
  if (isMobile && screen.modal) content.appendChild(modalBlock(screen.modal.title, screen.modal.fields.slice(0, 3), 0, 0, content.width, 260));
  return root;
}

function drawAuthScreen(root, screen, isMobile) {
  var w = root.width;
  var h = root.height;
  var panelW = isMobile ? w - 32 : 1050;
  var panelH = isMobile ? h - 48 : 620;
  var panel = frame("AuthLayout", (w - panelW) / 2, (h - panelH) / 2, panelW, panelH, C.paper);
  panel.cornerRadius = 12;
  panel.strokes = [paint(C.line)];
  panel.clipsContent = true;
  root.appendChild(panel);

  if (!isMobile) {
    var brand = frame("Brand panel", 0, 0, 520, panelH, C.ink);
    brand.layoutMode = "VERTICAL";
    brand.itemSpacing = 24;
    brand.paddingLeft = 54;
    brand.paddingRight = 54;
    brand.paddingTop = 88;
    panel.appendChild(brand);
    brand.appendChild(iconSquare(54, C.primary));
    brand.appendChild(text("Gestión Comercial Inteligente", 36, rgb("#FFFFFF"), FONT_BOLD));
    brand.appendChild(text("Una visión clara de su comercio para tomar mejores decisiones todos los días.", 16, rgb("#D8E2F0"), FONT));
    ["Ventas y gastos centralizados", "Control de productos y stock", "Indicadores y reportes exportables"].forEach(function (x) {
      brand.appendChild(authHighlight(x));
    });
  }

  var formX = isMobile ? 24 : 590;
  var formW = isMobile ? panelW - 48 : 380;
  var form = frame("Formulario " + screen.name, formX, isMobile ? 52 : 86, formW, panelH - 120, C.paper);
  form.layoutMode = "VERTICAL";
  form.itemSpacing = isMobile ? 14 : 16;
  panel.appendChild(form);
  form.appendChild(text(screen.title, 30, C.ink, FONT_BOLD));
  form.appendChild(text(screen.description, 14, C.muted, FONT));
  form.appendChild(alertBox("Error de validación o servidor", "error", formW));
  screen.form.forEach(function (field) {
    form.appendChild(field.indexOf("Categoría") >= 0 || field === "Producto" ? selectBox(field, 0, 0, formW) : input(field, 0, 0, formW));
  });
  form.appendChild(button(screen.primary, 0, 0, formW, "primary"));
  form.appendChild(text(screen.link, 13, C.muted, FONT));
}

function drawSidebar(parent, activeLabel, compact) {
  var side = frame("Sidebar", 0, 0, 264, parent.height || 520, C.sidebar);
  side.layoutMode = "VERTICAL";
  side.itemSpacing = 8;
  side.paddingLeft = 18;
  side.paddingRight = 18;
  side.paddingTop = 22;
  side.paddingBottom = 18;
  if (parent.type !== "COMPONENT") parent.appendChild(side);

  var brand = frame("Brand", 0, 0, 228, 54, C.sidebar);
  brand.layoutMode = "HORIZONTAL";
  brand.itemSpacing = 12;
  brand.counterAxisAlignItems = "CENTER";
  brand.appendChild(iconSquare(42, C.primary));
  var brandText = frame("Brand text", 0, 0, 160, 44, C.sidebar);
  brandText.layoutMode = "VERTICAL";
  brandText.itemSpacing = 3;
  brandText.appendChild(text("Gestión Comercial", 15, rgb("#FFFFFF"), FONT_BOLD));
  brandText.appendChild(text("Panel inteligente", 11, rgb("#B8C6DA"), FONT));
  brand.appendChild(brandText);
  side.appendChild(brand);
  side.appendChild(sectionLabel("Navegación", rgb("#B8C6DA")));
  navItems.forEach(function (item) {
    side.appendChild(navItem(item.label, activeLabel === item.label || (activeLabel === "Nueva venta" && item.label === "Ventas") || (activeLabel === "Detalle de venta" && item.label === "Ventas")));
  });
  var spacer = frame("Spacer", 0, 0, 1, 60, C.sidebar);
  spacer.layoutGrow = 1;
  side.appendChild(spacer);
  side.appendChild(userMini());
  if (parent.type === "COMPONENT") parent.appendChild(side);
}

function drawNavbar(parent, width, x, isMobile) {
  var bar = frame("Navbar", x || 0, 0, width || 760, isMobile ? 72 : 72, rgba("#FFFFFF", 0.92));
  bar.layoutMode = "HORIZONTAL";
  bar.itemSpacing = 16;
  bar.counterAxisAlignItems = "CENTER";
  bar.paddingLeft = isMobile ? 16 : 28;
  bar.paddingRight = isMobile ? 16 : 28;
  bar.strokes = [paint(C.line)];
  parent.appendChild(bar);
  if (isMobile) bar.appendChild(text("☰", 24, C.ink, FONT_BOLD));
  var business = frame("Business", 0, 0, 260, 44, rgba("#FFFFFF", 0));
  business.layoutMode = "VERTICAL";
  business.itemSpacing = 2;
  business.appendChild(text("Comercio Demo", 12, C.muted, FONT));
  business.appendChild(text("Panel de gestión", 16, C.ink, FONT_BOLD));
  business.layoutGrow = 1;
  bar.appendChild(business);
  if (!isMobile) {
    bar.appendChild(text("Admin Usuario", 13, C.text, FONT_MEDIUM));
    bar.appendChild(button("Salir", 0, 0, 86, "outline"));
  }
}

function drawPageHeader(parent, title, description, actionLabel) {
  var w = parent.width || 760;
  var header = frame("Header - " + title, 0, 0, w, actionLabel ? 92 : 82, rgba("#FFFFFF", 0));
  header.layoutMode = "HORIZONTAL";
  header.itemSpacing = 20;
  header.counterAxisAlignItems = "CENTER";
  var copy = frame("Header copy", 0, 0, w - (actionLabel ? 220 : 0), 76, rgba("#FFFFFF", 0));
  copy.layoutMode = "VERTICAL";
  copy.itemSpacing = 6;
  copy.layoutGrow = 1;
  copy.appendChild(text(title, 30, C.ink, FONT_BOLD));
  copy.appendChild(text(description, 14, C.muted, FONT));
  header.appendChild(copy);
  if (actionLabel) header.appendChild(button("+ " + actionLabel, 0, 0, 190, "primary"));
  parent.appendChild(header);
}

function kpiGrid(labels, width, isMobile) {
  var grid = frame("KPIs", 0, 0, width, isMobile ? labels.length * 86 : 108, rgba("#FFFFFF", 0));
  grid.layoutMode = isMobile ? "VERTICAL" : "HORIZONTAL";
  grid.itemSpacing = 12;
  labels.forEach(function (label) {
    grid.appendChild(kpiCard(label, label.indexOf("Ventas del mes") >= 0 ? "18" : "$ 125.000", 0, 0, isMobile ? width : Math.floor((width - (labels.length - 1) * 12) / labels.length)));
  });
  return grid;
}

function filtersBar(items, width) {
  var bar = frame("Filtros", 0, 0, width, 82, C.paper);
  bar.layoutMode = "HORIZONTAL";
  bar.itemSpacing = 12;
  bar.counterAxisAlignItems = "CENTER";
  bar.paddingLeft = 16;
  bar.paddingRight = 16;
  bar.strokes = [paint(C.line)];
  items.forEach(function (item) {
    if (item.indexOf("Aplicar") >= 0) bar.appendChild(button(item, 0, 0, 150, "primary"));
    else if (item.indexOf("Limpiar") >= 0) bar.appendChild(button(item, 0, 0, 130, "text"));
    else bar.appendChild(input(item, 0, 0, 160));
  });
  return bar;
}

function onboardingBlock(width) {
  var box = frame("Onboarding vacío inicial", 0, 0, width, 174, rgb("#EEF5F8"));
  box.layoutMode = "VERTICAL";
  box.itemSpacing = 12;
  box.paddingLeft = 22;
  box.paddingRight = 22;
  box.paddingTop = 18;
  box.appendChild(text("Prepare su comercio en tres pasos", 20, C.ink, FONT_BOLD));
  box.appendChild(text("Todavía no hay productos. Complete esta configuración inicial para comenzar a vender.", 13, C.muted, FONT));
  var steps = frame("Pasos", 0, 0, width - 44, 78, rgba("#FFFFFF", 0));
  steps.layoutMode = "HORIZONTAL";
  steps.itemSpacing = 12;
  ["Organice categorías", "Cargue productos", "Registre stock"].forEach(function (label, i) {
    var s = frame("Paso " + (i + 1), 0, 0, Math.floor((width - 68) / 3), 78, C.paper);
    s.layoutMode = "VERTICAL";
    s.itemSpacing = 5;
    s.paddingLeft = 12;
    s.paddingTop = 10;
    s.appendChild(text("Paso " + (i + 1), 10, C.muted, FONT_MEDIUM));
    s.appendChild(text(label, 14, C.ink, FONT_BOLD));
    s.appendChild(text(["Ir a categorías", "Crear productos", "Ir a stock"][i], 12, C.primary, FONT_MEDIUM));
    steps.appendChild(s);
  });
  box.appendChild(steps);
  return box;
}

function saleBuilder(width, isMobile) {
  var wrap = frame("Constructor de venta", 0, 0, width, isMobile ? 440 : 520, rgba("#FFFFFF", 0));
  wrap.layoutMode = "VERTICAL";
  wrap.itemSpacing = 14;
  wrap.appendChild(alertBox("Stock insuficiente para producto seleccionado.", "error", width));
  for (var i = 0; i < (isMobile ? 2 : 3); i++) {
    var row = frame("Línea de venta " + (i + 1), 0, 0, width, isMobile ? 116 : 74, C.paper);
    row.layoutMode = isMobile ? "VERTICAL" : "HORIZONTAL";
    row.itemSpacing = 12;
    row.counterAxisAlignItems = "CENTER";
    row.paddingLeft = 14;
    row.paddingRight = 14;
    row.paddingTop = 10;
    row.strokes = [paint(C.line)];
    row.appendChild(selectBox("Producto - stock - precio", 0, 0, isMobile ? width - 28 : width - 360));
    row.appendChild(input("Cantidad", 0, 0, isMobile ? width - 28 : 120));
    if (!isMobile) row.appendChild(text("$ 24.500", 16, C.ink, FONT_BOLD));
    wrap.appendChild(row);
  }
  wrap.appendChild(button("+ Agregar producto", 0, 0, 180, "outline"));
  var summary = frame("Resumen de la venta", 0, 0, width, isMobile ? 190 : 210, rgb("#F9FBFD"));
  summary.layoutMode = "VERTICAL";
  summary.itemSpacing = 12;
  summary.paddingLeft = 18;
  summary.paddingRight = 18;
  summary.paddingTop = 16;
  summary.strokes = [paint(C.line)];
  summary.appendChild(text("Resumen de la venta", 20, C.ink, FONT_BOLD));
  summary.appendChild(input("Notas", 0, 0, width - 36));
  summary.appendChild(input("Descuento", 0, 0, width - 36));
  summary.appendChild(text("Subtotal $ 73.500     Total $ 70.000", 18, C.primary, FONT_BOLD));
  summary.appendChild(button("Confirmar venta", 0, 0, width - 36, "primary"));
  wrap.appendChild(summary);
  return wrap;
}

function tableBlock(title, columns, x, y, width, height, emptyMessage, actions) {
  var box = frame(title, x, y, width, height, C.paper);
  box.layoutMode = "VERTICAL";
  box.strokes = [paint(C.line)];
  box.clipsContent = true;
  var head = frame(title + " header", 0, 0, width, 54, C.paper);
  head.layoutMode = "HORIZONTAL";
  head.counterAxisAlignItems = "CENTER";
  head.paddingLeft = 16;
  head.paddingRight = 16;
  head.itemSpacing = 10;
  head.appendChild(text(title, 17, C.ink, FONT_BOLD));
  var grow = frame("grow", 0, 0, 1, 1, C.paper);
  grow.layoutGrow = 1;
  head.appendChild(grow);
  if (actions) actions.forEach(function (a) { head.appendChild(button(a, 0, 0, 82, a === "Excel" ? "primary" : "outline")); });
  box.appendChild(head);
  var headerRow = tableRow(columns, width, true);
  box.appendChild(headerRow);
  for (var r = 0; r < 3; r++) box.appendChild(tableRow(columns.map(function (c, i) { return sampleCell(c, i); }), width, false));
  if (emptyMessage) {
    var empty = frame("Estado vacío", 0, 0, width, 44, C.soft);
    empty.layoutMode = "HORIZONTAL";
    empty.counterAxisAlignItems = "CENTER";
    empty.paddingLeft = 16;
    empty.appendChild(text("Estado vacío: " + emptyMessage, 12, C.muted, FONT));
    box.appendChild(empty);
  }
  return box;
}

function tableRow(cells, width, isHeader) {
  var row = frame(isHeader ? "Table head" : "Table row", 0, 0, width, isHeader ? 38 : 34, isHeader ? rgb("#EEF2F7") : C.paper);
  row.layoutMode = "HORIZONTAL";
  row.counterAxisAlignItems = "CENTER";
  row.paddingLeft = 12;
  row.paddingRight = 12;
  row.itemSpacing = 8;
  var cellW = Math.max(74, Math.floor((width - 24 - (cells.length - 1) * 8) / cells.length));
  cells.forEach(function (cell) {
    var t = text(String(cell), isHeader ? 11 : 12, isHeader ? C.ink : C.text, isHeader ? FONT_BOLD : FONT);
    t.resize(cellW, isHeader ? 18 : 20);
    row.appendChild(t);
  });
  row.strokes = [paint(C.line)];
  return row;
}

function modalBlock(title, fields, x, y, width, height) {
  var modal = frame(title, x, y, width, height, C.paper);
  modal.layoutMode = "VERTICAL";
  modal.itemSpacing = 12;
  modal.paddingLeft = 22;
  modal.paddingRight = 22;
  modal.paddingTop = 20;
  modal.paddingBottom = 18;
  modal.cornerRadius = 12;
  modal.strokes = [paint(C.line)];
  modal.effects = shadow();
  modal.appendChild(text(title, 20, C.ink, FONT_BOLD));
  fields.forEach(function (f) {
    modal.appendChild(f.indexOf("Tipo") >= 0 || f.indexOf("Categoría") >= 0 || f.indexOf("Producto") >= 0 ? selectBox(f, 0, 0, width - 44) : input(f, 0, 0, width - 44));
  });
  var actions = frame("Dialog actions", 0, 0, width - 44, 44, C.paper);
  actions.layoutMode = "HORIZONTAL";
  actions.itemSpacing = 10;
  actions.counterAxisAlignItems = "CENTER";
  actions.appendChild(button("Cancelar", 0, 0, 110, "text"));
  actions.appendChild(button(title.indexOf("movimiento") >= 0 ? "Registrar" : "Guardar", 0, 0, 120, "primary"));
  modal.appendChild(actions);
  return modal;
}

function confirmModal(title, x, y) {
  var c = frame(title, x, y, 400, 170, C.paper);
  c.layoutMode = "VERTICAL";
  c.itemSpacing = 14;
  c.paddingLeft = 22;
  c.paddingRight = 22;
  c.paddingTop = 20;
  c.cornerRadius = 12;
  c.strokes = [paint(C.line)];
  c.effects = shadow();
  c.appendChild(text(title, 20, C.ink, FONT_BOLD));
  c.appendChild(text("Confirme la acción. Se conservará la trazabilidad del sistema.", 13, C.muted, FONT));
  var actions = frame("Actions", 0, 0, 356, 44, C.paper);
  actions.layoutMode = "HORIZONTAL";
  actions.itemSpacing = 10;
  actions.appendChild(button("Cancelar", 0, 0, 110, "text"));
  actions.appendChild(button(title.indexOf("Eliminar") >= 0 || title.indexOf("Anular") >= 0 ? title : "Desactivar", 0, 0, 150, "danger"));
  c.appendChild(actions);
  return c;
}

function summaryPanel(items, width, isMobile) {
  var p = frame("Resumen de totales", 0, 0, isMobile ? width : 430, 178, C.paper);
  p.layoutMode = "VERTICAL";
  p.itemSpacing = 10;
  p.paddingLeft = 18;
  p.paddingRight = 18;
  p.paddingTop = 18;
  p.strokes = [paint(C.line)];
  items.forEach(function (item, i) {
    p.appendChild(text(item + (item === "Total" ? "    $ 70.000" : "    $ 24.500"), i === 2 ? 20 : 14, i === 2 ? C.primary : C.text, i === 2 ? FONT_BOLD : FONT_MEDIUM));
  });
  return p;
}

function kpiCard(label, value, x, y, width) {
  var card = frame(label, x, y, width, 92, C.paper);
  card.layoutMode = "HORIZONTAL";
  card.itemSpacing = 12;
  card.counterAxisAlignItems = "CENTER";
  card.paddingLeft = 14;
  card.paddingRight = 14;
  card.strokes = [paint(C.line)];
  card.appendChild(iconSquare(40, rgba("#3157A4", 0.12)));
  var copy = frame("copy", 0, 0, width - 70, 52, C.paper);
  copy.layoutMode = "VERTICAL";
  copy.itemSpacing = 4;
  copy.appendChild(text(label, 12, C.muted, FONT_MEDIUM));
  copy.appendChild(text(value, 20, C.ink, FONT_BOLD));
  card.appendChild(copy);
  return card;
}

function input(label, x, y, width) {
  var i = frame(label, x, y, width, 56, C.paper);
  i.layoutMode = "VERTICAL";
  i.itemSpacing = 5;
  i.paddingLeft = 12;
  i.paddingRight = 12;
  i.paddingTop = 8;
  i.strokes = [paint(C.line)];
  i.cornerRadius = 6;
  i.appendChild(text(label, 11, C.muted, FONT_MEDIUM));
  i.appendChild(text("Entrada de datos", 13, C.text, FONT));
  return i;
}

function selectBox(label, x, y, width) {
  var s = input(label, x, y, width);
  s.name = label + " select";
  s.appendChild(text("⌄", 16, C.muted, FONT_BOLD));
  return s;
}

function button(label, x, y, width, variant) {
  var fill = variant === "primary" ? C.primary : variant === "danger" ? C.error : C.paper;
  var color = variant === "primary" || variant === "danger" ? rgb("#FFFFFF") : C.primary;
  var b = frame(label, x, y, width, 42, fill);
  b.layoutMode = "HORIZONTAL";
  b.counterAxisAlignItems = "CENTER";
  b.primaryAxisAlignItems = "CENTER";
  b.cornerRadius = 7;
  if (variant === "outline" || variant === "text") b.strokes = [paint(variant === "text" ? C.paper : C.primary)];
  b.appendChild(text(label, 13, color, FONT_BOLD));
  return b;
}

function toast(message, severity, x, y) {
  var color = severity === "error" ? C.error : C.success;
  var t = frame("Toast", x, y, 340, 56, color);
  t.layoutMode = "HORIZONTAL";
  t.counterAxisAlignItems = "CENTER";
  t.paddingLeft = 16;
  t.paddingRight = 16;
  t.cornerRadius = 8;
  t.effects = shadow();
  t.appendChild(text(message, 12, rgb("#FFFFFF"), FONT_MEDIUM));
  return t;
}

function alertBox(message, severity, width) {
  var color = severity === "error" ? rgba("#C7372F", 0.1) : rgba("#1F8A5B", 0.1);
  var a = frame("Alert", 0, 0, width, 42, color);
  a.layoutMode = "HORIZONTAL";
  a.counterAxisAlignItems = "CENTER";
  a.paddingLeft = 12;
  a.cornerRadius = 6;
  a.appendChild(text(message, 12, severity === "error" ? C.error : C.success, FONT_MEDIUM));
  return a;
}

function navItem(label, active) {
  var item = frame(label, 0, 0, 228, 42, active ? rgba("#FFFFFF", 0.13) : C.sidebar);
  item.layoutMode = "HORIZONTAL";
  item.itemSpacing = 10;
  item.counterAxisAlignItems = "CENTER";
  item.paddingLeft = 12;
  item.cornerRadius = 8;
  item.appendChild(iconDot(active ? C.accent : rgb("#92A4BC")));
  item.appendChild(text(label, 13, active ? rgb("#FFFFFF") : rgb("#D8E2F0"), active ? FONT_BOLD : FONT_MEDIUM));
  return item;
}

function userMini() {
  var u = frame("Usuario", 0, 0, 228, 64, rgba("#FFFFFF", 0.08));
  u.layoutMode = "HORIZONTAL";
  u.itemSpacing = 10;
  u.counterAxisAlignItems = "CENTER";
  u.paddingLeft = 12;
  u.cornerRadius = 10;
  u.appendChild(iconSquare(34, C.accent));
  var copy = frame("Usuario copy", 0, 0, 145, 40, rgba("#FFFFFF", 0));
  copy.layoutMode = "VERTICAL";
  copy.itemSpacing = 2;
  copy.appendChild(text("Admin Usuario", 12, rgb("#FFFFFF"), FONT_BOLD));
  copy.appendChild(text("ADMIN", 10, rgb("#B8C6DA"), FONT));
  u.appendChild(copy);
  u.appendChild(text("↗", 14, rgb("#D8E2F0"), FONT_BOLD));
  return u;
}

function sectionLabel(label, color) {
  var t = text(label, 10, color, FONT_BOLD);
  t.name = label;
  return t;
}

function authHighlight(label) {
  var h = frame(label, 0, 0, 380, 42, rgba("#FFFFFF", 0));
  h.layoutMode = "HORIZONTAL";
  h.itemSpacing = 12;
  h.counterAxisAlignItems = "CENTER";
  h.appendChild(iconSquare(32, rgba("#62C3C4", 0.18)));
  h.appendChild(text(label, 14, rgb("#FFFFFF"), FONT_MEDIUM));
  return h;
}

function chip(label, bg, color) {
  var c = frame(label, 0, 0, 250, 28, bg);
  c.layoutMode = "HORIZONTAL";
  c.counterAxisAlignItems = "CENTER";
  c.paddingLeft = 10;
  c.cornerRadius = 14;
  c.appendChild(text(label, 12, color, FONT_MEDIUM));
  return c;
}

function iconSquare(size, fill) {
  var i = figma.createFrame();
  i.name = "Icon";
  i.resize(size, size);
  i.cornerRadius = Math.min(10, size / 4);
  i.fills = [paint(fill)];
  var dot = figma.createEllipse();
  dot.name = "Glyph";
  dot.resize(size * 0.42, size * 0.42);
  dot.x = size * 0.29;
  dot.y = size * 0.29;
  dot.fills = [paint(fill.r > 0.8 ? C.primary : rgb("#FFFFFF"))];
  i.appendChild(dot);
  return i;
}

function iconDot(color) {
  var d = figma.createEllipse();
  d.name = "Nav icon";
  d.resize(9, 9);
  d.fills = [paint(color)];
  return d;
}

function text(value, size, color, font) {
  var t = figma.createText();
  t.fontName = font || FONT;
  t.characters = value;
  t.fontSize = size;
  t.fills = [paint(color)];
  t.lineHeight = { unit: "AUTO" };
  return t;
}

function frame(name, x, y, w, h, fill) {
  var f = figma.createFrame();
  f.name = name;
  f.x = x;
  f.y = y;
  f.resize(w, h);
  f.fills = [paint(fill)];
  f.cornerRadius = 8;
  return f;
}

function component(name, draw) {
  var c = figma.createComponent();
  c.name = "Component / " + name;
  c.fills = [paint(C.paper)];
  c.cornerRadius = 8;
  draw(c);
  return c;
}

function sampleCell(column, index) {
  var c = String(column).toLowerCase();
  if (c.indexOf("fecha") >= 0) return "13/06/2026";
  if (c.indexOf("estado") >= 0) return "Confirmada";
  if (c.indexOf("precio") >= 0 || c.indexOf("total") >= 0 || c.indexOf("importe") >= 0 || c.indexOf("costo") >= 0 || c.indexOf("ganancia") >= 0) return "$ 24.500";
  if (c.indexOf("stock") >= 0 || c.indexOf("cantidad") >= 0 || c.indexOf("items") >= 0 || c.indexOf("mínimo") >= 0) return "12";
  if (c.indexOf("acciones") >= 0 || c.indexOf("detalle") >= 0) return "Editar / Ver";
  if (c.indexOf("usuario") >= 0) return "Admin Usuario";
  if (c.indexOf("sku") >= 0) return "SKU-001";
  if (c.indexOf("categor") >= 0) return "Insumos";
  return index === 0 ? "Producto demo" : "Dato";
}

function shadow() {
  return [
    {
      type: "DROP_SHADOW",
      color: { r: 0.06, g: 0.1, b: 0.18, a: 0.14 },
      offset: { x: 0, y: 12 },
      radius: 28,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ];
}

function rgb(hex) {
  var h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255
  };
}

function rgba(hex, alpha) {
  var c = rgb(hex);
  c.a = alpha;
  return c;
}

function paint(color) {
  var p = {
    type: "SOLID",
    color: { r: color.r, g: color.g, b: color.b }
  };
  if (typeof color.a === "number") p.opacity = color.a;
  return p;
}
