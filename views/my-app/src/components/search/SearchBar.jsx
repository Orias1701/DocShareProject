// src/components/search/SearchBar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchCombined } from "../../services/searchService";

/**
 * props:
 * - className?: string   (để bạn đặt width ở Header)
 */
export default function SearchBar({ className = "" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("post"); // post | album | category | hashtag
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState({
    posts: [],
    albums: [],
    categories: [],
    hashtags: [],
  });

  const nav = useNavigate();
  const wrapRef = useRef(null);

  // đóng panel khi click ra ngoài
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // đóng bằng ESC
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // debounce gọi API khi nhấn Enter hoặc nút kính lúp
  const doSearch = async () => {
    const query = q.trim();
    if (!query) {
      setRes({ posts: [], albums: [], categories: [], hashtags: [] });
      setOpen(false);
      return;
    }
    try {
      setLoading(true);
      const data = await searchCombined(query);
      setRes(data);
      setOpen(true);
      // nếu tất cả đều rỗng → vẫn mở panel để hiện “không thấy kết quả”
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      doSearch();
    }
  };

  // dữ liệu theo tab
  const tabData = useMemo(() => {
    switch (active) {
      case "album":
        return res.albums;
      case "category":
        return res.categories;
      case "hashtag":
        return res.hashtags;
      default:
        return res.posts;
    }
  }, [active, res]);

  // map item → link đích hợp lý
  const renderItem = (item) => {
    switch (active) {
      case "album": {
        const id = item.album_id || item.id;
        const name = item.album_name || item.name || item.title;
        return (
          <Link
            to={`/album/${encodeURIComponent(id)}`}
            className="block px-3 py-2 hover:bg-white/10 rounded"
          >
            <div className="text-white font-medium truncate">{name}</div>
            {item.description && (
              <div className="text-xs text-gray-400 truncate">{item.description}</div>
            )}
          </Link>
        );
      }
      case "category": {
        const id = item.category_id || item.id;
        const name = item.category_name || item.name || item.title;
        return (
          <Link
            to={`/category/${encodeURIComponent(id)}`}
            className="block px-3 py-2 hover:bg-white/10 rounded"
          >
            <div className="text-white font-medium truncate">{name}</div>
          </Link>
        );
      }
      case "hashtag": {
        // Cho phép đi theo id hoặc tên (slug)
        const id = item.hashtag_id || item.id || item.name;
        const slug = String(item.hashtag_name || item.name || "").replace(/^#/, "");
        const to =
          id && String(id).startsWith("HASHTAG")
            ? `/hashtag/${encodeURIComponent(id)}`
            : `/hashtag/${encodeURIComponent(slug)}`;

        return (
          <Link
            to={to}
            className="block px-3 py-2 hover:bg-white/10 rounded"
          >
            <div className="text-white font-medium truncate">
              #{slug || id}
            </div>
          </Link>
        );
      }
      default: {
        // post
        const id = item.post_id || item.id;
        const title = item.title || item.name || "Untitled";
        const albumName = item.album_name || "";
        return (
          <Link
            to={`/viewer/post/${encodeURIComponent(id)}`}
            className="flex gap-3 px-3 py-2 hover:bg-white/10 rounded"
          >
            <img
              src={
                item.banner_url ||
                "https://via.placeholder.com/64x40?text=Post"
              }
              alt=""
              className="w-16 h-10 object-cover rounded"
            />
            <div className="min-w-0">
              <div className="text-white font-medium truncate">{title}</div>
              {albumName && (
                <div className="text-xs text-gray-400 truncate">{albumName}</div>
              )}
            </div>
          </Link>
        );
      }
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Ô nhập + nút kính lúp (giữ style header cũ) */}
      <div className="header-search flex items-center w-full">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search..."
          className="px-2 py-1 rounded text-black w-full"
        />
        <button className="ml-2" onClick={doSearch} aria-label="Tìm kiếm">
          <i className="fa-solid fa-magnifying-glass" />
        </button>
      </div>

      {/* Panel kết quả dạng tab */}
      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-[#1E232B] border border-gray-700 rounded-xl shadow-xl p-3">
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            {[
              { key: "post", label: "Post" },
              { key: "album", label: "Album" },
              { key: "category", label: "Category" },
              { key: "hashtag", label: "Hashtag" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={`px-4 py-1 rounded-full border ${
                  active === t.key
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-gray-600 hover:border-white/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="min-h-[140px] max-h-[340px] overflow-auto pr-1">
            {loading ? (
              <div className="text-gray-300 px-2 py-6">Đang tìm…</div>
            ) : tabData.length === 0 ? (
              <div className="text-gray-400 px-2 py-6">Không có kết quả.</div>
            ) : (
              <div className="space-y-1">
                {tabData.slice(0, 10).map((it, idx) => (
                  <div key={(it.id || it.post_id || it.album_id || it.category_id || it.hashtag_id || idx) + "_" + active}>
                    {renderItem(it)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer tuỳ chọn: chuyển đến trang kết quả tổng hợp */}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                // ví dụ điều hướng đến 1 trang /search?q=...
                nav(`/search?q=${encodeURIComponent(q.trim())}`);
                setOpen(false);
              }}
              className="px-3 py-1 rounded bg-white text-black font-semibold"
            >
              Xem tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
