<?php
// models/Category.php
require_once __DIR__ . '/../config/Database.php';

class Category {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM categories WHERE category_id = :cid");
        $stmt->execute([':cid' => $id]);
        return $stmt->fetch();
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM categories");
        return $stmt->fetchAll();
    }
}
