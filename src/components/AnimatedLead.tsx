import React, { useState, useEffect } from "react";

interface AnimatedLeadProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function AnimatedLead({
  phrases,
  typingSpeed = 30,
  deletingSpeed = 15,
  pauseDuration = 3200
}: AnimatedLeadProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(() => phrases[0] || "");
  const [isDeleting, setIsDeleting] = useState(false);

  // Sincroniza imediatamente quando a lista de frases muda (ex: alternância PT / EN)
  useEffect(() => {
    setIsDeleting(false);
    setDisplayText(phrases[phraseIndex % phrases.length] || "");
  }, [phrases]);

  useEffect(() => {
    // Respeito à preferência de acessibilidade por redução de movimento
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayText(phrases[phraseIndex % phrases.length] || "");
      return;
    }

    const currentPhrase = phrases[phraseIndex % phrases.length];
    if (!currentPhrase) return;

    let timer: number;

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        // Digitando caractere a caractere
        timer = window.setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Frase completa — pausa para leitura confortável
        timer = window.setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (displayText.length > 0) {
        // Apagando rapidamente para a próxima transição
        timer = window.setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        // Pausa breve no estado vazio antes de iniciar a próxima frase
        timer = window.setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 280);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className="hero-lead-wrapper" role="region" aria-label="Apresentação dinâmica">
      <p className="hero-lead" aria-live="polite">
        <span className="hero-lead-quote">&ldquo;</span>
        <span className="hero-lead-text">{displayText}</span>
        <span className="hero-lead-cursor" aria-hidden="true" />
        <span className="hero-lead-quote">&rdquo;</span>
      </p>
    </div>
  );
}
