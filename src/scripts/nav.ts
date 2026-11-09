// Menú superior: fondo al bajar, se esconde al bajar y vuelve al subir, enlace activo y menú móvil.
import { gsap, ScrollTrigger, bloquearScroll, reducido } from "../lib/movimiento";

export function iniciarNav() {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return;

  ScrollTrigger.create({
    start: 0,
    end: "max",
    refreshPriority: -1,
    onUpdate: (self) => {
      const y = self.scroll();
      const menuAbierto = nav.classList.contains("nav--menu");
      nav.classList.toggle("nav--solida", y > 24 || menuAbierto);
      nav.classList.toggle("nav--oculta", self.direction === 1 && y > window.innerHeight * 0.8 && !menuAbierto);
    },
  });

  // Enlace activo según la sección en pantalla.
  document.querySelectorAll<HTMLAnchorElement>(".nav__enlace").forEach((a) => {
    const seccion = document.querySelector(a.getAttribute("href") ?? "");
    if (!seccion) return;
    ScrollTrigger.create({
      trigger: seccion,
      start: "top 55%",
      end: "bottom 45%",
      refreshPriority: -1,
      onToggle: (s) => a.classList.toggle("activo", s.isActive),
    });
  });

  iniciarMenuMovil(nav);
}

function iniciarMenuMovil(nav: HTMLElement) {
  const boton = document.querySelector<HTMLButtonElement>("[data-menu-boton]");
  const menu = document.querySelector<HTMLElement>("[data-menu]");
  if (!boton || !menu) return;
  let abierto = false;
  const items = menu.querySelectorAll(".menu-movil__enlace, .menu-movil__cta");

  const abrir = () => {
    abierto = true;
    menu.hidden = false;
    nav.classList.add("nav--menu", "nav--solida");
    nav.classList.remove("nav--oculta");
    boton.setAttribute("aria-expanded", "true");
    boton.setAttribute("aria-label", "Cerrar menú");
    bloquearScroll(true);
    gsap.killTweensOf([menu, items]);
    gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reducido ? 0 : 0.75, ease: "expo.inOut" });
    gsap.fromTo(items, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.05, delay: reducido ? 0 : 0.3 });
    (menu.querySelector("a") as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const cerrar = () => {
    if (!abierto) return;
    abierto = false;
    nav.classList.remove("nav--menu");
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", "Abrir menú");
    bloquearScroll(false);
    gsap.to(menu, {
      clipPath: "inset(0 0 100% 0)",
      duration: reducido ? 0 : 0.6,
      ease: "expo.inOut",
      onComplete: () => {
        menu.hidden = true;
      },
    });
  };

  boton.addEventListener("click", () => (abierto ? cerrar() : abrir()));
  menu.querySelectorAll("[data-menu-enlace]").forEach((a) => a.addEventListener("click", cerrar));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && abierto) {
      cerrar();
      boton.focus();
    }
  });
  window.matchMedia("(min-width: 1081px)").addEventListener("change", (m) => m.matches && cerrar());
}
