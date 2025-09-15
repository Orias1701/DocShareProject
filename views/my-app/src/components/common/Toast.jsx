import React, { useEffect, useRef } from "react";

const COLOR_BY_TYPE = {
  success: "bg-emerald-600 border-emerald-400",
  error: "bg-rose-600 border-rose-400",
  info: "bg-slate-700 border-slate-500",
};

export default function Toast({ open, message, onClose, type = "success" }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // auto close after 3s
    timerRef.current = setTimeout(() => {
      onClose?.();
    }, 3000);
    return () => clearTimeout(timerRef.current);
  }, [open, onClose]);

  // hidden but keep in tree for simple mounting
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div
        className={`text-white border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 min-w-[260px] ${COLOR_BY_TYPE[type]}`}
      >
        <div className="pt-0.5">
          {type === "success" && <i className="fa-solid fa-check-circle" />}
          {type === "error" && <i className="fa-solid fa-triangle-exclamation" />}
          {type === "info" && <i className="fa-solid fa-circle-info" />}
        </div>
        <div className="flex-1 text-sm leading-5">{message}</div>
        <button
          onClick={onClose}
          className="opacity-80 hover:opacity-100 transition"
          aria-label="Close toast"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}
