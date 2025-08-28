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
}
