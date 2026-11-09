// Colores del logo nuevo (medidos de la imagen original): rojo abajo-izquierda → naranja arriba-derecha.
// Los usan el SVG, el lienzo de la laptop, el logo 3D y las imágenes para redes.
type Paradas = readonly (readonly [number, string])[];
export const DEGRADADOS: Record<"cuerpo" | "hexagono" | "burbuja", Paradas> = {
  cuerpo: [[0, "#fb0302"], [0.3, "#fb0502"], [0.45, "#fb1e02"], [0.53, "#fc3e02"], [0.82, "#fd8e02"], [1, "#fdb903"]],
  hexagono: [[0, "#fb2601"], [1, "#fd9202"]],
  burbuja: [[0, "#fc4203"], [1, "#fd9e02"]],
};
export const ROJO_LOGO = "#fb0403";
