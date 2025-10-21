import React, { useState } from "react";
import { Link } from "react-router-dom";
import bannerAuth from "../../assets/image/banner_auth.png";
import authApi from "../../services/usersServices"; // đồng bộ với code của bạn

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const data = await authApi.forgotPassword(email);
      if (data && data.status === "ok") {
        setMessage(data.message || "Nếu email tồn tại, liên kết đặt lại đã được gửi.");
      } else {
        setMessage("Nếu email tồn tại, liên kết đặt lại đã được gửi.");
      }
    } catch (err) {
      setError(err?.message || "Không thể kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left - banner giống LoginPage */}
      <div
        className="w-full md:w-1/2 min-h-screen bg-no-repeat bg-top bg-cover md:sticky md:top-0"
        style={{ backgroundImage: `url(${bannerAuth})` }}
      >
        <div className="h-full w-full bg-black/40 flex flex-col justify-center px-10 py-20">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Forgot your<br />password?
          </h1>
          <p className="mt-4 text-gray-200 text-lg max-w-md">
            Nhập email để nhận liên kết đặt lại mật khẩu an toàn.
          </p>
          <Link to="/login" className="mt-6 text-indigo-300 hover:text-indigo-200">
            Quay lại đăng nhập &gt;&gt;
          </Link>
        </div>
      </div>

      {/* Right - form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 text-black">
          <h2 className="text-2xl font-semibold text-center mb-6">Quên mật khẩu</h2>

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          {message && <div className="mb-3 text-sm text-green-600">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-400 text-black px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}
            </button>
          </form>

          <p className="text-center text-sm text-black mt-6">
            Nhớ mật khẩu rồi?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
