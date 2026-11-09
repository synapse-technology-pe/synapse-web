// Portafolio: carrusel que se arrastra con el mouse, flechas, contador y ficha de cada proyecto.
import { gsap, reducido, bloquearScroll } from "../../lib/movimiento";
import type { Proyecto } from "../../data/proyectos";

export function iniciarTrabajos() {
  const seccion = document.querySelector<HTMLElement>("[data-proyectos]");
  const pista = seccion?.querySelector<HTMLElement>("[data-proyectos-pista]");
  if (!seccion || !pista) return;
  const tarjetas = [...pista.querySelectorAll<HTMLElement>("[data-proyecto]")];
  const actual = seccion.querySelector<HTMLElement>("[data-proyectos-actual]")!;
  const anterior = seccion.querySelector<HTMLButtonElement>("[data-proyectos-anterior]")!;
  const siguiente = seccion.querySelector<HTMLButtonElement>("[data-proyectos-siguiente]")!;

  // Qué tarjeta está al frente: la más cercana al borde izquierdo de la pista.
  const indice = () => {
    const izq = pista.getBoundingClientRect().left + parseFloat(getComputedStyle(pista).paddingLeft);
    let mejor = 0;
    let distancia = Infinity;
    tarjetas.forEach((t, i) => {
      const d = Math.abs(t.getBoundingClientRect().left - izq);
      if (d < distancia) [mejor, distancia] = [i, d];
    });
    return mejor;
  };
  const actualizar = () => {
    const i = indice();
    actual.textContent = String(i + 1).padStart(2, "0");
    anterior.disabled = pista.scrollLeft < 4;
    siguiente.disabled = pista.scrollLeft > pista.scrollWidth - pista.clientWidth - 4;
  };
  const irA = (i: number) => {
    const t = tarjetas[Math.max(0, Math.min(tarjetas.length - 1, i))];
    pista.scrollTo({ left: t.offsetLeft - parseFloat(getComputedStyle(pista).paddingLeft), behavior: reducido ? "auto" : "smooth" });
  };
  pista.addEventListener("scroll", actualizar, { passive: true });
  anterior.addEventListener("click", () => irA(indice() - 1));
  siguiente.addEventListener("click", () => irA(indice() + 1));
  pista.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") irA(indice() + 1);
    if (e.key === "ArrowLeft") irA(indice() - 1);
  });
  actualizar();

  // Arrastrar con el mouse (en celulares el desplazamiento táctil es nativo).
  let inicioX = 0;
  let inicioScroll = 0;
  let movido = 0;
  let activo = false;
  pista.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    activo = true;
    movido = 0;
    inicioX = e.clientX;
    inicioScroll = pista.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!activo) return;
    const dx = e.clientX - inicioX;
    movido = Math.max(movido, Math.abs(dx));
    if (movido > 4) pista.classList.add("arrastrando");
    pista.scrollLeft = inicioScroll - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!activo) return;
    activo = false;
    pista.classList.remove("arrastrando");
    if (movido > 4) irA(indice());
  });
  // Si fue un arrastre, no abrir la ficha al soltar.
  pista.addEventListener("click", (e) => {
    if (movido > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  if (!reducido) {
    gsap.fromTo(
      tarjetas,
      { x: 120, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: pista, start: "top 85%", once: true } },
    );
  }

  iniciarFicha();
}

function iniciarFicha() {
  const ficha = document.querySelector<HTMLDialogElement>("[data-ficha]");
  const datos = document.getElementById("datos-proyectos");
  if (!ficha || !datos) return;
  const proyectos = JSON.parse(datos.textContent ?? "[]") as Proyecto[];
  const $ = <T extends HTMLElement>(s: string) => ficha.querySelector<T>(s)!;
  const media = $("[data-ficha-media]");
  const detalle = $("[data-ficha-detalle]");
  const stack = $("[data-ficha-stack]");
  const url = $<HTMLAnchorElement>("[data-ficha-url]");

  const crear = (etiqueta: string, texto: string, clase?: string) => {
    const el = document.createElement(etiqueta);
    el.textContent = texto;
    if (clase) el.className = clase;
    return el;
  };

  document.addEventListener("click", (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLElement>("[data-abrir-proyecto]");
    if (!boton) return;
    const i = Number(boton.dataset.abrirProyecto);
    const p = proyectos[i];
    if (!p) return;
    $("[data-ficha-num]").textContent = `${String(i + 1).padStart(2, "0")} / ${String(proyectos.length).padStart(2, "0")}`;
    $("[data-ficha-nombre]").textContent = p.nombre;
    $("[data-ficha-rubro]").textContent = p.rubro;

    media.replaceChildren();
    if (p.video) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://player.vimeo.com/video/${p.video}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.title = `Video de ${p.nombre}`;
      iframe.allowFullscreen = true;
      media.append(iframe);
    } else {
      const img = document.createElement("img");
      img.src = p.imagen;
      img.alt = `Captura de ${p.nombre}`;
      media.append(img);
    }

    detalle.replaceChildren();
    const bloques: [string, string | undefined][] = [
      ["El problema", p.problema],
      ["La solución", p.solucion],
    ];
    bloques.forEach(([t, txt]) => {
      if (!txt) return;
      const b = crear("div", "", "ficha__bloque");
      b.append(crear("h4", t), crear("p", txt));
      detalle.append(b);
    });
    if (!p.problema && !p.solucion) detalle.append(crear("p", p.resumen, "ficha__bloque"));

    stack.replaceChildren(...(p.stack ?? []).map((s) => crear("li", s)));
    url.hidden = !p.url;
    if (p.url) url.href = p.url;

    ficha.showModal();
    bloquearScroll(true);
  });

  const cerrar = () => ficha.open && ficha.close();
  $("[data-ficha-cerrar]").addEventListener("click", cerrar);
  $("[data-ficha-cotizar]").addEventListener("click", cerrar);
  ficha.addEventListener("click", (e) => {
    if (e.target === ficha) cerrar();
  });
  ficha.addEventListener("close", () => {
    media.replaceChildren(); // detiene el video
    bloquearScroll(false);
  });
}
