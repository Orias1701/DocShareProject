<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    // public function login($email, $password) {
    //     $user = $this->userModel->getByEmail($email);
    //     if ($user && $password === $user['password']) { // So sánh trực tiếp
    //         $_SESSION['user'] = $user;
    //         header("Location: index.php");
    //         exit;
    //     } else {
    //         $error = "Sai email hoặc mật khẩu!";
    //         include __DIR__ . '/../views/login.php';
    //     }
    // }
    public function login($email, $password) {
    $user = $this->userModel->getByEmail($email);

    if ($user && password_verify($password, $user['password'])) {
        // Đăng nhập thành công
        $_SESSION['user'] = $user;
        header("Location: index.php");
        exit;
    } else {
        $error = "Sai email hoặc mật khẩu!";
        include __DIR__ . '/../views/login.php';
    }
}
    // public function register($username, $email, $password) {
    //     if ($this->userModel->getByEmail($email)) {
    //         $error = "Email đã tồn tại!";
    //         include __DIR__ . '/../views/register.php';
    //         return;
    //     }
    //     // Lưu thẳng mật khẩu (không hash)
    //     $this->userModel->createUser($username, $email, $password);
    //     header("Location: index.php?action=login");
    //     exit;
    // }
     public function register($username, $email, $password) {
    if ($this->userModel->getByEmail($email)) {
        $error = "Email đã tồn tại!";
        include __DIR__ . '/../views/register.php';
        return;
    }

    // Hash mật khẩu
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Lưu user mới (role mặc định ROLE_USER)
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
