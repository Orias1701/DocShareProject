import React from "react";
import CategoryItem from "../../../components/user_manager/list/CategoryItem";
import CategoryInfoPanel from "../../../components/user_manager/panels/CategoryInfoPanel";
import AddCategoryModal from "../../../components/user_manager/modals/AddCategoryModal";
import ConfirmModal from "../../common/ConfirmModal";
import ModalEditCategory from "../modals/ModalEditCategories";
import categoryServices from "../../../services/categoryServices";

// Chuẩn hoá item từ API -> UI
const mapApiCategory = (c) => ({
  id: c.category_id,
  name: c.category_name,
});

export default function CategoriesTab() {
  // ====== STATE ======
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  // Modal
  const [openAdd, setOpenAdd] = React.useState(false);
  const [confirm, setConfirm] = React.useState({ open: false, target: null });
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState(null);

  // ====== PHÂN TRANG ======
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  // ====== FETCH LIST ======
  async function fetchCategories() {
    try {
      setLoading(true);
      setError(null);

      const arr = await categoryServices.list();
      // Hỗ trợ nhiều định dạng trả về: {categories: [...]}, {data: [...]}, hoặc [...]:
      const raw = Array.isArray(arr?.categories)
        ? arr.categories
        : Array.isArray(arr?.data)
        ? arr.data
        : Array.isArray(arr)
        ? arr
        : [];

      const mapped = raw.map(mapApiCategory);
      setData(mapped);
      setFetched(true);
      setSelectedId((prev) => prev ?? mapped[0]?.id ?? null);
    } catch (e) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  // Lần đầu vào tab -> lấy danh sách
  React.useEffect(() => {
    if (!fetched && !loading) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi đổi trang: nếu selectedId không còn thuộc trang hiện tại thì chọn item đầu trang
  React.useEffect(() => {
    if (pageData.length && !pageData.some((c) => c.id === selectedId)) {
      setSelectedId(pageData[0].id);
    }
  }, [pageData, selectedId]);

  // ID đang hiển thị cho panel
  const currentCategoryId = selectedId ?? (pageData[0]?.id ?? null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ====== LIST ====== */}
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
              <i className="fa-solid fa-rotate" />
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

        {/* BỌC CategoryItem TRONG DIV CLICKABLE để chắc chắn bắt click */}
        <div className="space-y-3">
          {pageData.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(c.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(c.id)}
              className={`rounded-xl transition ring-0 cursor-pointer ${
                c.id === selectedId ? "ring-1 ring-white/40 bg-white/5" : "hover:bg-white/5"
              }`}
            >
              <CategoryItem
                cat={c}
                active={c.id === selectedId}
                // Lưu ý: không phụ thuộc CategoryItem.onClick để tránh bị nuốt event
              />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div>
              Page <strong>{page}</strong> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ====== PANEL (dùng countPost) ====== */}
      <aside>
        {currentCategoryId ? (
          // key giúp re-mount khi đổi danh mục -> fetch sạch
          <CategoryInfoPanel categoryId={currentCategoryId} />
        ) : (
          <div className="panel panel-muted">Nothing to show here.</div>
        )}
      </aside>

      {/* ====== MODALS ====== */}
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
