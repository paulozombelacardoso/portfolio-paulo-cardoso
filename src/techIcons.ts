// Mapeamento de ícones oficiais de tecnologias (Devicons)
const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

export const TECH_ICONS: Record<string, string> = {
  // Linguagens
  c: `${DEVICON_BASE}/c/c-original.svg`,
  "c++": `${DEVICON_BASE}/cplusplus/cplusplus-original.svg`,
  "c++98": `${DEVICON_BASE}/cplusplus/cplusplus-original.svg`,
  "c#": `${DEVICON_BASE}/csharp/csharp-original.svg`,
  csharp: `${DEVICON_BASE}/csharp/csharp-original.svg`,
  javascript: `${DEVICON_BASE}/javascript/javascript-original.svg`,
  js: `${DEVICON_BASE}/javascript/javascript-original.svg`,
  typescript: `${DEVICON_BASE}/typescript/typescript-original.svg`,
  ts: `${DEVICON_BASE}/typescript/typescript-original.svg`,
  python: `${DEVICON_BASE}/python/python-original.svg`,
  html: `${DEVICON_BASE}/html5/html5-original.svg`,
  html5: `${DEVICON_BASE}/html5/html5-original.svg`,
  css: `${DEVICON_BASE}/css3/css3-original.svg`,
  css3: `${DEVICON_BASE}/css3/css3-original.svg`,
  bash: `${DEVICON_BASE}/bash/bash-original.svg`,
  shell: `${DEVICON_BASE}/bash/bash-original.svg`,

  // Backend & Frameworks
  "node.js": `${DEVICON_BASE}/nodejs/nodejs-original.svg`,
  nodejs: `${DEVICON_BASE}/nodejs/nodejs-original.svg`,
  node: `${DEVICON_BASE}/nodejs/nodejs-original.svg`,
  nestjs: `${DEVICON_BASE}/nestjs/nestjs-original.svg`,
  express: `${DEVICON_BASE}/express/express-original.svg`,
  "express.js": `${DEVICON_BASE}/express/express-original.svg`,
  react: `${DEVICON_BASE}/react/react-original.svg`,
  "react.js": `${DEVICON_BASE}/react/react-original.svg`,
  "tailwind css": `${DEVICON_BASE}/tailwindcss/tailwindcss-original.svg`,
  tailwind: `${DEVICON_BASE}/tailwindcss/tailwindcss-original.svg`,

  // Bases de Dados
  postgresql: `${DEVICON_BASE}/postgresql/postgresql-original.svg`,
  postgres: `${DEVICON_BASE}/postgresql/postgresql-original.svg`,
  mysql: `${DEVICON_BASE}/mysql/mysql-original.svg`,
  mariadb: `${DEVICON_BASE}/mariadb/mariadb-original.svg`,
  mongodb: `${DEVICON_BASE}/mongodb/mongodb-original.svg`,
  mongo: `${DEVICON_BASE}/mongodb/mongodb-original.svg`,
  sql: `${DEVICON_BASE}/mysql/mysql-original.svg`,
  "prisma orm": `${DEVICON_BASE}/prisma/prisma-original.svg`,
  prisma: `${DEVICON_BASE}/prisma/prisma-original.svg`,

  // DevOps & Ferramentas
  docker: `${DEVICON_BASE}/docker/docker-original.svg`,
  "docker compose": `${DEVICON_BASE}/docker/docker-original.svg`,
  linux: `${DEVICON_BASE}/linux/linux-original.svg`,
  "sistemas unix": `${DEVICON_BASE}/linux/linux-original.svg`,
  "unix / posix": `${DEVICON_BASE}/linux/linux-original.svg`,
  git: `${DEVICON_BASE}/git/git-original.svg`,
  github: `${DEVICON_BASE}/git/git-original.svg`,
  "git e github": `${DEVICON_BASE}/git/git-original.svg`,
  "git & github": `${DEVICON_BASE}/git/git-original.svg`,
  nginx: `${DEVICON_BASE}/nginx/nginx-original.svg`,
  wordpress: `${DEVICON_BASE}/wordpress/wordpress-plain.svg`
};

export function getTechIconUrl(name: string): string | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase().trim();

  // Correspondência exata
  if (TECH_ICONS[normalized]) {
    return TECH_ICONS[normalized];
  }

  // Correspondência parcial orientada
  for (const [key, url] of Object.entries(TECH_ICONS)) {
    if (
      normalized === key ||
      normalized.startsWith(`${key} `) ||
      normalized.endsWith(` ${key}`) ||
      normalized.includes(` ${key} `)
    ) {
      return url;
    }
  }

  return undefined;
}

export function getTechSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
}
