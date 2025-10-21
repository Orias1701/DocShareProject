// src/pages/auth/RequireAdmin.jsx
import useAuth from "../../hook/useAuth";

/**
 * ✅ Chỉ cho phép ROLE000 (Admin) truy cập
 * - Nếu đang load: hiển thị trạng thái loading
 * - Nếu chưa đăng nhập: hiển thị thông báo
 * - Nếu không phải admin: hiển thị 403 tại chỗ
 */
export default function RequireAdmin({ children }) {
  const auth = useAuth();

  // Đang kiểm tra quyền
  if (auth.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">🔒 Bạn chưa đăng nhập</h1>
        <p className="text-gray-600 mb-5">
          Vui lòng đăng nhập để tiếp tục.
        </p>
        <a
          href="/login"
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
        >
          Đăng nhập
        </a>
      </div>
    );
  }

  // Không phải admin
  if (auth.user?.role_id !== "ROLE000") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Truy cập bị từ chối
        </h2>
        <p className="text-gray-600 max-w-md mb-6">
          Bạn không có quyền truy cập vào khu vực quản trị.  
          Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ quản trị viên.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
        >
          🏠 Quay lại trang chủ
        </a>
      </div>
    );
  }

  // ✅ Nếu là admin
  return children;
}
