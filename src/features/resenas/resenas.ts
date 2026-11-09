// Filas de reseñas que avanzan en sentidos opuestos mientras haces scroll.
import { gsap, reducido } from "../../lib/movimiento";

export function iniciarResenas() {
  if (reducido) return;
  document.querySelectorAll<HTMLElement>("[data-resenas-fila]").forEach((fila) => {
    const pista = fila.querySelector<HTMLElement>(".resenas__pista");
    if (!pista) return;
    const izquierda = fila.dataset.resenasFila === "izquierda";
    const distancia = () => Math.max(0, pista.scrollWidth - window.innerWidth) * 0.6;
    gsap.fromTo(
      pista,
      { x: () => (izquierda ? 0 : -distancia()) },
      {
        x: () => (izquierda ? -distancia() : 0),
        ease: "none",
        scrollTrigger: { trigger: fila.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
      },
    );
  });
}
