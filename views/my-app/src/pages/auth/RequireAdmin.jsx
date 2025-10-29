import useAuth from "../../hook/useAuth";

function Spinner({ text="Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Truy cập bị từ chối</h2>
      <p className="text-gray-600 max-w-md mb-6">
        Bạn không có quyền truy cập vào khu vực quản trị.
      </p>
      <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
        🏠 Quay lại trang chủ
      </a>
    </div>
  );
}

export default function RequireAdmin({ children }) {
  const auth = useAuth();

  // ⛔️ Quan trọng: CHỜ đến khi profile/role sẵn sàng
  if (!auth.ready || auth.loading || !auth.userLoaded || !auth.user) {
    return <Spinner text="Đang kiểm tra quyền truy cập..." />;
  }

  const isAdmin =
    auth.user.role_id === "ROLE000" ||
    auth.user.role?.id === "ROLE000" ||
    auth.user.role === "ROLE000" ||
    auth.user.roles?.includes?.("ROLE000") ||
    auth.user.is_admin === true;

  if (!isAdmin) return <Forbidden />;
  return children;
}
