<?php
// controllers/UserFollowController.php
require_once __DIR__ . '/../models/UserFollow.php';

class UserFollowController
{
    private $model;

    public function __construct()
    {
        $this->model = new UserFollow();
    }

    private function jsonResponse($status, $data = [])
    {
        echo json_encode(array_merge(['status' => $status], $data));
        exit;
    }

    public function toggleFollow()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse('error', ['message' => 'Chưa đăng nhập']);
        }

        $myUserId = $_SESSION['user_id'];
        $followingId = $_POST['following_id'] ?? null;

        if (!$followingId || $myUserId == $followingId) {
            $this->jsonResponse('error', ['message' => 'Không hợp lệ']);
        }

        $isFollowing = $this->model->isFollowing($myUserId, $followingId);

        if ($isFollowing) {
            $this->model->unfollow($myUserId, $followingId);
            $isFollowing = false;
        } else {
            $this->model->follow($myUserId, $followingId);
            $isFollowing = true;
        }

        $this->jsonResponse('success', ['following' => $isFollowing]);
    }

    public function topFollowedUsers()
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $users = $this->model->getTopFollowedUsers($limit);

        $this->jsonResponse('success', ['data' => $users]);
    }

    // ✅ Danh sách mình đang follow
    public function userFollowing()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse('error', ['message' => 'Chưa đăng nhập']);
        }

        $userId = $_SESSION['user_id'];
        $users = $this->model->getFollowing($userId);

        $this->jsonResponse('success', ['data' => $users]);
    }

    // ✅ Danh sách người đang follow mình
    public function userFollowers()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse('error', ['message' => 'Chưa đăng nhập']);
        }

        $userId = $_SESSION['user_id'];
        $users = $this->model->getFollowers($userId);

        $this->jsonResponse('success', ['data' => $users]);
    }
}
