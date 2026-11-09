// Red de "sinapsis" detrás del logo: nodos conectados y pulsos rojos que viajan por las conexiones.
// Los nodos cercanos al puntero se encienden.
import { THREE, azar } from "../../lib/three-base";
import type { Tema } from "../../lib/tema";

const VERT_NODOS = /* glsl */ `
attribute float aEscala;
attribute float aRojo;
attribute float aFase;
uniform float uTiempo;
uniform float uDpr;
uniform float uTam;
uniform vec3 uPuntero;
varying float vRojo;
varying float vBrillo;
void main() {
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * mundo;
  float cerca = smoothstep(2.4, 0.0, distance(mundo.xy, uPuntero.xy)) * step(-6.0, mundo.z);
  vRojo = max(aRojo, cerca);
  float lejos = smoothstep(-22.0, -5.0, mv.z);
  vBrillo = (0.55 + 0.25 * sin(uTiempo * 1.4 + aFase) + cerca * 0.9) * lejos;
  gl_PointSize = uTam * aEscala * uDpr * (1.0 + cerca * 1.3) * (9.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG_NODOS = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uRojo;
uniform float uOpacidad;
varying float vRojo;
varying float vBrillo;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float halo = smoothstep(0.5, 0.0, d);
  float nucleo = smoothstep(0.16, 0.02, d);
  vec3 color = mix(uColor, uRojo, vRojo);
  float a = (halo * halo * 0.55 + nucleo * 0.75) * vBrillo * uOpacidad;
  if (a < 0.004) discard;
  gl_FragColor = vec4(color, a);
  #include <colorspace_fragment>
}`;

const VERT_LINEAS = /* glsl */ `
attribute float aAlfa;
varying float vAlfa;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vAlfa = aAlfa * smoothstep(-22.0, -4.0, mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG_LINEAS = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacidad;
varying float vAlfa;
void main() {
  gl_FragColor = vec4(uColor, vAlfa * uOpacidad);
  #include <colorspace_fragment>
}`;

interface Pulso {
  arista: number;
  invertido: boolean;
  t: number;
  velocidad: number;
}

