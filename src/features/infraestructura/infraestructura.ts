// La pila de infraestructura se arma con el scroll: cada capa cae en su lugar y se enciende su texto.
import { gsap, reducido } from "../../lib/movimiento";

export function iniciarInfraestructura() {
  const seccion = document.querySelector<HTMLElement>("[data-infra]");
  if (!seccion) return;
  const escenario = seccion.querySelector<HTMLElement>("[data-infra-escenario]")!;
  const capas = [...seccion.querySelectorAll<HTMLElement>("[data-capa]")];
  const items = [...seccion.querySelectorAll<HTMLElement>("[data-infra-item]")];
  const pila = seccion.querySelector<HTMLElement>("[data-pila]")!;

  if (reducido) {
    items.forEach((i) => i.classList.add("activo"));
    return;
  }

  const encender = (n: number) => items.forEach((it, i) => it.classList.toggle("activo", i <= n));
  const construir = (tl: gsap.core.Timeline) => {
    capas.forEach((capa, i) => {
      tl.fromTo(
        capa,
        { y: -260 - i * 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", onStart: () => encender(i), onReverseComplete: () => encender(i - 1) },
        i * 0.9,
      );
      tl.fromTo(capa.querySelector(".pila__placa"), { scale: 1.06 }, { scale: 1, duration: 0.4, ease: "power2.out" }, i * 0.9 + 0.75);
    });
    tl.fromTo(pila, { filter: "drop-shadow(0 0 0 rgba(229,18,27,0))" }, { filter: "drop-shadow(0 30px 60px rgba(229,18,27,0.35))", duration: 0.8 }, ">-0.2");
    return tl;
  };

  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    construir(
      gsap.timeline({
        scrollTrigger: { trigger: seccion, start: "top top", end: "+=170%", pin: escenario, scrub: 0.7, anticipatePin: 1 },
      }),
    );
  });
  mm.add("(max-width: 899px)", () => {
    construir(gsap.timeline({ scrollTrigger: { trigger: pila, start: "top 85%", end: "bottom 35%", scrub: 0.6 } }));
  });
}
