// La sección queda fija y cada palabra pasa de tenue a encendida con el scroll.
import { gsap, SplitText, reducido } from "../../lib/movimiento";

export function iniciarManifiesto() {
  const seccion = document.querySelector<HTMLElement>("[data-manifiesto]");
  const frase = seccion?.querySelector<HTMLElement>("[data-manifiesto-frase]");
  if (!seccion || !frase || reducido) return;

  const division = SplitText.create(frase, { type: "words", wordsClass: "palabra" });
  const pilares = seccion.querySelectorAll("[data-manifiesto-pilar]");

  gsap
    .timeline({
      scrollTrigger: { trigger: seccion, start: "top top", end: "+=120%", pin: true, scrub: 0.5, anticipatePin: 1 },
    })
    .to(division.words, { opacity: 1, ease: "none", stagger: 0.1, duration: 0.6 }, 0)
    .from(pilares, { y: 30, opacity: 0, ease: "power2.out", stagger: 0.12, duration: 0.8 }, ">-0.4");
}
