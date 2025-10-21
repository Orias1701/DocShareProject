import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";

/**
 * RequireRole - chỉ cho phép vào nếu user có 1 trong các vai trò cho phép
 * props:
 *  - roles: string[]  (vd: ["admin","manager"])
 *  - children: ReactNode
 */
export default function RequireRole({ roles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Đợi trạng thái auth
  if (loading) return null; // hoặc spinner

  // Chưa đăng nhập -> đá về /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lấy mảng vai trò của user (tuỳ backend của bạn)
  // Hỗ trợ nhiều kiểu phổ biến: user.roles (array), user.role (string), user.permissions (array)…
  const userRoles =
    (Array.isArray(user?.roles) && user.roles) ||
    (typeof user?.role === "string" ? [user.role] : []) ||
    (Array.isArray(user?.permissions) && user.permissions) ||
    [];

  const allowed = roles.length === 0 ? true : userRoles.some(r => roles.includes(String(r).toLowerCase()));

  // Không đủ quyền -> 403
  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
