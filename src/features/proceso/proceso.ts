// Proceso: en escritorio la sección queda fija y el carril de pasos se desliza a la izquierda;
// en celular la línea vertical se llena. Cada paso se enciende cuando la línea lo alcanza.
import { gsap, reducido } from "../../lib/movimiento";

export function iniciarProceso() {
  const seccion = document.querySelector<HTMLElement>("[data-proceso]");
  if (!seccion) return;
  const escenario = seccion.querySelector<HTMLElement>("[data-proceso-escenario]")!;
  const carril = seccion.querySelector<HTMLElement>("[data-proceso-carril]")!;
  const linea = seccion.querySelector<HTMLElement>("[data-proceso-linea]")!;
  const pasos = [...seccion.querySelectorAll<HTMLElement>("[data-paso]")];

  if (reducido) {
    pasos.forEach((p) => p.classList.add("activo"));
    gsap.set(linea, { scaleX: 1, scaleY: 1 });
    return;
  }

  const encender = (avance: number) => {
    pasos.forEach((p, i) => p.classList.toggle("activo", avance >= (i + 0.15) / pasos.length));
  };

  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const recorrido = () => Math.max(0, carril.scrollWidth - window.innerWidth + 2 * parseFloat(getComputedStyle(carril.parentElement!).paddingLeft));
    gsap
      .timeline({
        scrollTrigger: {
          trigger: seccion,
          start: "top top",
          end: () => `+=${recorrido() + window.innerHeight * 0.6}`,
          pin: escenario,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => encender(s.progress),
        },
      })
      .to(carril, { x: () => -recorrido(), ease: "none", duration: 1 }, 0)
      .fromTo(linea, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
  });
  mm.add("(max-width: 899px)", () => {
    gsap.fromTo(
      linea,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: carril,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.5,
          onUpdate: (s) => encender(s.progress),
        },
      },
    );
  });
}
