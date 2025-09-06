import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Component `Modal`
 * @description Một component modal có thể tái sử dụng với hiệu ứng animation.
 * @param {{
 * isOpen: boolean,       // Trạng thái đóng/mở của modal
 * onClose: () => void,   // Hàm được gọi khi người dùng muốn đóng modal
 * children: React.ReactNode // Nội dung bên trong modal
 * }} props
 */
const Modal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Lớp nền mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 cursor-pointer"
          />
          {/* Cửa sổ Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1C2028] rounded-xl z-50 p-6 w-full max-w-md"
          >
            {/* Nút đóng (X) ở góc trên bên phải */}
            <button 
              onClick={onClose} 
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;