<?php
require_once __DIR__ . '/../models/Bookmark.php';

class BookmarkController
{
    private $model;

    public function __construct()
    {
        $this->model = new Bookmark();
    }

    private function jsonResponse($status, $data = [])
    {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array_merge(['status' => $status], $data));
        exit;
    }

    // Thêm bookmark
    public function create()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse('error', ['message' => 'Chưa đăng nhập']);
        }

        $userId = $_SESSION['user_id'];
        $postId = $_POST['post_id'] ?? null;

        if (!$postId) {
            $this->jsonResponse('error', ['message' => 'Thiếu post_id']);
        }

        $added = $this->model->createBookmark($userId, $postId);

        if ($added) {
            $this->jsonResponse('success', ['message' => 'Đã lưu bookmark']);
        } else {
            $this->jsonResponse('error', ['message' => 'Không thể lưu bookmark']);
        }
    }

    // Xóa bookmark
    public function remove()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse('error', ['message' => 'Chưa đăng nhập']);
        }

        $userId = $_SESSION['user_id'];
        $postId = $_POST['post_id'] ?? null;

        if (!$postId) {
            $this->jsonResponse('error', ['message' => 'Thiếu post_id']);
        }

        $removed = $this->model->removeBookmark($userId, $postId);

        if ($removed) {
            $this->jsonResponse('success', ['message' => 'Đã xóa bookmark']);
        } else {
            $this->jsonResponse('error', ['message' => 'Bookmark không tồn tại']);
        }
    }

    // Lấy danh sách bài đã bookmark
    public function listByUser()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse('error', ['message' => 'Chưa đăng nhập']);
        }

        $userId = $_SESSION['user_id'];
        $bookmarks = $this->model->getBookmarksByUser($userId);

        $this->jsonResponse('success', ['data' => $bookmarks]);
    }
}
