import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Regis.css'; // dùng lại CSS từ RegisterPage
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

  const { setUser } = useAuth();   // để cập nhật user sau login
  const navigate = useNavigate();  // để chuyển hướng

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      identifier: formData.identifier.trim(),
      password: formData.password,
    };

    try {
      const res = await fetch(API_LOGIN_URL, {
        method: 'POST',
        credentials: 'include', // để lưu session cookie
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'ok') {
        setSuccess('Đăng nhập thành công!');
        setUser(data.user);  // cập nhật user vào state (useAuth)
        console.log('Logged in user:', data.user);

        // Reset form
        setFormData({ identifier: '', password: '' });

        // Chuyển về trang chính
        navigate('/');
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
          <a href="#">Sign in now &gt;&gt;</a>
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
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-link">
            Don't have an account? <a href="/register">Sign up +</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
