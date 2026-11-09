// Aligera los modelos GLB: quita piezas que casi no se ven (rejillas de parlantes) y los logos de Apple,
// y vuelve a empaquetar el binario solo con los datos que se usan.
// Uso: node scripts/optimizar-modelos.mjs <entrada.glb> <salida.glb> [nombre-de-nodo ...]
import { readFileSync, writeFileSync } from "node:fs";

const [entrada, salida, ...quitar] = process.argv.slice(2);
if (!entrada || !salida) {
  console.error("Uso: node scripts/optimizar-modelos.mjs <entrada.glb> <salida.glb> [nodos a quitar]");
  process.exit(1);
}

const glb = readFileSync(entrada);
const largoJson = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + largoJson).toString("utf8"));
const inicioBin = 20 + largoJson + 8;
const bin = glb.subarray(inicioBin, inicioBin + glb.readUInt32LE(20 + largoJson));

const sobra = (n) => quitar.some((q) => (n.name ?? "").startsWith(q));
const mapa = () => new Map();
const nodos = mapa();
const nuevosNodos = [];

// 1. Nodos que quedan (recorriendo la escena) y sus hijos remapeados.
function visitar(i) {
  const n = json.nodes[i];
  if (sobra(n)) return null;
  const nuevo = { ...n };
  nodos.set(i, nuevosNodos.length);
  nuevosNodos.push(nuevo);
  if (n.children) nuevo.children = n.children.map(visitar).filter((x) => x !== null);
  if (nuevo.children && !nuevo.children.length) delete nuevo.children;
  return nodos.get(i);
}
const escenas = json.scenes.map((s) => ({ ...s, nodes: s.nodes.map(visitar).filter((x) => x !== null) }));

// 2. Mallas, accesores, materiales, texturas, imágenes y bufferViews en uso.
const usar = (m, viejo, lista, valor) => {
  if (!m.has(viejo)) {
    m.set(viejo, lista.length);
    lista.push(valor);
  }
  return m.get(viejo);
};
const mallas = mapa(), accesores = mapa(), materiales = mapa(), texturas = mapa(), imagenes = mapa(), vistas = mapa();
const L = { mallas: [], accesores: [], materiales: [], texturas: [], imagenes: [], vistas: [] };

const vista = (i) => usar(vistas, i, L.vistas, json.bufferViews[i]);
const accesor = (i) => {
  if (!accesores.has(i)) {
    const a = { ...json.accessors[i] };
    usar(accesores, i, L.accesores, a);
    if (a.bufferView !== undefined) a.bufferView = vista(a.bufferView);
  }
  return accesores.get(i);
};
const imagen = (i) => {
  if (!imagenes.has(i)) {
    const im = { ...json.images[i] };
    usar(imagenes, i, L.imagenes, im);
    if (im.bufferView !== undefined) im.bufferView = vista(im.bufferView);
  }
  return imagenes.get(i);
};
const textura = (i) => {
  if (!texturas.has(i)) {
    const t = { ...json.textures[i] };
    usar(texturas, i, L.texturas, t);
    if (t.source !== undefined) t.source = imagen(t.source);
  }
  return texturas.get(i);
};
// Remapea cualquier { index } dentro de claves que terminan en "Texture".
function remapTexturas(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const copia = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (/Texture$/.test(k) && v && typeof v.index === "number") copia[k] = { ...remapTexturas(v), index: textura(v.index) };
    else copia[k] = typeof v === "object" ? remapTexturas(v) : v;
  }
  return copia;
}
const material = (i) => {
  if (!materiales.has(i)) usar(materiales, i, L.materiales, null);
  const j = materiales.get(i);
  if (L.materiales[j] === null) L.materiales[j] = remapTexturas(json.materials[i]);
  return j;
};
const malla = (i) => {
  if (!mallas.has(i)) {
    const m = json.meshes[i];
    const nueva = {
      ...m,
      primitives: m.primitives.map((p) => {
        const q = { ...p, attributes: Object.fromEntries(Object.entries(p.attributes).map(([k, a]) => [k, accesor(a)])) };
        if (p.indices !== undefined) q.indices = accesor(p.indices);
        if (p.material !== undefined) q.material = material(p.material);
        if (p.targets) q.targets = p.targets.map((t) => Object.fromEntries(Object.entries(t).map(([k, a]) => [k, accesor(a)])));
        return q;
      }),
    };
    usar(mallas, i, L.mallas, nueva);
  }
  return mallas.get(i);
};
nuevosNodos.forEach((n) => {
  if (n.mesh !== undefined) n.mesh = malla(n.mesh);
  delete n.skin;
});

// 3. Nuevo binario con las bufferViews usadas (alineadas a 4 bytes).
const trozos = [];
let desplazamiento = 0;
const nuevasVistas = L.vistas.map((v) => {
  const datos = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
  const relleno = (4 - (desplazamiento % 4)) % 4;
  if (relleno) trozos.push(Buffer.alloc(relleno));
  desplazamiento += relleno;
  const nueva = { ...v, buffer: 0, byteOffset: desplazamiento };
  trozos.push(datos);
  desplazamiento += datos.length;
  return nueva;
});
const relleno = (4 - (desplazamiento % 4)) % 4;
if (relleno) trozos.push(Buffer.alloc(relleno));
const nuevoBin = Buffer.concat(trozos);

const salidaJson = {
  ...json,
  scenes: escenas,
  nodes: nuevosNodos,
  meshes: L.mallas,
  accessors: L.accesores,
  bufferViews: nuevasVistas,
  buffers: [{ byteLength: nuevoBin.length }],
};
if (L.materiales.length) salidaJson.materials = L.materiales;
else delete salidaJson.materials;
if (L.texturas.length) salidaJson.textures = L.texturas;
else delete salidaJson.textures;
if (L.imagenes.length) salidaJson.images = L.imagenes;
else delete salidaJson.images;
delete salidaJson.animations;
delete salidaJson.skins;

let textoJson = Buffer.from(JSON.stringify(salidaJson), "utf8");
textoJson = Buffer.concat([textoJson, Buffer.alloc((4 - (textoJson.length % 4)) % 4, 0x20)]);
const cabecera = Buffer.alloc(12);
cabecera.writeUInt32LE(0x46546c67, 0);
cabecera.writeUInt32LE(2, 4);
cabecera.writeUInt32LE(12 + 8 + textoJson.length + 8 + nuevoBin.length, 8);
const bloque = (tipo, datos) => {
  const h = Buffer.alloc(8);
  h.writeUInt32LE(datos.length, 0);
  h.writeUInt32LE(tipo, 4);
  return Buffer.concat([h, datos]);
};
writeFileSync(salida, Buffer.concat([cabecera, bloque(0x4e4f534a, textoJson), bloque(0x004e4942, nuevoBin)]));
console.log(`${entrada} (${(glb.length / 1024).toFixed(0)} KB) → ${salida} (${((12 + 16 + textoJson.length + nuevoBin.length) / 1024).toFixed(0)} KB), nodos ${json.nodes.length} → ${nuevosNodos.length}`);
