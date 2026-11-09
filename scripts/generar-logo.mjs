// Genera src/components/ui/logo-datos.ts a partir del logo trazado (scripts/logo/logo-trazado.json):
// rutas SVG de la marca y del logotipo, y el cuerpo del hexágono cortado en 5 esquirlas
// siguiendo sus líneas de circuito (para animarlas en la intro y en 3D). Uso: npm run logo
// El trazado salió de las imágenes originales del logo con scripts/logo/trazar-logo.py.
import pc from "polygon-clipping";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const t = JSON.parse(readFileSync(fileURLToPath(new URL("./logo/logo-trazado.json", import.meta.url)), "utf8"));
const salida = fileURLToPath(new URL("../src/components/ui/logo-datos.ts", import.meta.url));

const r2 = (n) => Math.round(n * 100) / 100;
// Las rutas SVG van con un decimal (0.1 unidad ≈ medio píxel de la imagen original); los puntos 3D con dos.
const r1 = (n) => Math.round(n * 10) / 10;
const anillo = (pts) => "M" + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
const ruta = (anillos) => anillos.map(anillo).join("");
const area = (p) => p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0) / 2;
function centroide(p) {
  let a = 0, cx = 0, cy = 0;
  p.forEach(([x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; const f = x * y2 - x2 * y; a += f; cx += (x + x2) * f; cy += (y + y2) * f; });
  return [r2(cx / (3 * a)), r2(cy / (3 * a))];
}
const sinCierre = (p) => (p.length > 1 && p[0][0] === p.at(-1)[0] && p[0][1] === p.at(-1)[1] ? p.slice(0, -1) : p);

// Esquirlas: cuerpo ∩ región. Se descartan astillas diminutas que dejan los bordes de las regiones.
const cuerpo = t.cuerpo;
const esquirlas = Object.entries(t.regiones).map(([id, region]) => {
  const multi = pc.intersection([cuerpo], [region]);
  const poligonos = multi
    .map((pol) => pol.map(sinCierre))
    .filter((pol) => Math.abs(area(pol[0])) > 1);
  if (poligonos.length !== 1) console.warn(`⚠ esquirla ${id}: ${poligonos.length} polígonos`);
  const principal = poligonos.sort((a, b) => Math.abs(area(b[0])) - Math.abs(area(a[0])))[0];
  return { id, d: ruta(principal), pts: principal.map((r) => r.map(([x, y]) => [r2(x), r2(y)])), centro: centroide(principal[0]) };
});
const sumaEsquirlas = esquirlas.reduce((s, e) => s + Math.abs(area(e.pts[0])), 0);
console.log(`Cuerpo ${Math.abs(area(cuerpo)).toFixed(1)} u² · esquirlas ${sumaEsquirlas.toFixed(1)} u²`);

// Caja del cuerpo para el degradado (abajo-izquierda → arriba-derecha, como en el logo original).
const xs = cuerpo.map((p) => p[0]), ys = cuerpo.map((p) => p[1]);
const degradado = { x1: r2(Math.min(...xs)), y1: r2(Math.max(...ys)), x2: r2(Math.max(...xs)), y2: r2(Math.min(...ys)) };

// Envolvente del cuerpo (casco convexo): el hexágono por el que se abre la página en la intro.
function casco(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cruz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lado = (lista) => lista.reduce((h, q) => { while (h.length >= 2 && cruz(h.at(-2), h.at(-1), q) <= 0) h.pop(); h.push(q); return h; }, []);
  const inf = lado(p), sup = lado([...p].reverse());
  return [...inf.slice(0, -1), ...sup.slice(0, -1)];
}
// Se quitan vértices casi alineados (esquinas redondeadas) para dejar un hexágono limpio.
const envolvente = casco(cuerpo).filter((q, i, h) => {
  const a = h[(i - 1 + h.length) % h.length], b = h[(i + 1) % h.length];
  const giro = Math.abs((q[0] - a[0]) * (b[1] - q[1]) - (q[1] - a[1]) * (b[0] - q[0])) / (Math.hypot(q[0] - a[0], q[1] - a[1]) * Math.hypot(b[0] - q[0], b[1] - q[1]));
  return giro > 0.2;
}).map(([x, y]) => [r2(x), r2(y)]);
console.log(`Envolvente: ${envolvente.length} vértices`);

const nodos = t.nodos.map(([cx, cy, r, anillo]) => ({ cx, cy, r, anillo }));

// Líneas de circuito: del borde del cuerpo por el centro del canal hasta el anillo, y una vuelta al anillo.
const trazos = Object.entries(t.trazos).map(([id, { puntos, nodo }]) => {
  const n = nodos[nodo];
  const rc = r2((n.r + n.anillo) / 2);
  const [ux, uy] = puntos.at(-1);
  const dx = n.cx - ux, dy = n.cy - uy, L = Math.hypot(dx, dy);
  const entrada = [n.cx - (dx / L) * rc, n.cy - (dy / L) * rc];
  const opuesto = [2 * n.cx - entrada[0], 2 * n.cy - entrada[1]];
  const pts = [...puntos, entrada];
  let largo = 0;
  for (let i = 1; i < pts.length; i++) largo += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  largo += 2 * Math.PI * rc;
  const d =
    "M" + pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join("L") +
    `A${rc} ${rc} 0 1 1 ${r2(opuesto[0])} ${r2(opuesto[1])}A${rc} ${rc} 0 1 1 ${r2(entrada[0])} ${r2(entrada[1])}`;
  return { id, d, largo: r2(largo), nodo };
});

const centroHex = centroide(t.hexagono);
const datos = {
  marca: {
    ancho: t.ancho,
    alto: t.alto,
    cuerpo: ruta([cuerpo]),
    degradado,
    envolvente,
    esquirlas: esquirlas.map(({ id, d, centro }) => ({ id, d, centro })),
    hexagono: { d: ruta([t.hexagono]), centro: centroHex },
    burbujas: t.burbujas.map(([cx, cy, r]) => ({ cx, cy, r })),
    nodos,
    trazos,
  },
  logotipo: {
    ancho: r2(t.texto.x1 + 1),
    // Caja de las letras solas (para el logotipo gigante del pie).
    letrasCaja: { x: t.texto.x0, y: t.texto.arriba, w: r2(t.texto.x1 - t.texto.x0), h: r2(t.texto.abajo - t.texto.arriba) },
    divisor: { x: t.divisor[0], y: t.divisor[1], w: t.divisor[2], h: t.divisor[3] },
    letras: t.letras.map((l) => ({ letra: l.letra, d: ruta(l.contornos) })),
  },
  piezas3d: {
    cuerpo: [cuerpo],
    esquirlas: esquirlas.map(({ id, pts, centro }) => ({ id, pts, centro })),
    hexagono: { pts: [t.hexagono], centro: centroHex },
  },
};

const cabecera = "// Archivo generado por scripts/generar-logo.mjs a partir del logo trazado. No editar a mano.\n";
writeFileSync(
  salida,
  cabecera +
    "// marca: SVG del hexágono (cuerpo, esquirlas, hexágono chico, burbujas, nodos y líneas de circuito).\n" +
    "// logotipo: divisor y letras de \"Synapse\". piezas3d: polígonos para extruir en Three.js.\n" +
    Object.entries(datos).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as const;\n`).join("") +
    "// Silueta del cuerpo sola, para la intro (así no arrastra las rutas al JavaScript del navegador).\n" +
    `export const envolvente = ${JSON.stringify(envolvente)} as const;\n`,
);
console.log(`✓ ${salida}`);
