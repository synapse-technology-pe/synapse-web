// Reseñas de clientes. Usa solo reseñas reales y con permiso del cliente.
// Las marcadas con `ejemplo: true` se ven mientras editas (npm run dev) para que
// veas el diseño, pero NO salen en la web publicada. Bórralas al poner las reales.
// Si no hay reseñas reales, la sección no aparece en la web publicada.

export interface Resena {
  nombre: string;
  cargo: string;
  empresa: string;
  texto: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  ejemplo?: boolean;
}

export const resenas: Resena[] = [
  {
    ejemplo: true,
    nombre: "Nombre del cliente",
    cargo: "Gerente general",
    empresa: "Empresa del cliente",
    texto:
      "Aquí va la opinión real de tu cliente: qué problema tenía, qué construyeron juntos y qué cambió en su negocio después.",
    estrellas: 5,
  },
  {
    ejemplo: true,
    nombre: "Nombre del cliente",
    cargo: "Jefa de operaciones",
    empresa: "Empresa del cliente",
    texto:
      "Una segunda reseña real. Funciona mejor si menciona algo concreto: el sistema, el plazo o cómo los acompañaron.",
    estrellas: 5,
  },
  {
    ejemplo: true,
    nombre: "Nombre del cliente",
    cargo: "Fundador",
    empresa: "Empresa del cliente",
    texto: "Una tercera reseña real, corta y directa, con el nombre y el cargo de quien la escribe.",
    estrellas: 5,
  },
  {
    ejemplo: true,
    nombre: "Nombre del cliente",
    cargo: "Administrador",
    empresa: "Empresa del cliente",
    texto: "Una cuarta reseña real. Con tres o más, la sección se ve completa en todas las pantallas.",
    estrellas: 5,
  },
];

/** En la web publicada solo se muestran las reseñas reales. */
export const resenasVisibles = import.meta.env.DEV ? resenas : resenas.filter((r) => !r.ejemplo);
