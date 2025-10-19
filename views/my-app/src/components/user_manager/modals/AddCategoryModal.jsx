import React, { useState, useEffect } from "react";

export default function AddCategoryModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  useEffect(() => { if (!open) setName(""); }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <button
        className="absolute inset-0"
        style={{ background: "var(--color-overlay-bg)" }}
        onClick={onClose}
        aria-label="Close"
      />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl p-4 border shadow-2xl"
        style={{
          background: "var(--color-modal-bg)",
          borderColor: "var(--color-modal-border)",
          color: "var(--color-text)"
        }}
      >
        <h3 className="text-lg font-semibold mb-3">Add category</h3>

        <label
          className="block text-sm mb-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Category name
        </label>

        <input
          className="w-full mb-4 px-3 py-2 rounded-md border outline-none"
          style={{
            background: "var(--color-input-bg)",
            borderColor: "var(--color-border-soft)",
            color: "var(--color-text)"
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2">
          <button
            className="px-3 py-1.5 rounded-md border"
            style={{
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text-secondary)",
              background: "transparent"
            }}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-3 py-1.5 rounded-md disabled:opacity-40"
            style={{
              background: "var(--color-btn-bg)",
              color: "var(--color-btn-text)"
            }}
            disabled={!name.trim()}
            onClick={() => onSave({ name })}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
