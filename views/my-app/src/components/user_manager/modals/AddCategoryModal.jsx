import React, { useState, useEffect } from "react";

export default function AddCategoryModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  useEffect(()=>{ if(!open) setName(""); },[open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#151922] border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Add category</h3>
        <label className="block text-sm text-white/80 mb-1">Category name</label>
        <input className="w-full mb-4 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
               value={name} onChange={(e)=>setName(e.target.value)} />
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-1.5 rounded-md border border-white/10 text-white/80" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1.5 rounded-md bg-white text-black disabled:opacity-40"
                  disabled={!name.trim()}
                  onClick={()=>onSave({name})}>Add</button>
        </div>
      </div>
    </div>
  );
}
