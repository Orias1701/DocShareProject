import React from "react";

export default function CategoryItem({ cat, onEdit, onDelete }) {
  return (
    <div className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 border bg-[#1C2028] border-[#2d2d33]">
      <div className="flex items-center gap-3 min-w-0 text-left flex-1">
        <i className="fa-solid fa-folder text-white/70" />
        <div className="text-white font-semibold truncate">{cat.name}</div>
      </div>
      <div className="flex gap-2">
        <button className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white" onClick={onEdit}>
          <i className="fa-regular fa-pen-to-square mr-1" />Edit
        </button>
        <button className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200" onClick={onDelete}>
          <i className="fa-regular fa-trash-can mr-1" />Delete
        </button>
      </div>
    </div>
  );
}
