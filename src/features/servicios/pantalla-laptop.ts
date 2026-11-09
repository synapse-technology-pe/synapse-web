// Pantalla de la laptop (1440×900): sistema de gestión, plataforma SaaS y lectura de documentos con IA.
import { type Paleta, rect, texto, aparecer, sombra, marca, tramo, salida, miles, F_TITULO } from "./lienzo-ui";

export const ANCHO_LAPTOP = 1440;
export const ALTO_LAPTOP = 900;

function barraLateral(c: CanvasRenderingContext2D, pal: Paleta, titulo: string, items: string[], activo: number) {
  c.fillStyle = pal.panel;
  c.fillRect(0, 0, 250, ALTO_LAPTOP);
  c.fillStyle = pal.linea;
  c.fillRect(249, 0, 1, ALTO_LAPTOP);
  c.save();
  marca(c, 34, 36, 0.42, pal.texto);
  c.restore();
  texto(c, titulo, 90, 70, 700, 24, pal.texto, F_TITULO);
  items.forEach((it, i) => {
    const y = 160 + i * 62;
    if (i === activo) {
      c.fillStyle = pal.rojoSuave;
      rect(c, 18, y - 34, 214, 50, 12);
      c.fill();
      c.fillStyle = pal.rojo;
      c.fillRect(18, y - 34, 4, 50);
    }
    texto(c, it, 48, y, 600, 21, i === activo ? pal.texto : pal.suave);
  });
}

function encabezado(c: CanvasRenderingContext2D, pal: Paleta, titulo: string, sub: string) {
  texto(c, titulo, 290, 82, 700, 40, pal.texto, F_TITULO);
  texto(c, sub, 290, 116, 500, 19, pal.suave);
  c.fillStyle = pal.panel2;
  rect(c, 1150, 48, 190, 48, 24);
  c.fill();
  texto(c, "Buscar…", 1180, 79, 500, 18, pal.suave);
  c.fillStyle = pal.rojo;
  c.beginPath();
  c.arc(1384, 72, 24, 0, Math.PI * 2);
  c.fill();
  texto(c, "AM", 1370, 79, 700, 17, "#fff");
}

function tarjetaKpi(c: CanvasRenderingContext2D, pal: Paleta, x: number, etiqueta: string, valor: string, nota: string, alerta = false) {
  sombra(c, pal, true);
  c.fillStyle = pal.panel;
  rect(c, x, 150, 340, 170, 20);
  c.fill();
  sombra(c, pal, false);
  texto(c, etiqueta, x + 26, 196, 600, 19, pal.suave);
  texto(c, valor, x + 24, 258, 750, 46, pal.texto, F_TITULO);
  c.fillStyle = alerta ? pal.rojoSuave : pal.panel2;
  rect(c, x + 26, 278, nota.length * 9 + 30, 30, 15);
  c.fill();
  texto(c, nota, x + 41, 299, 700, 15, alerta ? pal.rojo : pal.suave);
}

