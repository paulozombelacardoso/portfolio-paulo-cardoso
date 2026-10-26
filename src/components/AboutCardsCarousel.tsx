import React from "react";

export interface AboutCardItem {
  num: string;
  title: string;
  desc: string;
}

interface AboutCardsCarouselProps {
  cards: AboutCardItem[];
}

export function AboutCardsCarousel({ cards }: AboutCardsCarouselProps) {
  // Renderiza cópias suficientes para garantir fluxo contínuo sem espaços vazios
  const renderCardSet = (keyPrefix: string) => (
    <>
      {cards.map((card, idx) => (
        <div key={`${keyPrefix}-set1-${idx}`} className="meta-card">
          <span className="meta-number">{card.num}</span>
          <h4>{card.title}</h4>
          <p>{card.desc}</p>
        </div>
      ))}
      {cards.map((card, idx) => (
        <div key={`${keyPrefix}-set2-${idx}`} className="meta-card">
          <span className="meta-number">{card.num}</span>
          <h4>{card.title}</h4>
          <p>{card.desc}</p>
        </div>
      ))}
      {cards.map((card, idx) => (
        <div key={`${keyPrefix}-set3-${idx}`} className="meta-card">
          <span className="meta-number">{card.num}</span>
          <h4>{card.title}</h4>
          <p>{card.desc}</p>
        </div>
      ))}
    </>
  );

  return (
    <div
      className="about-carousel-wrapper"
      role="region"
      aria-label="Áreas de especialização"
    >
      <div className="about-carousel-container">
        <div className="about-carousel-track">
          {/* Grupo principal acessível */}
          <div className="about-carousel-group">
            {renderCardSet("main")}
          </div>

          {/* Grupo duplicado para loop contínuo infinito e sem saltos */}
          <div className="about-carousel-group" aria-hidden="true">
            {renderCardSet("dup")}
          </div>
        </div>
      </div>
    </div>
  );
}
