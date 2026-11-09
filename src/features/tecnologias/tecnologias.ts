// Anillos de tecnologías: giran con el scroll y también se pueden arrastrar con el mouse o el dedo (con inercia).
import { gsap, ScrollTrigger, reducido } from "../../lib/movimiento";
import { dormirFueraDePantalla } from "../../lib/dormir";

export function iniciarTecnologias() {
  const seccion = document.querySelector<HTMLElement>("[data-tecno]");
  const escena = seccion?.querySelector<HTMLElement>("[data-tecno-escena]");
  if (!seccion || !escena) return;
  dormirFueraDePantalla(seccion);
  const anillos = [...seccion.querySelectorAll<HTMLElement>("[data-tecno-anillo]")];
  const estado = { scroll: 0, arrastre: 0 };

  const pintar = () => {
    anillos.forEach((a, i) => {
      const base = i === 0 ? -150 * estado.scroll : -20 + 150 * estado.scroll;
      a.style.setProperty("--giro", `${(base + estado.arrastre).toFixed(2)}deg`);
    });
  };

  if (!reducido) {
    ScrollTrigger.create({
      trigger: seccion,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (s) => {
        estado.scroll = s.progress;
        pintar();
      },
    });
  }

  // Arrastre: cada píxel gira 0.2 grados; al soltar sigue un poco por inercia.
  let x0 = 0;
  let ultimoX = 0;
  let ultimoT = 0;
  let velocidad = 0;
  let activo = false;
  escena.addEventListener("pointerdown", (e) => {
    activo = true;
    x0 = ultimoX = e.clientX;
    ultimoT = performance.now();
    velocidad = 0;
    gsap.killTweensOf(estado);
    escena.setPointerCapture(e.pointerId);
    escena.classList.add("arrastrando");
  });
  escena.addEventListener("pointermove", (e) => {
    if (!activo) return;
    const ahora = performance.now();
    const dx = e.clientX - ultimoX;
    velocidad = dx / Math.max(1, ahora - ultimoT);
    ultimoX = e.clientX;
    ultimoT = ahora;
    estado.arrastre += dx * 0.2;
    pintar();
  });
  const soltar = () => {
    if (!activo) return;
    activo = false;
    escena.classList.remove("arrastrando");
    if (!reducido && Math.abs(ultimoX - x0) > 2) {
      gsap.to(estado, { arrastre: estado.arrastre + velocidad * 160, duration: 1.4, ease: "power3.out", onUpdate: pintar });
    }
  };
  escena.addEventListener("pointerup", soltar);
  escena.addEventListener("pointercancel", soltar);

  // Con el teclado: flechas izquierda y derecha.
  escena.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    gsap.to(estado, { arrastre: estado.arrastre + (e.key === "ArrowRight" ? -24 : 24), duration: 0.5, ease: "power2.out", onUpdate: pintar });
  });
  pintar();
}
