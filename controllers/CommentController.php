<?php
// controllers/CommentController.php
require_once __DIR__ . '/../models/PostComment.php';
require_once __DIR__ . '/../services/IdGenerator.php';

class CommentController {
    private $postCommentModel;
    private $idGenerator;

    public function __construct() {
        $this->postCommentModel = new PostComment();
        $this->idGenerator = new IdGenerator();
    }

    // Hiển thị comment theo post
    public function getCommentsByPostId($postId) {
        $comments = $this->postCommentModel->getByPost($postId);
        include __DIR__ . '/../views/postcomment/comments_by_post.php';
    }

    // Tạo comment mới
    public function createComment($postId, $content) {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        // Kiểm tra dữ liệu đầu vào
        if (empty($postId) || empty($content)) {
            echo "Lỗi: post_id hoặc nội dung bình luận không được để trống.";
            exit;
        }

        // Lấy user_id từ session
        $userId = $_SESSION['user_id'];

        // Lấy các số từ ID để tạo comment_id
        $postNumber = preg_replace('/[^0-9]/', '', $postId);
        $userNumber = preg_replace('/[^0-9]/', '', $userId);
        $commentNumber = str_pad(rand(1, 99999), 5, "0", STR_PAD_LEFT);
        
        // Sử dụng IdGenerator để tạo comment_id theo format của bạn
        $newCommentId = $this->idGenerator->generateCommentId($postNumber, $userNumber, $commentNumber);

        // Gọi model để lưu comment
        $this->postCommentModel->create($newCommentId, $postId, $userId, $content);

        // redirect về chi tiết post
        header("Location: index.php?action=post_detail&post_id=" . $postId);
        exit;
    }

    // Update
    public function updateComment($commentId, $content) {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $currentUserId = $_SESSION['user_id'];

        // Lấy comment gốc để kiểm tra quyền
        $comment = $this->postCommentModel->getById($commentId);
        if (!$comment) {
            die("Comment không tồn tại");
        }

        // Chỉ cho phép user tạo ra comment mới được sửa
        if ($comment['user_id'] != $currentUserId) {
            die("Bạn không có quyền sửa comment này");
        }

        // Tiến hành update
        $this->postCommentModel->update($commentId, $content, $currentUserId);

        // Redirect về post gốc
        header("Location: index.php?action=post_detail&post_id=" . $comment['post_id']);
        exit;
    }

    // Delete
    public function deleteComment($commentId, $userId) {
        return $this->postCommentModel->delete($commentId, $userId);
    }
}
