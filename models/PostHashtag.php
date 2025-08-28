<?php
// models/PostHashtag.php
require_once __DIR__ . '/../config/Database.php';

class PostHashtag {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getHashtagsByPost($postId) {
        $stmt = $this->pdo->prepare("
            SELECT h.hashtag_id, h.hashtag_name
            FROM post_hashtags ph
            JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
            WHERE ph.post_id = :pid
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll();
    }
}
