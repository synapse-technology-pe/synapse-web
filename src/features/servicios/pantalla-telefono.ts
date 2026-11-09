// Pantalla del celular (390×844, dibujada al doble): app de pedidos y asistente con IA.
import { type Paleta, rect, texto, aparecer, sombra, tramo, salida, miles, F_TITULO, F_TEXTO } from "./lienzo-ui";

export const ANCHO_TEL = 390;
export const ALTO_TEL = 844;

function barraEstado(c: CanvasRenderingContext2D, pal: Paleta) {
  texto(c, "9:41", 32, 34, 600, 15, pal.texto);
  c.fillStyle = pal.texto;
  rect(c, 318, 24, 22, 11, 3);
  c.fill();
  rect(c, 344, 24, 18, 11, 3);
  c.fill();
}

function pedidos(c: CanvasRenderingContext2D, pal: Paleta, p: number) {
  barraEstado(c, pal);
  texto(c, "Hola, Carla", 24, 98, 700, 27, pal.texto, F_TITULO);
  texto(c, "Así va tu negocio hoy", 24, 124, 500, 15, pal.suave);
  c.fillStyle = pal.rojo;
  c.beginPath();
  c.arc(346, 96, 20, 0, Math.PI * 2);
  c.fill();
  texto(c, "C", 340, 103, 700, 18, "#fff");

  aparecer(c, tramo(p, 0, 0.35), 195, 230, () => {
    const g = c.createLinearGradient(20, 145, 370, 315);
    g.addColorStop(0, "#ff2a2a");
    g.addColorStop(1, "#8f0a10");
    c.fillStyle = g;
    rect(c, 20, 146, 350, 168, 24);
    c.fill();
    texto(c, "Ventas de hoy", 42, 184, 600, 15, "rgba(255,255,255,0.82)");
    texto(c, `S/ ${miles(4820 * salida(tramo(p, 0.05, 0.5)))}`, 40, 238, 800, 42, "#fff", F_TITULO);
    c.fillStyle = "rgba(255,255,255,0.2)";
    rect(c, 42, 258, 120, 30, 15);
    c.fill();
    texto(c, "+18% vs ayer", 54, 278, 700, 13, "#fff");
    c.strokeStyle = "rgba(255,255,255,0.9)";
    c.lineWidth = 3;
    c.beginPath();
    [0.2, 0.35, 0.3, 0.55, 0.5, 0.7, 0.9].forEach((v, i) => {
      const x = 232 + i * 20;
      const y = 292 - v * 70;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    });
    c.stroke();
  });

  aparecer(c, tramo(p, 0.15, 0.5), 195, 380, () => {
    ["Pedidos", "Clientes", "Pagos", "Stock"].forEach((l, i) => {
      const cx = 58 + i * 91;
      c.fillStyle = pal.panel2;
      c.beginPath();
      c.arc(cx, 372, 31, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = i === 0 ? pal.rojo : pal.suave;
      rect(c, cx - 11, 361, 22, 22, 6);
      c.fill();
      c.font = `600 13px ${F_TEXTO}`;
      const w = c.measureText(l).width;
      texto(c, l, cx - w / 2, 425, 600, 13, pal.suave);
    });
  });

  aparecer(c, tramo(p, 0.3, 0.6), 195, 470, () => texto(c, "Pedidos recientes", 24, 476, 700, 18, pal.texto, F_TITULO));
  const lista: [string, string, boolean][] = [
    ["#1042 · Ana R.", "Entregado", false],
    ["#1043 · Luis M.", "En camino", true],
    ["#1044 · Sofía P.", "Preparando", false],
  ];
  lista.forEach((o, i) => {
    const y = 496 + i * 72;
    aparecer(c, tramo(p, 0.36 + i * 0.08, 0.66 + i * 0.08), 195, y + 30, () => {
      sombra(c, pal, true);
      c.fillStyle = pal.panel;
      rect(c, 20, y, 350, 60, 16);
      c.fill();
      sombra(c, pal, false);
      texto(c, o[0], 38, y + 36, 600, 15, pal.texto);
      c.fillStyle = o[2] ? pal.rojo : pal.panel2;
      rect(c, 250, y + 16, 104, 28, 14);
      c.fill();
      c.font = `700 12px ${F_TEXTO}`;
      const w = c.measureText(o[1]).width;
      texto(c, o[1], 302 - w / 2, y + 35, 700, 12, o[2] ? "#fff" : pal.suave);
    });
  });

  // Barra inferior con botón central
  c.fillStyle = pal.panel;
  c.fillRect(0, 772, 390, 72);
  c.fillStyle = pal.linea;
  c.fillRect(0, 772, 390, 1);
  c.fillStyle = pal.suave;
  [48, 120, 270, 342].forEach((x) => {
    rect(c, x - 11, 798, 22, 22, 6);
    c.fill();
  });
  c.fillStyle = pal.rojo;
  c.beginPath();
  c.arc(195, 772, 31, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#fff";
  c.fillRect(183, 769.5, 24, 5);
  c.fillRect(192.5, 760, 5, 24);

  // Aviso de pedido confirmado
  const aviso = tramo(p, 0.75, 1);
  if (aviso > 0) {
    const e = salida(aviso);
    c.save();
    c.globalAlpha *= e;
    c.translate(0, (1 - e) * -80);
    c.fillStyle = pal.claro ? "#0b0b0d" : "#f4f4f5";
    rect(c, 20, 46, 350, 64, 20);
    c.fill();
    c.fillStyle = pal.rojo;
    c.beginPath();
    c.arc(56, 78, 16, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#fff";
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(48, 78);
    c.lineTo(54, 84);
    c.lineTo(64, 72);
    c.stroke();
    texto(c, "Pedido #1045 confirmado", 84, 84, 700, 16, pal.claro ? "#fff" : "#0b0b0d");
    c.restore();
  }
}

function burbuja(c: CanvasRenderingContext2D, pal: Paleta, t: string[], y: number, mia: boolean) {
  const ancho = 270;
  const alto = 22 + t.length * 22;
  const x = mia ? 370 - ancho : 20;
  c.fillStyle = mia ? pal.rojo : pal.panel2;
  rect(c, x, y, ancho, alto, 20);
  c.fill();
  t.forEach((linea, i) => texto(c, linea, x + 18, y + 34 + i * 22, 500, 15, mia ? "#fff" : pal.texto));
  return alto;
}

function chat(c: CanvasRenderingContext2D, pal: Paleta, p: number) {
  barraEstado(c, pal);
  c.fillStyle = pal.panel;
  c.fillRect(0, 54, 390, 84);
  c.fillStyle = pal.linea;
  c.fillRect(0, 138, 390, 1);
  c.fillStyle = pal.rojoSuave;
  c.beginPath();
  c.arc(48, 96, 22, 0, Math.PI * 2);
  c.fill();
  texto(c, "IA", 38, 102, 800, 16, pal.rojo);
  texto(c, "Asistente virtual", 82, 92, 700, 17, pal.texto, F_TITULO);
  c.fillStyle = "#22c55e";
  c.beginPath();
  c.arc(87, 112, 4, 0, Math.PI * 2);
  c.fill();
  texto(c, "En línea · responde al instante", 98, 117, 500, 13, pal.suave);

  let y = 166;
  const mensajes: [string[], boolean, number][] = [
    [["Hola, ¿mi pedido #1043", "ya salió?"], true, 0.05],
    [["Sí, Ana. Salió a las 10:42", "y llega hoy entre 2 y 3 p. m."], false, 0.3],
    [["¿Puedo cambiar la", "dirección de entrega?"], true, 0.52],
    [["Claro. Escríbeme la nueva", "dirección y la actualizo."], false, 0.78],
  ];
  mensajes.forEach(([lineas, mia, desde]) => {
    const q = tramo(p, desde, desde + 0.14);
    if (q <= 0) return;
    // Antes de cada respuesta, los puntos de "escribiendo…"
    if (!mia && q < 0.45) {
      c.save();
      c.globalAlpha *= salida(q / 0.2);
      c.fillStyle = pal.panel2;
      rect(c, 20, y, 76, 44, 20);
      c.fill();
      for (let i = 0; i < 3; i++) {
        c.fillStyle = pal.suave;
        c.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(q * 20 + i));
        c.beginPath();
        c.arc(42 + i * 16, y + 22, 4, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
      y += 58;
      return;
    }
    aparecer(c, mia ? q : (q - 0.45) / 0.55, 195, y + 30, () => {
      burbuja(c, pal, lineas, y, mia);
    });
    y += 22 + lineas.length * 22 + 14;
  });

  // Respuestas rápidas y campo de texto
  aparecer(c, tramo(p, 0.9, 1), 195, 712, () => {
    ["Ver pedido", "Hablar con alguien"].forEach((t, i) => {
      const x = i ? 160 : 20;
      const w = i ? 186 : 124;
      c.strokeStyle = pal.rojo;
      c.lineWidth = 1.5;
      rect(c, x, 690, w, 38, 19);
      c.stroke();
      texto(c, t, x + 16, 714, 600, 14, pal.rojo);
    });
  });
  c.fillStyle = pal.panel;
  c.fillRect(0, 752, 390, 92);
  c.fillStyle = pal.panel2;
  rect(c, 18, 768, 300, 50, 25);
  c.fill();
  texto(c, "Escribe un mensaje…", 40, 799, 500, 15, pal.suave);
  c.fillStyle = pal.rojo;
  c.beginPath();
  c.arc(348, 793, 25, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#fff";
  c.beginPath();
  c.moveTo(338, 783);
  c.lineTo(360, 793);
  c.lineTo(338, 803);
  c.lineTo(342, 793);
  c.closePath();
  c.fill();
}

export interface EstadoTelefono {
  modo: number; // 0 pedidos, 1 chat
  pedidos: number;
  chat: number;
}

export function dibujarTelefono(c: CanvasRenderingContext2D, pal: Paleta, e: EstadoTelefono) {
  c.save();
  c.fillStyle = pal.fondo;
  c.fillRect(0, 0, ANCHO_TEL, ALTO_TEL);
  const f = Math.max(0, Math.min(1, e.modo));
  if (f < 1) pedidos(c, pal, e.pedidos);
  if (f > 0) {
    c.globalAlpha = salida(f);
    c.fillStyle = pal.fondo;
    c.fillRect(0, 0, ANCHO_TEL, ALTO_TEL);
    chat(c, pal, e.chat);
    c.globalAlpha = 1;
  }
  c.restore();
}
