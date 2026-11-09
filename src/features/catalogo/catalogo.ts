// Catálogo: las tarjetas entran girando en 3D, en grupos, cuando llegan a la pantalla.
import { gsap, ScrollTrigger, reducido } from "../../lib/movimiento";
import { dormirFueraDePantalla } from "../../lib/dormir";

export function iniciarCatalogo() {
  dormirFueraDePantalla(document.querySelector("[data-catalogo]"));
  const tarjetas = gsap.utils.toArray<HTMLElement>("[data-servicio]");
  if (!tarjetas.length || reducido) return;
  gsap.set(tarjetas, { opacity: 0, y: 70, rotateX: -35, transformPerspective: 1000, transformOrigin: "50% 0%" });
  ScrollTrigger.batch(tarjetas, {
    start: "top 92%",
    once: true,
    onEnter: (lote) =>
      gsap.to(lote, { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, clearProps: "transform" }),
  });
}
