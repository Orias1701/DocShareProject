<?php
require_once __DIR__ . '/../config/Database.php';

class PasswordReset
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function createToken($email, $token)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        ");
        return $stmt->execute([$email, $token]);
    }

    public function findByToken($token)
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM password_resets 
            WHERE token = ? AND expires_at > NOW()
        ");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteToken($email)
    {
        $stmt = $this->conn->prepare("DELETE FROM password_resets WHERE email = ?");
        return $stmt->execute([$email]);
    }
}
