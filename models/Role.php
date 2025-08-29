<?php
require_once __DIR__ . '/../config/Database.php';

class Role {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function getAllRoles() {
        $stmt = $this->conn->query("SELECT * FROM roles ORDER BY role_id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRoleById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM roles WHERE role_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRole($roleName) {
        // Lấy role_id mới: dựa trên comment ROLE000 -> ROLE011, giả định là tăng dần
        // Đây là ví dụ, bạn có thể muốn logic tạo ID phức tạp hơn
        $stmt = $this->conn->query("SELECT role_id FROM roles ORDER BY role_id DESC LIMIT 1");
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($last) {
            $lastNum = intval(substr($last['role_id'], 4)); // Lấy '011' từ 'ROLE011'
            $newNum = $lastNum + 1;
        } else {
            $newNum = 0; // Bắt đầu từ ROLE000
        }
        $newId = "ROLE" . str_pad($newNum, 3, "0", STR_PAD_LEFT);


        $sql = "INSERT INTO roles (role_id, role_name) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$newId, $roleName]);
    }

    public function updateRole($id, $roleName) {
        $sql = "UPDATE roles SET role_name = ? WHERE role_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$roleName, $id]);
    }

    public function deleteRole($id) {
        // Cân nhắc xử lý các ràng buộc khóa ngoại nếu role này đang được sử dụng bởi users
        $sql = "DELETE FROM roles WHERE role_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}