import React from "react";
import { Code2, Server, Database, Terminal, Sparkles } from "lucide-react";
import { StackCategory } from "../data";

interface SkillGroupCardProps {
  category: StackCategory;
}

export function SkillGroupCard({ category }: SkillGroupCardProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case "Code2":
        return <Code2 size={18} />;
      case "Server":
        return <Server size={18} />;
      case "Database":
        return <Database size={18} />;
      case "Terminal":
        return <Terminal size={18} />;
      case "Sparkles":
        return <Sparkles size={18} />;
      default:
        return <Terminal size={18} />;
    }
  };

  return (
    <div className="stack-card">
      <div className="stack-head">
        <div className="stack-icon-wrap">{getIcon(category.iconName)}</div>
        <div>
          <h3 className="stack-category-name">{category.name}</h3>
          <p className="stack-category-desc">{category.description}</p>
        </div>
      </div>

      <div className="stack-items">
        {category.items.map((item) => (
          <span key={item} className="stack-item-pill">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
