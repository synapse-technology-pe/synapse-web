// Videos que se reproducen en silencio solo mientras se ven (portafolio y demás).
import { reducido } from "../../lib/movimiento";

export function iniciarVideosAuto() {
  const videos = document.querySelectorAll<HTMLVideoElement>("video[data-video-auto]");
  if (!videos.length) return;
  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach(({ target, isIntersecting }) => {
        const v = target as HTMLVideoElement;
        if (isIntersecting && !reducido) {
          if (v.preload === "none") v.preload = "auto";
          v.play().catch(() => {
            /* sin reproducción automática: queda la portada */
          });
        } else {
          v.pause();
        }
      }),
    { threshold: 0.35 },
  );
  videos.forEach((v) => io.observe(v));
}
