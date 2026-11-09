# Synapse · Web de la agencia

Web de una sola página para Synapse, agencia de desarrollo de software a medida en Lima, Perú.
Hecha con [Astro](https://astro.build) (HTML estático, ideal para SEO), animaciones de scroll con
GSAP + ScrollTrigger, desplazamiento suave con Lenis y escenas 3D con Three.js.

## Qué tiene

- **Intro con el logo**: las 5 esquirlas del hexágono aparecen sueltas, se atraen y chocan; la luz recorre
  los circuitos hasta los nodos, cae el hexágono chico, salen las burbujas, entra "Synapse" y la página se
  abre por la silueta del hexágono. Solo en la primera visita de la sesión; se salta con un clic o una tecla.
- **Héroe 3D**: "SYN" y "APSE" se abren y el logo en 3D se arma en el hueco con sus piezas (esquirlas,
  hexágono, burbujas y nodos). Al bajar, las piezas se separan en vista explotada mientras gira. Detrás, una
  red de "sinapsis" con pulsos que sigue al mouse.
- **Tecnologías**: dos anillos 3D con 33 logos reales que giran con el scroll (`src/data/tecnologias.ts`).
- **Trabajos en producción** justo después del inicio, con marcos de navegador y celular en 3D.
- **Catálogo**: 12 tipos de software con íconos 3D y tarjetas que se inclinan hacia el mouse.
- **En acción**: la sección queda fija y el scroll recorre 4 capítulos. La MacBook se abre, entra el
  iPhone y las pantallas muestran un sistema de gestión, una app de pedidos, un SaaS y un asistente con IA.
- **Infraestructura**: una pila 3D que se arma capa por capa (Oracle, Azure, AWS, Google Cloud, APIs como BCP).
- Proceso con carril horizontal, reseñas, preguntas frecuentes y **cotizador en 3 pasos** que llega por
  correo y ofrece enviarlo por WhatsApp.
- Tipografía: Anton (títulos), Geist (texto) y Geist Mono (etiquetas).
- **Rendimiento**: las escenas 3D compilan sus shaders sin bloquear y bajan solas su resolución si el equipo
  no llega a ~45 cuadros por segundo (`src/lib/calidad.ts`); la escena de la laptop se prepara en un momento
  libre; el 3D de CSS del catálogo y de los anillos se aplana mientras está lejos de la pantalla
  (`src/lib/dormir.ts`). En equipos rápidos se ve igual.
- **Modo claro y oscuro** (el cambio se abre en círculo), responsive y respeta "reducir movimiento".
- **SEO**: título y descripción, Open Graph, datos estructurados (negocio, servicios, video y preguntas),
  sitemap con video, robots.txt y transcripción del video.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # ver la web en http://localhost:4321 mientras editas
npm run build      # generar la web final en dist/
npm run preview    # ver la versión final antes de publicar
```

## Lo que tienes que completar antes de publicar

| Qué | Dónde |
|---|---|
| WhatsApp, correo y redes | `src/data/sitio.ts` |
| Videos de tus trabajos | `public/videos/trabajos/` y su ficha en `src/data/proyectos.ts` |
| Reseñas reales de clientes | `src/data/resenas.ts` (borra las de ejemplo) |
| Dominio de la web | `.env` → `SITE_URL=https://tudominio.com` (en Vercel se toma solo) |
| Textos que prometen algo (plazos, soporte, seguridad) | `src/data/*.ts` — revisa que reflejen cómo trabajas |

Las secciones **Trabajos** y **Reseñas** no aparecen en la web publicada mientras estén vacías.
Mientras editas (`npm run dev`) verás espacios y reseñas de ejemplo para que veas el diseño.

## Estructura

```
src/
├── pages/            index.astro (la página), 404, robots.txt y sitemap.xml
├── layouts/          Base.astro: <head>, SEO, tema, menú, intro y pie
├── features/         una carpeta por sección (componente .astro + su animación .ts)
│   ├── heroe/        escena 3D: logo extruido y red neuronal
│   ├── servicios/    escena 3D de dispositivos y pantallas dibujadas en canvas
│   └── ...           franja, manifiesto, video, proceso, infraestructura, trabajos, reseñas, preguntas, contacto
├── components/       Logo, Icono, menú, intro, pie, capas globales y SEO
├── data/             todos los textos editables
├── lib/              motor de animación, tema, utilidades 3D
├── scripts/          arranque y comportamiento global (menú, cursor, intro)
├── styles/           colores (tokens), base y componentes
└── assets/iconos/    íconos Lucide y logos de Oracle y Azure (SVG Logos, CC0)
public/               modelos 3D, videos, imagen para redes, íconos
scripts/              utilidades: logotipo SVG, imágenes para redes, aligerar modelos 3D
```

## Utilidades

- `npm run imagenes`: regenera `public/og.jpg`, `public/favicon.svg` y los íconos PNG desde el logo (usa Chrome o Edge).
- `npm run logo`: regenera `src/components/ui/logo-datos.ts` (rutas del logo, esquirlas y piezas 3D) desde
  `scripts/logo/logo-trazado.json`, que se trazó de las imágenes originales con `scripts/logo/trazar-logo.py`.
  Los colores del logo están en `src/components/ui/logo-colores.ts`.
- `npm run modelo -- entrada.glb salida.glb nodo-a-quitar`: aligera un modelo 3D quitando piezas.

## Publicar en Vercel

1. Sube la carpeta a un repositorio de GitHub.
2. En Vercel, importa el repositorio. Astro se detecta solo (build `npm run build`, salida `dist`).
3. Cuando tengas dominio propio, agrégalo en Vercel o define `SITE_URL`.

## Créditos

- Modelos 3D del iPhone y la MacBook: registro de HyperFrames (sin logos de Apple).
- Íconos: Lucide (ISC). Logos de Oracle y Microsoft Azure: SVG Logos de Gil Barbara (CC0); son marcas de sus dueños.
- Fuentes: Anton, Geist y Geist Mono (OFL) vía Fontsource. El logo es el original de Synapse, trazado a vectores.

## Formulario de cotización

- Cada solicitud llega automáticamente a **agencia.desarollo@gmail.com** mediante [FormSubmit](https://formsubmit.co) (gratis, sin cuenta).
- **La primera vez** FormSubmit envía un correo de activación a esa dirección: ábrelo y confirma. Desde entonces llegan todas las solicitudes.
- Al terminar, el visitante ve un botón para enviar la misma solicitud por **WhatsApp al +51 935 374 580**.
- El número, el correo y las redes se cambian en `src/data/sitio.ts`.

## Proyectos del portafolio

Se editan en `src/data/proyectos.ts` (nombre, rubro, resumen, captura, problema, solución, stack, video de Vimeo o enlace).
Las capturas van en `public/proyectos/`.
