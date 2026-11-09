// Genera la imagen para redes (public/og.jpg, 1200×630), los íconos PNG y public/favicon.svg a partir
// del logo, con Chrome o Edge sin ventana. Uso: npm run imagenes  (o CHROME_PATH=... para otro navegador)
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { marca, logotipo } from "../src/components/ui/logo-datos.ts";
import { DEGRADADOS, ROJO_LOGO } from "../src/components/ui/logo-colores.ts";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const pub = join(raiz, "public");
const navegador = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));
if (!navegador) throw new Error("No encontré Chrome ni Edge. Define CHROME_PATH.");

// Las fuentes van incrustadas: Chrome no carga fuentes de archivos locales en una página local.
const fuente = (ruta) => `data:font/woff2;base64,${readFileSync(join(raiz, "node_modules", ruta)).toString("base64")}`;
const titulos = fuente("@fontsource/anton/files/anton-latin-400-normal.woff2");
const texto = fuente("@fontsource-variable/geist/files/geist-latin-wght-normal.woff2");

// Marca: cuerpo con su degradado, nodos, hexágono chico y burbujas (igual que el componente Logo).
const paradas = (p) => p.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
const g = marca.degradado;
const marcaSvg = (id) => `
  <defs>
    <linearGradient id="${id}c" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">${paradas(DEGRADADOS.cuerpo)}</linearGradient>
    <linearGradient id="${id}h" x1="0" y1="1" x2="1" y2="0">${paradas(DEGRADADOS.hexagono)}</linearGradient>
    <linearGradient id="${id}b" x1="0" y1="1" x2="1" y2="0">${paradas(DEGRADADOS.burbuja)}</linearGradient>
  </defs>
  <path fill="url(#${id}c)" d="${marca.cuerpo}"/>
  ${marca.nodos.map((n) => `<circle fill="url(#${id}c)" cx="${n.cx}" cy="${n.cy}" r="${n.r}"/>`).join("")}
  <path fill="url(#${id}h)" d="${marca.hexagono.d}"/>
  ${marca.burbujas.map((b) => `<circle fill="url(#${id}b)" cx="${b.cx}" cy="${b.cy}" r="${b.r}"/>`).join("")}`;
const logotipoSvg = (tinta) => {
  const d = logotipo.divisor;
  const letras = logotipo.letras
    .map((l) => `<path fill-rule="evenodd" fill="${l.letra === "a" ? ROJO_LOGO : tinta}" d="${l.d}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logotipo.ancho} ${marca.alto}">${marcaSvg("l")}<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="${d.w / 2}" fill="${tinta}"/>${letras}</svg>`;
};
// Caja cuadrada con la marca centrada (para íconos).
const lado = marca.ancho + 6;
const cajaCuadrada = `-3 ${-(lado - marca.alto) / 2} ${lado} ${lado}`;

const base = `<meta charset="utf-8"><style>
@font-face{font-family:Titulos;src:url(${titulos}) format("woff2")}
@font-face{font-family:Texto;src:url(${texto}) format("woff2");font-weight:100 900}
*{margin:0;box-sizing:border-box}html,body{background:transparent}</style>`;

const og = `${base}<style>
body{width:1200px;height:630px;overflow:hidden;background:#050506;color:#f4f4f5;font-family:Texto,sans-serif;position:relative}
.brillo{position:absolute;right:-180px;top:-120px;width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(251,60,3,.36),transparent 62%)}
.red{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px);background-size:28px 28px}
.marca{position:absolute;right:70px;top:150px;width:300px;filter:drop-shadow(0 30px 70px rgba(251,70,3,.45))}
.texto{position:absolute;left:84px;top:84px;width:780px}
.logo{width:280px}
h1{margin-top:48px;font-family:Titulos,sans-serif;font-weight:400;font-size:88px;line-height:.92;text-transform:uppercase}
h1 span{color:#ff3a1a}
p{margin-top:28px;font-size:27px;color:#a1a1aa}
.pie{position:absolute;left:84px;bottom:64px;display:flex;gap:14px}
.pie b{padding:10px 20px;border:1px solid rgba(255,255,255,.18);border-radius:99px;font-size:20px;font-weight:600;color:#d4d4d8}
</style><div class="brillo"></div><div class="red"></div>
<svg class="marca" viewBox="-2 -2 ${marca.ancho + 4} ${marca.alto + 4}">${marcaSvg("m")}</svg>
<div class="texto"><div class="logo">${logotipoSvg("#f4f4f5")}</div>
<h1>Software <span>a medida</span><br>para tu empresa</h1>
<p>Webs, sistemas, apps, SaaS, IA e integraciones · Lima, Perú</p></div>
<div class="pie"><b>Páginas web</b><b>Sistemas</b><b>Apps móviles</b><b>IA</b></div>`;

const icono = (tam, fondo) => `${base}<style>body{width:${tam}px;height:${tam}px;display:grid;place-items:center;background:${fondo};border-radius:${fondo === "transparent" ? 0 : tam * 0.22}px}svg{width:${Math.round(tam * (fondo === "transparent" ? 1 : 0.74))}px}</style>
<svg viewBox="${cajaCuadrada}">${marcaSvg("i")}</svg>`;

const temp = mkdtempSync(join(tmpdir(), "synapse-img-"));
function capturar(html, ancho, alto, salida) {
  const archivo = join(temp, `p${ancho}x${alto}.html`);
  writeFileSync(archivo, html);
  execFileSync(navegador, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--default-background-color=00000000",
    "--virtual-time-budget=4000",
    `--user-data-dir=${join(temp, "perfil")}`,
    `--window-size=${ancho},${alto}`,
    `--screenshot=${salida}`,
    pathToFileURL(archivo).href,
  ], { stdio: "ignore" });
  console.log("✓", salida);
}

try {
  writeFileSync(join(pub, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cajaCuadrada}">${marcaSvg("f").replace(/\n\s*/g, "")}</svg>\n`);
  console.log("✓", join(pub, "favicon.svg"));
  const ogPng = join(temp, "og.png");
  capturar(og, 1200, 630, ogPng);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", ogPng, "-q:v", "3", join(pub, "og.jpg")]);
  console.log("✓", join(pub, "og.jpg"));
  capturar(icono(180, "#050506"), 180, 180, join(pub, "apple-touch-icon.png"));
  capturar(icono(192, "#050506"), 192, 192, join(pub, "icono-192.png"));
  capturar(icono(512, "#050506"), 512, 512, join(pub, "icono-512.png"));
  capturar(icono(512, "transparent"), 512, 512, join(pub, "logo-synapse.png"));
  capturar(icono(32, "transparent"), 32, 32, join(pub, "favicon-32.png"));
} finally {
  rmSync(temp, { recursive: true, force: true });
}
