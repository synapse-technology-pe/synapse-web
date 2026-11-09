// Inicio: "SYN" y "APSE" suben juntas y se abren para dejar el hueco donde se arma el logo 3D.
// Al bajar, las mitades se separan más y se desvanecen mientras el logo gira hacia arriba.
import { gsap, SplitText, reducido } from "../../lib/movimiento";
import { soportaWebGL } from "../../lib/webgl";

type Escena = { entrar(): void; scroll(p: number): void };

export function prepararHeroe() {
  const seccion = document.querySelector<HTMLElement>("[data-heroe]");
  if (!seccion) return { entrar: async () => {} };
  const canvas = seccion.querySelector<HTMLCanvasElement>("[data-heroe-lienzo]")!;
  const marca = seccion.querySelector<HTMLElement>("[data-heroe-marca]");
  const izq = seccion.querySelector<HTMLElement>('[data-heroe-mitad="izq"]');
  const der = seccion.querySelector<HTMLElement>('[data-heroe-mitad="der"]');
  const hueco = seccion.querySelector<HTMLElement>("[data-heroe-hueco]");
  let escena: Escena | null = null;

  // Three.js se descarga en paralelo mientras corre la intro.
  const conWebGL = soportaWebGL();
  if (!conWebGL) seccion.classList.add("heroe--sin3d");
  const carga: Promise<Escena | null> = conWebGL
    ? document.fonts.ready
        .then(() => import("./escena-heroe"))
        .then((m) => m.crearEscenaHeroe(canvas, seccion))
        .then((e) => {
          escena = e;
          seccion.classList.add("heroe--3d");
          return e;
        })
        .catch((error) => {
          console.warn("Escena 3D del inicio no disponible:", error);
          seccion.classList.add("heroe--sin3d");
          return null;
        })
    : Promise.resolve(null);

  if (!reducido) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: seccion,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (s) => escena?.scroll(s.progress),
        },
      })
      .to(izq, { xPercent: -28, ease: "none" }, 0)
      .to(der, { xPercent: 22, ease: "none" }, 0)
      .to(marca, { yPercent: -10, opacity: 0.15, ease: "none" }, 0)
      .to("[data-heroe-contenido]", { yPercent: -20, opacity: 0.1, ease: "none" }, 0)
      .to(".heroe__barra, .heroe__pie", { opacity: 0, ease: "none" }, 0);
  }

  async function entrar() {
    await document.fonts.ready;
    document.documentElement.classList.remove("anim-heroe");
    if (reducido) {
      carga.then((e) => e?.entrar());
      return;
    }
    const titulo = seccion!.querySelector<HTMLElement>("[data-heroe-titulo]")!;
    const lineas = SplitText.create(titulo, { type: "lines", mask: "lines", linesClass: "heroe__linea" });
    gsap
      .timeline({
        onComplete: () => lineas.revert(),
      })
      // Las mitades empiezan juntas (tapando el hueco) y se abren mientras el logo se arma.
      .from([izq, der], { yPercent: 40, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 0)
      .from(izq, { x: () => (hueco?.offsetWidth ?? 0) / 2, duration: 1.2, ease: "expo.inOut" }, 0.35)
      .from(der, { x: () => -(hueco?.offsetWidth ?? 0) / 2, duration: 1.2, ease: "expo.inOut" }, 0.35)
      .call(() => void carga.then((e) => e?.entrar()), [], 0.45)
      .from(".heroe__barra", { opacity: 0, y: -10, duration: 0.8 }, 0.1)
      .from(lineas.lines, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.1 }, 0.35)
      .from(".heroe__texto", { y: 20, opacity: 0, duration: 0.9 }, 0.55)
      .from(".heroe__acciones > *", { y: 16, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.65)
      .from(".heroe__pie", { opacity: 0, duration: 1 }, 0.8)
      .from(".heroe__brillo", { opacity: 0, scale: 0.6, duration: 1.8, ease: "power2.out" }, 0);
  }

  return { entrar };
}
