// src/auth/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hook/useAuth";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 24 }}>Đang kiểm tra phiên đăng nhập…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
