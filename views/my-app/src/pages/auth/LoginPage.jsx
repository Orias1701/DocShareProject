// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Regis.css'; // giữ nguyên css của bạn
import useAuth from '../../hook/useAuth';

// Endpoint login JSON
const API_LOGIN_URL = 'http://localhost:3000/public/index.php?action=api_login';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: '', // email hoặc username
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const { setUser }  = useAuth();  // để cập nhật user sau login (context/hook)
  const navigate     = useNavigate();
  const location     = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      identifier: formData.identifier.trim(),
      password: formData.password,
    };

    try {
      const res  = await fetch(API_LOGIN_URL, {
        method: 'POST',
        credentials: 'include', // để lưu session cookie
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Parse JSON an toàn (server có thể trả body rỗng)
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (res.ok && (data.status === 'ok' || data.user)) {
        setSuccess('Đăng nhập thành công!');
        if (data.user) setUser(data.user); // cập nhật user vào state (useAuth)

        // Nếu backend trả token (không bắt buộc với cookie session)
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Reset form
        setFormData({ identifier: '', password: '' });

        // Điều hướng: quay về trang trước nếu có & không phải /login, ngược lại về "/"
        const from = location.state?.from?.pathname;
        const dest = from && from !== '/login' ? from : '/';
        navigate(dest, { replace: true });
      } else {
        setError(data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="left-panel">
        <div className="left-content">
          <h1>Explore our newest features</h1>
          <p>Get updated posts and news from many individuals and organizations.</p>
          {/* Giữ bố cục, thay a -> Link để không reload */}
          <Link to="/login">Sign in now &gt;&gt;</Link>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-wrapper">
          <h2>Sign in</h2>

          {error &&   <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email or Username</label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
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
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-link">
            Don't have an account? <Link to="/register">Sign up +</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;