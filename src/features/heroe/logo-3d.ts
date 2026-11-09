// Marca de Synapse en 3D: el cuerpo del hexágono cortado en 5 esquirlas, el hexágono chico,
// 3 burbujas y 4 nodos, extruidos con el degradado rojo → naranja del logo.
// pose(armar, separar): las piezas llegan sueltas y encajan; con el scroll se abren en vista explotada.
import { THREE } from "../../lib/three-base";
import type { Tema } from "../../lib/tema";
import { marca, piezas3d } from "../../components/ui/logo-datos";
import { DEGRADADOS } from "../../components/ui/logo-colores";

type Anillos = readonly (readonly (readonly number[])[])[];
type V3 = [number, number, number];

const ESC = 40; // unidades del logo por unidad 3D
const CX = marca.ancho / 2;
const CY = marca.alto / 2;
const aMundo = (x: number, y: number) => new THREE.Vector2((x - CX) / ESC, -(y - CY) / ESC);

// El bisel queda por dentro del contorno (bevelOffset negativo) para no cerrar los canales del circuito.
const EXT = {
  depth: 0.2,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.014,
  bevelOffset: -0.014,
  bevelSegments: 4,
  curveSegments: 40,
};

const clamp01 = (f: number) => Math.min(1, Math.max(0, f));
const salidaCuarta = (f: number) => 1 - Math.pow(1 - f, 4);
const salidaRebote = (f: number, s = 2.2) => 1 + (s + 1) * Math.pow(f - 1, 3) + s * Math.pow(f - 1, 2);

function forma([exterior, ...huecos]: Anillos) {
  const s = new THREE.Shape(exterior.map(([x, y]) => aMundo(x, y)));
  huecos.forEach((h) => s.holes.push(new THREE.Path(h.map(([x, y]) => aMundo(x, y)))));
  return s;
}
function circulo(cx: number, cy: number, r: number) {
  const c = aMundo(cx, cy);
  const s = new THREE.Shape();
  s.absarc(c.x, c.y, r / ESC, 0, Math.PI * 2, false);
  return s;
}

// Degradado del cuerpo: proyección sobre el vector abajo-izquierda → arriba-derecha (como en el SVG).
const g = marca.degradado;
const gx = g.x2 - g.x1;
const gy = g.y2 - g.y1;
const g2 = gx * gx + gy * gy;
const degradadoCuerpo = (x: number, y: number) => ((x - g.x1) * gx + (y - g.y1) * gy) / g2;
// Degradado propio de una pieza (su caja): esquina abajo-izquierda → arriba-derecha.
const degradadoCaja = (x0: number, y0: number, w: number, h: number) => (x: number, y: number) =>
  ((x - x0) / w + 1 - (y - y0) / h) / 2;

