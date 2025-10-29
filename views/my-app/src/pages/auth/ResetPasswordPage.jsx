import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import bannerAuth from "../../assets/image/banner_auth.png";
import authApi from "../../services/usersServices";

function strengthLabel(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
  return labels[Math.max(0, score - 1)];
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const canSubmit = token && password.length >= 8 && password === confirm;
  const label = useMemo(() => strengthLabel(password), [password]);

  // ✅ Redirect về login sau 4 giây nếu reset thành công
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 4000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      // 📡 Gọi API
      console.log("🔹 Sending reset password request:", { token, new_password: password });
      const data = await authApi.resetPassword({ token, new_password: password });
      console.log("✅ Server response:", data); // ✅ log phản hồi API

      if (data?.status === "ok") {
        setSuccess("✅ Mật khẩu đã được cập nhật. Bạn sẽ được chuyển đến trang đăng nhập...");
      } else {
        const msg = data?.message || "Đặt lại mật khẩu thất bại.";
        if (/hết hạn/i.test(msg) || /invalid|token/i.test(msg)) {
          setError("⏰ Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Hãy yêu cầu lại email mới.");
        } else {
          setError(msg);
        }
        console.warn("⚠️ Reset failed:", msg);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API reset password:", err);
      if (err?.message?.includes("Failed to fetch")) {
        setError("⚠️ Không thể kết nối máy chủ. Kiểm tra mạng hoặc thử lại sau.");
      } else {
        setError("Lỗi không xác định: " + (err?.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left banner */}
      <div
        className="w-full md:w-1/2 min-h-screen bg-no-repeat bg-top bg-cover md:sticky md:top-0"
        style={{ backgroundImage: `url(${bannerAuth})` }}
      >
        <div className="h-full w-full bg-black/40 flex flex-col justify-center px-10 py-20">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Reset your<br />password
          </h1>
          <p className="mt-4 text-gray-200 text-lg max-w-md">
            Tạo mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.
          </p>
          <Link to="/login" className="mt-6 text-indigo-300 hover:text-indigo-200">
            Quay lại đăng nhập &gt;&gt;
          </Link>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 text-black">
          <h2 className="text-2xl font-semibold text-center mb-6">Đặt lại mật khẩu</h2>

          {!token && (
            <p className="mt-3 text-sm text-red-600 text-center">
              ❌ Thiếu token. Hãy mở liên kết từ email của bạn.
            </p>
          )}

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-3 text-sm text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-black">Mật khẩu mới</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-400 text-black px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
              />
              <p className="mt-1 text-xs text-gray-500">Độ mạnh: {label}</p>
            </div>

            <div>
              <label className="block text-sm text-black">Nhập lại mật khẩu</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-400 text-black px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm && confirm !== password && (
                <p className="mt-1 text-xs text-red-600">Mật khẩu không khớp.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>

          <p className="text-center text-sm text-black mt-6">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
