import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/font-awesome-6.6.0-pro-full-main/css/all.css';

/**
 * Custom Hook để phát hiện click bên ngoài một element
 */
const useClickOutside = (handler) => {
  const domNode = useRef();
  useEffect(() => {
    const maybeHandler = (event) => {
      if (domNode.current && !domNode.current.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener("mousedown", maybeHandler);
    return () => {
      document.removeEventListener("mousedown", maybeHandler);
    };
  });
  return domNode;
};

export default function Header() {
  // THAY ĐỔI: Thêm state để quản lý dropdown
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // THAY ĐỔI: Sử dụng hook để đóng dropdown khi click ra ngoài
  const dropdownRef = useClickOutside(() => {
    setDropdownOpen(false);
  });

  return (
    <header>
      <div className="header-logo">
        <i className="fa-solid fa-code"></i>
      </div>
      <div className="header-search">
        <input type="text" placeholder="Search..." />
        <button>
          <i className="fa-regular fa-circle fa-beat-fade"></i>
        </button>
      </div>
      <div className="header-right">
        <div className="header-tools">
          <i className="fa-regular fa-shapes fa-shake"></i>
          <span></span>
        </div>
        <div className="header-info">
          <i className="fa-solid fa-blog" style={{ color: "#ff6a25" }}></i>
          <span>24</span>
        </div>
        <div className="header-info">
          <i className="fa-solid fa-user-check" style={{ color: "#9625ff" }}></i>
          <span>36</span>
        </div>
        
        {/* THAY ĐỔI: Bọc khu vực user trong một div relative để định vị dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Biến div.header-user thành một button có thể click */}
          <button 
            type="button" 
            className="header-user" 
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            {/* Sử dụng ảnh avatar như trong thiết kế */}
            <img 
              src="https://i.pravatar.cc/40?img=1" 
              alt="User Avatar" 
              className="w-9 h-9 rounded-full"
            />
          </button>

          {/* Render dropdown menu nếu isDropdownOpen là true */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-3 w-60 bg-[#2C323B] border border-gray-700 rounded-lg shadow-lg"
              >
                {/* Header của dropdown */}
                <div className="flex items-center gap-3 p-3 border-b border-gray-700">
                  <img src="https://i.pravatar.cc/40?img=1" alt="User Avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-white">Real name</p>
                    <p className="text-sm text-gray-400">User name</p>
                  </div>
                </div>

                {/* Các mục trong menu */}
                <div className="py-2">
                  <NavLink to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white">
                    <i className="fa-regular fa-user w-4 text-center"></i>
                    <span>Profile</span>
                  </NavLink>
                  <a href="#" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-white/5 hover:text-red-400">
                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
                    <span>Log out</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}