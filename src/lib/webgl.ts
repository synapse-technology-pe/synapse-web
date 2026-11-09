// Comprobación ligera de WebGL (sin cargar Three.js) para decidir si se monta una escena 3D.
let resultado: boolean | null = null;

export function soportaWebGL(): boolean {
  if (resultado !== null) return resultado;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    resultado = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    resultado = false;
  }
  return resultado;
}
