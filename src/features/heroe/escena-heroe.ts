// Escena 3D del héroe: el logo extruido sobre la red de sinapsis. Sigue al puntero y al scroll;
// al bajar, las piezas del logo se separan (vista explotada) mientras gira.
import { THREE, crearRenderer, entornoEstudio, bucleVisible, ajustarTamano, precompilar } from "../../lib/three-base";
import { temaActual, alCambiarTema, type Tema } from "../../lib/tema";
import { gsap, reducido } from "../../lib/movimiento";
import { crearLogo3D } from "./logo-3d";
import { crearRed } from "./red-neuronal";

export async function crearEscenaHeroe(canvas: HTMLCanvasElement, seccion: HTMLElement) {
  const renderer = crearRenderer(canvas);
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camara.position.set(0, 0, 10);

  const entornos: Partial<Record<Tema, THREE.Texture>> = {};
  const entorno = (t: Tema) => (entornos[t] ??= entornoEstudio(renderer, t === "claro"));

  const luzClave = new THREE.DirectionalLight(0xffffff, 2.4);
  luzClave.position.set(-4, 5, 8);
  const luzRoja = new THREE.PointLight(0xff1a1a, 36, 16, 2);
  luzRoja.position.set(3, 1.6, -2.2);
  const relleno = new THREE.AmbientLight(0xffffff, 0.12);
  escena.add(luzClave, luzRoja, relleno);

  const logo = crearLogo3D();
  escena.add(logo.grupo);
  const movil = window.matchMedia("(max-width: 760px)").matches;
  const red = crearRed({ nodos: movil ? 84 : 150, pulsos: movil ? 18 : 34 });
  escena.add(red.grupo);

  const estado = { armado: reducido ? 1 : 0, aparicion: reducido ? 1 : 0, scroll: 0 };
  const puntero = new THREE.Vector2();
  const suave = new THREE.Vector2();
  const punteroMundo = new THREE.Vector3(99, 99, 0);
  const rayo = new THREE.Raycaster();
  const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let dentro = false;

  seccion.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      dentro = e.pointerType === "mouse";
    },
    { passive: true },
  );
  seccion.addEventListener("pointerleave", () => {
    dentro = false;
    puntero.set(0, 0);
  });

  // Dónde va el logo: a la derecha en escritorio; en celular, en el espacio libre entre el menú y el texto.
  const lugar = { x: 0, y: 0, s: 1 };
  const hueco = seccion.querySelector<HTMLElement>("[data-heroe-hueco]");
  // El logo va dentro del hueco entre "SYN" y "APSE": mismo centro y un poco más angosto que el hueco.
  function distribuir() {
    const { w, h } = ajustarTamano(renderer, camara, canvas);
    const alto = 2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) * 10;
    const pxPorUnidad = h / alto;
    const lienzo = canvas.getBoundingClientRect();
    const r = hueco?.getBoundingClientRect();
    if (!r || !r.width) {
      lugar.s = 0.8;
      lugar.x = 0;
      lugar.y = 0;
      return;
    }
    const cx = r.left - lienzo.left + r.width / 2;
    const cy = r.top - lienzo.top + r.height / 2;
    lugar.s = Math.min((r.width * 0.92) / pxPorUnidad / logo.ancho, (r.height * 1.02) / pxPorUnidad / logo.alto);
    lugar.x = (cx - w / 2) / pxPorUnidad;
    lugar.y = (h / 2 - cy) / pxPorUnidad;
  }
  distribuir();
  // Se vuelve a medir si cambia el lienzo o el hueco (fuentes que terminan de cargar, giro del celular…).
  const observador = new ResizeObserver(distribuir);
  observador.observe(canvas);
  if (hueco) observador.observe(hueco);
  document.fonts?.ready.then(distribuir);
  window.addEventListener("load", distribuir);

  let ultimoT = 0;
  function cuadro(t: number, dt: number) {
    ultimoT = t;
    suave.lerp(puntero, 1 - Math.pow(0.002, dt || 0.016));
    if (dentro) {
      rayo.setFromCamera(suave, camara);
      rayo.ray.intersectPlane(plano, punteroMundo);
    } else {
      punteroMundo.set(99, 99, 0);
    }
    const s = estado.scroll;
    camara.position.set(suave.x * 0.35, suave.y * 0.22 - s * 0.7, 10 - s * 3.4);
    camara.lookAt(0, -s * 0.7, 0);

    logo.pose(estado.armado, reducido ? 0 : Math.min(1, s * 1.7));
    const flota = reducido ? 0 : Math.sin(t * 0.9) * 0.07;
    logo.grupo.position.set(lugar.x, lugar.y + flota + s * 1.4, s * 1.6);
    logo.grupo.scale.setScalar(lugar.s * (1 - s * 0.12));
    const vaiven = reducido ? 0 : Math.sin(t * 0.5) * 0.14;
    logo.marca.rotation.y = vaiven + suave.x * 0.45 + s * 1.9 + (1 - estado.armado) * 0.8;
    logo.marca.rotation.x = -suave.y * 0.28 + s * 0.3;

    red.grupo.rotation.y = Math.sin(t * 0.05) * 0.12 + suave.x * 0.06;
    red.grupo.rotation.x = -suave.y * 0.04;
    red.opacidad(estado.aparicion * (1 - s * 0.55));
    red.actualizar(t, reducido ? 0 : dt, punteroMundo);
    renderer.render(escena, camara);
  }

  let listo = false;
  function aplicarTema(t: Tema) {
    escena.environment = entorno(t);
    logo.aplicarTema(t);
    red.aplicarTema(t);
    luzRoja.intensity = t === "claro" ? 22 : 36;
    if (listo) cuadro(ultimoT, 0);
  }
  aplicarTema(temaActual());
  alCambiarTema(aplicarTema);

  // Los shaders se compilan antes del primer cuadro y sin bloquear (con el logo armado, para que entren todos).
  logo.pose(1, 0);
  await precompilar(renderer, escena, camara);
  logo.pose(estado.armado, 0);
  listo = true;
  bucleVisible(seccion, cuadro);

  return {
    entrar() {
      if (reducido) return;
      gsap.to(estado, { armado: 1, duration: 2.5, ease: "none" });
      gsap.to(estado, { aparicion: 1, duration: 1.8, ease: "power2.inOut" });
    },
    scroll(p: number) {
      estado.scroll = p;
    },
  };
}
