<?php
// controllers/CommentController.php
require_once __DIR__ . '/../models/PostComment.php';
require_once __DIR__ . '/../services/IdGenerator.php';

class CommentController
{
    private $postCommentModel;
    private $idGenerator;

    public function __construct()
    {
        $this->postCommentModel = new PostComment();
        $this->idGenerator = new IdGenerator();
    }

    public function getCommentsByPostId($postId)
    {
        error_log("getCommentsByPostId(postId=$postId)");

        $comments = $this->postCommentModel->getRootByPost($postId);
        error_log("Root comments for postId=$postId: " . print_r($comments, true));

        foreach ($comments as &$comment) {
            $comment['replies'] = $this->getRepliesRecursive($comment['comment_id']);
            error_log("Replies for comment_id={$comment['comment_id']}: " . print_r($comment['replies'], true));
        }
        error_log("Comments with replies for postId=$postId: " . print_r($comments, true));

        if (empty($comments)) {
            error_log("No comments found for postId=$postId");
        }

        include __DIR__ . '/../views/postcomment/comments_by_post.php';
    }

    private function getRepliesRecursive($commentId)
    {
        error_log("getRepliesRecursive(commentId=$commentId)");
        $replies = $this->postCommentModel->getReplies($commentId);
        error_log("Replies for commentId=$commentId: " . print_r($replies, true));

        foreach ($replies as &$reply) {
            $reply['replies'] = $this->getRepliesRecursive($reply['comment_id']);
        }

        return $replies;
    }


    public function createComment($postId, $content, $parentId = null)
    {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        if (empty($postId) || empty($content)) {
            echo "Lỗi: post_id hoặc nội dung bình luận không được để trống.";
            exit;
        }

        $userId = $_SESSION['user_id'];

        $postNumber = preg_replace('/[^0-9]/', '', $postId);
        $userNumber = preg_replace('/[^0-9]/', '', $userId);
        $commentNumber = str_pad(rand(1, 99999), 5, "0", STR_PAD_LEFT);

        $newCommentId = $this->idGenerator->generateCommentId($postNumber, $userNumber, $commentNumber);

        $this->postCommentModel->create($newCommentId, $postId, $userId, $content, $parentId);

        header("Location: index.php?action=post_detail&post_id=" . $postId);
        exit;
    }

    // Các hàm updateComment, deleteComment giữ nguyên
    public function updateComment($commentId, $content)
    {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $currentUserId = $_SESSION['user_id'];
        $comment = $this->postCommentModel->getById($commentId);

        if (!$comment) {
            die("Comment không tồn tại");
        }

        if ($comment['user_id'] != $currentUserId) {
            die("Bạn không có quyền sửa comment này");
        }

        $this->postCommentModel->update($commentId, $content, $currentUserId);

        header("Location: index.php?action=post_detail&post_id=" . $comment['post_id']);
        exit;
    }

    public function deleteComment($commentId, $userId)
    {
        return $this->postCommentModel->delete($commentId, $userId);
    }
}
