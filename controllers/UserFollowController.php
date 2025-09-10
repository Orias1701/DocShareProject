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

    public function toggleFollow()
    {
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Chưa đăng nhập']);
            exit;
        }

        $myUserId = $_SESSION['user_id'];
        $followingId = $_POST['following_id'] ?? null;

        if (!$followingId || $myUserId === $followingId) {
            echo json_encode(['status' => 'error', 'message' => 'Không hợp lệ']);
            exit;
        }

        $ufModel = new UserFollow();

        $isFollowing = $ufModel->isFollowing($myUserId, $followingId);
        if ($isFollowing) {
            $ufModel->unfollow($myUserId, $followingId);
            $isFollowing = false;
        } else {
            $ufModel->follow($myUserId, $followingId);
            $isFollowing = true;
        }

        echo json_encode(['status' => 'success', 'following' => $isFollowing]);
        exit;
    }

    public function topFollowedUsers()
    {
        $limit = $_GET['limit'] ?? 10; // cho phép truyền limit qua query string
        $users = $this->model->getTopFollowedUsers((int)$limit);

        echo json_encode([
            'status' => 'success',
            'data'   => $users
        ]);
        exit;
    }
}
