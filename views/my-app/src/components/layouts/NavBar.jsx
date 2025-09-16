// src/components/layouts/NavBar.jsx
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import "../../assets/font-awesome-6.6.0-pro-full-main/css/all.css";
import useCurrentUser from "../../hook/useCurrentUser"; // <-- thêm

function NavBar({ isCollapsed, setIsCollapsed, onNewAlbumClick }) {
  const { user, loading } = useCurrentUser();

  const displayAvatar =
    user?.__display?.avatar || "https://i.pravatar.cc/40?img=1";
  const displayName = user?.__display?.name || "User name";

  // action buttons giữ nguyên
  const actionButtons = [
    { icon: "fa-solid fa-plus", text: "New Post", path: "/new-post" },
    { icon: "fa-solid fa-images", text: "New Album", path: "/new-album" },
  ];

  // Chuyển navSections vào trong component để dùng dữ liệu động
  const navSections = [
    {
      key: "user",
      items: [
        { avatar: displayAvatar, text: displayName, path: "/profile" },
        { icon: "fa-regular fa-compass", text: "Explore", path: "/" },
        { icon: "fa-regular fa-user", text: "Following", path: "/following" },
        { icon: "fa-regular fa-clock", text: "History", path: "/history" },
      ],
    },
    {
      key: "library",
      title: "My library",
      items: [
        { icon: "fa-regular fa-pen-to-square", text: "My posts", path: "/my-posts" },
        { icon: "fa-regular fa-folder", text: "My Albums", path: "/my-albums" },
      ],
    },
    {
      key: "feeds",
      title: "Custom feeds",
      items: [
        { icon: "fa-solid fa-ranking-star", text: "Leaderboard", path: "/leaderboard" },
        { icon: "fa-solid fa-list", text: "Categories", path: "/categories" },
        { icon: "fa-solid fa-hashtag", text: "Hashtags", path: "/hashtags" },
        { icon: "fa-regular fa-bookmark", text: "Bookmarks", path: "/bookmarks" },
      ],
    },
  ];

  return (
    <motion.nav
      animate={{ width: isCollapsed ? 80 : 250 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="
        fixed top-[60px] left-0
        h-[calc(100%-60px)]
        bg-[#0E1217] border-r border-[#444] text-white
        flex flex-col overflow-hidden z-[999]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 text-gray-400 flex-shrink-0">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              key="menu-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.15 } }}
              exit={{ opacity: 0 }}
              className="font-semibold"
            >
              Menu
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-gray-400 hover:text-white"
          type="button"
        >
          <i className={`fa-solid fa-${isCollapsed ? "chevron-right" : "chevron-left"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 overflow-y-auto flex-grow">
        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {actionButtons.map(({ icon, text, path }) => {
            if (text === "New Album") {
              return (
                <button
                  key={text}
                  type="button"
                  onClick={onNewAlbumClick}
                  className="bg-white/10 hover:bg-white/20 rounded-lg py-2 text-sm w-full flex items-center justify-center gap-3 overflow-hidden"
                >
                  <i className={`${icon} flex-shrink-0`} aria-hidden="true" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.08 } }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            }
            return (
              <ActionButton
                key={text}
                icon={icon}
                text={text}
                path={path}
                collapsed={isCollapsed}
              />
            );
          })}
        </div>

        <div className="w-full h-px bg-[#444] my-4" />

        {/* Sections */}
        {navSections.map((section) => (
          <div key={section.key} className="mb-2">
            <AnimatePresence>
              {section.title && !isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xs uppercase tracking-wide text-gray-400 mb-2 text-left pl-2"
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
                  path={path}
                  collapsed={isCollapsed}
                />
              ) : (
                <NavItem
                  key={text}
                  icon={icon}
                  text={text}
                  path={path}
                  collapsed={isCollapsed}
                />
              )
            )}
          </div>
        ))}
      </div>
    </motion.nav>
  );
}

/* --- Sub-components giữ nguyên --- */

function UserNavItem({ avatar, text, path, collapsed }) {
  const base =
    "flex items-center gap-4 py-2 px-2 rounded-md overflow-hidden text-gray-300 hover:text-white hover:bg-white/5";
  return (
    <NavLink to={path} className={({ isActive }) => (isActive ? `${base} bg-white/5` : base)}>
      <img src={avatar} alt="User Avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.08 } }}
            exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
            className="whitespace-nowrap font-semibold text-blue-400"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}

function NavItem({ icon, text, path, collapsed }) {
  const base =
    "flex items-center gap-4 py-2 px-2 rounded-md overflow-hidden text-gray-300 hover:text-white hover:bg-white/5";
  const active =
    "flex items-center gap-4 py-2 px-2 rounded-md overflow-hidden text-gray-300 hover:text-white bg-white/10";

  return (
    <NavLink to={path} className={({ isActive }) => (isActive ? active : base)}>
      <i className={`${icon} text-lg w-[20px] text-center flex-shrink-0`} aria-hidden="true" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.08 } }}
            exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
            className="whitespace-nowrap"
          >
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
      className="bg-white/10 hover:bg-white/20 rounded-lg py-2 text-sm w-full flex items-center justify-center gap-3 overflow-hidden"
    >
      <i className={`${icon} flex-shrink-0`} aria-hidden="true" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.08 } }}
            exit={{ opacity: 0 }}
            className="whitespace-nowrap"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}

export default memo(NavBar);