export function crearRed({ nodos = 150, pulsos = 34, semilla = 11 } = {}) {
  const rand = azar(semilla);
  const N = nodos;
  const pos = new Float32Array(N * 3);
  const escala = new Float32Array(N);
  const rojo = new Float32Array(N);
  const fase = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (rand() - 0.5) * 24;
    pos[i * 3 + 1] = (rand() - 0.5) * 13;
    pos[i * 3 + 2] = 1.5 - rand() * 12;
    escala[i] = 0.55 + rand() * 1.1;
    rojo[i] = rand() < 0.1 ? 1 : 0;
    fase[i] = rand() * Math.PI * 2;
  }

  // Conexiones: cada nodo con sus vecinos más cercanos.
  const aristas: [number, number][] = [];
  const vecinos: number[][] = Array.from({ length: N }, () => []);
  const vistas = new Set<string>();
  const MAX = 3.3;
  for (let i = 0; i < N; i++) {
    const dist: [number, number][] = [];
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      dist.push([Math.sqrt(dx * dx + dy * dy + dz * dz), j]);
    }
    dist.sort((a, b) => a[0] - b[0]);
    for (const [d, j] of dist.slice(0, 3)) {
      if (d > MAX) break;
      const clave = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (vistas.has(clave)) continue;
      vistas.add(clave);
      vecinos[i].push(aristas.length);
      vecinos[j].push(aristas.length);
      aristas.push([i, j]);
    }
  }

  const grupo = new THREE.Group();

  // Líneas
  const posLineas = new Float32Array(aristas.length * 6);
  const alfaLineas = new Float32Array(aristas.length * 2);
  aristas.forEach(([a, b], k) => {
    posLineas.set(pos.subarray(a * 3, a * 3 + 3), k * 6);
    posLineas.set(pos.subarray(b * 3, b * 3 + 3), k * 6 + 3);
    const dx = pos[a * 3] - pos[b * 3];
    const dy = pos[a * 3 + 1] - pos[b * 3 + 1];
    const dz = pos[a * 3 + 2] - pos[b * 3 + 2];
    const f = 1 - Math.sqrt(dx * dx + dy * dy + dz * dz) / MAX;
    alfaLineas[k * 2] = alfaLineas[k * 2 + 1] = 0.25 + f * 0.75;
  });
  const geoLineas = new THREE.BufferGeometry();
  geoLineas.setAttribute("position", new THREE.BufferAttribute(posLineas, 3));
  geoLineas.setAttribute("aAlfa", new THREE.BufferAttribute(alfaLineas, 1));
  const matLineas = new THREE.ShaderMaterial({
    vertexShader: VERT_LINEAS,
    fragmentShader: FRAG_LINEAS,
    uniforms: { uColor: { value: new THREE.Color() }, uOpacidad: { value: 0 } },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  grupo.add(new THREE.LineSegments(geoLineas, matLineas));

  // Nodos
  const geoNodos = new THREE.BufferGeometry();
  geoNodos.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geoNodos.setAttribute("aEscala", new THREE.BufferAttribute(escala, 1));
  geoNodos.setAttribute("aRojo", new THREE.BufferAttribute(rojo, 1));
  geoNodos.setAttribute("aFase", new THREE.BufferAttribute(fase, 1));
  const matNodos = new THREE.ShaderMaterial({
    vertexShader: VERT_NODOS,
    fragmentShader: FRAG_NODOS,
    uniforms: {
      uTiempo: { value: 0 },
      uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uTam: { value: 11 },
      uPuntero: { value: new THREE.Vector3(99, 99, 0) },
      uColor: { value: new THREE.Color() },
      uRojo: { value: new THREE.Color(0xff2a2a) },
      uOpacidad: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  grupo.add(new THREE.Points(geoNodos, matNodos));

  // Pulsos: una cabeza brillante y una estela corta por pulso.
  const lista: Pulso[] = Array.from({ length: pulsos }, () => ({
    arista: Math.floor(rand() * aristas.length),
    invertido: rand() < 0.5,
    t: rand(),
    velocidad: 0.35 + rand() * 0.55,
  }));
  const posCabezas = new Float32Array(pulsos * 3);
  const geoCabezas = new THREE.BufferGeometry();
  geoCabezas.setAttribute("position", new THREE.BufferAttribute(posCabezas, 3));
  geoCabezas.setAttribute("aEscala", new THREE.BufferAttribute(new Float32Array(pulsos).fill(1.9), 1));
  geoCabezas.setAttribute("aRojo", new THREE.BufferAttribute(new Float32Array(pulsos).fill(1), 1));
  geoCabezas.setAttribute("aFase", new THREE.BufferAttribute(new Float32Array(pulsos).fill(1.57), 1));
  const matCabezas = matNodos.clone();
  matCabezas.uniforms = THREE.UniformsUtils.clone(matNodos.uniforms);
  matCabezas.blending = THREE.AdditiveBlending;
  const cabezas = new THREE.Points(geoCabezas, matCabezas);
  grupo.add(cabezas);

  const posEstelas = new Float32Array(pulsos * 6);
  const alfaEstelas = new Float32Array(pulsos * 2);
  for (let k = 0; k < pulsos; k++) {
    alfaEstelas[k * 2] = 0;
    alfaEstelas[k * 2 + 1] = 1;
  }
  const geoEstelas = new THREE.BufferGeometry();
  geoEstelas.setAttribute("position", new THREE.BufferAttribute(posEstelas, 3));
  geoEstelas.setAttribute("aAlfa", new THREE.BufferAttribute(alfaEstelas, 1));
  const matEstelas = new THREE.ShaderMaterial({
    vertexShader: VERT_LINEAS,
    fragmentShader: FRAG_LINEAS,
    uniforms: { uColor: { value: new THREE.Color(0xff2a2a) }, uOpacidad: { value: 0 } },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  grupo.add(new THREE.LineSegments(geoEstelas, matEstelas));

  const punto = (i: number, j: number, t: number, salida: Float32Array, o: number) => {
    for (let c = 0; c < 3; c++) salida[o + c] = pos[i * 3 + c] + (pos[j * 3 + c] - pos[i * 3 + c]) * t;
  };

  function actualizar(t: number, dt: number, puntero: THREE.Vector3) {
    matNodos.uniforms.uTiempo.value = t;
    matNodos.uniforms.uPuntero.value.copy(puntero);
    matCabezas.uniforms.uTiempo.value = t;
    for (let k = 0; k < lista.length; k++) {
      const p = lista[k];
      let [a, b] = aristas[p.arista];
      if (p.invertido) [a, b] = [b, a];
      p.t += dt * p.velocidad;
      if (p.t >= 1) {
        // Llega al nodo: sigue por otra conexión de ese nodo.
        const opciones = vecinos[b].filter((e) => e !== p.arista);
        const siguiente = opciones.length ? opciones[Math.floor(rand() * opciones.length)] : Math.floor(rand() * aristas.length);
        p.invertido = aristas[siguiente][0] !== b;
        p.arista = siguiente;
        p.t = 0;
        [a, b] = aristas[siguiente];
        if (p.invertido) [a, b] = [b, a];
      }
      punto(a, b, p.t, posCabezas, k * 3);
      punto(a, b, Math.max(0, p.t - 0.22), posEstelas, k * 6);
      punto(a, b, p.t, posEstelas, k * 6 + 3);
    }
    geoCabezas.attributes.position.needsUpdate = true;
    geoEstelas.attributes.position.needsUpdate = true;
  }

  function aplicarTema(tema: Tema) {
    const claro = tema === "claro";
    matNodos.uniforms.uColor.value.set(claro ? 0x18181b : 0xe8e8ec);
    matLineas.uniforms.uColor.value.set(claro ? 0x18181b : 0xffffff);
    const mezcla = claro ? THREE.NormalBlending : THREE.AdditiveBlending;
    // La mezcla es un estado de dibujo: no hace falta recompilar el shader al cambiar de tema.
    matCabezas.blending = mezcla;
    matEstelas.blending = mezcla;
  }

  /** Opacidad general (0..1) para aparecer y desaparecer. */
  function opacidad(v: number) {
    matNodos.uniforms.uOpacidad.value = v;
    matCabezas.uniforms.uOpacidad.value = v;
    matLineas.uniforms.uOpacidad.value = v * 0.16;
    matEstelas.uniforms.uOpacidad.value = v * 0.9;
  }

  return { grupo, actualizar, aplicarTema, opacidad };
}