function gestion(c: CanvasRenderingContext2D, pal: Paleta, p: number) {
  barraLateral(c, pal, "Mi Empresa", ["Inicio", "Ventas", "Inventario", "Clientes", "Reportes", "Usuarios"], 2);
  encabezado(c, pal, "Inventario", "Actualizado hace 2 minutos");
  const kpis: [string, string, string, boolean][] = [
    ["Productos", miles(1284 * salida(tramo(p, 0, 0.6))), "12 nuevos", false],
    ["Stock bajo", String(Math.round(23 * salida(tramo(p, 0.1, 0.7)))), "Revisar hoy", true],
    ["Ventas de hoy", `S/ ${miles(8420 * salida(tramo(p, 0.2, 0.8)))}`, "+14% vs ayer", false],
  ];
  kpis.forEach((k, i) => aparecer(c, tramo(p, i * 0.1, 0.4 + i * 0.1), 460 + i * 360, 235, () => tarjetaKpi(c, pal, 290 + i * 360, ...k)));

  aparecer(c, tramo(p, 0.3, 0.8), 820, 600, () => {
    sombra(c, pal, true);
    c.fillStyle = pal.panel;
    rect(c, 290, 350, 1060, 500, 20);
    c.fill();
    sombra(c, pal, false);
    const cols = [["Producto", 320], ["Categoría", 640], ["Stock", 860], ["Precio", 1060], ["Estado", 1200]] as const;
    cols.forEach(([t, x]) => texto(c, t, x, 400, 600, 17, pal.suave));
    const filas: [string, string, number, string, 0 | 1 | 2][] = [
      ["Audífonos inalámbricos", "Electrónica", 0.82, "S/ 189.90", 0],
      ["Cargador USB-C 30 W", "Accesorios", 0.12, "S/ 59.90", 1],
      ["Teclado mecánico", "Periféricos", 0.64, "S/ 249.00", 0],
      ["Monitor 27 pulgadas", "Pantallas", 0, "S/ 1,099.00", 2],
      ["Mouse ergonómico", "Periféricos", 0.47, "S/ 89.90", 0],
      ["Cable HDMI 2 m", "Accesorios", 0.91, "S/ 29.90", 0],
    ];
    const estados = ["Disponible", "Stock bajo", "Agotado"];
    filas.forEach((f, i) => {
      const y = 456 + i * 64;
      const q = tramo(p, 0.4 + i * 0.06, 0.75 + i * 0.05);
      c.save();
      c.globalAlpha *= salida(q);
      c.fillStyle = pal.linea;
      c.fillRect(310, y - 40, 1020, 1);
      texto(c, f[0], 320, y, 600, 19, pal.texto);
      texto(c, f[1], 640, y, 500, 18, pal.suave);
      c.fillStyle = pal.panel2;
      rect(c, 860, y - 14, 140, 10, 5);
      c.fill();
      c.fillStyle = f[4] === 0 ? pal.texto : pal.rojo;
      rect(c, 860, y - 14, Math.max(6, 140 * f[2] * salida(q)), 10, 5);
      c.fill();
      texto(c, f[3], 1060, y, 600, 18, pal.texto);
      c.fillStyle = f[4] === 0 ? pal.panel2 : pal.rojoSuave;
      rect(c, 1196, y - 24, 128, 34, 17);
      c.fill();
      texto(c, estados[f[4]], 1214, y - 2, 700, 15, f[4] === 0 ? pal.suave : pal.rojo);
      c.restore();
    });
  });
}

const SERIE = [0.14, 0.19, 0.17, 0.28, 0.33, 0.3, 0.44, 0.5, 0.47, 0.61, 0.68, 0.76, 0.88];

