import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/font-awesome-6.6.0-pro-full-main/css/all.css";
import useAuth from "../../hook/useAuth";
import images from "../../assets/image";
import SearchBarPanel from "../search/SearchBarPanel.jsx";
import { user_followServices } from "../../services/user_followServices";

// click outside hook (đóng dropdown avatar khi click ra ngoài)
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

export default function Header() {
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();

  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const userMenuRef = useClickOutside(() => setDropdownOpen(false));

  // ESC để đóng search panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Enter trong ô header => điều hướng sang trang search
  const onHeaderKeyDown = (e) => {
    if (e.key === "Enter") {
      const val = q.trim();
      if (!val) return;
      navigate(`/search?type=post&q=${encodeURIComponent(val)}`);
      setOpenSearch(false);
    }
  };

  // Load số follower/following khi user login
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
      <header className="h-12 flex items-center px-4 bg-[#151a21] text-gray-200 border-y-2 border-[#2a7fff]">
        <p>Đang tải...</p>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-12 grid grid-cols-[1fr_minmax(320px,600px)_1fr] items-center px-4 bg-[#151a21] text-gray-200 border-y-2 border-[#2a7fff] z-50">
        <div className="flex items-center font-semibold text-lg">
          <i className="fa-solid fa-code mr-2"></i> Logo
        </div>

        <div className="relative flex items-center">
          <i className="fa-solid fa-magnifying-glass absolute left-3 text-gray-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpenSearch(true)}
            onKeyDown={onHeaderKeyDown}
            placeholder="Search Posts"
            className="w-full h-8 pl-9 pr-9 rounded-md bg-[#232a33] text-sm text-gray-200 placeholder:text-gray-400 border border-[#3a4654] focus:border-[#4e9bff] outline-none"
          />
          {q ? (
            <button
              aria-label="Clear search"
              title="Clear"
              onClick={() => {
                setQ("");
                setOpenSearch(false);
              }}
              className="absolute right-2 h-6 w-6 grid place-items-center rounded-md hover:bg-[#3a4654] transition"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          ) : (
            <button
              aria-label="Open Search Bar"
              title="Open search"
              onClick={() => setOpenSearch((v) => !v)}
              className="absolute right-2 h-6 w-6 grid place-items-center rounded-md bg-[#2b333d] hover:bg-[#3a4654] transition"
            >
              <i className="fa-solid fa-arrow-right" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-5 pr-2 text-base">
          <i className="fa-regular fa-grid-2 cursor-pointer opacity-80 hover:opacity-100"></i>

          <div className="flex items-center gap-1">
            <i className="fa-solid fa-blog text-[#ff6a25]" />
            <span className="text-sm">{followersCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <i className="fa-solid fa-user-check" style={{ color: "#9625ff" }} />
            <span className="text-sm">{followingCount}</span>
          </div>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="rounded-full overflow-hidden ring-1 ring-[#3a4654] hover:ring-[#4e9bff] transition"
              >
                <img
                  src={user?.avatar_url || images.avtImage}
                  alt="User Avatar"
                  className="w-8 h-8 object-cover"
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-60 bg-[#232a33] border border-[#3a4654] rounded-lg shadow-xl z-[60]"
                  >
                    <div className="flex items-center gap-3 p-3 border-b border-[#3a4654]">
                      <img
                        src={user?.avatar_url || images.avtImage}
                        alt="User Avatar"
                        className="w-9 h-9 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-white">{user.full_name || "Real name"}</p>
                        <p className="text-sm text-gray-400">{user.username || "User name"}</p>
                      </div>
                    </div>
                    <div className="py-2">
                      <NavLink
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                      >
                        <i className="fa-regular fa-user w-4 text-center" />
                        <span>Profile</span>
                      </NavLink>
                      <button
                        onClick={() => {
                          fetch("http://localhost:3000/public/index.php?action=logout", {
                            method: "POST",
                            credentials: "include",
                          })
                            .then(() => {
                              setDropdownOpen(false); // đóng dropdown
                              setTimeout(() => {
                                window.location.reload(); // reload trang sau 1 giây
                              }, 1000);
                            })
                            .catch((err) => console.error(err));
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-white/5 hover:text-red-400 w-full text-left"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center" />
                        <span>Log out</span>
                      </button>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex gap-2">
              <NavLink
                to="/login"
                className="px-3 py-1 rounded bg-[#2b333d] hover:bg-[#3a4654]"
              >
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className="px-3 py-1 rounded bg-[#2b333d] hover:bg-[#3a4654]"
              >
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
          navigate(
            `/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(keyword)}`
          );
          setOpenSearch(false);
        }}
      />
    </>
  );
}
