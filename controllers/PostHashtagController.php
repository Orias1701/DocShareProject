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

    // Hiển thị danh sách hashtag của một bài post
    public function listByPost($postId)
    {
        $hashtags = $this->postHashtagModel->getPostsByHashtag($postId);
        if ($postId) {
            include __DIR__ . '/../views/post_hashtag/list.php';
        } else {
            echo "Lỗi: Không tìm thấy bài viết.";
        }
    }
    public function getPostsByHashtagId($hashtagId)
    {
        $posts = $this->postHashtagModel->getPostsByHashtagId($hashtagId);

        // Gửi dữ liệu sang view
        include __DIR__ . '/../views/post_hashtag/posts_by_hashtag.php';
    }

    // Hiển thị form để thêm hashtag cho một bài post
    public function showCreateForm($postId)
    {
        if (empty($postId)) {
            $message = "Lỗi: Post ID không được cung cấp!";
            include __DIR__ . '/../views/post_hashtag/create.php';
            return;
        }
        $message = '';
        include __DIR__ . '/../views/post_hashtag/create.php';
    }

    public function create()
    {
        $message = '';

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $message = "Lỗi: Phương thức HTTP không được hỗ trợ!";
            include __DIR__ . '/../views/post_hashtag/create.php';
            return;
        }

        $postId = filter_var($_POST['post_id'] ?? null, FILTER_SANITIZE_STRING);
        $hashtagName = filter_var($_POST['hashtag_name'] ?? null, FILTER_SANITIZE_STRING);

        if (empty($postId) || empty($hashtagName)) {
            $message = "Lỗi: Vui lòng nhập đầy đủ Post ID và tên hashtag.";
            include __DIR__ . '/../views/post_hashtag/create.php';
            return;
        }

        if (!preg_match('/^#[a-zA-Z0-9_]+$/', $hashtagName)) {
            $message = "Lỗi: Hashtag phải bắt đầu bằng # và chỉ chứa chữ cái, số, hoặc dấu gạch dưới!";
            include __DIR__ . '/../views/post_hashtag/create.php';
            return;
        }

        try {
            $this->postHashtagModel->createHashtagToPost($postId, $hashtagName);
            header("Location: index.php?action=list_post_hashtags&post_id=" . urlencode($postId));
            exit;
        } catch (Exception $e) {
            $message = "Lỗi: " . $e->getMessage();
            include __DIR__ . '/../views/post_hashtag/create.php';
        }
    }
    // Xử lý yêu cầu

    // Hiển thị form để sửa hashtag của một bài post
    public function showEditForm($postId, $oldHashtagId)
    {
        $allHashtags = $this->hashtagModel->getAllHashtags();
        include __DIR__ . '/../views/post_hashtag/edit.php';
    }

    // Xử lý logic cập nhật hashtag
    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $postId = $_POST['post_id'] ?? null;
            $oldHashtagId = $_POST['old_hashtag_id'] ?? null;
            $newHashtagId = $_POST['new_hashtag_id'] ?? null;

            if ($postId && $oldHashtagId && $newHashtagId) {
                $this->postHashtagModel->updateHashtagForPost($postId, $oldHashtagId, $newHashtagId);
                header("Location: index.php?action=list_post_hashtags&post_id=$postId");
                exit;
            } else {
                echo "Lỗi: Dữ liệu không hợp lệ.";
            }
        }
    }

    // Xử lý logic xóa hashtag
    public function delete()
    {
        $postId = $_GET['post_id'] ?? null;
        $hashtagId = $_GET['hashtag_id'] ?? null;

        if ($postId && $hashtagId) {
            $this->postHashtagModel->deleteHashtagFromPost($postId, $hashtagId);
            header("Location: index.php?action=list_post_hashtags&post_id=$postId");
            exit;
        } else {
            echo "Lỗi: Dữ liệu không hợp lệ.";
        }
    }
}
