// src/components/layout/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/font-awesome-6.6.0-pro-full-main/css/all.css";
import useAuth from "../../hook/useAuth";
import images from "../../assets/image";
import SearchBarPanel from "../common/SearchBarPanel.jsx";
import { user_followServices } from "../../services/user_followServices";
import { fetchJson } from "../../services/fetchJson"; 

/* Click outside */
const useClickOutside = (handler) => {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [handler]);
  return ref;
};

export default function Header() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const userMenuRef = useClickOutside(() => setDropdownOpen(false));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenSearch(false);
      if (e.key === "Enter") handleSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleSearch = () => {
    const val = q.trim();
    if (!val) return;
    navigate(`/search?type=post&q=${encodeURIComponent(val)}`);
    setOpenSearch(false);
  };

  useEffect(() => {
    if (!user) {
      setFollowersCount(0);
      setFollowingCount(0);
      return;
    }
    const loadCounts = async () => {
      try {
        const f1 = await user_followServices.countFollowers();
        const f2 = await user_followServices.countFollowing();
        setFollowersCount(f1?.data?.count || 0);
        setFollowingCount(f2?.data?.count || 0);
      } catch (e) {
        console.error("Lỗi lấy số follow:", e);
      }
    };
    loadCounts();
    window.addEventListener("follow-updated", loadCounts);
    return () => window.removeEventListener("follow-updated", loadCounts);
  }, [user]);

  if (loading) {
    return (
      <header className="app-header h-12 flex items-center px-4 bg-[var(--color-bg)] text-[var(--color-text)] border-b border-[var(--color-header-border)]">
        <p>Đang tải...</p>
      </header>
    );
  }

  return (
    <>
      {/* LUÔN 1 HÀNG: 3 cột ngay từ mobile */}
      <header
        className="
          app-header
          fixed top-0 left-0 w-full
          h-12 md:h-[var(--header-height)]
          bg-[var(--color-bg)] text-[var(--color-text)]
          border-b border-[var(--color-header-border)] z-50

          grid grid-cols-[auto_1fr_auto]
          sm:grid-cols-[auto_minmax(320px,700px)_auto]
          items-center gap-2 md:gap-4 px-3 md:px-4
        "
      >
        {/* Cột 1: Logo */}
        <div className="flex items-center font-semibold text-base md:text-lg justify-start">
          <i className="fa-solid fa-code text-[color:var(--color-input-primary)] mr-2" />
        </div>

        {/* Cột 2: Search */}
        <div className="flex items-center w-full max-w-[600px] min-w-0 mx-auto">
          <div className="relative flex-1 min-w-0 overflow-hidden">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); if (!openSearch) setOpenSearch(true); }}
              onFocus={() => setOpenSearch(true)}
              placeholder="Tìm kiếm bài viết..."
              className="
                w-full h-9 pl-9 pr-9
                rounded-l-md md:rounded-l-xl
                bg-[var(--color-input-bg)] text-sm
                text-[var(--color-text)] placeholder:text-[color:var(--color-text-muted)]
                border border-r-0 border-[color:var(--color-border-soft)]
                focus:border-[color:var(--color-input-primary)] outline-none
              "
            />
            {q && (
              <button
                aria-label="Xoá"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-md hover:bg-[color:var(--color-hover-bg)] transition"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="
              h-9 px-3 md:px-4
              rounded-r-md md:rounded-r-xl
              bg-[color:var(--color-border-soft)] hover:bg-[color:var(--color-accent-hover)]
              border border-l-0 border-[color:var(--color-border-soft)]
              transition grid place-items-center shrink-0
            "
            aria-label="Tìm kiếm"
            title="Tìm kiếm"
          >
            <i className="fa-solid fa-magnifying-glass text-[var(--color-text)]" />
          </button>
        </div>

        {/* Cột 3: Actions */}
        <div className="flex items-center justify-end gap-3 md:gap-5">
          <div className="hidden sm:flex items-center gap-1">
            <i className="fa-solid fa-blog text-[#ff6a25]" />
            <span className="text-sm">{followersCount}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <i className="fa-solid fa-user-check" style={{ color: "#9625ff" }} />
            <span className="text-sm">{followingCount}</span>
          </div>

          {user ? (
            <UserMenu
              user={user}
              isDropdownOpen={isDropdownOpen}
              setDropdownOpen={setDropdownOpen}
              userMenuRef={userMenuRef}
              followersCount={followersCount}
              followingCount={followingCount}
            />
          ) : (
            <div className="flex gap-2">
              <NavLink to="/login" className="px-2 md:px-3 py-1 rounded bg-[var(--color-surface-alt)] hover:bg-[color:var(--color-hover-bg)]">
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="px-2 md:px-3 py-1 rounded bg-[var(--color-surface-alt)] hover:bg-[color:var(--color-hover-bg)]">
                Đăng ký
              </NavLink>
            </div>
          )}
        </div>
      </header>

      <SearchBarPanel
        open={openSearch}
        onClose={() => setOpenSearch(false)}
        query={q}
        setQuery={setQ}
        onSubmit={(tab, value) => {
          const type = (tab || "Post").toLowerCase();
          const keyword = (value ?? q).trim();
          if (!keyword) return;
          navigate(`/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(keyword)}`);
          setOpenSearch(false);
        }}
      />
    </>
  );
}

/* ===== UserMenu ===== */
function UserMenu({ user, isDropdownOpen, setDropdownOpen, userMenuRef, followersCount, followingCount }) {
  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="rounded-full overflow-hidden ring-1 ring-[color:var(--color-border-soft)] hover:ring-[color:var(--color-accent)] transition"
        aria-label="Mở menu người dùng"
      >
        <img src={user?.avatar_url || images.avtImage} alt="User Avatar" className="w-8 h-8 object-cover" />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-56 md:w-60 bg-[var(--color-surface)] border border-[color:var(--color-border-strong)] rounded-lg shadow-[var(--shadow-soft)] z-[60]"
          >
            <div className="flex items-center gap-3 p-3 border-b border-[color:var(--color-border-strong)]">
              <img src={user?.avatar_url || images.avtImage} alt="User Avatar" className="w-9 h-9 rounded-full" />
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-text)] truncate">{user.full_name || "Real name"}</p>
                <p className="text-xs md:text-sm text-[color:var(--color-text-muted)] truncate">{user.username || "User name"}</p>
              </div>
            </div>

            <div className="px-4 py-2 text-[color:var(--color-text-muted)] border-b border-[color:var(--color-border-strong)]">
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2"><i className="fa-solid fa-blog text-[#ff6a25]" /> Followers</span>
                <span className="text-[var(--color-text)] font-medium">{followersCount}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2"><i className="fa-solid fa-user-check" style={{ color: "#9625ff" }} /> Following</span>
                <span className="text-[var(--color-text)] font-medium">{followingCount}</span>
              </div>
            </div>

            <div className="py-1">
              <NavLink to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-hover-bg)] hover:text-[var(--color-text)]">
                <i className="fa-regular fa-user w-4 text-center" />
                <span>Profile</span>
              </NavLink>
              <button
                onClick={() => {
                  fetch(buildActionUrl("logout"), { method: "POST", credentials: "include" })
                    .then(() => { setDropdownOpen(false); setTimeout(() => window.location.reload(), 600); })
                    .catch((err) => console.error(err));
                }}
                className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-[color:var(--color-hover-bg)] hover:text-red-400 w-full text-left"
              >
                <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
