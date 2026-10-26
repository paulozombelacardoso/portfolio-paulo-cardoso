import React from "react";

export function LeetCodeIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8l-6 6" />
      <path d="M9 7.5L5 11.5a2.5 2.5 0 0 0 0 3.5l4 4a2.5 2.5 0 0 0 3.5 0l4-4" />
      <path d="M14 4h5a1 1 0 0 1 1 1v4" />
    </svg>
  );
}

export function CodeforcesIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="4.5" height="10" rx="1" />
      <rect x="9.75" y="4" width="4.5" height="17" rx="1" />
      <rect x="16.5" y="8" width="4.5" height="13" rx="1" />
    </svg>
  );
}
