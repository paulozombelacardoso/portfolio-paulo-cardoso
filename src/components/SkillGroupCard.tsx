import React from "react";
import { SkillGroup } from "../data";

interface SkillGroupCardProps {
  group: SkillGroup;
}

export function SkillGroupCard({ group }: SkillGroupCardProps) {
  return (
    <div className="card skill-card">
      <div className="skill-card-head">
        <h3>{group.group}</h3>
        <p className="skill-group-desc">{group.description}</p>
      </div>

      <div className="tags skill-tags" aria-label={`Tecnologias de ${group.group}`}>
        {group.items.map((item) => (
          <span
            key={item.name}
            className={`tag-i ${item.featured ? "featured" : ""}`}
            title={item.featured ? `${item.name} (Utilizado em projectos reais)` : item.name}
          >
            {item.featured && <span className="featured-dot" aria-hidden="true" />}
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
