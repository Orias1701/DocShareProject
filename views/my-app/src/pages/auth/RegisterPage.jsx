import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Regis.css';

// Dùng endpoint JSON mới:
const API_REGISTER_URL = 'http://localhost:3000/public/index.php?action=api_register';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    birthday: '',
    biography: '',
    avatar: null,       // hiện chưa upload file lên BE (BE chưa nhận multipart); có thể giữ để dùng sau
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();  // để chuyển hướng

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      avatar: e.target.files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // API backend mong đợi field: username, email, password, full_name, birth_date, avatar_url, bio
    const payload = {
      username:   formData.username.trim(),
      email:      formData.email.trim(),
      password:   formData.password,
      full_name:  formData.fullName.trim(),
      birth_date: formData.birthday,     // input type=date đã là YYYY-MM-DD
      bio:        formData.biography.trim() || null,
      // Nếu có sẵn link ảnh thì truyền avatar_url; còn upload file cần API riêng
      avatar_url: null,
    };

    try {
      const res = await fetch(API_REGISTER_URL, {
        method: 'POST',
        credentials: 'include', // cần nếu dùng session/cookie cross-origin
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // server luôn trả JSON theo chuẩn đã setup
      const data = await res.json();

      if (res.ok && data.status === 'ok') {
        setSuccess(data.message || 'Đăng ký thành công!');
        navigate("/login");
        // tuỳ chọn: reset form
        setFormData({
          username: '',
          fullName: '',
          email: '',
          password: '',
          birthday: '',
          biography: '',
          avatar: null,
        });
      } else {
        // gom message hợp lệ từ server, fallback nếu thiếu
        setError(data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
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

          {error &&   <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
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
