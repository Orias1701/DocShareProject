<?php
// controllers/UserFollowController.php
require_once __DIR__ . '/../models/UserFollow.php';

class UserFollowController
{
    private $model;

    public function __construct()
    {
        // Bật session ở entry point (index.php). Nếu cần ở đây:
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->model = new UserFollow();
    }

    private function jsonResponse($status, $payload = [], $httpCode = 200)
    {
        // Dọn mọi output (tránh BOM/space/notice)
        if (ob_get_length()) { ob_clean(); }

        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');

        // Chuẩn hoá schema cố định
        $body = [
            'status' => $status, // 'success' | 'error'
            'data'   => $payload, // luôn đặt dữ liệu trong data
        ];
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function toggleFollow()
    {
        if (!isset($_SESSION['user_id'])) {
            respond_json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $followerId = $_SESSION['user_id'];
        $followingId = $_POST['user_id'] ?? $_GET['user_id'] ?? null;

        if (!$followingId) {
            respond_json(['status' => 'error', 'message' => 'Missing user_id'], 422);
        }

        try {
            $ufModel = new UserFollow();
            $isFollowing = $ufModel->isFollowing($followerId, $followingId);

            if ($isFollowing) {
                $ufModel->unfollow($followerId, $followingId);
                respond_json(['status' => 'success', 'action' => 'unfollowed']);
            } else {
                $ufModel->follow($followerId, $followingId);
                respond_json(['status' => 'success', 'action' => 'followed']);
            }
        } catch (Exception $e) {
            respond_json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }


    public function topFollowedUsers()
    {
        try {
            $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
            $users = $this->model->getTopFollowedUsers($limit);
            return $this->jsonResponse('success', $users);
        } catch (Throwable $e) {
            error_log('[topFollowedUsers] '.$e->getMessage());
            return $this->jsonResponse('error', ['message' => 'Lỗi máy chủ'], 500);
        }
    }

    public function userFollowing()
    {
        try {
            if (!isset($_SESSION['user_id'])) {
                return $this->jsonResponse('error', ['message' => 'Chưa đăng nhập'], 401);
            }
            $userId = (string) $_SESSION['user_id'];
            $users  = $this->model->getFollowing($userId);
            return $this->jsonResponse('success', $users);
        } catch (Throwable $e) {
            error_log('[userFollowing] '.$e->getMessage());
            return $this->jsonResponse('error', ['message' => 'Lỗi máy chủ'], 500);
        }
    }

    public function userFollowers()
    {
        try {
            if (!isset($_SESSION['user_id'])) {
                return $this->jsonResponse('error', ['message' => 'Chưa đăng nhập'], 401);
            }
            $userId = (string) $_SESSION['user_id'];
            $users  = $this->model->getFollowers($userId);
            return $this->jsonResponse('success', $users);
        } catch (Throwable $e) {
            error_log('[userFollowers] '.$e->getMessage());
            return $this->jsonResponse('error', ['message' => 'Lỗi máy chủ'], 500);
        }
    }
}
// Không đóng tag PHP để tránh BOM/space
