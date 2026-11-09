// Objetos 3D que orbitan el logo del héroe: código, base de datos, engranaje, chat, cubo, nube,
// celular y anillo (todo lo que construimos). Se arman al entrar, siguen al puntero y se dispersan con el scroll.
import { THREE } from "../../lib/three-base";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Tema } from "../../lib/tema";

const EXT = { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4, curveSegments: 14 };

function forma(pts: number[][]) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function extruir(s: THREE.Shape, profundidad = EXT.depth) {
  const g = new THREE.ExtrudeGeometry(s, { ...EXT, depth: profundidad });
  g.center();
  return g;
}

function formaEngranaje(dientes = 10, rExt = 0.5, rInt = 0.39, rHueco = 0.15) {
  const s = new THREE.Shape();
  const pasos = dientes * 4;
  for (let i = 0; i <= pasos; i++) {
    const a = (i / pasos) * Math.PI * 2;
    const r = i % 4 < 2 ? rExt : rInt;
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const hueco = new THREE.Path();
  hueco.absarc(0, 0, rHueco, 0, Math.PI * 2, true);
  s.holes.push(hueco);
  return s;
}

function formaBurbuja(w = 1, h = 0.7, r = 0.22) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(-0.3, -h / 2);
  s.lineTo(-0.38, -h / 2 - 0.24);
  s.lineTo(-0.1, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function texturaPantalla() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "#ff3b3b");
  grad.addColorStop(1, "#5a050a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 128);
  g.fillStyle = "rgba(255,255,255,0.85)";
  [26, 46, 62, 78].forEach((y, i) => g.fillRect(10, y, i === 0 ? 30 : 44, 6));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface Objeto {
  malla: THREE.Object3D;
  base: THREE.Vector3;
  giro: THREE.Vector3;
  inicial: THREE.Euler;
  esc: number;
  fase: number;
}

export function crearObjetos3D(movil: boolean) {
  const tinta = new THREE.MeshPhysicalMaterial({ color: 0xededf0, metalness: 0.6, roughness: 0.24, clearcoat: 0.8 });
  const rojo = new THREE.MeshPhysicalMaterial({ color: 0xe5121b, metalness: 0.3, roughness: 0.28, clearcoat: 1, emissive: 0x3a0000 });
  const grafito = new THREE.MeshPhysicalMaterial({ color: 0x2a2a30, metalness: 0.85, roughness: 0.34, clearcoat: 0.5 });
  const pantalla = new THREE.MeshBasicMaterial({ map: texturaPantalla(), toneMapped: false });

  const grupo = new THREE.Group();
  const lista: Objeto[] = [];
  const agregar = (malla: THREE.Object3D, base: number[], giro: number[], esc: number, fase: number) => {
    malla.rotation.set(fase, fase * 1.7, fase * 0.6);
    grupo.add(malla);
    lista.push({
      malla,
      base: new THREE.Vector3(...base),
      giro: new THREE.Vector3(...giro),
      inicial: malla.rotation.clone(),
      esc,
      fase,
    });
  };

  // </>
  const llaves = new THREE.Group();
  const menor = extruir(forma([[0.36, 0.55], [-0.24, 0], [0.36, -0.55], [0.5, -0.42], [0.06, 0], [0.5, 0.42]]));
  const izq = new THREE.Mesh(menor, rojo);
  izq.position.x = -0.66;
  const der = new THREE.Mesh(menor, rojo);
  der.rotation.z = Math.PI;
  der.position.x = 0.66;
  llaves.add(izq, new THREE.Mesh(extruir(forma([[0.12, -0.62], [0.3, -0.62], [-0.12, 0.62], [-0.3, 0.62]])), rojo), der);

  // Base de datos: tres discos con filo rojo
  const bd = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.17, 48), tinta);
    disco.position.y = (i - 1) * 0.23;
    const filo = new THREE.Mesh(new THREE.TorusGeometry(0.425, 0.014, 8, 56), rojo);
    filo.rotation.x = Math.PI / 2;
    filo.position.y = disco.position.y + 0.085;
    bd.add(disco, filo);
  }

  const engranaje = new THREE.Mesh(extruir(formaEngranaje(), 0.16), grafito);

  // Burbuja de chat con tres puntos
  const chat = new THREE.Group();
  chat.add(new THREE.Mesh(extruir(formaBurbuja(), 0.16), tinta));
  [-0.24, 0, 0.24].forEach((x) => {
    const punto = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), rojo);
    punto.position.set(x, 0.02, 0.15);
    chat.add(punto);
  });

  const cubo = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.6, 0.6, 4, 0.12), rojo);

  const nube = new THREE.Group();
  [[0, 0.04, 0.33], [-0.34, -0.08, 0.24], [0.34, -0.07, 0.26], [0.12, 0.2, 0.25], [-0.14, 0.16, 0.22]].forEach(([x, y, r]) => {
    const bola = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), tinta);
    bola.position.set(x, y, 0);
    nube.add(bola);
  });
  nube.scale.z = 0.7;

  const telefono = new THREE.Group();
  telefono.add(new THREE.Mesh(new RoundedBoxGeometry(0.52, 1.02, 0.08, 4, 0.07), grafito));
  const pant = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.92), pantalla);
  pant.position.z = 0.042;
  telefono.add(pant);

  const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.085, 22, 64), tinta);

  // Posiciones respecto del logo (unidades del logo). En celular, solo cuatro y a los costados.
  if (movil) {
    agregar(llaves, [1.8, 0.8, 0.2], [0.2, 0.5, 0], 0.62, 0.3);
    agregar(cubo, [-1.75, 0.75, -0.4], [0.4, 0.3, 0.2], 0.58, 1.1);
    agregar(chat, [-1.8, -0.7, 0.3], [0, 0.4, 0.1], 0.6, 2.2);
    agregar(engranaje, [1.75, -0.75, 0.1], [0, 0, 0.6], 0.6, 0.7);
  } else {
    agregar(llaves, [1.45, 1.85, 0.4], [0.15, 0.45, 0.05], 0.52, 0.3);
    agregar(bd, [2.0, -0.25, -0.8], [0.25, 0.4, 0], 0.55, 1.4);
    agregar(engranaje, [1.3, -1.9, 0.3], [0.1, 0.2, 0.55], 0.55, 0.7);
    agregar(chat, [-0.35, -2.25, 0.6], [0.05, 0.4, 0.08], 0.5, 2.2);
    agregar(cubo, [-1.05, 1.85, -0.9], [0.35, 0.3, 0.2], 0.46, 1.1);
    agregar(nube, [2.45, 1.3, -2.4], [0.05, 0.25, 0.02], 0.7, 2.8);
    agregar(telefono, [2.4, -1.6, -1.6], [0.1, 0.35, 0.05], 0.65, 0.5);
    agregar(anillo, [-1.6, 0.2, -2.8], [0.4, 0.5, 0.1], 0.6, 1.9);
  }

  const desplaza = new THREE.Vector3();
  /** aparicion 0..1 (entrada), scroll 0..1, puntero -1..1 */
  function actualizar(
    t: number,
    lugar: { x: number; y: number; s: number; kx: number },
    aparicion: number,
    scroll: number,
    puntero: THREE.Vector2,
  ) {
    lista.forEach((o, i) => {
      // A la derecha la órbita se comprime si no hay espacio hasta el borde de la pantalla.
      const bx = o.base.x > 0 ? o.base.x * lugar.kx : o.base.x;
      const f = THREE.MathUtils.clamp(aparicion * 1.5 - i * 0.08, 0, 1);
      const e = f === 0 ? 0 : 1 + 2.4 * Math.pow(f - 1, 3) + 1.4 * Math.pow(f - 1, 2); // salida con rebote
      const abre = 1 + scroll * 1.8;
      const prof = 0.12 + (o.base.z + 3) * 0.06;
      desplaza.set(puntero.x * prof, puntero.y * prof * 0.6, 0);
      o.malla.position.set(
        lugar.x + bx * lugar.s * abre + desplaza.x,
        lugar.y + (o.base.y + Math.sin(t * 0.8 + o.fase * 3) * 0.09) * lugar.s * abre + desplaza.y + scroll * 1.2,
        o.base.z + scroll * 1.5,
      );
      o.malla.rotation.set(o.inicial.x + t * o.giro.x, o.inicial.y + t * o.giro.y + scroll * 2, o.inicial.z + t * o.giro.z);
      o.malla.scale.setScalar(Math.max(0.0001, o.esc * lugar.s * e));
      o.malla.visible = f > 0.001;
    });
  }

  function aplicarTema(tema: Tema) {
    const claro = tema === "claro";
    tinta.color.set(claro ? 0x141417 : 0xededf0);
    tinta.metalness = claro ? 0.35 : 0.6;
    rojo.envMapIntensity = claro ? 0.45 : 1;
    rojo.emissive.set(claro ? 0x6a0000 : 0x3a0000);
    grafito.color.set(claro ? 0x3a3a42 : 0x2a2a30);
  }

  return { grupo, actualizar, aplicarTema };
}
