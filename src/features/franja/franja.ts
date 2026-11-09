// Las dos filas de la franja se desplazan en sentidos opuestos según el scroll.
import { gsap, reducido } from "../../lib/movimiento";

export function iniciarFranja() {
  if (reducido) return;
  document.querySelectorAll<HTMLElement>("[data-franja-fila]").forEach((fila) => {
    const pista = fila.querySelector(".franja__pista");
    const izquierda = fila.dataset.franjaFila === "izquierda";
    gsap.fromTo(
      pista,
      { xPercent: izquierda ? 0 : -28 },
      {
        xPercent: izquierda ? -28 : 0,
        ease: "none",
        scrollTrigger: { trigger: fila.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );
  });
}
