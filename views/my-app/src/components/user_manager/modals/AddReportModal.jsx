import React, { useState, useEffect } from "react";

export default function AddReportModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "", status: "open" });
  useEffect(()=>{ if(!open) setForm({ title: "", description: "", status: "open"}); },[open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#151922] border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Add report</h3>
        <label className="block text-sm text-white/80 mb-1">Title</label>
        <input className="w-full mb-3 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
               value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} />
        <label className="block text-sm text-white/80 mb-1">Description</label>
        <textarea className="w-full mb-3 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white min-h-[96px]"
                  value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} />
        <label className="block text-sm text-white/80 mb-1">Status</label>
        <select className="w-full mb-4 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
                value={form.status} onChange={(e)=>setForm(f=>({...f,status:e.target.value}))}>
          <option value="open">open</option>
          <option value="in-review">in-review</option>
          <option value="closed">closed</option>
        </select>
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-1.5 rounded-md border border-white/10 text-white/80" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1.5 rounded-md bg-white text-black disabled:opacity-40"
                  disabled={!form.title.trim()}
                  onClick={()=>onSave(form)}>Add</button>
        </div>
      </div>
    </div>
  );
}
