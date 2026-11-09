// Calidad adaptable: mide cuánto tardan los cuadros y, si el equipo no llega, baja la resolución de las
// escenas 3D por pasos (y, en el último paso, quita los desenfoques de fondo). En equipos rápidos no cambia nada.
import { gsap } from "./movimiento";

/** Multiplicador de la resolución 3D en cada nivel (0 = máxima). */
const ESCALAS = [1, 0.84, 0.7, 0.58];
const VENTANA = 1500; // ms de cuadros que se promedian antes de decidir
const LENTO = 23; // ms por cuadro (≈ 43 fps): por encima, baja un nivel
const HOLGADO = 17.8; // ms por cuadro (pantalla de 60 Hz al día): sostenido varias veces, puede subir un nivel

const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
const nucleos = nav.hardwareConcurrency || 4;
const memoria = nav.deviceMemory || 4;
/** Equipos muy justos empiezan un nivel abajo. */
let nivel = nucleos <= 2 || memoria <= 2 || nav.connection?.saveData ? 1 : 0;

const oyentes = new Set<(escala: number) => void>();
let activas = 0; // escenas 3D dibujándose ahora
let suma = 0;
let cuadros = 0;
let inicioVentana = 0;
let ventanasHolgadas = 0;
const fallosEn = new Map<number, number>(); // cuántas veces falló cada nivel (para no oscilar)
let iniciado = false;

export const escalaCalidad = () => ESCALAS[nivel];

/** Avisa cuando cambia la escala (las escenas ajustan su resolución). Devuelve cómo dejar de escuchar. */
export function alCambiarCalidad(fn: (escala: number) => void) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

function cambiar(nuevo: number) {
  nivel = Math.max(0, Math.min(ESCALAS.length - 1, nuevo));
  document.documentElement.classList.toggle("calidad-baja", nivel >= ESCALAS.length - 1);
  oyentes.forEach((fn) => fn(ESCALAS[nivel]));
}

/** Una escena 3D avisa que está dibujando (true) o que se detuvo (false). Solo se mide mientras hay alguna. */
export function escenaActiva(activa: boolean) {
  activas = Math.max(0, activas + (activa ? 1 : -1));
  reiniciarVentana();
  if (!iniciado) iniciar();
}

function reiniciarVentana() {
  suma = 0;
  cuadros = 0;
  inicioVentana = performance.now();
}

function iniciar() {
  iniciado = true;
  document.addEventListener("visibilitychange", reiniciarVentana);
  gsap.ticker.add((_t, dt) => {
    if (!activas || document.hidden) return;
    // Pausas largas (carga de un modelo, cambio de pestaña) no cuentan como lentitud del equipo.
    if (dt > 250) return reiniciarVentana();
    suma += dt;
    cuadros++;
    if (performance.now() - inicioVentana < VENTANA || cuadros < 20) return;
    const promedio = suma / cuadros;
    reiniciarVentana();
    if (promedio > LENTO && nivel < ESCALAS.length - 1) {
      fallosEn.set(nivel, (fallosEn.get(nivel) ?? 0) + 1);
      ventanasHolgadas = 0;
      cambiar(nivel + 1);
    } else if (promedio < HOLGADO && nivel > 0) {
      // Sube solo si va fluido varias veces seguidas (~9 s) y ese nivel no falló ya dos veces.
      if (++ventanasHolgadas >= 6 && (fallosEn.get(nivel - 1) ?? 0) < 2) {
        ventanasHolgadas = 0;
        cambiar(nivel - 1);
      }
    } else {
      ventanasHolgadas = 0;
    }
  });
}
