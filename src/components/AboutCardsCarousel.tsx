import React from "react";

export interface AboutCardItem {
  num: string;
  title: string;
  desc: string;
}

interface AboutCardsCarouselProps {
  cards: AboutCardItem[];
}

function Card({ card }: { card: AboutCardItem }) {
  return (
    <div className="meta-card">
      <span className="meta-number">{card.num}</span>
      <h4>{card.title}</h4>
      <p>{card.desc}</p>
    </div>
  );
}

/**
 * Ecrãs largos: cartões fixos lado a lado (alinhados com as restantes secções).
 * Ecrãs estreitos (< 900px): carrossel contínuo. A troca é feita em CSS.
 */
export function AboutCardsCarousel({ cards }: AboutCardsCarouselProps) {
  // Cópias suficientes para o carrossel fluir sem espaços vazios.
  const renderCardSet = (keyPrefix: string) =>
    [0, 1, 2].flatMap((set) => cards.map((card, idx) => <Card key={`${keyPrefix}-${set}-${idx}`} card={card} />));

  return (
    <>
      <div
        className="about-cards"
        role="list"
        aria-label="Áreas de especialização"
        style={{ "--about-cols": Math.min(cards.length, 3) } as React.CSSProperties}
      >
        {cards.map((card, idx) => (
          <div role="listitem" key={idx} style={{ display: "contents" }}>
            <Card card={card} />
          </div>
        ))}
      </div>

      <div className="about-carousel-wrapper is-narrow-only" role="region" aria-label="Áreas de especialização">
        <div className="about-carousel-container">
          <div className="about-carousel-track">
            <div className="about-carousel-group">{renderCardSet("main")}</div>
            {/* Grupo duplicado para loop contínuo sem saltos */}
            <div className="about-carousel-group" aria-hidden="true">
              {renderCardSet("dup")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
