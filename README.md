# Portefólio — Paulo Cardoso
React + TypeScript + Vite. Temas Sistema/Claro/Escuro, projectos e certificados filtráveis, CV com visualização e download.

## Executar (com Makefile: `make dev`, `make build`, `make preview`, `make check`, `make help`)
    npm install
    npm run dev       # desenvolvimento
    npm run build     # produção (pasta dist/)

## Personalizar
- Conteúdo: `src/data.ts` (projectos, competências, certificados, formação, experiência, CVs).
- CVs: copie os PDFs para `public/cv/` com os nomes definidos em `cvs` (`Paulo_Cardoso_CV_FullStack_PT.pdf`, `CV_Paulo_Cardoso_IT.pdf`, `Paulo_Cardoso_CV.pdf`).
- Certificados: PDFs em `public/certificates/` e entradas em `certifications`.
- Fotografia (opcional): `public/photo.jpg`. Sem ela aparece o monograma "PC".
- Links GitHub/demo dos projectos: campos `github` e `demo` em `projects`.
- Favicon: `public/favicon.svg`. Metadados de partilha: `index.html`.

## Publicar
Vercel/Netlify: build `npm run build`, pasta `dist`. GitHub Pages: publique o conteúdo de `dist`.
