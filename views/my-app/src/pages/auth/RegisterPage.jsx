import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bannerAuth from "../../assets/image/banner_auth.png";
import fetchJson from "../../services/fetchJson"; // DÙNG helper của bạn

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    birthday: "",
    biography: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] || null : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ và tên.";
    if (!form.username.trim()) e.username = "Vui lòng nhập tên người dùng.";
    else if (form.username.length < 3) e.username = "Tên người dùng phải có ít nhất 3 ký tự.";
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Email không hợp lệ.";
    // if (form.password.length < 8) e.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(form.password)) 
      e.password = "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";    
    else if (!/[0-9]/.test(form.password)) e.password = "Mật khẩu phải chứa ít nhất 1 số.";
    else if (!/[a-z]/.test(form.password)) e.password = "Mật khẩu phải chứa ít nhất 1 chữ thường.";
    if (!form.birthday) e.birthday = "Vui lòng chọn ngày sinh.";
    return e;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) {
      const firstField = Object.keys(eObj)[0];
      formRef.current?.querySelector(`[name="${firstField}"]`)?.focus();
      return;
    }

    setLoading(true);
    setServerMsg(null);
    try {
      let data;

      if (form.avatar) {
        // Nếu có avatar -> dùng FormData (KHÔNG set Content-Type)
        const fd = new FormData();
        fd.append("full_name", form.fullName);
        fd.append("username", form.username);
        fd.append("email", form.email);
        fd.append("password", form.password);
        fd.append("birth_date", form.birthday);
        if (form.biography) fd.append("bio", form.biography);
        fd.append("avatar", form.avatar);

        data = await fetchJson("api_register", {
          method: "POST",
          body: fd,
        });
      } else {
        // Không có avatar -> gửi JSON
        const payload = {
          full_name: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          birth_date: form.birthday,
          bio: form.biography || null,
        };

        data = await fetchJson("api_register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (data?.status === "ok") {
        setServerMsg({ type: "success", text: data.message || "Đăng ký thành công!" });
        setTimeout(() => navigate("/login"), 700);
      } else {
        setServerMsg({
          type: "error",
          text: data?.message || "Đăng ký thất bại. Vui lòng thử lại!",
        });
      }
    } catch (err) {
      setServerMsg({ type: "error", text: err.message || "Lỗi không xác định." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT - Image (giữ chữ trắng để tương phản) */}
      <div
        className="
          w-full md:w-1/2
          min-h-screen md:h-screen
          bg-no-repeat bg-top bg-cover
          md:sticky md:top-0
        "
        style={{ backgroundImage: `url(${bannerAuth})` }}
      >
        <div className="h-full w-full bg-black/40 flex flex-col justify-center px-12 py-20">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Create your free <br /> account
          </h1>
          <p className="mt-5 text-gray-200 text-lg max-w-md">
            Explore our core features for individuals and organizations.
          </p>
          <a href="#" className="mt-6 text-indigo-300 hover:text-indigo-200 text-lg font-medium">
            Get start now &gt;&gt;
          </a>
        </div>
      </div>

      {/* RIGHT - Form (toàn bộ chữ màu đen) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div ref={formRef} className="w-full max-w-lg px-10 py-12 sm:px-12 sm:py-14 text-black">
          <h2 className="text-3xl font-bold text-center mb-6">Sign up</h2>

          {serverMsg && (
            <div
              className={`mb-5 text-base px-4 py-3 rounded-md border ${
                serverMsg.type === "success"
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {serverMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-base">
            {/* Full Name */}
            <div>
              <label className="font-semibold text-black">Full name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-4 py-3 text-lg text-black ${
                  errors.fullName ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
              />
              {errors.fullName && <p className="text-red-600 mt-1 text-sm">{errors.fullName}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="font-semibold text-black">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-4 py-3 text-lg text-black ${
                  errors.username ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
              />
              {errors.username && <p className="text-red-600 mt-1 text-sm">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="font-semibold text-black">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-4 py-3 text-lg text-black ${
                  errors.email ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
              />
              {errors.email && <p className="text-red-600 mt-1 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="font-semibold text-black">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-4 py-3 text-lg text-black ${
                  errors.password ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
              />
              {errors.password ? (
                <p className="text-red-600 mt-1 text-sm">{errors.password}</p>
              ) : (
                <p className="text-black/80 text-sm mt-1">
                  Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="font-semibold text-black">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-4 py-3 text-lg text-black ${
                  errors.birthday ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
              />
              {errors.birthday && <p className="text-red-600 mt-1 text-sm">{errors.birthday}</p>}
            </div>

            {/* Biography */}
            <div>
              <label className="font-semibold text-black">Biography</label>
              <textarea
                name="biography"
                value={form.biography}
                onChange={handleChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-400 text-black px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="font-semibold text-black">Choose your avatar</label>
              <input
                type="file"
                name="avatar"
                onChange={handleChange}
                className="mt-2 block w-full text-black text-base"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 text-lg rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
            >
              {loading ? "Registering..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-base text-black mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
              Sign in +
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
