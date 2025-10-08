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
        res == null; // 👈 nếu caller không return gì nhưng không lỗi → coi là OK

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
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close backdrop" />
      <div className="relative z-10 w-full max-w-[420px] bg-[#1F2631] text-white border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-[16px] font-semibold">Edit Category</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-white/10 text-white/80 hover:text-white"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4">
          {banner && (
            <div
              className={
                "mb-3 px-3 py-2 rounded-md text-xs border " +
                (banner.type === "success"
                  ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                  : "bg-red-900/30 text-red-200 border-red-700/40")
              }
            >
              {banner.text}
            </div>
          )}

          <label className="block text-xs text-white/70 mb-1">Category name</label>
          <input
            ref={inputRef}
            className="h-[42px] w-full px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
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

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <button
            className="h-[38px] px-4 rounded-md bg-[#2b3442] text-white/90 hover:bg-[#25303e]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="h-[38px] px-4 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50"
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
