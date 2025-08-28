<?php
// models/PostReaction.php
require_once __DIR__ . '/../config/Database.php';

class PostReaction {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getByPost($postId) {
        $stmt = $this->pdo->prepare("
            SELECT r.reaction_type, r.created_at, r.user_id, ui.full_name
            FROM post_reactions r
            LEFT JOIN user_infos ui ON r.user_id = ui.user_id
            WHERE r.post_id = :pid
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll();
    }
}
