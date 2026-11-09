// Servicios: la sección queda fija y el scroll recorre cuatro capítulos.
// La laptop se abre, entra el celular y las pantallas cambian según el servicio.
import { gsap, ScrollTrigger, reducido, irA } from "../../lib/movimiento";
import { soportaWebGL } from "../../lib/webgl";
import { estadoEscenaInicial, estadoEscenaQuieto, type EstadoEscena } from "./estado-escena";

const CAPITULOS = 4;

function recorrido(tl: gsap.core.Timeline, e: EstadoEscena, capitulos: HTMLElement[]) {
  const p = e.pantallas;
  // 1 · Sistemas web: la laptop se abre y enciende.
  tl.to(e, { tapa: 0, lapRY: -0.18, camX: 0.4, camY: 1.7, camZ: 6.8, mirY: 1.0, mirZ: -0.5, duration: 0.6 }, 0)
    .to(p, { encendido: 1, duration: 0.3, ease: "power1.inOut" }, 0.38)
    .to(p, { gestion: 1, duration: 0.5, ease: "none" }, 0.5);
  // 2 · Apps móviles: el celular entra al frente.
  tl.to(e, { telS: 1, duration: 0.15, ease: "power1.out" }, 1)
    .to(e, { telX: 1.55, telY: 0.95, telZ: 1.05, telRY: -0.32, duration: 0.45, ease: "expo.out" }, 1)
    .to(e, { lapX: -0.55, camX: 1.0, camY: 1.45, camZ: 5.6, mirX: 0.7, mirY: 0.95, mirZ: 0, duration: 0.45 }, 1)
    .to(p, { pedidos: 1, duration: 0.7, ease: "none" }, 1.2);
  // 3 · SaaS: el celular sale y la cámara se acerca a la pantalla.
  tl.to(e, { telX: 3.4, telY: -0.2, telRY: -1.0, duration: 0.35, ease: "power2.in" }, 2)
    .to(e, { telS: 0, duration: 0.1 }, 2.3)
    .to(e, { lapX: 0, lapRY: 0, camX: 0, camY: 1.5, camZ: 4.4, mirX: 0, mirY: 1.28, mirZ: -1.0, duration: 0.45 }, 2)
    .to(p, { modo: 1, duration: 0.18, ease: "none" }, 2.05)
    .to(p, { saas: 1, duration: 0.7, ease: "none" }, 2.2);
  // 4 · IA: documento en la laptop y asistente en el celular.
  tl.to(p, { modo: 2, duration: 0.18, ease: "none" }, 3.02)
    .to(p, { telModo: 1, duration: 0.01 }, 3)
    .to(e, { telS: 1.05, duration: 0.12 }, 3.05)
    .fromTo(e, { telX: -3.2, telY: 0.4, telRY: 1.1 }, { telX: 1.3, telY: 0.85, telZ: 1.5, telRY: -0.14, duration: 0.45, ease: "expo.out", immediateRender: false }, 3.05)
    .to(e, { camX: 0.55, camY: 1.45, camZ: 6.1, mirX: 0.35, mirY: 0.95, mirZ: 0.1, lapRY: -0.08, duration: 0.45 }, 3.02)
    .to(p, { documento: 1, duration: 0.75, ease: "none" }, 3.15)
    .to(p, { chat: 1, duration: 0.8, ease: "none" }, 3.15)
    .to({}, { duration: 0.15 }, 3.85);

  // Textos de cada capítulo
  capitulos.forEach((c, i) => {
    if (i > 0) tl.fromTo(c, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, i + 0.02);
    if (i < CAPITULOS - 1) tl.to(c, { autoAlpha: 0, y: -46, duration: 0.2, ease: "power2.in" }, i + 0.8);
  });
}

export function iniciarServicios() {
  const seccion = document.querySelector<HTMLElement>("[data-servicios]");
  if (!seccion) return;
  const escenario = seccion.querySelector<HTMLElement>("[data-servicios-escenario]")!;
  const canvas = seccion.querySelector<HTMLCanvasElement>("[data-servicios-lienzo]")!;
  const capitulos = [...seccion.querySelectorAll<HTMLElement>("[data-capitulo]")];
  const marcas = [...seccion.querySelectorAll<HTMLElement>("[data-capitulo-marca]")];
  const estado = reducido ? estadoEscenaQuieto() : estadoEscenaInicial();

  // La escena (modelos, texturas y shaders) se prepara en un momento libre después de la entrada del inicio,
  // para que no trabe el scroll al llegar. Si bajas antes, se monta cuando la sección se acerca.
  if (soportaWebGL()) {
    let montada = false;
    const montar = () => {
      if (montada) return;
      montada = true;
      import("./escena-dispositivos")
        .then((m) => m.crearEscenaDispositivos(canvas, seccion, estado))
        .then(() => seccion.classList.add("servicios--3d"))
        .catch((error) => console.warn("Escena de dispositivos no disponible:", error));
    };
    ScrollTrigger.create({ trigger: seccion, start: "top 220%", once: true, onEnter: montar });
    document.addEventListener(
      "synapse:inicio-listo",
      () => (window.requestIdleCallback ? requestIdleCallback(montar, { timeout: 4000 }) : setTimeout(montar, 1500)),
      { once: true },
    );
  }

  if (reducido) return;

  gsap.set(capitulos.slice(1), { autoAlpha: 0 });
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  recorrido(tl, estado, capitulos);

  const marcar = (i: number) => marcas.forEach((m, k) => m.classList.toggle("activa", k === i));
  marcar(0);
  const disparador = ScrollTrigger.create({
    trigger: seccion,
    start: "top top",
    end: () => `+=${window.innerHeight * 3.4}`,
    pin: escenario,
    scrub: 0.8,
    animation: tl,
    anticipatePin: 1,
    onUpdate: (s) => {
      const i = Math.min(CAPITULOS - 1, Math.floor(s.progress * CAPITULOS * 0.999));
      marcar(i);
      marcas.forEach((m, k) => m.style.setProperty("--llenado", Math.max(0, Math.min(1, s.progress * CAPITULOS - k)).toFixed(3)));
    },
  });

  // Los números del índice llevan a su capítulo.
  marcas.forEach((m, i) =>
    m.addEventListener("click", () => irA(disparador.start + (disparador.end - disparador.start) * ((i + 0.55) / CAPITULOS))),
  );
}
