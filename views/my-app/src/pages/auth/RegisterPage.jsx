import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Regis.css';

// Nếu bạn dùng Vite proxy, đổi thành '/api?action=api_register'
const API_REGISTER_URL = 'http://localhost:3000/public/index.php?action=api_register';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    birthday: '',
    biography: '',
    avatar: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, avatar: e.target.files[0] || null }));
  };

  // Basic client-side password policy check
  function validatePassword(pw) {
    if (!pw || pw.length < 8) return 'Mật khẩu phải >= 8 ký tự.';
    if (!/[0-9]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 số.';
    if (!/[a-z]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường.';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // client-side validation
    const pwdErr = validatePassword(formData.password);
    if (pwdErr) {
      setError(pwdErr);
      setLoading(false);
      return;
    }
    if (!formData.email) {
      setError('Vui lòng nhập email.');
      setLoading(false);
      return;
    }

    const payload = {
      username:   formData.username.trim(),
      email:      formData.email.trim(),
      password:   formData.password,
      full_name:  formData.fullName.trim(),
      birth_date: formData.birthday,
      bio:        formData.biography.trim() || null,
      avatar_url: null, // nếu muốn upload file, cần endpoint multipart riêng
    };

    try {
      const res = await fetch(API_REGISTER_URL, {
        method: 'POST',
        credentials: 'include', // giữ nếu bạn dùng PHP session cookie
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      // xử lý an toàn: có thể server trả body rỗng hoặc non-JSON
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        // non-JSON response
        console.error('Non-JSON response:', text);
        throw new Error('Server trả về dữ liệu không hợp lệ (không phải JSON).');
      }

      if (res.ok && data?.status === 'ok') {
        setSuccess(data.message || 'Đăng ký thành công!');
        // reset form, navigate sau 700ms để user đọc message
        setTimeout(() => {
          setFormData({
            username: '',
            fullName: '',
            email: '',
            password: '',
            birthday: '',
            biography: '',
            avatar: null,
          });
          navigate('/login');
        }, 700);
      } else {
        // ưu tiên message từ body, fallback sang status text
        const msg = data?.message || data?.error || `Đăng ký thất bại (${res.status})`;
        setError(msg);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="left-panel">
        <div className="left-content">
          <h1>Create your free account</h1>
          <p>Explore our core features for individuals and organizations.</p>
          <a href="#">Get start now &gt;&gt;</a>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-wrapper">
          <h2>Sign up for ...</h2>

          {error &&   <div className="alert alert-error" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="status">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="password-hint">
                Password should be at least 8 characters including a number and a lowercase letter.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="biography">Biography</label>
              <textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Choose your avatar</label>
              <div className="file-drop-area">
                <p>Drag & Drop file</p>
                <span>Or if you prefer</span>
                <input type="file" id="avatar-upload" hidden onChange={handleFileChange} />
                <label htmlFor="avatar-upload" className="browse-button">Browse my file</label>
              </div>
              {formData.avatar && (
                <p className="file-name">Selected: {formData.avatar.name}</p>
              )}
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Registering...' : 'Sign up'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/login">Sign in +</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
