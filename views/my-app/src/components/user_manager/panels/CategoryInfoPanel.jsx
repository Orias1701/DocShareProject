// src/components/user_manager/panels/CategoryInfoPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import categoryServices from "../../../services/categoryServices";

export default function CategoryInfoPanel({ categoryId }) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);

  // giữ giá trị trước đó để hiển thị trong lúc loading => tránh giật name
  const prevCategoryRef = useRef(null);
  const [displayName, setDisplayName] = useState(""); // tên đang hiển thị (ổn định)

  useEffect(() => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    // không xoá tên cũ khi bắt đầu load -> tránh giật
    // prevCategoryRef.current giữ record trước đó
    const fetchIt = async () => {
      try {
        const res = await categoryServices.countPost(categoryId);
        const item =
          Array.isArray(res?.categories) && res.categories.length > 0
            ? res.categories[0]
            : null;

        if (!item) {
          throw new Error("Không tìm thấy danh mục");
        }

        const next = {
          id: item.category_id,
          name: item.category_name,
          postCount: item.post_count ?? 0,
        };

        // cập nhật dữ liệu mới
        setCategory(next);
        prevCategoryRef.current = next;

        // đổi tên hiển thị sau khi đã có data -> giảm giật
        setDisplayName(next.name);
      } catch (e) {
        console.error("CategoryInfoPanel error:", e);
        setError("Không thể tải dữ liệu danh mục.");
        // nếu lỗi, giữ nguyên displayName (tên cũ) để không giật
      } finally {
        setLoading(false);
      }
    };

    fetchIt();
  }, [categoryId]);

  // nếu chưa từng có dữ liệu, cho tên hiển thị rỗng lần đầu
  useEffect(() => {
    if (!prevCategoryRef.current && category) {
      setDisplayName(category.name || "");
    }
  }, [category]);

  return (
    <div
      className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white transition-opacity duration-300"
      style={{ opacity: loading ? 0.92 : 1 }}
    >
      {/* Header: cố định chiều cao để tránh reflow ở tên */}
      <div className="mb-3 flex items-center gap-2">
        <h3
          className="text-lg font-semibold h-7 leading-7 whitespace-nowrap overflow-hidden text-ellipsis"
          // fade nhẹ khi tên đổi (chỉ 150ms, không gây nháy)
          style={{ transition: "opacity 150ms ease-in-out" }}
        >
          {displayName || "Category Details"}
        </h3>

        {/* spinner nhỏ, không thay thế text => không giật */}
        {loading && (
          <span
            className="inline-block h-3 w-3 border border-white/40 border-t-transparent rounded-full animate-spin"
            aria-label="loading"
            title="Loading"
          />
        )}
      </div>

      {/* mô tả (giữ ổn định, không thay đổi trong lúc load) */}
      {!error && (
        <p className="text-sm text-white/70 mb-4">
          Thông tin chi tiết về danh mục và tổng số bài viết.
        </p>
      )}

      {/* lỗi */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* phần data: giữ layout ổn định bằng min-h */}
      <div className="text-sm text-white/90 min-h-[20px]">
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
