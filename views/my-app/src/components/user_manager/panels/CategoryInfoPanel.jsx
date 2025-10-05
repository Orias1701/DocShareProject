import React from "react";

export default function CategoryInfoPanel({ category }) {
  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33]">
      <h3 className="text-lg font-semibold mb-2 text-white">{category?.name || "Category Details"}</h3>
      <p className="text-white/70 text-sm mb-3">Manage content under this category.</p>
      <p className="text-sm text-gray-300">
        <i className="fa-solid fa-layer-group text-sky-400 mr-2"></i>
        Posts under this category: <b>{category?.posts || 0}</b>
      </p>
    </div>
  );
}
