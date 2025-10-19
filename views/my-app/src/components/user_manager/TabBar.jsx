import React from "react";

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className={[
      "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
      active
        ? "bg-[var(--color-btn-bg)] text-[var(--color-btn-text)] border-[var(--color-btn-bg)]"
        : "text-[var(--color-text-secondary)] border-[var(--color-border-soft)] hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-border-strong)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[var(--color-focus-ring)]",
    ].join(" ")}
  >
    {children}
  </button>
);

export default function TabBar({ tabs = [], active, onChange }) {
  return (
    <div
      className={[
        "flex items-center gap-2 w-fit mb-4 p-1 rounded-full border",
        "bg-[var(--color-surface-alt)] border-[var(--color-border-soft)]",
      ].join(" ")}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const label = tab.charAt(0).toUpperCase() + tab.slice(1);
        const isActive = active === tab;
        return (
          <TabButton
            key={tab}
            active={isActive}
            onClick={() => onChange?.(tab)}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </TabButton>
        );
      })}
    </div>
  );
}
