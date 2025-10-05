import React from "react";

export default function AlbumInfoPanel() {
  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33]">
      <h3 className="text-lg font-semibold mb-2 text-white">Album Information</h3>
      <p className="text-white/70 text-sm mb-3">
        View and manage user albums, photos, and descriptions.
      </p>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#2b303b] rounded-md h-20 flex items-center justify-center text-white/50 text-xs">
            Photo {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
