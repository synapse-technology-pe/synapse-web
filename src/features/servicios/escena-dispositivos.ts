// Escena 3D de Servicios: MacBook (con tapa que se abre) e iPhone con pantallas dibujadas en vivo.
import { THREE, crearRenderer, entornoEstudio, bucleVisible, ajustarTamano, precompilar } from "../../lib/three-base";
import { escalaCalidad } from "../../lib/calidad";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { temaActual, alCambiarTema, type Tema } from "../../lib/tema";
import { reducido } from "../../lib/movimiento";
import { crearPantallas, fuentesListas } from "./pantallas";
import type { EstadoEscena } from "./estado-escena";

const nombreBase = (o: THREE.Object3D) => o.name.replace(/[._]\d+$/, "");

/** Proyección plana para que la textura cubra la pantalla de borde a borde. */
function uvPlano(malla: THREE.Mesh) {
  const g = malla.geometry;
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const pos = g.attributes.position;
  const w = b.max.x - b.min.x || 1;
  const h = b.max.y - b.min.y || 1;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - b.min.x) / w;
    uv[i * 2 + 1] = (pos.getY(i) - b.min.y) / h;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

function texturaSombra() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.6)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.22)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export async function crearEscenaDispositivos(canvas: HTMLCanvasElement, seccion: HTMLElement, estado: EstadoEscena) {
  const cargador = new GLTFLoader();
  const [, glLaptop, glTel] = await Promise.all([
    fuentesListas(),
    cargador.loadAsync("/models/macbook.glb"),
    cargador.loadAsync("/models/iphone.glb"),
  ]);

  const renderer = crearRenderer(canvas, 1.75);
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
  const entornos: Partial<Record<Tema, THREE.Texture>> = {};
  const entorno = (t: Tema) => (entornos[t] ??= entornoEstudio(renderer, t === "claro"));

  const clave = new THREE.DirectionalLight(0xffffff, 2.1);
  clave.position.set(-3, 5, 6);
  const borde = new THREE.PointLight(0xff1a1a, 30, 0, 2);
  borde.position.set(3.4, 2.4, -2.6);
  const borde2 = new THREE.PointLight(0xff2a2a, 12, 0, 2);
  borde2.position.set(-3.6, 0.6, -1.6);
  escena.add(clave, borde, borde2, new THREE.AmbientLight(0xffffff, 0.18));

  const pantallas = crearPantallas();
  const texL = new THREE.CanvasTexture(pantallas.laptop);
  const texT = new THREE.CanvasTexture(pantallas.telefono);
  for (const t of [texL, texT]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  // ── MacBook ──
  const laptop = glLaptop.scene;
  const bisagra = new THREE.Group();
  bisagra.position.set(0, 0.0155, -0.1052);
  laptop.add(bisagra);
  laptop.updateMatrixWorld(true);
  const deTapa = ["lid", "lid-glass", "display", "display-notch", "camera", "apple-logo", "apple-logo-leaf"];
  const aMover: THREE.Object3D[] = [];
  laptop.traverse((o) => {
    if (o.parent === laptop && deTapa.includes(nombreBase(o))) aMover.push(o);
  });
  aMover.forEach((o) => bisagra.attach(o));
  laptop.traverse((o) => {
    const n = nombreBase(o);
    if (n.startsWith("apple-logo")) o.visible = false;
    if ((o as THREE.Mesh).isMesh && n === "display") {
      uvPlano(o as THREE.Mesh);
      (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ map: texL, toneMapped: false });
    }
  });
  const contL = new THREE.Group();
  contL.add(laptop);
  let caja = new THREE.Box3().setFromObject(laptop);
  laptop.scale.setScalar(3.4 / caja.getSize(new THREE.Vector3()).x);
  caja = new THREE.Box3().setFromObject(laptop);
  const centroL = caja.getCenter(new THREE.Vector3());
  laptop.position.set(-centroL.x, -caja.min.y, -centroL.z);
  escena.add(contL);

  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 4.4),
    new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false, toneMapped: false }),
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.002;
  contL.add(sombra);

  // ── iPhone ──
  const tel = glTel.scene;
  tel.traverse((o) => {
    const malla = o as THREE.Mesh;
    if (!malla.isMesh) return;
    const n = nombreBase(o);
    if (n.startsWith("apple-logo")) {
      o.visible = false;
      return;
    }
    if (n.startsWith("front-glass")) {
      uvPlano(malla);
      malla.material = new THREE.MeshBasicMaterial({ map: texT, toneMapped: false });
      return;
    }
    const m = malla.material as THREE.MeshPhysicalMaterial;
    const nm = m.name ?? "";
    if (/anodised|antenna|lens-ring/.test(nm)) {
      m.color.set(0x2a2a2f);
      m.metalness = 0.85;
      m.roughness = 0.32;
    } else if (/shield-back/.test(nm)) {
      m.color.set(0x1b1b1f);
      m.roughness = 0.28;
    }
  });
  const buscar = (base: string) => {
    let hallado: THREE.Object3D | undefined;
    tel.traverse((o) => {
      if (!hallado && nombreBase(o).startsWith(base)) hallado = o;
    });
    return hallado;
  };
  const frente = buscar("front-glass");
  const atras = buscar("rear-window");
  if (frente && atras) {
    tel.updateMatrixWorld(true);
    const pf = frente.getWorldPosition(new THREE.Vector3());
    const pa = atras.getWorldPosition(new THREE.Vector3());
    if (pf.z < pa.z) tel.rotation.y += Math.PI;
  }
  caja = new THREE.Box3().setFromObject(tel);
  tel.scale.setScalar(1.85 / caja.getSize(new THREE.Vector3()).y);
  caja = new THREE.Box3().setFromObject(tel);
  tel.position.sub(caja.getCenter(new THREE.Vector3()));
  const contT = new THREE.Group();
  contT.add(tel);
  escena.add(contT);

  // ── Puntero ──
  const puntero = new THREE.Vector2();
  const suave = new THREE.Vector2();
  seccion.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    },
    { passive: true },
  );
  seccion.addEventListener("pointerleave", () => puntero.set(0, 0));

  const distribuir = () => ajustarTamano(renderer, camara, canvas);
  distribuir();
  new ResizeObserver(distribuir).observe(canvas);

  const mira = new THREE.Vector3();
  const pos = new THREE.Vector3();
  let ultimoT = 0;
  let ultimoDibujo = -1;
  function cuadro(t: number, dt: number) {
    ultimoT = t;
    const e = estado;
    // Las pantallas se redibujan solo si cambian. Si el equipo va justo, como mucho ~25 veces por segundo.
    const pausa = escalaCalidad() < 1 ? 0.04 : 0;
    if (t - ultimoDibujo >= pausa || dt === 0) {
      const { laptopCambio, telCambio } = pantallas.dibujar(e.pantallas);
      if (laptopCambio) texL.needsUpdate = true;
      if (telCambio) texT.needsUpdate = true;
      if (laptopCambio || telCambio) ultimoDibujo = t;
    }

    contL.position.set(e.lapX, e.lapY, e.lapZ);
    contL.rotation.y = e.lapRY;
    bisagra.rotation.x = THREE.MathUtils.lerp(-0.2, 1.565, e.tapa);

    const flota = reducido ? 0 : Math.sin(t * 1.1) * 0.035;
    contT.visible = e.telS > 0.01;
    contT.position.set(e.telX, e.telY + flota, e.telZ);
    contT.rotation.set(e.telRX, e.telRY + (reducido ? 0 : Math.sin(t * 0.7) * 0.04), e.telRZ);
    contT.scale.setScalar(Math.max(0.001, e.telS));

    suave.lerp(puntero, 1 - Math.pow(0.003, dt || 0.016));
    // En pantallas angostas la cámara se aleja para que todo quepa.
    const k = Math.max(1, 1.08 / camara.aspect);
    mira.set(e.mirX, e.mirY, e.mirZ);
    pos.set(e.camX, e.camY, e.camZ).sub(mira).multiplyScalar(k).add(mira);
    pos.x += suave.x * 0.3;
    pos.y += suave.y * 0.18;
    camara.position.copy(pos);
    camara.lookAt(mira);
    renderer.render(escena, camara);
  }

  let listo = false;
  function aplicarTema(t: Tema) {
    escena.environment = entorno(t);
    (sombra.material as THREE.MeshBasicMaterial).opacity = t === "claro" ? 0.9 : 0.75;
    borde.intensity = t === "claro" ? 18 : 30;
    if (listo) cuadro(ultimoT, 0);
  }
  aplicarTema(temaActual());
  alCambiarTema(aplicarTema);

  // Shaders compilados antes del primer cuadro y sin bloquear la página.
  await precompilar(renderer, escena, camara);
  listo = true;
  bucleVisible(seccion, cuadro, "200px");
}
