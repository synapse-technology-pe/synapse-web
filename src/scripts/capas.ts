// Capas globales: barra de progreso, cursor, luz que sigue al puntero y reproductor de video.
import { gsap, reducido, tactil, bloquearScroll } from "../lib/movimiento";

export function iniciarCapas() {
  iniciarProgreso();
  iniciarLuzPuntero();
  iniciarModalVideo();
  if (!reducido && !tactil) {
    iniciarCursor();
    iniciarInclinacion();
  }
}

// Elementos con data-tilt: se inclinan en 3D hacia el puntero (usan --rx / --ry en su CSS).
function iniciarInclinacion() {
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    el.addEventListener(
      "pointermove",
      (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      },
      { passive: true },
    );
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

function iniciarProgreso() {
  const barra = document.querySelector("[data-progreso]");
  if (!barra) return;
  gsap.to(barra, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3, refreshPriority: -1 } });
}

// Botones y tarjetas con luz: guardan la posición del puntero en --mx / --my.
function iniciarLuzPuntero() {
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".boton, .tarjeta--luz");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    },
    { passive: true },
  );
}

function iniciarCursor() {
  const cursor = document.querySelector<HTMLElement>("[data-cursor-raiz]");
  const texto = document.querySelector<HTMLElement>("[data-cursor-texto]");
  if (!cursor || !texto) return;
  const aro = cursor.querySelector<HTMLElement>(".cursor__aro")!;
  const punto = cursor.querySelector<HTMLElement>(".cursor__punto")!;
  const aroX = gsap.quickTo(aro, "x", { duration: 0.45, ease: "power3.out" });
  const aroY = gsap.quickTo(aro, "y", { duration: 0.45, ease: "power3.out" });
  const ptoX = gsap.quickTo(punto, "x", { duration: 0.08, ease: "power2.out" });
  const ptoY = gsap.quickTo(punto, "y", { duration: 0.08, ease: "power2.out" });
  cursor.classList.add("cursor--oculto");

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      cursor.classList.remove("cursor--oculto");
      aroX(e.clientX);
      aroY(e.clientY);
      ptoX(e.clientX);
      ptoY(e.clientY);
      const sobre = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, summary, label, input, textarea, select");
      const ver = sobre?.dataset.cursor === "ver";
      cursor.classList.toggle("cursor--ver", ver);
      cursor.classList.toggle("cursor--enlace", !!sobre && !ver && !sobre.matches("input, textarea"));
      texto.textContent = ver ? (sobre?.dataset.cursorTexto ?? "Ver") : "";
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => cursor.classList.add("cursor--oculto"));
}

// Cualquier elemento con data-video="ruta.mp4" abre el reproductor (data-vertical para videos verticales).
function iniciarModalVideo() {
  const modal = document.querySelector<HTMLDialogElement>("[data-modal-video]");
  const video = document.querySelector<HTMLVideoElement>("[data-modal-reproductor]");
  if (!modal || !video) return;

  document.addEventListener("click", (e) => {
    const disparador = (e.target as HTMLElement).closest<HTMLElement>("[data-video]");
    if (!disparador) return;
    e.preventDefault();
    video.src = disparador.dataset.video ?? "";
    video.poster = disparador.dataset.poster ?? "";
    modal.classList.toggle("modal-video--vertical", disparador.hasAttribute("data-vertical"));
    modal.showModal();
    bloquearScroll(true);
    video.play().catch(() => {
      /* el navegador pidió un clic: los controles quedan visibles */
    });
  });

  const cerrar = () => modal.open && modal.close();
  modal.querySelector("[data-modal-cerrar]")?.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });
  modal.addEventListener("close", () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
    bloquearScroll(false);
  });
}
