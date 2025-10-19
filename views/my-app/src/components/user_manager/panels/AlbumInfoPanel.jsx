import React, { useEffect, useRef, useState } from "react";
import categoryServices from "../../../services/categoryServices";

export default function CategoryInfoPanel({ categoryId }) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);
  const prevCategoryRef = useRef(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await categoryServices.countPost(categoryId);
        const item =
          Array.isArray(res?.categories) && res.categories.length > 0
            ? res.categories[0]
            : null;
        if (!item) throw new Error("Không tìm thấy danh mục");

        const next = {
          id: item.category_id,
          name: item.category_name,
          postCount: item.post_count ?? 0,
        };
        setCategory(next);
        prevCategoryRef.current = next;
        setDisplayName(next.name);
      } catch {
        setError("Không thể tải dữ liệu danh mục.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  return (
    <div
      className="p-6 rounded-xl border transition-opacity duration-300"
      style={{
        background: "var(--color-surface-alt)",
        borderColor: "var(--color-border-soft)",
        color: "var(--color-text)",
        opacity: loading ? 0.9 : 1,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{displayName || "Category Details"}</h3>
        {loading && (
          <span
            className="inline-block h-3 w-3 border border-white/40 border-t-transparent rounded-full animate-spin"
            aria-label="loading"
          />
        )}
      </div>

      {!error && (
        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Thông tin chi tiết về danh mục và tổng số bài viết.
        </p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="text-sm min-h-[20px]" style={{ color: "var(--color-text)" }}>
        {loading && (
          <div className="animate-pulse">
            <div className="h-4 w-1/3 bg-white/10 rounded" />
          </div>
        )}
        {!loading && !error && (
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-layer-group" />
            <span>
              <b>{category?.postCount ?? 0}</b> bài viết trong danh mục này
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
