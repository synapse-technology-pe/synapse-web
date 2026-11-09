// Intro del logo: las esquirlas del hexágono aparecen sueltas, se atraen y chocan; la luz recorre
// los circuitos hasta los nodos, cae el hexágono chico, salen las burbujas y entra "Synapse".
// La página se abre por la silueta del hexágono, que crece desde el centro de la marca.
import { gsap, bloquearScroll } from "../lib/movimiento";
import { envolvente } from "../components/ui/logo-datos";

// Giro (en grados) con el que llega cada esquirla; la dirección sale del centro del cuerpo.
const GIROS: Record<string, number> = { izquierda: -42, superior: 28, derecha: 46, centro: -30, inferior: 36 };

/** Resuelve cuando el héroe puede empezar su entrada. */
export function iniciarIntro(): Promise<void> {
  const html = document.documentElement;
  const raiz = document.querySelector<HTMLElement>("[data-intro]");
  if (!raiz || !html.classList.contains("con-intro")) {
    raiz?.remove();
    html.classList.remove("con-intro");
    return Promise.resolve();
  }
  try {
    sessionStorage.setItem("synapse-intro", "1");
  } catch {
    /* sin almacenamiento: la intro se repetirá */
  }
  // La intro abre siempre sobre el héroe, aunque el navegador quiera restaurar el scroll.
  if (!location.hash) {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }
  bloquearScroll(true);

  const centro = raiz.querySelector<HTMLElement>("[data-intro-centro]")!;
  const logo = raiz.querySelector<SVGSVGElement>(".intro__logo")!;
  const grupoMarca = logo.querySelector<SVGGElement>(".logo__marca")!;
  const cuerpo = logo.querySelector<SVGPathElement>(".logo__cuerpo")!;
  const grupoEsquirlas = logo.querySelector<SVGGElement>(".logo__esquirlas")!;
  const hueco = raiz.querySelector<SVGPolygonElement>("[data-intro-hueco]")!;
  const aro = raiz.querySelector<SVGPolygonElement>("[data-intro-aro]")!;
  const q = <T extends Element = SVGElement>(sel: string) => [...logo.querySelectorAll<T>(sel)];
  const esquirlas = q<SVGPathElement>(".logo__esquirla");
  const trazos = q<SVGPathElement>(".logo__trazo");
  const nodos = q<SVGCircleElement>(".logo__nodo");
  const onda = logo.querySelector<SVGPolygonElement>(".logo__onda")!;

  // Silueta del cuerpo (en unidades del logo), centrada y con medio ancho = 1.
  const env = envolvente;
  const xs = env.map((p) => p[0]);
  const ys = env.map((p) => p[1]);
  const cx0 = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy0 = (Math.min(...ys) + Math.max(...ys)) / 2;
  const medio = (Math.max(...xs) - Math.min(...xs)) / 2;
  const silueta = env.map(([x, y]) => [(x - cx0) / medio, (y - cy0) / medio]);

  const iris = { r: 0, cx: innerWidth / 2, cy: innerHeight / 2, max: 1 };
  const forma = (r: number) =>
    silueta.map(([x, y]) => `${(iris.cx + x * r).toFixed(1)},${(iris.cy + y * r).toFixed(1)}`).join(" ");
  const dibujarIris = () => {
    hueco.setAttribute("points", forma(iris.r));
    aro.setAttribute("points", forma(iris.r * 1.04 + 4));
    aro.style.opacity = String(iris.r > 2 ? Math.max(0, 1 - iris.r / (iris.max * 0.7)) : 0);
  };
  const medirIris = () => {
    const b = cuerpo.getBoundingClientRect();
    iris.cx = b.left + b.width / 2;
    iris.cy = b.top + b.height / 2;
    const lejos = Math.max(
      Math.hypot(iris.cx, iris.cy),
      Math.hypot(innerWidth - iris.cx, iris.cy),
      Math.hypot(iris.cx, innerHeight - iris.cy),
      Math.hypot(innerWidth - iris.cx, innerHeight - iris.cy),
    );
    // La silueta es más ancha que alta: su "radio" más corto es ~0.7 del medio ancho.
    iris.max = lejos / 0.68 + 40;
  };

  return new Promise((resolver) => {
    let terminado = false;
    const terminar = () => {
      if (terminado) return;
      terminado = true;
      quitarSaltos();
      raiz.remove();
      html.classList.remove("con-intro");
      bloquearScroll(false);
      resolver();
    };

    // Estado inicial: el cuerpo entero se oculta y se ven sus esquirlas sueltas.
    gsap.set(grupoEsquirlas, { visibility: "visible" });
    gsap.set(cuerpo, { opacity: 0 });
    gsap.set(nodos, { scale: 0, transformOrigin: "50% 50%" });
    trazos.forEach((t) => {
      const largo = Number(t.dataset.largo);
      gsap.set(t, { visibility: "visible", opacity: 0, strokeDasharray: largo, strokeDashoffset: largo });
    });
    const sueltas = esquirlas.map((e) => {
      const b = e.getBBox();
      const dx = b.x + b.width / 2 - cx0;
      const dy = b.y + b.height / 2 - cy0;
      const L = Math.hypot(dx, dy) || 1;
      return { e, ux: dx / L, uy: dy / L, giro: GIROS[e.dataset.esquirla ?? ""] ?? 30 };
    });

    const CHOQUE = 1.05;
    const SALIDA = 2.55;
    const tl = gsap.timeline({ onComplete: terminar });
    tl.set(centro, { opacity: 1 }, 0);

    // 1) Las esquirlas aparecen lejos, girando, y se acercan despacio…
    // 2) …hasta que de golpe se atraen y chocan todas a la vez.
    sueltas.forEach(({ e, ux, uy, giro }, i) => {
      tl.fromTo(
        e,
        { x: ux * 62, y: uy * 62, rotation: giro * 1.6, scale: 0.55, opacity: 0, transformOrigin: "50% 50%" },
        { x: ux * 34, y: uy * 34, rotation: giro, scale: 0.8, opacity: 1, duration: 0.5, ease: "power2.out" },
        0.04 * i,
      ).to(e, { x: 0, y: 0, rotation: 0, scale: 1, duration: CHOQUE - 0.5, ease: "power3.in" }, 0.5);
    });

    // 3) Choque: onda con la silueta del hexágono, rebote de la marca y el cuerpo queda entero.
    tl.set(cuerpo, { opacity: 1 }, CHOQUE)
      .set(grupoEsquirlas, { visibility: "hidden" }, CHOQUE + 0.02)
      .fromTo(
        onda,
        { visibility: "visible", scale: 1, opacity: 0.95, transformOrigin: "50% 50%" },
        { scale: 1.9, opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false },
        CHOQUE,
      )
      .fromTo(
        grupoMarca,
        { scale: 1.06, transformOrigin: "50% 60%" },
        { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.45)", immediateRender: false },
        CHOQUE,
      );

    // 4) La luz entra por cada circuito, da la vuelta al anillo y enciende su nodo.
    trazos.forEach((t, i) => {
      const nodo = nodos[Number(t.dataset.nodo)];
      const inicio = CHOQUE + 0.08 + i * 0.09;
      tl.set(t, { opacity: 1 }, inicio)
        .to(t, { strokeDashoffset: 0, duration: 0.55, ease: "power2.in" }, inicio)
        .to(nodo, { scale: 1, duration: 0.5, ease: "back.out(3)" }, inicio + 0.5)
        .to(t, { opacity: 0, duration: 0.5, ease: "power1.out" }, inicio + 0.6);
    });

    // 5) Cae el hexágono chico (gira 60°: llega encajando) y salen las burbujas desde la esquina.
    tl.from(
      q(".logo__hex"),
      { y: -30, rotation: -60, opacity: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "back.out(1.7)" },
      CHOQUE + 0.12,
    ).from(
      q(".logo__burbuja"),
      {
        x: (i: number) => [-12, -6, -18][i] ?? -10,
        y: (i: number) => [10, 14, 20][i] ?? 12,
        scale: 0,
        transformOrigin: "50% 50%",
        duration: 0.6,
        ease: "back.out(2.2)",
        stagger: 0.09,
      },
      CHOQUE + 0.3,
    );

    // 6) El divisor crece y entra "Synapse" letra por letra.
    tl.from(q(".logo__divisor"), { scaleY: 0, transformOrigin: "50% 50%", duration: 0.55, ease: "power3.out" }, CHOQUE + 0.45)
      .from(q(".logo__letra"), { y: 26, opacity: 0, duration: 0.75, ease: "power4.out", stagger: 0.045 }, CHOQUE + 0.52)
      .fromTo("[data-intro-barra]", { scaleX: 0 }, { scaleX: 1, duration: SALIDA - 0.45, ease: "power2.inOut" }, 0.2);

    // 7) Salida: la marca se aleja y la página se abre por la silueta del hexágono.
    tl.call(medirIris, [], SALIDA - 0.01)
      .to(centro, { scale: 0.9, opacity: 0, duration: 0.55, ease: "power3.in" }, SALIDA)
      .to(iris, { r: () => iris.max, duration: 1.15, ease: "expo.inOut", onUpdate: dibujarIris }, SALIDA + 0.12);

    // Saltar con un clic, una tecla o la rueda.
    const saltar = () => {
      if (tl.time() < SALIDA) tl.seek(SALIDA);
      tl.timeScale(1.8);
      quitarSaltos();
    };
    const eventos = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    eventos.forEach((ev) => window.addEventListener(ev, saltar, { passive: true }));
    function quitarSaltos() {
      eventos.forEach((ev) => window.removeEventListener(ev, saltar));
    }
    // Seguro: si algo se traba, la página se abre igual.
    window.setTimeout(terminar, 7500);
  });
}