function saas(c: CanvasRenderingContext2D, pal: Paleta, p: number) {
  barraLateral(c, pal, "Plataforma", ["Resumen", "Clientes", "Suscripciones", "Facturación", "Ajustes"], 0);
  encabezado(c, pal, "Resumen", "Todas las empresas · últimos 12 meses");
  const k = salida(tramo(p, 0, 0.5));
  tarjetaKpi(c, pal, 290, "Empresas activas", String(Math.round(248 * k)), "+18 este mes", false);
  tarjetaKpi(c, pal, 650, "Ingresos recurrentes", `S/ ${(86.4 * k).toFixed(1)} mil`, "+24%", true);
  tarjetaKpi(c, pal, 1010, "Retención", `${(96.8 * k).toFixed(1)}%`, "Estable", false);

  // Gráfico de crecimiento
  sombra(c, pal, true);
  c.fillStyle = pal.panel;
  rect(c, 290, 350, 700, 500, 20);
  c.fill();
  sombra(c, pal, false);
  texto(c, "Crecimiento de suscripciones", 320, 402, 700, 22, pal.texto, F_TITULO);
  for (let i = 0; i < 4; i++) {
    c.fillStyle = pal.linea;
    c.fillRect(320, 470 + i * 88, 640, 2);
  }
  const punto = (i: number) => ({ x: 330 + (i / (SERIE.length - 1)) * 620, y: 800 - SERIE[i] * 360 });
  const avance = tramo(p, 0.15, 0.9) * (SERIE.length - 1);
  const n = Math.floor(avance);
  const pts = Array.from({ length: n + 1 }, (_, i) => punto(i));
  if (n < SERIE.length - 1) {
    const a = punto(n);
    const b = punto(n + 1);
    const f = avance - n;
    pts.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
  }
  if (pts.length > 1) {
    const g = c.createLinearGradient(0, 450, 0, 810);
    g.addColorStop(0, "rgba(229,18,27,0.4)");
    g.addColorStop(1, "rgba(229,18,27,0)");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(pts[0].x, 810);
    pts.forEach((q) => c.lineTo(q.x, q.y));
    c.lineTo(pts[pts.length - 1].x, 810);
    c.closePath();
    c.fill();
    c.strokeStyle = "#ff2a2a";
    c.lineWidth = 5;
    c.lineJoin = "round";
    c.beginPath();
    pts.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)));
    c.stroke();
    const fin = pts[pts.length - 1];
    c.save();
    c.shadowColor = "rgba(255,42,42,0.9)";
    c.shadowBlur = 26;
    c.fillStyle = "#ff2a2a";
    c.beginPath();
    c.arc(fin.x, fin.y, 9, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // Planes
  sombra(c, pal, true);
  c.fillStyle = pal.panel;
  rect(c, 1010, 350, 340, 500, 20);
  c.fill();
  sombra(c, pal, false);
  texto(c, "Planes", 1040, 402, 700, 22, pal.texto, F_TITULO);
  const planes: [string, number][] = [["Básico", 0.41], ["Pro", 0.46], ["Empresa", 0.13]];
  planes.forEach(([nombre, v], i) => {
    const y = 470 + i * 110;
    const q = salida(tramo(p, 0.2 + i * 0.12, 0.7 + i * 0.1));
    texto(c, nombre, 1040, y, 600, 19, pal.texto);
    texto(c, `${Math.round(v * 100 * q)}%`, 1268, y, 700, 19, i === 1 ? pal.rojo : pal.suave);
    c.fillStyle = pal.panel2;
    rect(c, 1040, y + 22, 280, 12, 6);
    c.fill();
    c.fillStyle = i === 1 ? pal.rojo : pal.texto;
    rect(c, 1040, y + 22, Math.max(8, 280 * v * q), 12, 6);
    c.fill();
  });
}

