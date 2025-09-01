<?php
// controllers/PostHashtagController.php
require_once __DIR__ . '/../models/PostHashtag.php';
require_once __DIR__ . '/../models/Hashtag.php';

class PostHashtagController {
    private $postHashtagModel;
    private $hashtagModel;

    public function __construct() {
        $this->postHashtagModel = new PostHashtag();
        $this->hashtagModel = new Hashtag();
    }

    // Hiển thị danh sách hashtag của một bài post
    public function listByPost($postId) {
        $hashtags = $this->postHashtagModel->getPostsByHashtag($postId);
        if ($postId) {
            include __DIR__ . '/../views/post_hashtag/list.php';
        } else {
            echo "Lỗi: Không tìm thấy bài viết.";
        }
    }
      public function getPostsByHashtagId($hashtagId) {
        $posts = $this->postHashtagModel->getPostsByHashtagId($hashtagId);

        // Gửi dữ liệu sang view
        include __DIR__ . '/../views/post_hashtag/posts_by_hashtag.php';
    }

    // Hiển thị form để thêm hashtag cho một bài post
    public function showCreateForm($postId) {
        include __DIR__ . '/../views/post_hashtag/create.php';
    }

    // Xử lý logic thêm hashtag cho post
    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $postId = $_POST['post_id'] ?? null;
            $hashtagName = $_POST['hashtag_name'] ?? null;

            if ($postId && $hashtagName) {
                $hashtagId = $this->hashtagModel->findOrCreateHashtag($hashtagName);
                if ($hashtagId) {
                    $this->postHashtagModel->createHashtagToPost($postId, $hashtagId);
                }
                header("Location: index.php?action=list_post_hashtags&post_id=$postId");
                exit;
            } else {
                echo "Lỗi: Dữ liệu không hợp lệ.";
            }
        }
    }
    
    // Hiển thị form để sửa hashtag của một bài post
    public function showEditForm($postId, $oldHashtagId) {
        $allHashtags = $this->hashtagModel->getAllHashtags();
        include __DIR__ . '/../views/post_hashtag/edit.php';
    }

    // Xử lý logic cập nhật hashtag
    public function update() {
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
    public function delete() {
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
