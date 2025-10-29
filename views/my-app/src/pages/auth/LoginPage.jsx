import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import bannerAuth from "../../assets/image/banner_auth.png";
import fetchJson from "../../services/fetchJson"; // DÙNG helper của bạn

export default function LoginPage() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);

    try {
      const data = await fetchJson("api_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // caller tự set
        body: JSON.stringify(formData),                  // caller tự stringify
      });

      if (data?.status === "ok" || data?.user) {
        setSuccess("Đăng nhập thành công!");
        if (data.user) setUser(data.user);
        if (data.token) localStorage.setItem("token", data.token);

        const from = location.state?.from?.pathname;
        navigate(from && from !== "/login" ? from : "/", { replace: true });
      } else {
        setError(data?.message || "Đăng nhập thất bại!");
      }
    } catch (err) {
      setError(err.message || "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left - banner image (giữ chữ trắng để tương phản) */}
      <div
        className="
          w-full md:w-1/2
          min-h-screen md:h-screen
          bg-no-repeat bg-top bg-cover
          md:sticky md:top-0
        "
        style={{ backgroundImage: `url(${bannerAuth})` }}
      >
        <div className="h-full w-full bg-black/40 flex flex-col justify-center px-10 py-20">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Explore our<br />newest features
          </h1>
          <p className="mt-4 text-gray-200 text-lg max-w-md">
            Get updated posts and news from many individuals and organizations.
          </p>
          <Link to="/login" className="mt-6 text-indigo-300 hover:text-indigo-200">
            Sign in now &gt;&gt;
          </Link>
        </div>
      </div>

      {/* Right - form (toàn bộ chữ màu đen) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 text-black">
          <h2 className="text-2xl font-semibold text-center mb-6">Sign in</h2>

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-3 text-sm text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-black">Email or Username</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-400 text-black px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm text-black">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-400 text-black px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-sm text-black">
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              Quên mật khẩu?
            </Link>
          </p>
          <p className="text-center text-sm text-black mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
              Sign up +
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
