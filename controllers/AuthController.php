<?php
// controllers/AuthController.php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/PasswordReset.php';
require_once __DIR__ . '/../vendor/MailerService.php';



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
            $_SESSION['role_id'] = $user['role_id'];
            $_SESSION['user'] = [
                'user_id'   => $user['user_id'],
                'username'  => $user['username'],
                'email'     => $user['email'],
                'full_name' => $user['full_name'] ?? null,
                'avatar_url' => $user['avatar_url'] ?? null,
                'role_id'   => $user['role_id'],
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
            "ROLE011",   // role mặc định
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
                    'role_id'   => $user['role_id'],
                ]
            ], 200);
        } else {
            $this->json([
                'status' => 'error',
                'message' => 'Chưa đăng nhập'
            ], 401);
        }
    }
    function isAdmin()
    {
        // Set header để trình duyệt hiểu đây là response JSON
        header('Content-Type: application/json');

        $response = [];

        // Nếu session user_id không tồn tại, chắc chắn không phải admin
        if (!isset($_SESSION['user_id'])) {
            $response = [
                'status' => 'error',
                'isAdmin' => false,
                'message' => 'No user logged in.',
                'debug' => [
                    'session_user_id' => $_SESSION['user_id'] ?? null,
                    'session_data' => $_SESSION
                ]
            ];
        } else {
            $roleId = $_SESSION['user']['role_id'] ?? null;

            $response = [
                'status' => 'ok',
                'isAdmin' => $roleId === 'ROLE000',
                'roleId' => $roleId,
                'session_user' => $_SESSION['user_id'], // in chi tiết user
                'session_data' => $_SESSION, // in toàn bộ session để debug
                'message' => $roleId === 'ROLE000'
                    ? 'User is an administrator.'
                    : 'Access denied. User does not have administrator privileges.'
            ];
        }

        // trả về JSON
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }


    public function requireAdmin(): void
    {
        if (!$this->isAdmin()) {
            http_response_code(403);
            $this->json(['status' => 'error', 'message' => 'Chỉ admin mới được phép truy cập'], 403);
        }
    }
    public function deleteAccount(): void
    {
        // Hỗ trợ DELETE hoặc POST + X-HTTP-Method-Override: DELETE
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $override = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '');
        $isDelete = ($method === 'DELETE') || ($method === 'POST' && $override === 'DELETE');
        if (!$isDelete) {
            $this->json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        // Phải đăng nhập
        if (empty($_SESSION['user_id'])) {
            $this->json(['status' => 'error', 'message' => 'Chưa đăng nhập'], 401);
        }

        // Lấy role từ session (ưu tiên root, fallback từ $_SESSION['user'])
        $role = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
        if ($role !== 'ROLE000') {
            $this->json(['status' => 'error', 'message' => 'Chỉ admin mới có quyền xoá tài khoản'], 403);
        }

        // Đọc user_id mục tiêu từ JSON body hoặc ?id=...
        $raw  = file_get_contents('php://input') ?: '';
        $data = json_decode($raw, true);
        $targetId = $data['user_id'] ?? ($_GET['id'] ?? '');

        // Nếu không truyền → mặc định xoá chính admin đang đăng nhập
        if ($targetId === '' || $targetId === null) {
            $targetId = (string)($_SESSION['user_id'] ?? '');
        }

        // Nếu vẫn rỗng → báo lỗi
        if ($targetId === '') {
            $this->json(['status' => 'error', 'message' => 'Thiếu user_id'], 400);
        }

        // (Khuyến nghị) Không cho xoá admin khác
        if (method_exists($this->userModel, 'getRoleById')) {
            $targetRole = $this->userModel->getRoleById($targetId); // nên trả 'ROLE000'/'ROLE001'
            if ($targetRole === 'ROLE000' && $targetId !== (string)$_SESSION['user_id']) {
                $this->json(['status' => 'error', 'message' => 'Không thể xoá tài khoản admin khác'], 403);
            }
        }

        // Thực hiện xoá (CHÚ Ý: deleteUser phải nhận string ID)
        $deleted = $this->userModel->deleteUser($targetId);

        if ($deleted) {
            // Nếu xoá chính mình → huỷ session
            if ($targetId === (string)$_SESSION['user_id']) {
                $_SESSION = [];
                if (ini_get('session.use_cookies')) {
                    $p = session_get_cookie_params();
                    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
                }
                session_destroy();
            }

            $this->json(['status' => 'ok', 'message' => "Đã xoá tài khoản #{$targetId}"], 200);
        }

        $this->json(['status' => 'error', 'message' => 'Xoá tài khoản thất bại, vui lòng thử lại!'], 500);
    }
    // ===== Thêm vào trong class AuthController =====
    public function updateAccount(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        // Chỉ ADMIN
        $roleSession = $_SESSION['user']['role_id'] ?? $_SESSION['role_id'] ?? null;
        if ($roleSession !== 'ROLE000') {
            $this->json(['status' => 'error', 'message' => 'Chỉ ADMIN mới có quyền cập nhật tài khoản!'], 403);
        }

        $body = (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false)
            ? $this->readJsonBody()
            : $_POST;

        $user_id     = $body['user_id']      ?? null;
        $email       = $body['email']        ?? null;
        $newPassword = $body['new_password'] ?? null;
        $role_id     = $body['role_id']      ?? null;

        if (!$user_id) {
            $this->json(['status' => 'error', 'message' => 'Thiếu user_id'], 400);
        }
        if ($email === null && $newPassword === null && $role_id === null) {
            $this->json(['status' => 'error', 'message' => 'Không có dữ liệu để cập nhật'], 400);
        }

        $res = $this->userModel->adminUpdateAccount($user_id, $email, $newPassword, $role_id);

        $this->json($res, $res['status'] === 'ok' ? 200 : 400);
    }

    /** ------------------------------
     *  📧 FORGOT PASSWORD (Gửi link qua email)
     *  Endpoint: POST /api/auth/forgot-password
     *  Body JSON: { "email": "user@gmail.com" }
     * ------------------------------ */
    public function apiForgotPassword(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        $body = $this->readJsonBody();
        $email = trim($body['email'] ?? '');

        if ($email === '') {
            $this->json(['status' => 'error', 'message' => 'Thiếu email'], 400);
        }

        $user = $this->userModel->getByEmail($email);
        if (!$user) {
            $this->json(['status' => 'error', 'message' => 'Không tìm thấy người dùng với email này!'], 404);
        }

        // 🔹 Tạo token reset mật khẩu
        $resetModel = new PasswordReset();
        $token = bin2hex(random_bytes(32));
        $resetModel->createToken($email, $token);

        // 🔹 Tạo đường dẫn khôi phục (link gửi về email)
        $link = "http://localhost:5173/reset-password?token={$token}";

        // 🔹 Soạn email
        $subject = "Đặt lại mật khẩu của bạn";
        $message = "Xin chào {$user['username']},\n\n"
            . "Bấm vào đường dẫn sau để đặt lại mật khẩu (hết hạn sau 30 phút):\n{$link}\n\n"
            . "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.";

        // 🔹 Gửi email thật bằng PHPMailer
        $sent = MailerService::sendMail($email, $subject, $message);

        if ($sent) {
            $this->json([
                'status' => 'ok',
                'message' => 'Email đặt lại mật khẩu đã được gửi đến hộp thư của bạn (hết hạn sau 30 phút).'
            ]);
        } else {
            // Nếu lỗi gửi email → trả về link giả lập để test nhanh
            $this->json([
                'status' => 'error',
                'message' => 'Không gửi được email, vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.',
                'reset_link_debug' => $link
            ]);
        }
    }

    public function apiResetPassword(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
        }

        $body = $this->readJsonBody();
        $token = trim($body['token'] ?? '');
        $newPassword = (string)($body['new_password'] ?? '');

        if ($token === '' || $newPassword === '') {
            $this->json(['status' => 'error', 'message' => 'Thiếu token hoặc mật khẩu mới'], 400);
        }

        // ✅ Kiểm tra token trong bảng password_resets
        $resetModel = new PasswordReset();
        $resetData = $resetModel->findByToken($token);

        if (!$resetData) {
            $this->json(['status' => 'error', 'message' => 'Token không hợp lệ hoặc đã hết hạn'], 400);
        }

        // ✅ Lấy email từ token và cập nhật mật khẩu mới
        $email = $resetData['email'];
        $hashed = password_hash($newPassword, PASSWORD_BCRYPT);

        $conn = Database::getConnection();
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->execute([$hashed, $email]);

        // ✅ Xoá token sau khi dùng
        $resetModel->deleteToken($email);

        // ✅ Trả JSON phản hồi
        $this->json([
            'status' => 'ok',
            'message' => 'Mật khẩu của bạn đã được cập nhật thành công!'
        ]);
    }
}
