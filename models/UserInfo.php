<?php
// models/UserInfo.php
require_once __DIR__ . '/../config/Database.php';

class UserInfo {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM user_infos");
        return $stmt->fetchAll();
    }

    public function getByUserId($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM user_infos WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetch();
    }
}
