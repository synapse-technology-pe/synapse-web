// Dueño de los dos lienzos de pantalla: los redibuja solo cuando cambia su estado o el tema.
import { paleta } from "./lienzo-ui";
import { temaActual } from "../../lib/tema";
import { dibujarLaptop, ANCHO_LAPTOP, ALTO_LAPTOP, type EstadoLaptop } from "./pantalla-laptop";
import { dibujarTelefono, ANCHO_TEL, ALTO_TEL, type EstadoTelefono } from "./pantalla-telefono";

export interface EstadoPantallas extends EstadoLaptop {
  telModo: number;
  pedidos: number;
  chat: number;
}

export function estadoInicial(): EstadoPantallas {
  return { encendido: 0, modo: 0, gestion: 0, saas: 0, documento: 0, telModo: 0, pedidos: 0, chat: 0 };
}

export function crearPantallas() {
  const laptop = document.createElement("canvas");
  laptop.width = ANCHO_LAPTOP;
  laptop.height = ALTO_LAPTOP;
  const telefono = document.createElement("canvas");
  const ESC = 2;
  telefono.width = ANCHO_TEL * ESC;
  telefono.height = ALTO_TEL * ESC;
  const cl = laptop.getContext("2d")!;
  const ct = telefono.getContext("2d")!;

  let firmaLaptop = "";
  let firmaTel = "";
  let tema = "";

  /** Devuelve qué lienzos cambiaron (para avisar a las texturas). */
  function dibujar(e: EstadoPantallas, forzar = false) {
    const t = temaActual();
    const cambioTema = t !== tema;
    tema = t;
    const pal = paleta(t);
    const r = (v: number) => v.toFixed(3);
    const fl = [e.encendido, e.modo, e.gestion, e.saas, e.documento].map(r).join("|");
    const ft = [e.telModo, e.pedidos, e.chat].map(r).join("|");
    let laptopCambio = false;
    let telCambio = false;
    if (forzar || cambioTema || fl !== firmaLaptop) {
      firmaLaptop = fl;
      dibujarLaptop(cl, pal, e);
      laptopCambio = true;
    }
    if (forzar || cambioTema || ft !== firmaTel) {
      firmaTel = ft;
      ct.setTransform(ESC, 0, 0, ESC, 0, 0);
      const et: EstadoTelefono = { modo: e.telModo, pedidos: e.pedidos, chat: e.chat };
      dibujarTelefono(ct, pal, et);
      telCambio = true;
    }
    return { laptopCambio, telCambio };
  }

  return { laptop, telefono, dibujar };
}

/** Espera a que las fuentes del lienzo estén listas antes de dibujar texto. */
export function fuentesListas() {
  if (!document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load('600 16px "Geist Variable"'),
    document.fonts.load('700 16px "Geist Variable"'),
  ]).then(() => undefined, () => undefined);
}
