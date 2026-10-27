# Personal Portfolio

A minimalist personal portfolio built to showcase my projects, technical skills, professional experience, education, and certifications in software development.

The portfolio focuses on simplicity, usability, and a clean visual experience, making it easy to explore my work and access my professional profiles and CV.

## Features

- **Minimalist design** — clean layout with a focus on content.
- **Dark and light modes** — switch between black and white visual themes.
- **Responsive layout** — adapted for desktop, tablet, and mobile devices.
- **Projects showcase** — explore projects, technologies, descriptions, and relevant images or videos.
- **Professional experience** — highlights of work experience and practical activities.
- **Certifications** — a dedicated section for certificates and professional development.
- **CV download** — direct access to my résumé.
- **Interactive details** — project and experience details displayed through modals.
- **Social and coding profiles** — quick access to GitHub, LinkedIn, LeetCode, and Codeforces.
- **Subtle animations** — smooth transitions and interactions.

## Tech Stack

- **React** — component-based user interface.
- **TypeScript** — static typing and maintainable code.
- **Vite** — development server and build tooling.
- **CSS** — styling, responsive layouts, themes, and animations.

## Project Structure

```text
portfolio/
├── public/
│   ├── favicon.svg
│   ├── photo.png
│   └── ...
├── src/
│   ├── App.tsx
│   ├── data.ts
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

- `public/` — static assets, profile images, project media, certificates, and downloadable files.
- `src/App.tsx` — main application interface and components.
- `src/data.ts` — portfolio content, including projects, experience, education, and certifications.
- `src/styles.css` — layout, visual styles, responsive behavior, themes, and animations.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd portfolio
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Customization

Portfolio content and assets can be updated to reflect new projects, professional experiences, and certifications.

- Update `src/data.ts` to modify portfolio information.
- Add or replace images and other static assets in `public/`.
- Update `public/photo.png` to change the profile image.
- Place the CV in the public assets directory and configure its download link.
- Modify `src/styles.css` to customize themes, layout, and animations.

## Deployment

The project can be deployed to static hosting platforms such as Vercel, Netlify, or GitHub Pages, depending on the repository configuration.

Build the project using `npm run build` and deploy the generated `dist/` directory.

## License

This project is intended to serve as my personal portfolio. Please contact me before reusing its personal content, images, or branding.

---

**Developed by Paulo Cardoso**

[GitHub](https://github.com/paulozombelacardoso) · [LinkedIn](https://www.linkedin.com/in/paulo-cardoso-99772835b/)