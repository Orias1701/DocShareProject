import React, { useEffect, useRef, useState } from "react";

export default function ModalEditCategory({ open, onClose, category, onSave }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const inputRef = useRef(null);

  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  useEffect(() => {
    if (!open) {
      setName("");
      setSaving(false);
      setBanner(null);
      return;
    }
    setName(category?.name || category?.category_name || "");
    setTimeout(() => inputRef.current?.focus?.(), 0);
  }, [open, category]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSave = async () => {
    if (!name.trim()) {
      showBanner("error", "Tên không được để trống");
      return;
    }
    if (!onSave) {
      onClose?.();
      return;
    }
    try {
      setSaving(true);
      const res = await onSave({
        category_id: category?.id || category?.category_id,
        category_name: name.trim(),
      });

      const ok =
        res?.status === "ok" ||
        res?.status === "success" ||
        res === true ||
        res == null;

      if (ok) {
        showBanner("success", res?.message || "Đã cập nhật danh mục.");
        setTimeout(() => onClose?.(), 600);
      } else {
        showBanner("error", res?.message || "Cập nhật thất bại");
      }
    } catch (e) {
      showBanner("error", e?.message || "Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-3">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "var(--color-overlay-bg)" }}
        onClick={onClose}
        aria-label="Close backdrop"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl border shadow-2xl"
        style={{
          background: "var(--color-modal-bg)",
          borderColor: "var(--color-modal-border)",
          color: "var(--color-text)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <h3 className="text-[16px] font-semibold">Edit Category</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border hover:opacity-80"
            style={{
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text-secondary)",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          {banner && (
            <div
              className="mb-3 px-3 py-2 rounded-md text-xs border"
              style={{
                background:
                  banner.type === "success"
                    ? "rgba(16,185,129,0.18)"
                    : "rgba(239,68,68,0.18)",
                color:
                  banner.type === "success"
                    ? "#D1FAE5"
                    : "#FECACA",
                borderColor:
                  banner.type === "success"
                    ? "rgba(16,185,129,0.4)"
                    : "rgba(239,68,68,0.4)",
              }}
            >
              {banner.text}
            </div>
          )}

          <label
            className="block text-xs mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Category name
          </label>
          <input
            ref={inputRef}
            className="h-[42px] w-full px-3 rounded-md border outline-none text-sm"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text)",
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên danh mục"
            maxLength={100}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim() && !saving) {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <button
            className="h-[38px] px-4 rounded-md hover:opacity-80"
            style={{
              background: "var(--color-surface-alt)",
              color: "var(--color-text)",
            }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="h-[38px] px-4 rounded-md disabled:opacity-50"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
