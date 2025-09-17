<?php
// controllers/AuthController.php
require_once __DIR__ . '/../models/User.php';

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();

        // Khởi tạo session nếu cần dùng cookie phiên đăng nhập
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /** ------------------------------
     * Helpers
     * ------------------------------ */
    private function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function readJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /** ------------------------------
     * LOGIN (JSON)
     * Body JSON: { "identifier": "...", "password": "..." }
     * identifier có thể là email hoặc username
     * ------------------------------ */
    public function apiLogin(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        $body = (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false)
            ? $this->readJsonBody()
            : $_POST;

        $identifier = trim($body['identifier'] ?? $body['email'] ?? '');
        $password   = (string)($body['password'] ?? '');

        if ($identifier === '' || $password === '') {
            $this->json(['status' => 'error', 'message' => 'Thiếu identifier/email hoặc password'], 400);
        }

        $user = $this->userModel->getByEmailOrUsername($identifier);
        if ($user && password_verify($password, $user['password'])) {
            // Lưu session tối thiểu (tuỳ nhu cầu)
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['user'] = [
                'user_id'   => $user['user_id'],
                'username'  => $user['username'],
                'email'     => $user['email'],
                'full_name' => $user['full_name'] ?? null,
                'avatar_url' => $user['avatar_url'] ?? null,
            ];

            $this->json([
                'status' => 'ok',
                'user'   => $_SESSION['user']
            ], 200);
        }

        $this->json(['status' => 'error', 'message' => 'Sai tên đăng nhập/email hoặc mật khẩu!'], 401);
    }

    /** ------------------------------
     * REGISTER (JSON)
     * Body JSON: {
     *   "username": "...", "email": "...", "password": "...",
     *   "full_name": "...", "birth_date": "YYYY-MM-DD",
     *   "avatar_url": null|"...", "bio": null|"..."
     * }
     * ------------------------------ */
    public function apiRegister(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        $body = (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false)
            ? $this->readJsonBody()
            : $_POST;

        $username   = trim($body['username']   ?? '');
        $email      = trim($body['email']      ?? '');
        $password   = (string)($body['password'] ?? '');
        $full_name  = trim($body['full_name']  ?? '');
        $birth_date = trim($body['birth_date'] ?? '');
        $avatar_url = $body['avatar_url'] ?? null;
        $bio        = $body['bio']        ?? null;

        if ($username === '' || $email === '' || $password === '' || $full_name === '' || $birth_date === '') {
            $this->json(['status' => 'error', 'message' => 'Thiếu trường bắt buộc'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json(['status' => 'error', 'message' => 'Email không hợp lệ'], 422);
        }

        if ($this->userModel->getByEmail($email)) {
            $this->json(['status' => 'error', 'message' => 'Email đã tồn tại!'], 409);
        }

        if ($this->userModel->getByUsername($username)) {
            $this->json(['status' => 'error', 'message' => 'Tên người dùng đã tồn tại!'], 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

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
            $this->json(['status' => 'ok', 'message' => 'Đăng ký thành công'], 201);
        }

        $this->json(['status' => 'error', 'message' => 'Đăng ký thất bại, vui lòng thử lại!'], 500);
    }

    /** ------------------------------
     * LOGOUT (JSON)
     * ------------------------------ */
    public function apiLogout(): void
    {
        // Xoá session hiện tại
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();

        $this->json(['status' => 'ok', 'message' => 'Đã đăng xuất'], 200);
    }

    // controllers/AuthController.php

    public function apiMe(): void
    {
        if (isset($_SESSION['user'])) {
            $user = $_SESSION['user'];
            $userId = $user['user_id'];

            // Lấy thêm thông tin user_infos từ DB
            require_once __DIR__ . '/../models/UserInfo.php';
            $userInfoModel = new UserInfo();
            $info = $userInfoModel->getUserInfoById($userId);

            $this->json([
                'status' => 'ok',
                'user'   => [
                    'user_id'    => $user['user_id'],
                    'username'   => $user['username'],
                    'email'      => $user['email'],
                    'full_name'  => $info['full_name'] ?? null,
                    'phone'      => $info['phone'] ?? null,
                    'birth_date' => $info['birth_date'] ?? null,
                    'bio'    => $info['bio'] ?? null,
                    'avatar_url' => $info['avatar_url'] ?? null,
                ]
            ], 200);
        } else {
            $this->json([
                'status' => 'error',
                'message' => 'Chưa đăng nhập'
            ], 401);
        }
    }
}