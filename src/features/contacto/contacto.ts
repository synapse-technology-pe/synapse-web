// Contacto: el título se llena de color con el scroll y el cotizador avanza en 3 pasos.
// Al enviar, la solicitud llega por correo (FormSubmit) y se ofrece enviarla también por WhatsApp.
import { gsap, ScrollTrigger, reducido } from "../../lib/movimiento";

export function iniciarContacto() {
  const titulo = document.querySelector<HTMLElement>("[data-contacto-titulo]");
  if (titulo && !reducido) {
    gsap.to(titulo, {
      backgroundPosition: "0% 0",
      ease: "none",
      scrollTrigger: { trigger: titulo, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
    });
  }
  const form = document.querySelector<HTMLFormElement>("[data-cotizador]");
  if (form) iniciarCotizador(form);
}

function iniciarCotizador(form: HTMLFormElement) {
  const pasos = [...form.querySelectorAll<HTMLFieldSetElement>("[data-paso]")];
  const puntos = [...form.querySelectorAll<HTMLLIElement>(".cotizador__puntos li")];
  const num = form.querySelector<HTMLElement>("[data-cotizador-num]")!;
  const barra = form.querySelector<HTMLElement>("[data-cotizador-barra]")!;
  const nota = form.querySelector<HTMLElement>("[data-cotizador-nota]")!;
  const resumen = form.querySelector<HTMLElement>("[data-cotizador-resumen]")!;
  const atras = form.querySelector<HTMLButtonElement>("[data-cotizador-atras]")!;
  const siguiente = form.querySelector<HTMLButtonElement>("[data-cotizador-siguiente]")!;
  const enviar = form.querySelector<HTMLButtonElement>("[data-cotizador-enviar]")!;
  let actual = 0;

  const valores = (nombre: string) =>
    [...form.querySelectorAll<HTMLInputElement>(`[name="${nombre}"]:checked`)].map((i) => i.value);
  const campo = (nombre: string) => form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${nombre}"]`)!;
  const texto = (nombre: string) => campo(nombre).value.trim();

  function avisar(mensaje: string, ok = false) {
    nota.textContent = mensaje;
    nota.classList.toggle("ok", ok);
  }

  function validar(i: number): boolean {
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    if (i === 0 && !valores("tipo").length) return falla("Elige al menos un tipo de proyecto.");
    if (i === 1 && texto("idea").length < 15) return falla("Cuéntanos un poco más de tu idea (al menos una frase).", "idea");
    if (i === 2) {
      if (!texto("nombre")) return falla("Escribe tu nombre.", "nombre");
      const tel = texto("telefono").replace(/[^\d+]/g, "");
      const correo = texto("correo");
      const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
      if (tel.length < 7 && !correoOk) return falla("Déjanos un WhatsApp o un correo para responderte.", "telefono");
      if (correo && !correoOk) return falla("Revisa el correo: parece incompleto.", "correo");
      if (!(campo("consentimiento") as HTMLInputElement).checked) return falla("Marca la casilla para que podamos responderte.");
    }
    avisar("");
    return true;
  }

  function falla(mensaje: string, nombre?: string) {
    avisar(mensaje);
    if (nombre) {
      const c = campo(nombre);
      c.setAttribute("aria-invalid", "true");
      c.focus();
    }
    return false;
  }

  function pintarResumen() {
    const partes = [
      ["Proyecto", valores("tipo").join(", ")],
      ["Plazo", valores("plazo")[0]],
    ].filter(([, v]) => v);
    resumen.innerHTML = partes.map(([k, v]) => `<span>${k}: <b>${escapar(v!)}</b></span>`).join("<span>·</span>");
  }

  function ir(destino: number) {
    const dir = destino > actual ? 1 : -1;
    const saliente = pasos[actual];
    const entrante = pasos[destino];
    actual = destino;
    if (destino === pasos.length - 1) pintarResumen();
    num.textContent = `Paso ${destino + 1} de ${pasos.length}`;
    barra.style.width = `${((destino + 1) / pasos.length) * 100}%`;
    puntos.forEach((p, k) => {
      p.classList.toggle("activo", k === destino);
      p.classList.toggle("hecho", k < destino);
    });
    atras.hidden = destino === 0;
    siguiente.hidden = destino === pasos.length - 1;
    enviar.hidden = destino !== pasos.length - 1;

    const mostrar = () => {
      saliente.hidden = true;
      entrante.hidden = false;
      entrante.querySelector<HTMLElement>("legend")?.focus({ preventScroll: true });
      if (!reducido) {
        gsap.fromTo(
          entrante,
          { opacity: 0, x: 50 * dir, rotateY: 10 * dir },
          { opacity: 1, x: 0, rotateY: 0, duration: 0.55, ease: "power3.out", clearProps: "transform" },
        );
      }
      ScrollTrigger.refresh();
    };
    if (reducido) mostrar();
    else gsap.to(saliente, { opacity: 0, x: -40 * dir, rotateY: -8 * dir, duration: 0.25, ease: "power2.in", onComplete: mostrar });
  }

  siguiente.addEventListener("click", () => validar(actual) && ir(actual + 1));
  atras.addEventListener("click", () => ir(actual - 1));
  form.addEventListener("keydown", (e) => {
    // Enter avanza de paso (salvo en el cuadro de texto)
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && actual < pasos.length - 1) {
      e.preventDefault();
      siguiente.click();
    }
  });

  const exito = form.querySelector<HTMLElement>("[data-cotizador-exito]")!;
  const enlaceWa = form.querySelector<HTMLAnchorElement>("[data-cotizador-whatsapp]")!;
  const textoExito = form.querySelector<HTMLElement>("[data-cotizador-exito-texto]")!;

  function mensaje() {
    const empresa = texto("empresa");
    return [
      `Hola, soy ${texto("nombre")}${empresa ? ` de ${empresa}` : ""}. Quiero cotizar un proyecto con Synapse.`,
      "",
      `• Proyecto: ${valores("tipo").join(", ")}`,
      `• Plazo: ${valores("plazo")[0] ?? "Por definir"}`,
      `• Situación: ${valores("situacion")[0] ?? "-"}`,
      "",
      "Mi idea:",
      texto("idea"),
      "",
      `Contacto: ${[texto("telefono"), texto("correo")].filter(Boolean).join(" · ")}`,
    ].join("\n");
  }

  function mostrarExito(llegoCorreo: boolean) {
    form.querySelector<HTMLElement>(".cotizador__cabeza")!.hidden = true;
    form.querySelector<HTMLElement>(".cotizador__pasos")!.hidden = true;
    form.querySelector<HTMLElement>(".cotizador__acciones")!.hidden = true;
    avisar("");
    if (!llegoCorreo) textoExito.textContent = "No pudimos enviar el correo en este momento. Envíanos tu solicitud por WhatsApp y te respondemos ahí.";
    exito.hidden = false;
    if (!reducido) gsap.from(exito, { opacity: 0, y: 24, duration: 0.6, ease: "power3.out" });
    exito.querySelector<HTMLElement>("h3")?.setAttribute("tabindex", "-1");
    exito.querySelector<HTMLElement>("h3")?.focus();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validar(pasos.length - 1)) return;
    if (texto("_honey")) return; // bot
    const texto_ = mensaje();
    const whatsapp = form.dataset.whatsapp;
    enlaceWa.hidden = !whatsapp;
    if (whatsapp) enlaceWa.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(texto_)}`;

    const correo = form.dataset.formsubmit || form.dataset.correo;
    if (!correo) {
      mostrarExito(false);
      return;
    }
    enviar.disabled = true;
    avisar("Enviando tu solicitud…", true);
    try {
      const respuesta = await fetch(`https://formsubmit.co/ajax/${correo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Nueva cotización: ${valores("tipo").join(", ")}`,
          _template: "table",
          _captcha: "false",
          Nombre: texto("nombre"),
          Empresa: texto("empresa") || "-",
          WhatsApp: texto("telefono") || "-",
          Correo: texto("correo") || "-",
          Proyecto: valores("tipo").join(", "),
          Plazo: valores("plazo")[0] ?? "Por definir",
          Situación: valores("situacion")[0] ?? "-",
          Idea: texto("idea"),
          _replyto: texto("correo") || undefined,
        }),
      });
      const datos = await respuesta.json().catch(() => ({}));
      mostrarExito(respuesta.ok && String(datos.success) === "true");
    } catch {
      mostrarExito(false);
    } finally {
      enviar.disabled = false;
    }
  });
}

function escapar(t: string) {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
