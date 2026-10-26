import React from "react";
import { Briefcase, Calendar, MapPin, ChevronRight } from "lucide-react";
import { Experience } from "../data";

interface ExperienceCardProps {
  experience: Experience;
  onSelect: (exp: Experience) => void;
}

export function ExperienceCard({ experience, onSelect }: ExperienceCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(experience);
    }
  };

  return (
    <li className="timeline-item">
      <div
        className="card interactive-card experience-card"
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        onClick={() => onSelect(experience)}
        onKeyDown={handleKeyDown}
      >
        <div className="card-top-meta">
          <span className="card-date-badge">
            <Calendar size={13} /> {experience.period}
          </span>
          <span className="card-location-badge">
            <MapPin size={13} /> {experience.location}
          </span>
        </div>

        <div className="exp-card-header">
          <div className="exp-icon-box">
            <Briefcase size={18} />
          </div>
          <div>
            <h3>{experience.role}</h3>
            <h4 className="exp-company">{experience.company}</h4>
          </div>
        </div>

        <p className="exp-summary">{experience.summary}</p>

        <div className="tags" aria-label="Competências e tecnologias">
          {experience.skills.slice(0, 5).map((s) => (
            <span key={s} className="tag-i">
              {s}
            </span>
          ))}
          {experience.skills.length > 5 && (
            <span className="tag-i muted-tag">+{experience.skills.length - 5}</span>
          )}
        </div>

        <div className="card-actions-row">
          <span className="link-action">
            Ver detalhes da experiência <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </li>
  );
}
