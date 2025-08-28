<?php
// models/UserFollow.php
require_once __DIR__ . '/../config/Database.php';

class UserFollow {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getFollowersCount($userId) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) AS cnt FROM user_follows WHERE following_id = :uid");
        $stmt->execute([':uid' => $userId]);
        return (int)$stmt->fetchColumn();
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM user_follows");
        return $stmt->fetchAll();
    }
}
