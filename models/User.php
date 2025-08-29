<?php
require_once __DIR__ . '/../config/Database.php';

class User {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function getByEmail($email) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createUser($username, $email, $password, $role_id = "ROLE_USER") {
        // Lấy user_id mới: USER + 12 chữ số
        $stmt = $this->conn->query("SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1");
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($last) {
            $num = intval(substr($last['user_id'], 4)) + 1; // bỏ "USER"
        } else {
            $num = 1;
        }
        $newId = "USER" . str_pad($num, 10, "0", STR_PAD_LEFT);

        // Thêm user
        $sql = "INSERT INTO users (user_id, username, email, password, role_id) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$newId, $username, $email, $password, $role_id]);
    }
}
