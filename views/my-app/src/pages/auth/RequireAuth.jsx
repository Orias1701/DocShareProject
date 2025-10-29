import useAuth from "../../hook/useAuth";

const Spinner = ({text="Loading..."}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth.ready || auth.loading || (auth.isAuthenticated && !auth.userLoaded)) {
    return <Spinner text="Đang kiểm tra đăng nhập..." />;
  }
  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">🔒 Bạn chưa đăng nhập</h1>
        <a href="/login" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
          Đăng nhập
        </a>
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
