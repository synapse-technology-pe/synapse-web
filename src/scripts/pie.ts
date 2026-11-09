// Pie: las letras del logotipo gigante suben una por una mientras llegas al final.
import { gsap, reducido } from "../lib/movimiento";

export function iniciarPie() {
  const letras = document.querySelectorAll(".pie__letra");
  if (!letras.length || reducido) return;
  gsap.fromTo(
    letras,
    { y: 80 },
    {
      y: 0,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".pie__gigante", start: "top 98%", end: "bottom 92%", scrub: 1 },
    },
  );
}
