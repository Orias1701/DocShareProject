<?php
require_once __DIR__ . '/../config/Database.php';

class UserInfo
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAllUserInfos()
    {
        $stmt = $this->conn->query(
            "SELECT 
                u.user_id,
                u.username,
                u.email,
                u.role_id,
                u.created_at,
                u.followers_count,
                ui.full_name,
                ui.avatar_url,
                ui.bio,
                ui.birth_date,
                COUNT(p.post_id) AS total_posts
            FROM users u
            LEFT JOIN user_infos ui ON u.user_id = ui.user_id
            LEFT JOIN albums a ON u.user_id = a.user_id
            LEFT JOIN posts p ON a.album_id = p.album_id
            GROUP BY 
                u.user_id, u.username, u.email, u.role_id, u.created_at, 
                u.followers_count, ui.full_name, ui.avatar_url, ui.bio, ui.birth_date
                "
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserInfoById($userId)
    {
        $stmt = $this->conn->prepare("SELECT ui.*, u.username, u.email FROM user_infos ui JOIN users u ON ui.user_id = u.user_id WHERE ui.user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createUserInfo($userId, $fullName, $avatarUrl, $bio, $birthDate)
    {
        $sql = "INSERT INTO user_infos (user_id, full_name, avatar_url, bio, birth_date) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId, $fullName, $avatarUrl, $bio, $birthDate]);
    }

    public function updateUserInfo($userId, $fullName, $avatarUrl, $bio, $birthDate)
    {
        $sql = "UPDATE user_infos SET full_name = ?, avatar_url = ?, bio = ?, birth_date = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$fullName, $avatarUrl, $bio, $birthDate, $userId]);
    }

    public function deleteUserInfo($userId)
    {
        $sql = "DELETE FROM user_infos WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId]);
    }

    public function getAvailableUserIds()
    {
        $stmt = $this->conn->query("
            SELECT u.user_id, u.username, u.email
            FROM users u
            LEFT JOIN user_infos ui ON u.user_id = ui.user_id
            WHERE ui.user_id IS NULL
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
