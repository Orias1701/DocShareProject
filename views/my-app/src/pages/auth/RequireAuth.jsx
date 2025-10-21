// src/pages/auth/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hook/useAuth";

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  console.log("🔒 RequireAuth check:", {
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  });

  // 🕐 Hiển thị trạng thái đang kiểm tra đăng nhập
  if (auth.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-gray-600">Đang xác thực người dùng...</p>
      </div>
    );
  }

  // 🚫 Nếu chưa đăng nhập → chuyển sang trang login
  if (!auth.isAuthenticated) {
    console.warn("🚪 Chưa đăng nhập → redirect đến /login");
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // để sau login quay lại trang cũ
      />
    );
  }

  // ✅ Nếu đã đăng nhập → hiển thị nội dung con
  console.log("✅ Đã đăng nhập:", auth.user?.email);
  return children;
}
