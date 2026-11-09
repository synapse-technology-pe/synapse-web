// Motor de movimiento compartido: GSAP + ScrollTrigger + SplitText y desplazamiento suave (Lenis).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const tactil = window.matchMedia("(hover: none), (pointer: coarse)").matches;
export const escritorio = () => window.matchMedia("(min-width: 900px)").matches;

export let lenis: Lenis | null = null;

export function iniciarMovimiento() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out", duration: 0.9 });

  if (!reducido) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // Solo en desarrollo: acceso para probar el recorrido desde la consola.
    if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __st: ScrollTrigger });
  }

  // Enlaces internos (#seccion) con desplazamiento suave y compensación del menú.
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href") ?? "";
    if (id.length < 2) return;
    const destino = document.querySelector(id);
    if (!destino) return;
    e.preventDefault();
    irA(destino);
    history.replaceState(null, "", id === "#inicio" ? location.pathname : id);
  });
}

export function irA(destino: Element | number) {
  const offset = typeof destino === "number" || (destino as HTMLElement).id === "inicio" ? 0 : -8;
  if (lenis) {
    lenis.scrollTo(destino as HTMLElement, { offset, duration: 1.4 });
  } else if (typeof destino === "number") {
    window.scrollTo({ top: destino, behavior: reducido ? "auto" : "smooth" });
  } else {
    destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
  }
}

/** Detiene o reanuda el desplazamiento (menú abierto, video abierto). */
export function bloquearScroll(bloquear: boolean) {
  if (lenis) bloquear ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = bloquear ? "hidden" : "";
}

export { gsap, ScrollTrigger, SplitText };
