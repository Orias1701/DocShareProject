<?php
require_once __DIR__ . '/../config/Database.php';

class PostReaction {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    // Lấy reaction của user với post
    public function getUserReaction($postId, $userId) {
        $stmt = $this->pdo->prepare("SELECT reaction_type 
                                     FROM post_reactions 
                                     WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$postId, $userId]);
        return $stmt->fetchColumn();
    }

    // Thêm mới reaction
    public function create($postId, $userId, $type) {
        $stmt = $this->pdo->prepare("INSERT INTO post_reactions (post_id, user_id, reaction_type) 
                                     VALUES (?, ?, ?)");
        return $stmt->execute([$postId, $userId, $type]);
    }

    // Cập nhật reaction
    public function update($postId, $userId, $type) {
        $stmt = $this->pdo->prepare("UPDATE post_reactions 
                                     SET reaction_type = ? 
                                     WHERE post_id = ? AND user_id = ?");
        return $stmt->execute([$type, $postId, $userId]);
    }

    // Xóa reaction
    public function delete($postId, $userId) {
        $stmt = $this->pdo->prepare("DELETE FROM post_reactions 
                                     WHERE post_id = ? AND user_id = ?");
        return $stmt->execute([$postId, $userId]);
    }

    // Đếm reaction theo loại
    public function getReactionCounts($postId) {
        $stmt = $this->pdo->prepare("SELECT reaction_type, COUNT(*) as cnt 
                                     FROM post_reactions 
                                     WHERE post_id = ? 
                                     GROUP BY reaction_type");
        $stmt->execute([$postId]);
        return $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    }
}
