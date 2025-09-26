<?php
// controllers/CommentController.php (JSON version)
require_once __DIR__ . '/../models/PostComment.php';
require_once __DIR__ . '/../services/IdGenerator.php';

class CommentController
{
    private $postCommentModel;
    private $idGenerator;

    public function __construct()
    {
        $this->postCommentModel = new PostComment();
        $this->idGenerator      = new IdGenerator();

        // (tuỳ chọn) Bật CORS nếu FE & BE khác origin
        // header("Access-Control-Allow-Origin: https://your-frontend.com");
        // header("Access-Control-Allow-Credentials: true");
        // header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
        // header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT, PATCH");
    }

    /* -------------------- helpers -------------------- */
    private function jsonResponse($data, int $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function requireLogin()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Bạn cần đăng nhập.'
            ], 401);
        }
        return $_SESSION['user_id'];
    }

    /* -------------------- actions -------------------- */

    // GET: list comments by post (nested)
    // Router: ?action=list_comments_by_post&post_id=...
    public function getCommentsByPostId($postId)
    {
        if (empty($postId)) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'BAD_REQUEST',
                'message' => 'Thiếu post_id'
            ], 400);
        }

        // root comments
        $comments = $this->postCommentModel->getRootByPost($postId);

        // build nested recursively
        foreach ($comments as &$comment) {
            $comment['replies'] = $this->getRepliesRecursive($comment['comment_id']);
        }

        $this->jsonResponse([
            'ok' => true,
            'data' => $comments
        ], 200);
    }

    private function getRepliesRecursive($commentId)
    {
        $replies = $this->postCommentModel->getReplies($commentId);
        foreach ($replies as &$reply) {
            $reply['replies'] = $this->getRepliesRecursive($reply['comment_id']);
        }
        return $replies;
    }

    // POST: create comment (support parent_id cho reply)
    // Router: ?action=create_comment
    // body: post_id, content, (optional) parent_id
    public function createComment($postId, $content, $parentId = null)
    {
        $userId = $this->requireLogin();

        $postId  = trim((string)$postId);
        $content = trim((string)$content);
        $parentId = $parentId !== null && $parentId !== '' ? trim((string)$parentId) : null;

        if ($postId === '' || $content === '') {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'BAD_REQUEST',
                'message' => 'post_id hoặc content không được trống'
            ], 400);
        }

        // tạo comment_id theo quy tắc cũ
        $postNumber    = preg_replace('/[^0-9]/', '', $postId);
        $userNumber    = preg_replace('/[^0-9]/', '', $userId);
        $commentNumber = str_pad(rand(1, 99999), 5, "0", STR_PAD_LEFT);
        $newCommentId  = $this->idGenerator->generateCommentId($postNumber, $userNumber, $commentNumber);

        $ok = $this->postCommentModel->create($newCommentId, $postId, $userId, $content, $parentId);

        if (!$ok) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'CREATE_FAILED',
                'message' => 'Không lưu được comment'
            ], 500);
        }

        // Trả lại object cơ bản (tuỳ BE có getById thì gọi lại)
        $created = [
            'comment_id' => $newCommentId,
            'post_id'    => $postId,
            'user_id'    => $userId,
            'content'    => $content,
            'parent_id'  => $parentId,
        ];

        $this->jsonResponse([
            'ok' => true,
            'data' => $created
        ], 201);
    }

    // POST: update comment
    // Router: ?action=update_comment
    // body: comment_id, content
    public function updateComment($commentId, $content)
    {
        $currentUserId = $this->requireLogin();

        $commentId = trim((string)$commentId);
        $content   = trim((string)$content);

        if ($commentId === '' || $content === '') {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'BAD_REQUEST',
                'message' => 'Thiếu comment_id hoặc content'
            ], 400);
        }

        $comment = $this->postCommentModel->getById($commentId);
        if (!$comment) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'NOT_FOUND',
                'message' => 'Comment không tồn tại'
            ], 404);
        }

        if ($comment['user_id'] != $currentUserId) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'FORBIDDEN',
                'message' => 'Bạn không có quyền sửa comment này'
            ], 403);
        }

        $ok = $this->postCommentModel->update($commentId, $content, $currentUserId);
        if (!$ok) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'UPDATE_FAILED',
                'message' => 'Không cập nhật được comment'
            ], 500);
        }

        $this->jsonResponse([
            'ok' => true,
            'data' => [
                'comment_id' => $commentId,
                'content'    => $content
            ]
        ], 200);
    }

    // DELETE/GET/POST: delete comment
    // Router hiện tại: ?action=delete_comment&id=...
    // Trả JSON thay vì redirect
    public function deleteComment($commentId, $userId)
    {
        $currentUserId = $this->requireLogin();

        // Nếu router cũ vẫn truyền $userId từ ngoài, ưu tiên session
        $userId = $currentUserId;

        $commentId = trim((string)$commentId);
        if ($commentId === '') {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'BAD_REQUEST',
                'message' => 'Thiếu comment_id'
            ], 400);
        }

        // (Tuỳ BE) có thể kiểm tra quyền sở hữu trước khi xóa:
        $comment = $this->postCommentModel->getById($commentId);
        if (!$comment) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'NOT_FOUND',
                'message' => 'Comment không tồn tại'
            ], 404);
        }
        if ($comment['user_id'] != $userId) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'FORBIDDEN',
                'message' => 'Bạn không có quyền xóa comment này'
            ], 403);
        }

        $ok = $this->postCommentModel->delete($commentId, $userId);
        if (!$ok) {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'DELETE_FAILED',
                'message' => 'Không xóa được comment'
            ], 500);
        }

        $this->jsonResponse([
            'ok' => true,
            'data' => ['deleted' => true, 'comment_id' => $commentId]
        ], 200);
    }
    public function countCommentsByPostId($postId)
    {
        $postId = trim((string)$postId);
        if ($postId === '') {
            $this->jsonResponse([
                'ok' => false,
                'error' => 'BAD_REQUEST',
                'message' => 'Thiếu post_id'
            ], 400);
        }

        $count = $this->postCommentModel->countByPost($postId);

        $this->jsonResponse([
            'ok'   => true,
            'data' => [ 'post_id' => $postId, 'count' => $count ]
        ], 200);
    }
}
