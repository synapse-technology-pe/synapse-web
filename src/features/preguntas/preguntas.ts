// Acordeón con apertura y cierre suaves; se abre una pregunta a la vez.
import { gsap, ScrollTrigger, reducido } from "../../lib/movimiento";

export function iniciarPreguntas() {
  const items = [...document.querySelectorAll<HTMLDetailsElement>("[data-pregunta]")];
  items.forEach((d) => {
    const resumen = d.querySelector("summary")!;
    const cuerpo = d.querySelector<HTMLElement>(".pregunta__respuesta")!;
    resumen.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) cerrar(d, cuerpo);
      else {
        items.filter((o) => o !== d && o.open).forEach((o) => cerrar(o, o.querySelector<HTMLElement>(".pregunta__respuesta")!));
        abrir(d, cuerpo);
      }
    });
  });
}

function abrir(d: HTMLDetailsElement, cuerpo: HTMLElement) {
  d.open = true;
  if (reducido) return;
  gsap.fromTo(cuerpo, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
}

function cerrar(d: HTMLDetailsElement, cuerpo: HTMLElement) {
  if (reducido) {
    d.open = false;
    return;
  }
  gsap.to(cuerpo, {
    height: 0,
    opacity: 0,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => {
      d.open = false;
      gsap.set(cuerpo, { clearProps: "height,opacity" });
      ScrollTrigger.refresh();
    },
  });
}
