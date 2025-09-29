import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// click outside
const useClickOutside = (handler) => {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [handler]);
  return ref;
};

const TABS = ["Post", "Album", "Category", "Hashtag"];

export default function SearchBarPanel({ open, onClose, query, onSubmit, loading=false, results={posts:[],albums:[],categories:[],hashtags:[]} }) {
  const [tab, setTab] = useState("Album");
  const ref = useClickOutside(onClose);

  const counts = {
    Post: results.posts?.length || 0,
    Album: results.albums?.length || 0,
    Category: results.categories?.length || 0,
    Hashtag: results.hashtags?.length || 0,
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="search-panel">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mx-auto max-w-[1200px] rounded-xl border border-[#3a4654] bg-[#1b2129] text-gray-200 shadow-xl p-4"
          >
            <div className="text-sm text-gray-400 mb-3">
              Result for:&nbsp;
              <span className="text-gray-200 font-medium">{query ? `"${query}"` : "Searching result"}</span>
              {loading && <span className="ml-3 text-blue-400">…loading</span>}
            </div>

            <div className="flex items-center gap-2 mb-2">
              {["Post", "Album", "Category", "Hashtag"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg border text-sm flex items-center gap-2 ${
                    tab === t ? "bg-white/10 border-white/20" : "bg-[#2b333d] border-transparent hover:bg-[#3a4654]"
                  }`}
                >
                  {t} <span className="text-xs opacity-80">({counts[t]})</span>
                </button>
              ))}
            </div>

            {/* chỉ hiển gợi ý/summary, không có nút search ở đây */}
            <div className="text-xs text-gray-300">
              {Object.values(counts).reduce((a,b)=>a+b,0) > 0
                ? "Gợi ý đã sẵn sàng, bấm Enter hoặc nút kính lúp trên thanh header để tìm."
                : "Nhập từ khoá ở thanh header để tìm."}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
