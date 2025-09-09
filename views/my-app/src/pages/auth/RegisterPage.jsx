import React, { useState } from 'react';
import './Regis.css';
// import { FaCloudUploadAlt } from 'react-icons/fa'; // Import icon


// import icon1 from './assets/icon1.png';
// import icon2 from './assets/icon2.png';
// import icon3 from './assets/icon3.png';


// ========================================================================
const API_REGISTER_URL = 'http://localhost:3000/public/index.php?action=register';


const RegisterPage = () => {
    // State để lưu trữ dữ liệu từ các ô input
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        birthday: '',
        biography: '',
        avatar: null,
    });

    // State để quản lý trạng thái của việc gửi form
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Hàm được gọi mỗi khi người dùng nhập liệu vào form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };
    
    // Hàm xử lý khi người dùng chọn file (hiện tại chưa dùng để upload)
    const handleFileChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            avatar: e.target.files[0],
        }));
    };

    // Hàm được gọi khi người dùng nhấn nút "Sign up"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn trình duyệt tải lại trang
        setLoading(true);
        setError(null);
        setSuccess(null);

        const postData = new FormData();
        postData.append('username', formData.username);
        postData.append('full_name', formData.fullName);
        postData.append('email', formData.email);
        postData.append('password', formData.password);
        postData.append('birth_date', formData.birthday);
        postData.append('bio', formData.biography);

        try {
            const response = await fetch(API_REGISTER_URL, {
                method: 'POST',
                body: postData,
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                
            } else {
                setError(result.message);
            }
        } catch{
            setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
        } finally {
            // Dừng trạng thái loading sau khi hoàn tất
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="left-panel">
                {/* Các icon trang trí - bạn có thể dùng ảnh của mình */}
                {/* <div className="floating-icon icon1"><img src={icon1} alt="deco"/></div> */}
                {/* <div className="floating-icon icon2"><img src={icon2} alt="deco"/></div> */}
                {/* <div className="floating-icon icon3"><img src={icon3} alt="deco"/></div> */}
                
                <div className="left-content">
                    <h1>Create your free account</h1>
                    <p>Explore our core features for individuals and organizations.</p>
                    <a href="#">Get start now &gt;&gt;</a>
                </div>
            </div>

            {/* ===== BẢNG BÊN PHẢI (FORM) ===== */}
            <div className="right-panel">
                <div className="form-wrapper">
                    <h2>Sign up for ...</h2>

                    {/* Vùng hiển thị thông báo lỗi hoặc thành công */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">Full name</label>
                            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                            <p className="password-hint">
                                Password should be at least 8 characters including a number and a lowercase letter.
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="birthday">Birthday</label>
                            <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="biography">Biography</label>
                            <textarea id="biography" name="biography" value={formData.biography} onChange={handleChange}></textarea>
                        </div>

                        <div className="form-group">
                            <label>Choose your avatar</label>
                            <div className="file-drop-area">
                                {/* <FaCloudUploadAlt className="upload-icon" /> */}
                                <p>Drag & Drop file</p>
                                <span>Or if you prefer</span>
                                <input type="file" id="avatar-upload" hidden onChange={handleFileChange} />
                                <label htmlFor="avatar-upload" className="browse-button">Browse my file</label>
                            </div>
                        </div>

                        <button type="submit" className="signup-button" disabled={loading}>
                            {loading ? 'Registering...' : 'Sign up'}
                        </button>
                    </form>

                    <p className="login-link">
                        Already have an account? <a href="#">Sign in +</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;