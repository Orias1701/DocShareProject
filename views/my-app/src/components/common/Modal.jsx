import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/**
 * Component `Modal`
 * @description Modal tái sử dụng với animation + portal
 * Toàn bộ màu nền, border, text được lấy từ biến CSS trong index.css
 */
const Modal = ({ isOpen, onClose, children }) => {
  // Khóa scroll khi modal mở
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Lớp nền mờ (overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--color-overlay-bg)] backdrop-blur-sm z-[2000] cursor-pointer"
          />

          {/* Hộp Modal chính */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              bg-[var(--color-modal-bg)] text-[var(--color-text)]
              border border-[var(--color-modal-border)]
              rounded-xl z-[2001] p-6 w-full max-w-md
              shadow-[var(--shadow-soft)]
            "
          >
            {/* Nút đóng (X) */}
            <button
              onClick={onClose}
              className="
                absolute top-3 right-3
                text-[var(--color-text-muted)]
                hover:text-[var(--color-text)]
                transition-colors
              "
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body // 👈 render ra body, tránh bị che
  );
};

export default Modal;
