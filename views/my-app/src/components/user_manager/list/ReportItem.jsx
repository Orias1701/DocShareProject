import React from "react";

export default function ReportItem({ report, onEdit, onDelete }) {
  return (
    <div className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 border bg-[#1C2028] border-[#2d2d33]">
      <div className="min-w-0">
        <div className="text-white font-semibold truncate">{report.title}</div>
        <div className="text-xs text-white/60 mt-0.5">
          {new Date(report.createdAt).toLocaleString()} • {report.status}
        </div>
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