/** Geometría extruida con u = posición en el degradado (así cada píxel toma su color exacto). */
function extruir(s: THREE.Shape, degradado: (x: number, y: number) => number) {
  const geo = new THREE.ExtrudeGeometry(s, EXT);
  geo.translate(0, 0, -EXT.depth / 2);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = clamp01(degradado(pos.getX(i) * ESC + CX, -pos.getY(i) * ESC + CY));
    uv[i * 2 + 1] = 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

function textura(paradas: readonly (readonly [number, string])[]) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 2;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  paradas.forEach(([o, color]) => grad.addColorStop(o, color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function material(paradas: readonly (readonly [number, string])[]) {
  const map = textura(paradas);
  return new THREE.MeshPhysicalMaterial({
    map,
    emissiveMap: map,
    emissive: 0xffffff,
    emissiveIntensity: 0.2,
    metalness: 0.22,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
}

interface Pieza {
  grupo: THREE.Group;
  base: THREE.Vector3;
  desde: { p: V3; r: V3; s: number }; // desfase al empezar a armarse
  abre: { p: V3; r: V3 }; // desfase con la vista explotada completa
  inicio: number;
  duracion: number;
  rebote?: boolean;
  f: number; // avance actual de esta pieza (0..1)
}

export function crearLogo3D() {
  const matCuerpo = material(DEGRADADOS.cuerpo);
  const matHex = material(DEGRADADOS.hexagono);
  const matBurbuja = material(DEGRADADOS.burbuja);
  const matNodo = material(DEGRADADOS.cuerpo);
  const materiales = [matCuerpo, matHex, matBurbuja, matNodo];

  const grupo = new THREE.Group();
  const conjunto = new THREE.Group(); // gira con el puntero y el scroll
  grupo.add(conjunto);
  const piezas: Pieza[] = [];

  function agregar(geo: THREE.BufferGeometry, mat: THREE.Material, centro: THREE.Vector2, datos: Omit<Pieza, "grupo" | "base" | "f">) {
    geo.translate(-centro.x, -centro.y, 0);
    const malla = new THREE.Mesh(geo, mat);
    const contenedor = new THREE.Group();
    contenedor.add(malla);
    contenedor.position.set(centro.x, centro.y, 0);
    conjunto.add(contenedor);
    const pieza: Pieza = { grupo: contenedor, base: contenedor.position.clone(), f: 0, ...datos };
    piezas.push(pieza);
    return pieza;
  }

  // Centro del cuerpo: de ahí salen las direcciones de las esquirlas.
  const env = marca.envolvente;
  const centroCuerpo = aMundo(
    (Math.min(...env.map((p) => p[0])) + Math.max(...env.map((p) => p[0]))) / 2,
    (Math.min(...env.map((p) => p[1])) + Math.max(...env.map((p) => p[1]))) / 2,
  );

  // Esquirlas: llegan desde afuera, girando, con un leve desfase entre ellas.
  const GIROS: V3[] = [
    [0.9, -1.4, 0.8],
    [-1.2, 0.7, -0.5],
    [0.7, 1.5, -0.9],
    [-0.8, -1.1, 0.6],
    [1.1, 0.9, 0.7],
  ];
  const PROF = [2.2, 1.7, 2.6, 1.9, 2.4];
  const ABRE_Z = [0.32, 0.55, -0.18, 0.42, -0.3];
  const esquirlas = piezas3d.esquirlas.map((e, i) => {
    const centro = aMundo(e.centro[0], e.centro[1]);
    const dir = centro.clone().sub(centroCuerpo).normalize();
    return agregar(extruir(forma(e.pts), degradadoCuerpo), matCuerpo, centro, {
      desde: { p: [dir.x * 1.9, dir.y * 1.9, PROF[i]], r: GIROS[i], s: 0.7 },
      abre: { p: [dir.x * 0.42, dir.y * 0.42, ABRE_Z[i]], r: [GIROS[i][0] * 0.12, GIROS[i][1] * 0.12, GIROS[i][2] * 0.08] },
      inicio: i * 0.04,
      duracion: 0.45,
    });
  });

  // Cuerpo entero: se muestra cuando todo está armado y quieto (sin las uniones de las esquirlas).
  const cuerpoGeo = extruir(forma(piezas3d.cuerpo), degradadoCuerpo);
  const cuerpo = new THREE.Mesh(cuerpoGeo, matCuerpo);
  cuerpo.visible = false;
  conjunto.add(cuerpo);

  // Hexágono chico: cae desde arriba girando 60° (encaja igual).
  const hp = piezas3d.hexagono.pts[0];
  const hx = hp.map((p) => p[0]);
  const hy = hp.map((p) => p[1]);
  const cajaHex = degradadoCaja(Math.min(...hx), Math.min(...hy), Math.max(...hx) - Math.min(...hx), Math.max(...hy) - Math.min(...hy));
  agregar(extruir(forma(piezas3d.hexagono.pts), cajaHex), matHex, aMundo(piezas3d.hexagono.centro[0], piezas3d.hexagono.centro[1]), {
    desde: { p: [0, 1.5, 1.6], r: [0.9, 0, -Math.PI / 3], s: 0.6 },
    abre: { p: [0, 0.38, 0.5], r: [0.25, 0, 0.12] },
    inicio: 0.4,
    duracion: 0.35,
  });

  // Burbujas: brotan desde la esquina del cuerpo con rebote.
  marca.burbujas.forEach((b, i) => {
    const centro = aMundo(b.cx, b.cy);
    agregar(extruir(circulo(b.cx, b.cy, b.r), degradadoCaja(b.cx - b.r, b.cy - b.r, b.r * 2, b.r * 2)), matBurbuja, centro, {
      desde: { p: [-0.32 - i * 0.08, -0.3 - i * 0.1, 0.4], r: [0, 0, 0], s: 0 },
      abre: { p: [0.35 + i * 0.12, 0.3 + i * 0.12, 0.75 + i * 0.2], r: [0, 0, 0] },
      inicio: 0.52 + i * 0.07,
      duracion: 0.3,
      rebote: true,
    });
  });

  // Nodos: se encienden al final, con un destello.
  const nodos = marca.nodos.map((n, i) =>
    agregar(extruir(circulo(n.cx, n.cy, n.r), degradadoCuerpo), matNodo, aMundo(n.cx, n.cy), {
      desde: { p: [0, 0, 0.5], r: [0, 0, 0], s: 0 },
      abre: { p: [0, 0, 0.3 + i * 0.06], r: [0, 0, 0] },
      inicio: 0.6 + i * 0.06,
      duracion: 0.22,
      rebote: true,
    }),
  );

  let armado = 0;
  let separacion = 0;
  let brilloBase = 0.2;

  function aplicar() {
    for (const pz of piezas) {
      pz.f = clamp01((armado - pz.inicio) / pz.duracion);
      const e = pz.rebote ? salidaRebote(pz.f) : salidaCuarta(pz.f);
      const k = 1 - e;
      const { desde, abre } = pz;
      pz.grupo.position.set(
        pz.base.x + desde.p[0] * k + abre.p[0] * separacion,
        pz.base.y + desde.p[1] * k + abre.p[1] * separacion,
        desde.p[2] * k + abre.p[2] * separacion,
      );
      pz.grupo.rotation.set(
        desde.r[0] * k + abre.r[0] * separacion,
        desde.r[1] * k + abre.r[1] * separacion,
        desde.r[2] * k + abre.r[2] * separacion,
      );
      pz.grupo.scale.setScalar(Math.max(0.0001, desde.s + (1 - desde.s) * e));
      pz.grupo.visible = pz.f > 0.001;
    }
    // Armado y quieto: se ve el cuerpo entero en lugar de sus esquirlas.
    const entero = armado >= 0.999 && separacion < 0.002;
    cuerpo.visible = entero;
    esquirlas.forEach((pz) => (pz.grupo.visible = !entero && pz.f > 0.001));
    // Destello de los nodos mientras aparecen.
    const destello = Math.max(...nodos.map((n) => (n.f > 0 && n.f < 1 ? Math.sin(n.f * Math.PI) : 0)));
    matNodo.emissiveIntensity = brilloBase + destello * 1.6;
  }

  /** armar: 0 = piezas sueltas, 1 = logo armado. separar: 0 = junto, 1 = vista explotada. */
  function pose(armar: number, separar: number) {
    armado = armar;
    separacion = separar;
    aplicar();
  }

  function aplicarTema(t: Tema) {
    const claro = t === "claro";
    // En tema claro el entorno es brillante: menos reflejo y más brillo propio para que el naranja no se lave.
    brilloBase = claro ? 0.5 : 0.2;
    for (const m of materiales) {
      m.envMapIntensity = claro ? 0.16 : 1;
      m.clearcoat = claro ? 0.45 : 1;
      m.emissiveIntensity = brilloBase;
    }
  }

  pose(0, 0);
  return { grupo, marca: conjunto, pose, aplicarTema, ancho: marca.ancho / ESC, alto: marca.alto / ESC };
}
