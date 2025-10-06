// src/pages/user_manager/tabs/CategoriesTab.jsx
import React from "react";

import CategoryItem from "../../../components/user_manager/list/CategoryItem";
import CategoryInfoPanel from "../../../components/user_manager/panels/CategoryInfoPanel";
import AddCategoryModal from "../../../components/user_manager/modals/AddCategoryModal";
import ConfirmModal from "../../../components/user_manager/modals/ConfirmModal";

import categoryServices from "../../../services/categoryServices";

const mapApiCategory = (c) => ({
  id: c.category_id,
  name: c.category_name,
  posts: 0,
});

export default function CategoriesTab() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState();
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [openAdd, setOpenAdd] = React.useState(false);
  const [confirm, setConfirm] = React.useState({ open: false, target: null });

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const currentCategory =
    pageData.find((c) => c.id === selectedId) ?? pageData[0] ?? null;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const arr = await categoryServices.list();
      if (Array.isArray(arr)) {
        const mapped = arr.map(mapApiCategory);
        setData(mapped);
        setFetched(true);
        setSelectedId(mapped[0]?.id);
      } else {
        throw new Error("Invalid category list response");
      }
    } catch (e) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchCategories();
  }, []);

  React.useEffect(() => setPage(1), [fetched]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Category List</h2>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/20 text-white/90 hover:text-white"
              onClick={fetchCategories}
              disabled={loading}
              title="Refresh categories"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-white text-black"
              onClick={() => setOpenAdd(true)}
            >
              <i className="fa-regular fa-square-plus mr-1" /> Add
            </button>
          </div>
        </div>

        {loading && !fetched && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        )}

        {error && data.length === 0 && (
          <div className="text-red-300 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            Failed to load categories: {error}
            <div className="mt-3">
              <button onClick={fetchCategories} className="px-3 py-1.5 rounded-md bg-white text-black">
                Retry
              </button>
            </div>
          </div>
        )}

        {fetched && data.length === 0 && (
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-xl p-4">
            No categories found.
          </div>
        )}

        <div className="space-y-3">
          {pageData.map((c) => (
            <CategoryItem
              key={c.id}
              cat={c}
              onEdit={() => alert("Edit category")}
              onDelete={() => setConfirm({ open: true, target: c })}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="text-sm text-white/80">
              Page <span className="font-semibold">{page}</span> / {totalPages}
            </div>
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <aside>
        {currentCategory ? (
          <CategoryInfoPanel category={currentCategory} />
        ) : (
          <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
            Nothing to show here.
          </div>
        )}
      </aside>

      <AddCategoryModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={async ({ name }) => {
          try {
            await categoryServices.create({ category_name: name });
            await fetchCategories();
          } catch (e) {
            console.error(e);
            setData((prev) => [{ id: `LOCAL_${Date.now()}`, name, posts: 0 }, ...prev]);
          } finally {
            setOpenAdd(false);
          }
        }}
      />

      <ConfirmModal
        open={confirm.open}
        message={`Are you sure you want to delete ${confirm.target?.name || "this category"}?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          try {
            await categoryServices.delete(confirm.target?.id);
            await fetchCategories();
          } catch (e) {
            console.error(e);
          } finally {
            setConfirm({ open: false, target: null });
          }
        }}
      />
    </div>
  );
}
