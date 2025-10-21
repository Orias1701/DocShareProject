import { Navigate, useLocation, useParams } from "react-router-dom";
import useAuth from "../../hook/useAuth";

export default function RequireSelfOrAdmin({ children, paramKey = "userId" }) {
  const auth = useAuth();
  const location = useLocation();
  const params = useParams();
  const targetId = params?.[paramKey];

  if (auth.loading) return null; // hoặc spinner
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (auth.isAdmin()) return children; // Admin pass
  const me = auth.user?.user_id;
  if (me && targetId && me === targetId) return children; // Chính chủ pass
  return <Navigate to="/403" replace />;
}
