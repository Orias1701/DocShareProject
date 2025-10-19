import React from "react";
import CategoryItem from "../../../components/user_manager/list/CategoryItem";
import CategoryInfoPanel from "../../../components/user_manager/panels/CategoryInfoPanel";
import AddCategoryModal from "../../../components/user_manager/modals/AddCategoryModal";
import ConfirmModal from "../../common/ConfirmModal";
import ModalEditCategory from "../modals/ModalEditCategories";
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

  const [selectedId, setSelectedId] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [openAdd, setOpenAdd] = React.useState(false);
  const [confirm, setConfirm] = React.useState({ open: false, target: null });
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState(null);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const arr = await categoryServices.list();
      const mapped = (Array.isArray(arr) ? arr : []).map(mapApiCategory);
      setData(mapped);
      setFetched(true);
      setSelectedId((prev) => prev ?? mapped[0]?.id ?? null);
    } catch (e) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchCategories();
  }, []);

  const currentCategory =
    data.find((c) => c.id === selectedId) ?? pageData[0] ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Category List</h2>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline"
              onClick={fetchCategories}
              disabled={loading}
              title="Refresh"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setOpenAdd(true)}
              title="Add category"
            >
              <i className="fa-regular fa-square-plus mr-1" /> Add
            </button>
          </div>
        </div>

        {loading && !fetched && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10" />
            ))}
          </div>
        )}

        {error && !data.length && (
          <div className="panel panel-muted text-red-300">
            Failed to load categories: {error}
            <button onClick={fetchCategories} className="btn btn-primary mt-3">
              Retry
            </button>
          </div>
        )}

        {fetched && !data.length && (
          <div className="panel panel-muted">No categories found.</div>
        )}

        <div className="space-y-3">
          {pageData.map((c) => (
            <CategoryItem
              key={c.id}
              cat={c}
              active={c.id === selectedId}
              onClick={() => setSelectedId(c.id)}
              onEdit={() => {
                setEditCategory(c);
                setOpenEdit(true);
              }}
              onDelete={() => setConfirm({ open: true, target: c })}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <div>Page <strong>{page}</strong> / {totalPages}</div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        )}
      </div>

      <aside>
        {currentCategory ? (
          <CategoryInfoPanel categoryId={selectedId} />
        ) : (
          <div className="panel panel-muted">Nothing to show here.</div>
        )}
      </aside>

      <AddCategoryModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={async ({ name }) => {
          try {
            await categoryServices.create({ category_name: name });
            await fetchCategories();
          } finally {
            setOpenAdd(false);
          }
        }}
      />

      <ModalEditCategory
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        category={editCategory}
        onSave={async ({ category_id, category_name }) => {
          const res = await categoryServices.update({ category_id, category_name });
          await fetchCategories();
          return res || { status: "ok" };
        }}
      />

      <ConfirmModal
        open={confirm.open}
        message={`Delete ${confirm.target?.name || "this category"}?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          await categoryServices.delete(confirm.target?.id);
          await fetchCategories();
          setConfirm({ open: false, target: null });
        }}
      />
    </div>
  );
}
