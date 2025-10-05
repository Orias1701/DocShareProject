import React from "react";

export default function ConfirmModal({ open, message, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#151922] border border-white/10 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold mb-3 text-white">Confirm delete</h3>
        <p className="text-white/80 mb-5">{message}</p>
        <div className="flex justify-center gap-3">
          <button className="px-3 py-1.5 rounded-md border border-white/20 text-white/80 hover:text-white" onClick={onClose}>
            Cancel
          </button>
          <button className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
