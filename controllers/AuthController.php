<?php
require_once __DIR__ . '/../models/User.php';

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
        if (session_status() === PHP_SESSION_NONE) session_start();
    }



    // Login
    public function login($identifier, $password)
    {
        // Cho phép nhập email hoặc username
        $user = $this->userModel->getByEmailOrUsername($identifier);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['user'] = $user;

            header("Location: index.php");
            exit;
        } else {
            $error = "Sai tên đăng nhập/email hoặc mật khẩu!";
            include __DIR__ . '/../views/login.php';
        }
    }


    // Register
    public function register($username, $email, $password, $full_name, $birth_date, $avatar_url = null, $bio = null)
    {
        // Kiểm tra email tồn tại chưa
        if ($this->userModel->getByEmail($email)) {
            $error = "Email đã tồn tại!";
            include __DIR__ . '/../views/register.php';
            return;
        }

        if ($this->userModel->getByUsername($username)) {
            $error = "Tên người dùng đã tồn tại!";
            include __DIR__ . '/../views/register.php';
            return;
        }


        // Hash mật khẩu
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Gọi Model tạo user (có đầy đủ tham số)
        $created = $this->userModel->createUser(
            $username,
            $email,
            $hashedPassword,
            "ROLE001",   // role mặc định
            $full_name,
            $avatar_url,
            $bio,
            $birth_date
        );

        if ($created) {
            header("Location: index.php?action=login&success=1");
            exit;
        } else {
            $error = "Đăng ký thất bại, vui lòng thử lại!";
            include __DIR__ . '/../views/register.php';
            return;
        }
    }

    // Logout
    public function logout()
    {
        session_destroy();
        header("Location: index.php?action=login");
        exit;
    }
}
