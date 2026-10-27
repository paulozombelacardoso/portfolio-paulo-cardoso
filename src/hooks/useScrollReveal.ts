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
      cards.forEach((card) => {
        card.classList.add("is-visible", "reveal-complete");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;

          // Revela se entrou no viewport ou se já está acima dele (scroll rápido / já visto)
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            target.classList.add("is-visible");
            observer.unobserve(target);

            // Marca a revelação como concluída para que interações de hover não sofram delay
            const timer = setTimeout(() => {
              target.classList.add("reveal-complete");
            }, 850);

            const handleEnd = (e: TransitionEvent) => {
              if (
                e.target === target &&
                (e.propertyName === "transform" || e.propertyName === "opacity")
              ) {
                target.classList.add("reveal-complete");
                clearTimeout(timer);
                target.removeEventListener("transitionend", handleEnd);
              }
            };
            target.addEventListener("transitionend", handleEnd);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    cards.forEach((card) => {
      // Se já estava visível, garante que tem o estado de revelação concluída
      if (card.classList.contains("is-visible")) {
        card.classList.add("reveal-complete");
      } else {
        observer.observe(card);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}
