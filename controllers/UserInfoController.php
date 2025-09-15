<?php
require_once __DIR__ . '/../models/UserInfo.php';
require_once __DIR__ . '/../models/User.php';

class UserInfoController {
    private $userInfoModel;
    private $userModel;

    public function __construct() {
        $this->userInfoModel = new UserInfo();
        $this->userModel = new User();
    }

    /** -------- Helpers -------- */
    private function respondJson($payload, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function respondError(string $message, int $code = 400, array $extra = []): void {
        $this->respondJson(array_merge([
            'status'  => 'error',
            'message' => $message,
        ], $extra), $code);
    }

    private function requireMethod(string $method): void {
        if (strcasecmp($_SERVER['REQUEST_METHOD'] ?? '', $method) !== 0) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => $method]);
        }
    }

    /** -------- API endpoints (JSON) -------- */

    // GET /?action=list_user_infos
    public function listUserInfos() {
        $infos = $this->userInfoModel->getAllUserInfos();
        $this->respondJson([
            'status' => 'ok',
            'data'   => $infos,
        ]);
    }

    // GET /?action=show_create_form  -> trả về các user còn trống user_info (nếu bạn còn dùng)
    public function showCreateForm() {
        $availableUsers = $this->userInfoModel->getAvailableUserIds();
        $this->respondJson([
            'status' => 'ok',
            'data'   => [ 'availableUsers' => $availableUsers ],
        ]);
    }

    // POST /?action=create_user_info
    public function create() {
        $this->requireMethod('POST');

        $userId    = $_POST['user_id'] ?? null;
        $fullName  = $_POST['full_name'] ?? null;
        $bio       = $_POST['bio'] ?? null;
        $birthDate = $_POST['birth_date'] ?? null;

        if (!$userId || !$fullName) {
            $this->respondError('Thiếu user_id hoặc full_name', 422);
        }

        // Upload avatar (nếu có)
        $avatarUrl = null;
        if (!empty($_FILES['avatar']['tmp_name'])) {
            try {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload     = $cloudinary->uploadApi()->upload($_FILES['avatar']['tmp_name']);
                $avatarUrl  = $upload['secure_url'] ?? null;
            } catch (\Throwable $e) {
                $this->respondError('Upload avatar thất bại', 500, ['detail' => $e->getMessage()]);
            }
        }

        try {
            $this->userInfoModel->createUserInfo($userId, $fullName, $avatarUrl, $bio, $birthDate);
            $created = $this->userInfoModel->getUserInfoById($userId);
            $this->respondJson([
                'status' => 'ok',
                'data'   => $created,
            ], 201);
        } catch (\Throwable $e) {
            $this->respondError('Tạo user info thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    // GET /?action=show_edit_form&id=123  -> trả về dữ liệu hiện tại (nếu còn dùng)
    public function showEditForm() {
        $userId = $_GET['id'] ?? null;
        if (!$userId) $this->respondError('Thiếu id', 422);

        $userInfo = $this->userInfoModel->getUserInfoById($userId);
        if (!$userInfo) $this->respondError('Người dùng không tồn tại', 404);

        $this->respondJson([
            'status' => 'ok',
            'data'   => $userInfo,
        ]);
    }

    // POST /?action=update_user_info
    public function update() {
        $this->requireMethod('POST');
    
        $userId    = $_POST['user_id'] ?? null;
        $fullName  = $_POST['full_name'] ?? null;
        $bio       = $_POST['bio'] ?? null;
        $birthDate = $_POST['birth_date'] ?? null;
    
        if (!$userId || !$fullName) {
            $this->respondError('Thiếu user_id hoặc full_name', 422);
        }
    
        // Chuẩn hoá birthDate rỗng về null
        if ($birthDate === '') $birthDate = null;
    
        $userInfo = $this->userInfoModel->getUserInfoById($userId);
        if (!$userInfo) {
            $this->respondError('Người dùng không tồn tại', 404);
        }
    
        $avatarUrl = $userInfo['avatar_url'] ?? null;
    
        // Upload avatar mới (nếu có)
        if (!empty($_FILES['avatar']['tmp_name'])) {
            try {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload     = $cloudinary->uploadApi()->upload($_FILES['avatar']['tmp_name']);
                if (!empty($upload['secure_url'])) {
                    $avatarUrl = $upload['secure_url'];
                }
            } catch (\Throwable $e) {
                $this->respondError('Upload avatar thất bại', 500, ['detail' => $e->getMessage()]);
            }
        }
    
        // 🔽 PHẦN QUAN TRỌNG: luôn cập nhật + trả JSON chuẩn
        try {
            $this->userInfoModel->updateUserInfo($userId, $fullName, $avatarUrl, $bio, $birthDate);
            $updated = $this->userInfoModel->getUserInfoById($userId);
    
            // Trả JSON thống nhất, để frontend parse được
            $this->respondJson([
                'status' => 'ok',
                'data'   => [
                    'user' => $updated,   // React sẽ lấy fresh profile từ đây
                ],
            ]);
        } catch (\Throwable $e) {
            $this->respondError('Cập nhật user info thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }
    

    // DELETE /?action=delete_user_info&id=123  (nếu khó gửi DELETE, có thể dùng POST)
    public function delete() {
        $userId = $_GET['id'] ?? ($_POST['id'] ?? null);
        if (!$userId) $this->respondError('Thiếu id', 422);

        try {
            $ok = $this->userInfoModel->deleteUserInfo($userId);
            $this->respondJson([
                'status' => 'ok',
                'data'   => [ 'deleted' => (bool)$ok, 'id' => (int)$userId ],
            ]);
        } catch (\Throwable $e) {
            $this->respondError('Xoá user info thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    // GET /?action=show_user_info&id=123
    public function showUserInfo() {
        $userId = $_GET['id'] ?? null;
        if (!$userId) $this->respondError('Thiếu user_id', 422);

        $userInfo = $this->userInfoModel->getUserInfoById($userId);
        if (!$userInfo) $this->respondError('Người dùng không tồn tại', 404);

        // Kiểm tra follow
        $myUserId    = $_SESSION['user_id'] ?? null;
        $isFollowing = false;
        if ($myUserId && (string)$myUserId !== (string)$userId) {
            require_once __DIR__ . '/../models/UserFollow.php';
            $isFollowing = (new UserFollow())->isFollowing($myUserId, $userId);
        }

        $this->respondJson([
            'status' => 'ok',
            'data'   => [
                'user'        => $userInfo,
                'isFollowing' => $isFollowing,
            ],
        ]);
    }
}
