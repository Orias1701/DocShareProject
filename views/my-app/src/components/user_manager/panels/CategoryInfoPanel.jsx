import React, { useEffect, useState, useMemo } from "react";
import categoryServices from "../../../services/categoryServices";

/**
 * CategoryInfoPanel
 * - Nhận categoryId, fetch countPost mỗi khi đổi id.
 * - Giữ lại giao diện cũ khi loading => tránh "giật".
 */
export default function CategoryInfoPanel({ categoryId }) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);

  // Mỗi khi categoryId đổi => fetch mới
  useEffect(() => {
    if (!categoryId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await categoryServices.countPost(categoryId);
        const item =
          Array.isArray(res?.categories) && res.categories.length > 0
            ? res.categories[0]
            : null;
        if (!item) throw new Error("Không tìm thấy danh mục");

        if (!mounted) return;
        setCategory({
          id: item.category_id,
          name: item.category_name,
          postCount: Number(item.post_count ?? 0),
        });
      } catch {
        if (!mounted) return;
        setError("Không thể tải dữ liệu danh mục.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  const wrapperStyle = {
    background: "var(--color-card-bg)",
    borderColor: "var(--color-card-border)",
    color: "var(--color-text)",
    transition: "opacity 0.25s ease",
    opacity: loading ? 0.8 : 1,
  };

  // Khi lỗi hoặc chưa chọn
  if (error || !category) {
    return (
      <div className="p-6 rounded-xl border" style={wrapperStyle}>
        <p style={{ color: "var(--color-text-secondary)" }}>
          {error || "Không có dữ liệu danh mục."}
        </p>
      </div>
    );
  }

  // Hiển thị mượt mà như PostInfoPanel
  return (
    <div className="p-6 rounded-xl border text-left" style={wrapperStyle}>
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-lg border flex items-center justify-center"
          style={{
            borderColor: "var(--color-border-soft)",
            background: "var(--color-muted-bg)",
            color: "var(--color-text-secondary)",
          }}
        >
          <i className="fa-solid fa-layer-group" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold leading-snug">
            {category.name}
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            #{category.id}
          </div>
        </div>
      </div>

      <div
        className="mt-4 h-px"
        style={{ background: "var(--color-border-soft)" }}
      />

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Overview</h4>
        <dl className="text-sm grid grid-cols-[120px_1fr] gap-y-2 items-start">
          <dt className="text-[color:var(--color-text-muted)]">Tên danh mục:</dt>
          <dd style={{ color: "var(--color-text)" }}>{category.name}</dd>

          <dt className="text-[color:var(--color-text-muted)]">Số bài viết:</dt>
          <dd style={{ color: "var(--color-text)" }}>
            <b>{category.postCount}</b> bài viết
          </dd>
        </dl>
      </div>

      {loading && (
        <div className="absolute top-4 right-4">
          <span className="inline-block h-3 w-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
