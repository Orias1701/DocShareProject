import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/font-awesome-6.6.0-pro-full-main/css/all.css';
import useAuth from '../../hook/useAuth';
import images from '../../assets/image';

// Custom Hook để phát hiện click ra ngoài
const useClickOutside = (handler) => {
  const domNode = useRef();
  useEffect(() => {
    const maybeHandler = (event) => {
      if (domNode.current && !domNode.current.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener("mousedown", maybeHandler);
    return () => document.removeEventListener("mousedown", maybeHandler);
  });
  return domNode;
};

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const { user, loading, setUser } = useAuth(); // dùng hook để lấy user từ session
  const dropdownRef = useClickOutside(() => setDropdownOpen(false));

  if (loading) {
    return (
      <header className="p-4 bg-gray-800 text-white">
        <p>Đang tải...</p>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      {/* Logo */}
      <div className="header-logo">
        <i className="fa-solid fa-code text-2xl"></i>
      </div>

      {/* Search */}
      <div className="header-search flex items-center">
        <input type="text" placeholder="Search..." className="px-2 py-1 rounded text-black"/>
        <button className="ml-2">
          <i className="fa-regular fa-circle fa-beat-fade"></i>
        </button>
      </div>

      {/* Icon + User */}
      <div className="header-right flex items-center gap-4">
        {/* Các icon hiện có */}
        <div className="header-tools flex items-center gap-1">
          <i className="fa-regular fa-shapes fa-shake"></i>
          <span></span>
        </div>
        <div className="header-info flex items-center gap-1">
          <i className="fa-solid fa-blog" style={{ color: "#ff6a25" }}></i>
          <span>24</span>
        </div>
        <div className="header-info flex items-center gap-1">
          <i className="fa-solid fa-user-check" style={{ color: "#9625ff" }}></i>
          <span>36</span>
        </div>

        {/* Phần user/avatar */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button" 
              className="header-user"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
            <img
              src={user?.avatar_url || images.avtImage}
              alt="User Avatar"
              className="w-9 h-9 rounded-full"
            />

            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-3 w-60 bg-[#2C323B] border border-gray-700 rounded-lg shadow-lg"
                >
                  <div className="flex items-center gap-3 p-3 border-b border-gray-700">
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
                      <i className="fa-regular fa-user w-4 text-center"></i>
                      <span>Profile</span>
                    </NavLink>
                    <button 
                      onClick={() => { 
                        fetch("http://localhost:3000/public/index.php?action=logout", { 
                          method: "POST", 
                          credentials: "include" 
                        }).then(() => setUser(null));
                        setDropdownOpen(false);
                      }} 
                      className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-white/5 hover:text-red-400 w-full text-left"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
                      <span>Log out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex gap-2">
            <NavLink to="/login" className="auth-btn">Đăng nhập</NavLink>
            <NavLink to="/register" className="auth-btn">Đăng ký</NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
