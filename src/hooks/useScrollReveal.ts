import { useEffect } from "react";

/**
 * Hook para detetar elementos com a classe .reveal-card à medida que entram
 * na janela de visualização (viewport) e activar a animação suave de subida.
 */
export function useScrollReveal(dependencies: unknown[] = []) {
  useEffect(() => {
    // Se o utilizador configurou redução de movimento, revela tudo de imediato
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = document.querySelectorAll<HTMLElement>(".reveal-card");

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    cards.forEach((card) => {
      // Se já estava visível, garante o estado
      if (!card.classList.contains("is-visible")) {
        observer.observe(card);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}
