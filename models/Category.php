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
        // 1. Lấy ID cuối cùng từ database
        $stmt = $this->conn->query("SELECT category_id FROM categories ORDER BY category_id DESC LIMIT 1");
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. Trích xuất phần số từ ID cuối cùng
        $lastNumber = $last ? intval(substr($last['category_id'], strlen('CATEGORY'))) : 0;

        // 3. Khởi tạo IdGenerator và sử dụng nó để tạo ID mới
        $idGenerator = new IdGenerator();
        $newId = $idGenerator->generateCategoryId($lastNumber);

        // 4. Thực thi câu lệnh INSERT
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