// Datos generales de la agencia. Aquí cambias tus contactos y redes:
// la web los usa en el menú, el formulario, el pie y los datos para Google.

export const sitio = {
  nombre: "Synapse",
  titulo: "Synapse | Desarrollo de software a medida en Lima, Perú",
  descripcion:
    "Agencia de desarrollo de software a medida en Lima: sistemas web, apps móviles, plataformas SaaS e inteligencia artificial para empresas de todo el Perú.",
  ciudad: "Lima",
  pais: "Perú",

  // Número de WhatsApp con código de país, solo dígitos. Ejemplo: "51987654321".
  // Si lo dejas vacío, el formulario envía por correo.
  whatsapp: "51935374580",
  whatsappVisible: "+51 935 374 580",

  // Correo de contacto. Ejemplo: "hola@tudominio.com".
  correo: "agencia.desarollo@gmail.com",

  // Código privado de FormSubmit (llegó en el correo de activación). Las solicitudes del formulario
  // se envían a este código en vez de al correo visible, así los bots no lo leen del código.
  formsubmit: "aac6948d161849abfc208be7db48f844",

  // Enlaces completos a tus redes. Las vacías no se muestran.
  redes: {
    tiktok: "https://www.tiktok.com/@soluc.soft_x",
    instagram: "",
    linkedin: "",
    facebook: "",
  },
};

export const navegacion = [
  { texto: "Proyectos", href: "#proyectos" },
  { texto: "Servicios", href: "#servicios" },
  { texto: "Tecnologías", href: "#tecnologias" },
  { texto: "Proceso", href: "#proceso" },
  { texto: "Reseñas", href: "#resenas" },
  { texto: "Preguntas", href: "#preguntas" },
];

/** Enlace de WhatsApp con un mensaje ya escrito (o null si no hay número). */
export function enlaceWhatsapp(mensaje = "Hola, quiero cotizar un proyecto con Synapse.") {
  if (!sitio.whatsapp) return null;
  return `https://wa.me/${sitio.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
