// Aplana el 3D de CSS de una sección mientras está lejos de la pantalla. Así el navegador deja de mantener
// sus capas 3D en cada cuadro (el catálogo y los anillos suman ~220). Pasa fuera de la vista: no se nota.
export function dormirFueraDePantalla(el: Element | null, margen = "150% 0px") {
  if (!el) return;
  new IntersectionObserver(([e]) => el.classList.toggle("plano-3d", !e.isIntersecting), { rootMargin: margen }).observe(el);
}
