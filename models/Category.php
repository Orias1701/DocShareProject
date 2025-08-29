<?php
require_once __DIR__ . '/../config/Database.php';

class Category {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function getAllCategories() {
        $stmt = $this->conn->query("SELECT * FROM categories ORDER BY category_id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCategoryById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM categories WHERE category_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCategory($categoryName) {
        // Lấy category_id mới
        $stmt = $this->conn->query("SELECT category_id FROM categories ORDER BY category_id DESC LIMIT 1");
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($last) {
            $num = intval(substr($last['category_id'], 9)) + 1;
        } else {
            $num = 1;
        }
        $newId = "CATEGORY" . str_pad($num, 5, "0", STR_PAD_LEFT);

        $sql = "INSERT INTO categories (category_id, category_name) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$newId, $categoryName]);
    }

    public function updateCategory($id, $categoryName) {
        $sql = "UPDATE categories SET category_name = ? WHERE category_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$categoryName, $id]);
    }

    public function deleteCategory($id) {
        $sql = "DELETE FROM categories WHERE category_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}