import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// click outside
const useClickOutside = (handler) => {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [handler]);
  return ref;
};


export default function SearchBarPanel({
  open,
  onClose,
  query,
  onSubmit,
  loading = false,
  results = { posts: [], albums: [], categories: [], hashtags: [] },
}) {
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
            className="mx-auto max-w-[1200px] rounded-xl 
                       border border-[color:var(--color-border-soft)] 
                       bg-[var(--color-bg)] text-[var(--color-text)] 
                       shadow-xl p-4"
          >
            {/* --- Header Text --- */}
            <div className="text-sm text-[color:var(--color-text-darker)] mb-3">
              Kết quả cho:&nbsp;
              <span className="text-[var(--color-text)] font-medium">
                {query ? `"${query}"` : "Đang tìm kiếm..."}
              </span>
              {loading && (
                <span className="ml-3 text-[color:var(--color-input-primary)]">
                  Đang tải...
                </span>
              )}
            </div>

            {/* --- Result Info --- */}
            <div className="text-xs text-[color:var(--color-text-darker)]">
              {Object.values(counts).reduce((a, b) => a + b, 0) > 0 ? (
                <>
                  Gợi ý đã sẵn sàng — nhấn{" "}
                  <span className="text-[color:var(--color-input-primary)] font-semibold">
                    Enter
                  </span>{" "}
                  hoặc biểu tượng{" "}
                  <i className="fa-solid fa-magnifying-glass text-[color:var(--color-input-primary)]" />{" "}
                  để tìm kiếm.
                </>
              ) : (
                "Nhập từ khoá ở thanh tìm kiếm trên đầu trang để bắt đầu."
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
