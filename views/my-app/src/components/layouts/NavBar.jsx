// src/components/layouts/NavBar.jsx
import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/font-awesome-6.6.0-pro-full-main/css/all.css";
import useCurrentUser from "../../hook/useCurrentUser";
import authApi from "../../services/usersServices";

const FALLBACK_AVATAR =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

/* --------- Icon map (dễ đổi về sau) --------- */
const ICONS = {
  newPost: "fa-solid fa-square-plus",
  newAlbum: "fa-solid fa-photo-film",

  explore: "fa-solid fa-compass",
  following: "fa-solid fa-user-group",

  myPosts: "fa-solid fa-pencil",
  myAlbums: "fa-solid fa-photo-film",
  bookmarks: "fa-solid fa-bookmark",

  leaderboard: "fa-solid fa-trophy",
  categories: "fa-solid fa-tags",

  admin: "fa-solid fa-shield-halved",
};

function NavBar({ isCollapsed = false, setIsCollapsed, onNewAlbumClick }) {
  const { user, loading } = useCurrentUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639.98px)").matches
  );
  const navigate = useNavigate();

  // đảm bảo theme class
  useEffect(() => {
    document.body.classList.add("main-page");
    return () => document.body.classList.remove("main-page");
  }, []);

  // theo dõi breakpoint để khóa collapsed ở mobile
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639.98px)");
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener?.("change", onChange) ?? mql.addListener(onChange);
    return () => {
      mql.removeEventListener?.("change", onChange) ?? mql.removeListener(onChange);
    };
  }, []);

  const collapsed = useMemo(() => (isMobile ? true : !!isCollapsed), [isMobile, isCollapsed]);

  useEffect(() => {
    document.body.classList.toggle("sidebar--collapsed", collapsed);
  }, [collapsed]);

  // admin?
  useEffect(() => {
    (async () => {
      if (!user) return setIsAdmin(false);
      try {
        const res = await authApi.admin();
        setIsAdmin(res?.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [user]);

  const displayAvatar = user?.__display?.avatar || FALLBACK_AVATAR;
  const displayName = user?.__display?.name || "User name";

  const handleNewAlbum = () => {
    if (typeof onNewAlbumClick === "function") onNewAlbumClick();
    else navigate("/new-album");
  };

  const actionButtons = [
    { icon: ICONS.newPost, text: "New Post", path: "/new-post" },
  ];

  const navSections = [
    {
      key: "user",
      items: [
        { avatar: displayAvatar, text: displayName, path: "/profile" },
        { icon: ICONS.explore, text: "Explore", path: "/" },
        { icon: ICONS.following, text: "Following", path: "/following" },
      ],
    },
    {
      key: "library",
      title: "My library",
      items: [
        { icon: ICONS.myPosts, text: "My posts", path: "/my-posts" },
        { icon: ICONS.myAlbums, text: "My Albums", path: "/my-albums" },
        { icon: ICONS.bookmarks, text: "Bookmarks", path: "/bookmarks" },
      ],
    },
    {
      key: "feeds",
      title: "Custom feeds",
      items: [
        { icon: ICONS.leaderboard, text: "Leaderboard", path: "/leaderboard" },
        { icon: ICONS.categories, text: "Categories", path: "/categories" },
      ],
    },
  ];

  return (
    <motion.nav
      animate={{ width: collapsed ? 80 : 250 }}
      transition={{ duration: 0.25 }}
      className="
        fixed left-0 top-[var(--header-height)]
        h-[calc(100%-var(--header-height))]
        bg-[var(--color-bg)] border-r border-[var(--color-header-border)]
        text-[var(--color-text)] flex flex-col overflow-hidden
        z-[var(--z-sidebar)]
      "
    >
      {/* Header nhỏ trong sidebar */}
      <div className="flex items-center justify-between px-6 py-3 text-[var(--color-text-muted)]">
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="menu-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold"
            >
              Menu
            </motion.span>
          )}
        </AnimatePresence>
        {/* Ẩn hoàn toàn toggle để user không thay đổi */}
        <div aria-hidden className="w-8 h-8" />
      </div>

      {/* Action */}
      <div className="px-3 space-y-2">
        {actionButtons.map(({ icon, text, path }) => (
          <ActionButton key={text} icon={icon} text={text} path={path} collapsed={collapsed} />
        ))}

        {/* New Album */}
        <button
          type="button"
          onClick={handleNewAlbum}
          className="add-btn flex items-center justify-center gap-3 w-full py-2 text-sm rounded-lg overflow-hidden"
        >
          <i className={ICONS.newAlbum} aria-hidden="true" />
          {!collapsed && <span className="whitespace-nowrap">New Album</span>}
        </button>
      </div>

      <div className="my-3 h-px bg-[var(--color-border-strong)]" />

      {/* Sections */}
      <div className="px-2 overflow-y-auto flex-1">
        {navSections.map((section) => (
          <NavSection key={section.key} section={section} collapsed={collapsed} loading={loading} />
        ))}

        {/* Admin */}
        {isAdmin && (
          <div className="mb-2">
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs uppercase tracking-wide text-[var(--color-info)] mb-2 text-left pl-2"
              >
                Admin Panel
              </motion.p>
            )}
            <NavItem icon={ICONS.admin} text="Management" path="/user-manager" collapsed={collapsed} />
          </div>
        )}
      </div>
    </motion.nav>
  );
}

/* ---------- Sub-components ---------- */

function NavSection({ section, collapsed, loading }) {
  return (
    <div className="mb-2">
      <AnimatePresence>
        {section.title && !collapsed && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-xs uppercase tracking-wide text-[var(--color-info)] mb-2 text-left pl-2"
          >
            {section.title}
          </motion.p>
        )}
      </AnimatePresence>

      {section.items.map(({ icon, avatar, text, path }) =>
        avatar ? (
          <UserNavItem
            key={text}
            avatar={avatar}
            text={loading ? "Loading..." : text}
            collapsed={collapsed}
          />
        ) : (
          <NavItem key={text} icon={icon} text={text} path={path} collapsed={collapsed} />
        )
      )}
    </div>
  );
}

function UserNavItem({ avatar, text, collapsed }) {
  const src = avatar || FALLBACK_AVATAR;
  return (
    <div className="flex items-center gap-4 py-2 px-2 rounded-md overflow-hidden text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)]/30">
      <img
        src={src}
        alt="User Avatar"
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_AVATAR) e.currentTarget.src = FALLBACK_AVATAR;
        }}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="whitespace-nowrap font-semibold text-[var(--color-link)]"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, text, path, collapsed }) {
  const base =
    "flex items-center gap-4 py-2 px-2 rounded-md overflow-hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover-bg)]";
  const active =
    "flex items-center gap-4 py-2 px-2 rounded-md overflow-hidden text-[var(--color-text)] bg-[var(--color-surface-alt)]/40";
  return (
    <NavLink to={path} className={({ isActive }) => (isActive ? active : base)}>
      <i className={`${icon} text-lg w-[20px] text-center flex-shrink-0`} aria-hidden="true" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}

function ActionButton({ icon, text, path, collapsed }) {
  return (
    <NavLink
      to={path}
      className="add-btn flex items-center justify-center gap-3 w-full py-2 text-sm rounded-lg overflow-hidden"
    >
      <i className={icon} aria-hidden="true" />
      {!collapsed && <span className="whitespace-nowrap">{text}</span>}
    </NavLink>
  );
}

export default memo(NavBar);
