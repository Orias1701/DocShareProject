import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryInfoCard from "../../components/category/CategoryInfoCard";
import categoryServices from "../../services/categoryServices";

function CategoriesPage() {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await categoryServices.list();
        setAllCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Không tải được categories");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const iconClass = "fa-solid fa-folder";

  if (loading) return <div className="text-white p-4">Đang tải categories...</div>;
  if (err) {
    return (
      <div className="text-white p-4">
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4">
          <div className="font-semibold">Lỗi tải Categories</div>
          <div className="text-red-200 mt-1">{err}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      <section>
        <h2 className="text-2xl font-bold mb-6">All categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allCategories.map((cat) => (
            <Link key={cat.category_id} to={`/categories/${cat.category_id}`}>
              <CategoryInfoCard
                icon={iconClass}
                title={cat.category_name}
                subtitle={`ID: ${cat.category_id}`}
                description="Short category description..."
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CategoriesPage;
