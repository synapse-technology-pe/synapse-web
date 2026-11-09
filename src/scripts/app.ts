// Arranque de la página. Las animaciones con scroll se crean en el orden de las secciones
// (de arriba hacia abajo) para que los tramos fijos calculen bien sus distancias.
import { iniciarMovimiento, ScrollTrigger } from "../lib/movimiento";
import { iniciarTema } from "../lib/tema";
import { iniciarNav } from "./nav";
import { iniciarCapas } from "./capas";
import { iniciarIntro } from "./intro";
import { iniciarPie } from "./pie";
import { prepararHeroe } from "../features/heroe/heroe";
import { iniciarTecnologias } from "../features/tecnologias/tecnologias";
import { iniciarCatalogo } from "../features/catalogo/catalogo";
import { iniciarFranja } from "../features/franja/franja";
import { iniciarManifiesto } from "../features/manifiesto/manifiesto";
import { iniciarServicios } from "../features/servicios/servicios";
import { iniciarVideosAuto } from "../features/video/video";
import { iniciarProceso } from "../features/proceso/proceso";
import { iniciarInfraestructura } from "../features/infraestructura/infraestructura";
import { iniciarTrabajos } from "../features/trabajos/trabajos";
import { iniciarResenas } from "../features/resenas/resenas";
import { iniciarPreguntas } from "../features/preguntas/preguntas";
import { iniciarContacto } from "../features/contacto/contacto";

function seguro(nombre: string, fn: () => void) {
  try {
    fn();
  } catch (error) {
    console.error(`[Synapse] Falló ${nombre}:`, error);
  }
}

iniciarMovimiento();
seguro("tema", iniciarTema);
const heroe = prepararHeroe();
seguro("proyectos", iniciarTrabajos);
seguro("catálogo", iniciarCatalogo);
seguro("tecnologías", iniciarTecnologias);
seguro("franja", iniciarFranja);
seguro("manifiesto", iniciarManifiesto);
seguro("servicios", iniciarServicios);
seguro("proceso", iniciarProceso);
seguro("infraestructura", iniciarInfraestructura);
seguro("reseñas", iniciarResenas);
seguro("preguntas", iniciarPreguntas);
seguro("contacto", iniciarContacto);
seguro("pie", iniciarPie);
seguro("videos", iniciarVideosAuto);
seguro("menú", iniciarNav);
seguro("capas", iniciarCapas);

iniciarIntro()
  .then(() => heroe.entrar())
  // Cuando termina la entrada del inicio, las secciones pesadas pueden prepararse en segundo plano.
  .then(() => setTimeout(() => document.dispatchEvent(new Event("synapse:inicio-listo")), 2600));

// Las fuentes cambian medidas: se recalculan los tramos cuando terminan de cargar.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener("load", () => ScrollTrigger.refresh());
