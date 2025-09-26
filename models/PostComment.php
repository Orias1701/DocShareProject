<?php
// models/PostComment.php
require_once __DIR__ . '/../config/Database.php';

class PostComment
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    // Lấy comment gốc (parent_id IS NULL) theo post_id
    public function getRootByPost($postId)
    {
        $stmt = $this->pdo->prepare("
            SELECT c.comment_id, c.content, c.created_at, c.user_id, ui.full_name, c.parent_id,ui.avatar_url
            FROM post_comments c
            LEFT JOIN user_infos ui ON c.user_id = ui.user_id
            WHERE c.post_id = :pid AND c.parent_id IS NULL
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([':pid' => $postId]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Debug: Ghi log dữ liệu bình luận gốc
        error_log("getRootByPost(postId=$postId): " . print_r($result, true));
        return $result;
    }

    public function getReplies($parentId)
    {
        error_log("getReplies(parentId=$parentId)");
        if (empty($parentId)) {
            error_log("Error: parentId is empty or NULL");
            return [];
        }

        try {
            $stmt = $this->pdo->prepare("
            SELECT c.comment_id, c.content, c.created_at, c.user_id, ui.full_name, c.parent_id
            FROM post_comments c
            LEFT JOIN user_infos ui ON c.user_id = ui.user_id
            WHERE c.parent_id = :pid
            ORDER BY c.created_at ASC
        ");
            $stmt->bindValue(':pid', $parentId, PDO::PARAM_STR);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return [];
        }
    }

    // Lấy tất cả comment của post (cả gốc và reply)
    public function getAllByPost($postId)
    {
        $stmt = $this->pdo->prepare("
            SELECT c.comment_id, c.content, c.created_at, c.user_id, ui.full_name,
                   COALESCE(c.parent_id, NULL) AS parent_id
            FROM post_comments c
            LEFT JOIN user_infos ui ON c.user_id = ui.user_id
            WHERE c.post_id = ?
            ORDER BY created_at ASC
        ");
        $stmt->execute([$postId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy comment theo ID
    public function getById($commentId)
    {
        $stmt = $this->pdo->prepare("
        SELECT c.comment_id, c.post_id, c.content, c.created_at, c.user_id, ui.full_name,
               COALESCE(c.parent_id, NULL) AS parent_id
        FROM post_comments c
        LEFT JOIN user_infos ui ON c.user_id = ui.user_id
        WHERE c.comment_id = ?
    ");
        $stmt->execute([$commentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // Lấy comment theo user_id
    public function getByUserId($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM post_comments 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tạo comment mới (có thể là reply)
    public function create($commentId, $postId, $userId, $content, $parentId = null)
    {
        $sql = "INSERT INTO post_comments (comment_id, post_id, user_id, content, parent_id) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$commentId, $postId, $userId, $content, $parentId]);
    }

    // Cập nhật comment
    public function update($commentId, $content, $userId)
    {
        $sql = "UPDATE post_comments SET content = ? 
                WHERE comment_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$content, $commentId, $userId]);
    }

    // Xoá comment
    public function delete($commentId, $userId)
    {
        $sql = "DELETE FROM post_comments WHERE comment_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$commentId, $userId]);
    }
}
