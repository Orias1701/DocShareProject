<?php
// controllers/PostHashtagController.php
require_once __DIR__ . '/../models/PostHashtag.php';
require_once __DIR__ . '/../models/Hashtag.php';

class PostHashtagController
{
    private $postHashtagModel;
    private $hashtagModel;

    public function __construct()
    {
        $this->postHashtagModel = new PostHashtag();
        $this->hashtagModel = new Hashtag();
    }

    // Trả JSON thay vì include view
    public function listByPost($postId)
    {
        if (empty($postId)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Không tìm thấy bài viết'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        $hashtags = $this->postHashtagModel->getPostsByHashtag($postId);
        echo json_encode([
            'status' => 'success',
            'data' => $hashtags
        ], JSON_UNESCAPED_UNICODE);
    }

    public function getPostsByHashtagId($hashtagId)
    {
        if (empty($hashtagId)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'hashtag_id là bắt buộc'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        $posts = $this->postHashtagModel->getPostsByHashtagId($hashtagId);
        echo json_encode([
            'status' => 'success',
            'data' => $posts
        ], JSON_UNESCAPED_UNICODE);
    }

    public function showCreateForm($postId)
    {
        echo json_encode([
            'status' => empty($postId) ? 'error' : 'success',
            'message' => empty($postId) ? 'Post ID không được cung cấp' : 'OK'
        ], JSON_UNESCAPED_UNICODE);
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode([
                'status' => 'error',
                'message' => 'Phương thức HTTP không được hỗ trợ'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $postId = filter_var($_POST['post_id'] ?? null, FILTER_SANITIZE_STRING);
        $hashtagInput = filter_var($_POST['hashtag_name'] ?? null, FILTER_SANITIZE_STRING);

        if (empty($postId) || empty($hashtagInput)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Thiếu post_id hoặc hashtag_name'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $hashtags = array_filter(array_map('trim', explode(',', $hashtagInput)));

        foreach ($hashtags as $hashtag) {
            if (!preg_match('/^#[a-zA-Z0-9_]+$/', $hashtag)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => "Hashtag '$hashtag' không hợp lệ"
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
        }

        try {
            foreach ($hashtags as $hashtag) {
                $this->postHashtagModel->createHashtagToPost($postId, $hashtag);
            }
            echo json_encode([
                'status' => 'success',
                'message' => 'Đã thêm hashtag',
                'post_id' => $postId,
                'hashtags' => $hashtags
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function showEditForm($postId, $oldHashtagId)
    {
        $allHashtags = $this->hashtagModel->getAllHashtags();
        echo json_encode([
            'status' => 'success',
            'data' => $allHashtags
        ], JSON_UNESCAPED_UNICODE);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $postId = $_POST['post_id'] ?? null;
            $oldHashtagId = $_POST['old_hashtag_id'] ?? null;
            $newHashtagId = $_POST['new_hashtag_id'] ?? null;

            if ($postId && $oldHashtagId && $newHashtagId) {
                $this->postHashtagModel->updateHashtagForPost($postId, $oldHashtagId, $newHashtagId);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Cập nhật hashtag thành công',
                    'post_id' => $postId
                ], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ'
                ], JSON_UNESCAPED_UNICODE);
            }
        }
    }

    public function delete()
    {
        $postId = $_GET['post_id'] ?? null;
        $hashtagId = $_GET['hashtag_id'] ?? null;

        if ($postId && $hashtagId) {
            $this->postHashtagModel->deleteHashtagFromPost($postId, $hashtagId);
            echo json_encode([
                'status' => 'success',
                'message' => 'Xoá hashtag thành công',
                'post_id' => $postId,
                'hashtag_id' => $hashtagId
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ'
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
