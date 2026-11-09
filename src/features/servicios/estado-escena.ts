// Estado que el scroll anima y la escena 3D dibuja (cámara, laptop, celular y pantallas).
import { estadoInicial, type EstadoPantallas } from "./pantallas";

export interface EstadoEscena {
  camX: number;
  camY: number;
  camZ: number;
  mirX: number;
  mirY: number;
  mirZ: number;
  lapX: number;
  lapY: number;
  lapZ: number;
  lapRY: number;
  tapa: number; // 1 cerrada, 0 abierta
  telX: number;
  telY: number;
  telZ: number;
  telRX: number;
  telRY: number;
  telRZ: number;
  telS: number;
  pantallas: EstadoPantallas;
}

/** Inicio del recorrido: laptop cerrada y el celular fuera de cuadro. */
export function estadoEscenaInicial(): EstadoEscena {
  return {
    camX: 0,
    camY: 3.1,
    camZ: 8.2,
    mirX: 0,
    mirY: 0.55,
    mirZ: 0,
    lapX: 0,
    lapY: 0,
    lapZ: 0,
    lapRY: -0.55,
    tapa: 1,
    telX: 3.6,
    telY: 0.6,
    telZ: 0.8,
    telRX: 0.06,
    telRY: -1.3,
    telRZ: 0,
    telS: 0,
    pantallas: estadoInicial(),
  };
}

/** Composición fija para movimiento reducido: laptop abierta, celular al lado, pantallas completas. */
export function estadoEscenaQuieto(): EstadoEscena {
  const e = estadoEscenaInicial();
  Object.assign(e, { camX: 0.8, camY: 1.5, camZ: 6, mirX: 0.5, mirY: 0.95, mirZ: 0, lapX: -0.5, lapRY: -0.15, tapa: 0 });
  Object.assign(e, { telX: 1.5, telY: 0.95, telZ: 1.05, telRY: -0.32, telS: 1 });
  Object.assign(e.pantallas, { encendido: 1, gestion: 1, pedidos: 1 });
  return e;
}
