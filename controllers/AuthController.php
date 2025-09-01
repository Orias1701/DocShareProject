<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
        if(session_status()===PHP_SESSION_NONE) session_start();
    }

    // trong AuthController.php
    public function login($email, $password) {
        $user = $this->userModel->getByEmail($email);

        if ($user && password_verify($password, $user['password'])) {
            // Sửa: Lưu user_id vào một key riêng biệt
            $_SESSION['user_id'] = $user['user_id']; 

            // Tùy chọn: Vẫn lưu toàn bộ thông tin người dùng nếu cần
            $_SESSION['user'] = $user; 

            header("Location: index.php");
            exit;
        } else {
            $error = "Sai email hoặc mật khẩu!";
            include __DIR__ . '/../views/login.php';
        }
    }

    public function register($username, $email, $password) {
        if ($this->userModel->getByEmail($email)) {
            $error = "Email đã tồn tại!";
            include __DIR__ . '/../views/register.php';
            return;
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $this->userModel->createUser($username, $email, $hashedPassword, "ROLE011");

        header("Location: index.php?action=login");
        exit;
    }

    public function logout() {
        session_destroy();
        header("Location: index.php?action=login");
        exit;
    }
}