function documento(c: CanvasRenderingContext2D, pal: Paleta, p: number) {
  barraLateral(c, pal, "Asistente IA", ["Documentos", "Bandeja", "Reportes", "Ajustes"], 0);
  encabezado(c, pal, "Lectura de documentos", "Factura recibida por correo");
  // Hoja del documento
  c.fillStyle = pal.claro ? "#ffffff" : "#f2f2f0";
  sombra(c, pal, true);
  rect(c, 290, 150, 560, 700, 16);
  c.fill();
  sombra(c, pal, false);
  texto(c, "Factura electrónica", 330, 210, 700, 26, "#0b0b0d", F_TITULO);
  texto(c, "Distribuidora Norte", 330, 246, 600, 18, "#55555c");
  const lineas = [290, 330, 370, 450, 490, 530, 570, 650, 690];
  lineas.forEach((y, i) => {
    c.fillStyle = "#e4e4e1";
    rect(c, 330, y, i % 3 === 2 ? 300 : 480, 14, 7);
    c.fill();
  });
  texto(c, "Total S/ 2,360.00", 330, 790, 700, 22, "#0b0b0d");
  // Línea que "lee" el documento
  const lectura = tramo(p, 0, 0.7);
  if (lectura > 0 && lectura < 1) {
    const y = 180 + lectura * 640;
    const g = c.createLinearGradient(0, y - 60, 0, y);
    g.addColorStop(0, "rgba(229,18,27,0)");
    g.addColorStop(1, "rgba(229,18,27,0.28)");
    c.fillStyle = g;
    c.fillRect(290, y - 60, 560, 60);
    c.fillStyle = "#ff2a2a";
    c.fillRect(290, y, 560, 3);
  }
  // Datos extraídos
  sombra(c, pal, true);
  c.fillStyle = pal.panel;
  rect(c, 880, 150, 470, 700, 20);
  c.fill();
  sombra(c, pal, false);
  texto(c, "Datos extraídos", 910, 205, 700, 24, pal.texto, F_TITULO);
  const pct = Math.round(lectura * 100);
  texto(c, pct < 100 ? `Leyendo… ${pct}%` : "Listo para registrar", 910, 240, 600, 17, pct < 100 ? pal.suave : pal.rojo);
  const datos: [string, string][] = [
    ["Proveedor", "Distribuidora Norte"],
    ["RUC", "20•••••••41"],
    ["Fecha de emisión", "07/11/2026"],
    ["Subtotal", "S/ 2,000.00"],
    ["IGV", "S/ 360.00"],
    ["Total", "S/ 2,360.00"],
  ];
  datos.forEach(([k, v], i) => {
    const q = tramo(p, 0.08 + i * 0.1, 0.22 + i * 0.1);
    const y = 300 + i * 78;
    c.fillStyle = pal.linea;
    c.fillRect(910, y + 26, 410, 1);
    texto(c, k, 910, y, 600, 16, pal.suave);
    aparecer(c, q, 1100, y + 4, () => {
      texto(c, v, 1080, y + 2, 700, 19, pal.texto);
      c.fillStyle = pal.rojo;
      c.beginPath();
      c.arc(1316, y - 6, 11, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#fff";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(1310, y - 6);
      c.lineTo(1314, y - 2);
      c.lineTo(1322, y - 11);
      c.stroke();
    });
  });
  aparecer(c, tramo(p, 0.75, 1), 1115, 800, () => {
    c.fillStyle = pal.rojo;
    rect(c, 910, 772, 410, 56, 28);
    c.fill();
    texto(c, "Registrar en el sistema", 1012, 808, 700, 19, "#fff");
  });
}

export interface EstadoLaptop {
  encendido: number;
  modo: number; // 0 gestión, 1 SaaS, 2 documento (con decimales: transición)
  gestion: number;
  saas: number;
  documento: number;
}

export function dibujarLaptop(c: CanvasRenderingContext2D, pal: Paleta, e: EstadoLaptop) {
  c.save();
  c.fillStyle = pal.fondo;
  c.fillRect(0, 0, ANCHO_LAPTOP, ALTO_LAPTOP);
  const modos = [() => gestion(c, pal, e.gestion), () => saas(c, pal, e.saas), () => documento(c, pal, e.documento)];
  const base = Math.min(2, Math.floor(e.modo));
  const f = e.modo - base;
  modos[base]();
  if (f > 0 && base < 2) {
    c.globalAlpha = salida(f);
    c.fillStyle = pal.fondo;
    c.fillRect(0, 0, ANCHO_LAPTOP, ALTO_LAPTOP);
    modos[base + 1]();
    c.globalAlpha = 1;
  }
  // Encendido: pantalla roja con la marca que se retira hacia arriba
  if (e.encendido < 1) {
    const h = ALTO_LAPTOP * (1 - salida(e.encendido));
    c.save();
    c.beginPath();
    c.rect(0, 0, ANCHO_LAPTOP, h);
    c.clip();
    c.fillStyle = "#0b0b0d";
    c.fillRect(0, 0, ANCHO_LAPTOP, ALTO_LAPTOP);
    c.fillStyle = pal.rojo;
    c.globalAlpha = 0.18;
    c.fillRect(0, 0, ANCHO_LAPTOP, ALTO_LAPTOP);
    c.globalAlpha = 1;
    marca(c, 650, 380, 1.4, "#f4f4f5");
    c.restore();
  }
  c.restore();
}
