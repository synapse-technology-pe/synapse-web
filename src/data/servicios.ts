// Los cuatro servicios. Cada uno es un capítulo de la escena 3D de la sección Servicios.

export interface Servicio {
  id: "web" | "movil" | "saas" | "ia";
  titulo: string;
  resumen: string;
  ejemplos: string[];
}

export const servicios: Servicio[] = [
  {
    id: "web",
    titulo: "Sistemas web a medida",
    resumen:
      "Sistemas de gestión para ordenar tu operación: ventas, inventario, caja, reportes y usuarios con permisos, en la nube y desde cualquier navegador.",
    ejemplos: ["Inventario y ventas", "Reservas y citas", "Portales para clientes"],
  },
  {
    id: "movil",
    titulo: "Apps móviles para Android e iOS",
    resumen:
      "Apps que tus clientes y tu equipo usan a diario para hacer pedidos, reservar, seguir entregas y recibir notificaciones.",
    ejemplos: ["Pedidos y delivery", "Notificaciones", "Apps para tu equipo"],
  },
  {
    id: "saas",
    titulo: "Plataformas SaaS por suscripción",
    resumen:
      "Convertimos tu idea en un software que vendes por suscripción, con cuentas por empresa, planes, cobros recurrentes y panel de métricas.",
    ejemplos: ["Multiempresa", "Planes y cobros", "Métricas de uso"],
  },
  {
    id: "ia",
    titulo: "Inteligencia artificial a medida",
    resumen:
      "Asistentes y automatizaciones que trabajan con la información de tu empresa: atienden clientes, leen documentos y preparan reportes.",
    ejemplos: ["Asistentes de atención", "Lectura de documentos", "Reportes automáticos"],
  },
];
