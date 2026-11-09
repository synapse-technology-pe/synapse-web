// Tema oscuro (marca) y claro. Se guarda en el navegador y avisa a las escenas 3D con el evento "tema".
import { reducido } from "./movimiento";

export type Tema = "oscuro" | "claro";

export const temaActual = (): Tema => (document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro");

export function alCambiarTema(fn: (t: Tema) => void) {
  window.addEventListener("tema", (e) => fn((e as CustomEvent<Tema>).detail));
}

function aplicar(t: Tema) {
  document.documentElement.dataset.tema = t;
  try {
    localStorage.setItem("synapse-tema", t);
  } catch {
    /* sin almacenamiento: el tema dura solo esta visita */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "claro" ? "#f5f5f3" : "#050506");
  window.dispatchEvent(new CustomEvent<Tema>("tema", { detail: t }));
  actualizarBotones();
}

function actualizarBotones() {
  const claro = temaActual() === "claro";
  document.querySelectorAll<HTMLButtonElement>("[data-tema-toggle]").forEach((b) => {
    b.setAttribute("aria-label", claro ? "Activar modo oscuro" : "Activar modo claro");
  });
}

function cambiar(x: number, y: number) {
  const nuevo: Tema = temaActual() === "oscuro" ? "claro" : "oscuro";
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reducido) {
    aplicar(nuevo);
    return;
  }
  // El tema nuevo se abre en círculo desde el botón.
  const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transicion = doc.startViewTransition(() => aplicar(nuevo));
  transicion.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
      { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

export function iniciarTema() {
  actualizarBotones();
  document.querySelectorAll<HTMLButtonElement>("[data-tema-toggle]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const r = b.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      cambiar(x, y);
    });
  });
}
