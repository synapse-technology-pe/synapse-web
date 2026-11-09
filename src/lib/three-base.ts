// Utilidades compartidas por las escenas 3D: renderer, entorno de luces, bucle solo visible y azar con semilla.
import * as THREE from "three";
import { gsap } from "./movimiento";
import { escalaCalidad, alCambiarCalidad, escenaActiva } from "./calidad";

export { THREE };

export function crearRenderer(canvas: HTMLCanvasElement, maxDpr = 1.75) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const movil = window.matchMedia("(max-width: 760px)").matches;
  // Resolución: la de la pantalla (con tope) por la escala de calidad, que baja sola si el equipo no llega.
  const base = Math.min(window.devicePixelRatio || 1, movil ? Math.min(maxDpr, 1.5) : maxDpr);
  renderer.setPixelRatio(base * escalaCalidad());
  alCambiarCalidad((escala) => renderer.setPixelRatio(base * escala));
  // En producción no se leen los registros de compilación de shaders: leerlos obliga a esperar y traba la página.
  renderer.debug.checkShaderErrors = import.meta.env.DEV;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** Entorno de estudio dibujado en un canvas: tiras de luz blancas y una roja para los reflejos. */
export function entornoEstudio(renderer: THREE.WebGLRenderer, claro = false) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  const fondo = g.createLinearGradient(0, 0, 0, 512);
  fondo.addColorStop(0, claro ? "#d9d9d6" : "#0b0b0d");
  fondo.addColorStop(0.55, claro ? "#b9b9b5" : "#050506");
  fondo.addColorStop(1, claro ? "#8f8f8b" : "#020203");
  g.fillStyle = fondo;
  g.fillRect(0, 0, 1024, 512);
  const tiras: [number, number, string, number][] = [
    [150, 1, "#ffffff", 70],
    [430, 0.6, "#ffffff", 50],
    [660, 0.95, "#ff2424", 80],
    [880, 0.5, "#ffffff", 46],
  ];
  for (const [x, a, color, ancho] of tiras) {
    const grad = g.createLinearGradient(x - ancho, 0, x + ancho, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = a;
    g.fillStyle = grad;
    g.fillRect(x - ancho, 70, ancho * 2, 370);
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(tex).texture;
  tex.dispose();
  pm.dispose();
  return env;
}

/**
 * Llama a `cuadro` en cada fotograma solo mientras `el` está en pantalla y la pestaña visible.
 * Usa el mismo reloj que GSAP para que scroll y 3D vayan sincronizados.
 */
export function bucleVisible(el: Element, cuadro: (t: number, dt: number) => void, margen = "120px") {
  let visible = false;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting === visible) return;
      visible = e.isIntersecting;
      escenaActiva(visible); // la calidad adaptable solo mide mientras hay escenas dibujándose
    },
    { rootMargin: margen },
  );
  io.observe(el);
  const tick = (t: number, dtMs: number) => {
    if (!visible || document.hidden) return;
    cuadro(t, Math.min(dtMs / 1000, 0.05));
  };
  gsap.ticker.add(tick);
  return {
    get visible() {
      return visible;
    },
    detener() {
      io.disconnect();
      gsap.ticker.remove(tick);
      if (visible) escenaActiva(false);
    },
  };
}

/** Azar reproducible (mulberry32): la red siempre se arma igual. */
export function azar(semilla = 7) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Compila los shaders de la escena sin bloquear la página (en paralelo si el navegador lo permite). */
export async function precompilar(renderer: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera) {
  try {
    await renderer.compileAsync(escena, camara);
  } catch {
    /* si falla, se compila al dibujar el primer cuadro */
  }
}

const tamanos = new WeakMap<THREE.WebGLRenderer, string>();
/** Ajusta el tamaño del renderer y la cámara al de su canvas (sin rehacer el lienzo si no cambió). */
export function ajustarTamano(renderer: THREE.WebGLRenderer, camara: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
  const w = canvas.clientWidth || 1;
  const h = canvas.clientHeight || 1;
  if (tamanos.get(renderer) !== `${w}x${h}`) {
    tamanos.set(renderer, `${w}x${h}`);
    renderer.setSize(w, h, false);
  }
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
  return { w, h };
}
