// Proyectos del portafolio (carrusel "Lo que hemos construido"). El orden de la lista es el del carrusel.
// Para agregar uno: pon una captura en public/proyectos/ y agrega un objeto aquí.
// `video` es el número del video de Vimeo (el que va después de vimeo.com/).

export interface Proyecto {
  nombre: string;
  rubro: string; // Sector y tipo, en pocas palabras
  resumen: string; // Una frase para la tarjeta
  imagen: string; // Captura en public/proyectos/
  problema?: string;
  solucion?: string;
  stack?: string[];
  video?: string;
  url?: string;
}

export const proyectos: Proyecto[] = [
  {
    nombre: "POS SaaS Multiempresa + IA",
    rubro: "SaaS · Retail",
    resumen: "Ventas, inventario, cobros con QR y reportes de muchas empresas en una sola plataforma, con IA que lee facturas.",
    imagen: "/proyectos/pos-saas.webp",
    problema:
      "Muchos negocios pequeños siguen separando caja, inventario, pagos y reportes en herramientas distintas. Eso genera errores de stock, poca visibilidad del rendimiento y pérdida de ventas cuando la conexión a internet no es estable.",
    solucion:
      "Desarrollamos una plataforma SaaS multiempresa que centraliza ventas, inventario, cobros QR y reportes. Aplica aislamiento de datos por empresa, webhooks de Mercado Pago, asistencia con Google Gemini para OCR y analítica, seguridad con Spring Security y sincronización offline parcial.",
    stack: ["Spring Boot", "Spring Security", "Multiempresa", "Mercado Pago", "Google Gemini", "Modo offline"],
    video: "1215131349",
  },
  {
    nombre: "Gestión de Visitas PCM",
    rubro: "Sector público · Plataforma web",
    resumen: "Registro de visitantes, acompañantes y autorizaciones con trazabilidad y lector de DNI para el control de acceso.",
    imagen: "/proyectos/visitas-pcm.webp",
    problema:
      "Las sedes institucionales necesitan registrar visitantes, acompañantes y autorizaciones con trazabilidad. Un flujo manual vuelve lento el ingreso y dificulta auditar los movimientos en tiempo real.",
    solucion:
      "Lideramos el modelado UML del sistema y desarrollamos una plataforma web para registrar visitas, gestionar autorizaciones, consultar reportes y conectar un lector de DNI funcional que agiliza el control de acceso.",
    stack: ["Modelado UML", "Plataforma web", "Lector de DNI", "Reportes", "Autorizaciones"],
    video: "1215098763",
  },
  {
    nombre: "La Pollerona",
    rubro: "Restaurante · Web de pedidos",
    resumen: "Web para una pollería a la leña con carta, fotos que abren el apetito y pedidos para recoger.",
    imagen: "/proyectos/la-pollerona.webp",
    stack: ["Diseño web", "Carta digital", "Pedidos para recoger", "Responsive"],
    url: "https://la-pollerona.vercel.app/",
  },
  {
    nombre: "Pinchazo",
    rubro: "Bar de tapas · Web 3D",
    resumen: "Web con objetos 3D y tipografía gigante para un bar de cocina hispano-limeña.",
    imagen: "/proyectos/pinchazo.webp",
    stack: ["Escenas 3D", "Animaciones", "Diseño de marca", "Responsive"],
    url: "https://estudio-topas.vercel.app/",
  },
  {
    nombre: "Vesta",
    rubro: "Moda · Tienda online",
    resumen: "Tienda de ropa con catálogo por categorías, carrito, cupones, seguimiento de pedidos y pago con Yape o Plin.",
    imagen: "/proyectos/vesta.webp",
    stack: ["E-commerce", "Carrito y cupones", "Seguimiento de pedidos", "Modo oscuro"],
    url: "https://vesta-moda-black.vercel.app/",
  },
];
