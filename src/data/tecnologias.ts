// Tecnologías y plataformas con las que trabajamos (se muestran en los anillos 3D).
// Son herramientas que usamos, no clientes ni socios: deja solo las que de verdad usas.
// `icono` es el archivo de src/assets/iconos/ (logos reales en color, SVG Logos / Simple Icons, CC0).

export interface Tecnologia {
  nombre: string;
  icono: string;
}

export const tecnologias: Tecnologia[] = [
  { nombre: "React", icono: "react" },
  { nombre: "Next.js", icono: "nextjs" },
  { nombre: "Vue.js", icono: "vue" },
  { nombre: "Angular", icono: "angular" },
  { nombre: "TypeScript", icono: "typescript" },
  { nombre: "Tailwind CSS", icono: "tailwindcss" },
  { nombre: "Node.js", icono: "nodejs" },
  { nombre: "Python", icono: "python" },
  { nombre: "Django", icono: "django" },
  { nombre: "Laravel", icono: "laravel" },
  { nombre: "Flutter", icono: "flutter" },
  { nombre: "Swift", icono: "swift" },
  { nombre: "Android", icono: "android" },
  { nombre: "PostgreSQL", icono: "postgres" },
  { nombre: "MySQL", icono: "mysql" },
  { nombre: "MongoDB", icono: "mongodb" },
  { nombre: "Redis", icono: "redis" },
  { nombre: "Firebase", icono: "firebase" },
  { nombre: "Supabase", icono: "supabase" },
  { nombre: "Docker", icono: "docker" },
  { nombre: "Kubernetes", icono: "kubernetes" },
  { nombre: "GitHub", icono: "github" },
  { nombre: "AWS", icono: "aws" },
  { nombre: "Google Cloud", icono: "google-cloud" },
  { nombre: "Microsoft Azure", icono: "azure" },
  { nombre: "Oracle Cloud", icono: "oracle" },
  { nombre: "Vercel", icono: "vercel" },
  { nombre: "Cloudflare", icono: "cloudflare" },
  { nombre: "OpenAI", icono: "openai" },
  { nombre: "Figma", icono: "figma" },
  { nombre: "WhatsApp", icono: "whatsapp" },
  { nombre: "Mercado Pago", icono: "mercadopago" },
  { nombre: "PayPal", icono: "paypal" },
];
