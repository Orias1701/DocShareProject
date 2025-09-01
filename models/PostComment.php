<?php
// models/PostComment.php
require_once __DIR__ . '/../config/Database.php';

class PostComment {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getByPost($postId) {
        $stmt = $this->pdo->prepare("
            SELECT c.comment_id, c.content, c.created_at, c.user_id, ui.full_name
            FROM post_comments c
            LEFT JOIN user_infos ui ON c.user_id = ui.user_id
            WHERE c.post_id = :pid
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll();
    }
     public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM post_comments ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy comment theo ID
    public function getById($commentId) {
        $stmt = $this->pdo->prepare("SELECT * FROM post_comments WHERE comment_id = ?");
        $stmt->execute([$commentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
     // Lấy comment theo user_id
    public function getByUserId($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM post_comments WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tạo comment mới
    public function create($commentId, $postId, $userId, $content) {
        $sql = "INSERT INTO post_comments (comment_id, post_id, user_id, content) VALUES (?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$commentId, $postId, $userId, $content]);
    }

    // Cập nhật comment
    public function update($commentId, $content, $userId) {
        $sql = "UPDATE post_comments SET content = ? 
                WHERE comment_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$content, $commentId, $userId]);
    }

    // Xoá comment
    public function delete($commentId, $userId) {
        $sql = "DELETE FROM post_comments WHERE comment_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$commentId, $userId]);
    }
}
