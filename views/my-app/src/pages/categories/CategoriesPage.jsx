import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryInfoCard from "../../components/category/CategoryInfoCard";
import categoryServices from "../../services/categoryServices";

/**
 * Trang hiển thị danh sách tất cả Category.
 */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API lấy danh sách Category
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const data = await categoryServices.list();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Không thể tải danh mục.");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Giao diện trạng thái
  if (loading)
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải danh mục...
      </div>
    );

  if (error)
    return (
      <div
        className="
          p-4 rounded-lg border
          bg-[rgba(255,0,0,0.1)]
          border-[var(--color-border-strong)]
          text-[var(--color-text)]
        "
      >
        <strong className="text-red-400">Lỗi:</strong> {error}
      </div>
    );

  // Hiển thị danh sách
  return (
    <div className="p-4 text-[var(--color-text)]">
      <h2 className="text-2xl font-bold mb-6">All Categories</h2>

      {categories.length === 0 ? (
        <div className="text-[var(--color-text-muted)]">
          Không có danh mục nào.
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.category_id} to={`/categories/${cat.category_id}`}>
              <CategoryInfoCard
                icon="fa-solid fa-folder"
                title={cat.category_name}
                subtitle={`ID: ${cat.category_id}`}
                description="Short category description..."
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
