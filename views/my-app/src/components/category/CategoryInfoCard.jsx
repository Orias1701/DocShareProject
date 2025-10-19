import React from "react";

/**
 * Thẻ hiển thị thông tin tóm tắt 1 Category.
 */
export default function CategoryInfoCard({ icon, title, subtitle, description }) {
  return (
    <div
      className="
        bg-[var(--color-card-bg)]
        border border-[var(--color-card-border)]
        rounded-xl p-6 text-center
        hover:border-[var(--color-border-soft)]
        hover:bg-[var(--color-card-hover)]
        transition-colors
      "
    >
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div
          className="
            w-16 h-16 rounded-full flex items-center justify-center
            bg-[var(--color-muted-bg)]
          "
        >
          <i className={`${icon} text-3xl text-[var(--color-icon-default)]`} />
        </div>
      </div>

      {/* Text */}
      <h3 className="font-bold text-lg text-[var(--color-text)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-3 h-10">{subtitle}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
