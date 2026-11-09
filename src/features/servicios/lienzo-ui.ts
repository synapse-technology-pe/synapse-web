// Ayudas de dibujo para las pantallas de los dispositivos (canvas 2D): paleta, formas y apariciones.
import type { Tema } from "../../lib/tema";
import { marca as datosMarca } from "../../components/ui/logo-datos";
import { DEGRADADOS } from "../../components/ui/logo-colores";

export interface Paleta {
  fondo: string;
  panel: string;
  panel2: string;
  texto: string;
  suave: string;
  linea: string;
  rojo: string;
  rojoSuave: string;
  claro: boolean;
}

export function paleta(t: Tema): Paleta {
  return t === "claro"
    ? { fondo: "#f6f6f4", panel: "#ffffff", panel2: "#efefec", texto: "#0b0b0d", suave: "#6b6b72", linea: "rgba(10,10,12,0.08)", rojo: "#e5121b", rojoSuave: "rgba(229,18,27,0.12)", claro: true }
    : { fondo: "#0b0b0d", panel: "#141417", panel2: "#1c1c20", texto: "#f4f4f5", suave: "#8a8a92", linea: "rgba(255,255,255,0.07)", rojo: "#e5121b", rojoSuave: "rgba(229,18,27,0.18)", claro: false };
}

export const F_TEXTO = '"Geist Variable", "Geist", system-ui, sans-serif';
export const F_TITULO = '"Geist Variable", "Geist", system-ui, sans-serif';

export const limitar = (v: number) => Math.max(0, Math.min(1, v));
export const salida = (v: number) => 1 - Math.pow(1 - limitar(v), 3);

/** Tramo de un progreso: devuelve 0..1 entre a y b. */
export const tramo = (p: number, a: number, b: number) => limitar((p - a) / (b - a));

export function rect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

export function texto(c: CanvasRenderingContext2D, t: string, x: number, y: number, peso: number, tam: number, color: string, fuente = F_TEXTO) {
  c.font = `${peso} ${tam}px ${fuente}`;
  c.fillStyle = color;
  c.fillText(t, x, y);
}

/** Dibuja `fn` apareciendo: sube un poco y gana opacidad según p (0..1). */
export function aparecer(c: CanvasRenderingContext2D, p: number, cx: number, cy: number, fn: () => void) {
  const e = salida(p);
  if (e <= 0) return;
  c.save();
  c.globalAlpha *= e;
  c.translate(cx, cy + (1 - e) * 22);
  c.scale(0.94 + 0.06 * e, 0.94 + 0.06 * e);
  c.translate(-cx, -cy);
  fn();
  c.restore();
}

/** Sombra suave de tarjeta (solo en tema claro, donde ayuda a separar). */
export function sombra(c: CanvasRenderingContext2D, pal: Paleta, activa: boolean) {
  if (activa && pal.claro) {
    c.shadowColor = "rgba(10,10,12,0.08)";
    c.shadowBlur = 24;
    c.shadowOffsetY = 8;
  } else {
    c.shadowColor = "transparent";
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
  }
}

// Marca de Synapse (coordenadas del logo, ~109×102) dibujada con Path2D desde las rutas del SVG.
let rutas: { cuerpo: Path2D; hex: Path2D } | null = null;
function degradado(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, paradas: readonly (readonly [number, string])[]) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  paradas.forEach(([o, color]) => g.addColorStop(o, color));
  return g;
}

export function marca(c: CanvasRenderingContext2D, x: number, y: number, s: number, tinta: string, mono = false) {
  rutas ??= { cuerpo: new Path2D(datosMarca.cuerpo), hex: new Path2D(datosMarca.hexagono.d) };
  const d = datosMarca.degradado;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = mono ? tinta : degradado(c, d.x1, d.y1, d.x2, d.y2, DEGRADADOS.cuerpo);
  c.fill(rutas.cuerpo);
  for (const n of datosMarca.nodos) {
    c.beginPath();
    c.arc(n.cx, n.cy, n.r, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = mono ? tinta : degradado(c, 38.5, 30.1, 64.3, 11.3, DEGRADADOS.hexagono);
  c.fill(rutas.hex);
  for (const b of datosMarca.burbujas) {
    if (!mono) c.fillStyle = degradado(c, b.cx - b.r, b.cy + b.r, b.cx + b.r, b.cy - b.r, DEGRADADOS.burbuja);
    c.beginPath();
    c.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
