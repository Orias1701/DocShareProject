// Chỉ cho phép ROLE000 (Admin) truy cập, người khác bị chặn
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hook/useAuth";

export default function RequireAdmin({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) return null; // Đợi load xong
  if (!auth.isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  // ✅ Chỉ cho phép role ROLE000 (Admin)
  if (auth.user?.role_id !== "ROLE000") {
    return <Navigate to="/403" replace />;
  }

  return children;
}
