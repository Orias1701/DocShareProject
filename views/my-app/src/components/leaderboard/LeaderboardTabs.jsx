import React from "react";

/**
 * Tabs chọn tiêu chí hiển thị leaderboard.
 * - Dùng biến CSS cho màu nền/chữ/viền.
 */
export default function LeaderboardTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
            className={[
              "px-4 py-2 rounded-lg font-semibold text-sm transition-colors",
              isActive
                ? "bg-[var(--color-btn-bg)] text-[var(--color-btn-text)] hover:bg-[var(--color-btn-hover-bg)]"
                : "bg-[var(--color-muted-bg)] text-[var(--color-text)] border border-[var(--color-border-soft)] hover:bg-[var(--color-card-hover)]",
            ].join(" ")}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
