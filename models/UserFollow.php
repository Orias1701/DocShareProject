<?php
// models/UserFollow.php
require_once __DIR__ . '/../config/Database.php';

class UserFollow
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function isFollowing($followerId, $followingId)
    {
        $stmt = $this->pdo->prepare("SELECT 1 FROM user_follows WHERE follower_id=? AND following_id=?");
        $stmt->execute([$followerId, $followingId]);
        return (bool)$stmt->fetch();
    }

    public function follow($followerId, $followingId)
{
    if ($followerId === $followingId) {
        throw new Exception('Không thể tự theo dõi chính mình');
    }

    $this->pdo->beginTransaction();
    try {
        // chèn quan hệ, nếu đã tồn tại thì bỏ qua
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO user_follows (follower_id, following_id) VALUES (?, ?)
        ");
        $stmt->execute([$followerId, $followingId]);

        // chỉ tăng nếu thực sự có dòng mới được chèn
        if ($stmt->rowCount() > 0) {
            $update = $this->pdo->prepare("
                UPDATE users
                SET followers_count = followers_count + 1
                WHERE user_id = ?
            ");
            $update->execute([$followingId]);
        }

        $this->pdo->commit();
    } catch (Exception $e) {
        $this->pdo->rollBack();
        throw $e;
    }
}

public function unfollow($followerId, $followingId)
{
    $this->pdo->beginTransaction();
    try {
        // xóa quan hệ, chỉ khi tồn tại
        $stmt = $this->pdo->prepare("
            DELETE FROM user_follows
            WHERE follower_id = ? AND following_id = ?
        ");
        $stmt->execute([$followerId, $followingId]);

        // chỉ giảm nếu thực sự có dòng bị xóa
        if ($stmt->rowCount() > 0) {
            $update = $this->pdo->prepare("
                UPDATE users
                SET followers_count = GREATEST(followers_count - 1, 0)
                WHERE user_id = ?
            ");
            $update->execute([$followingId]);
        }

        $this->pdo->commit();
    } catch (Exception $e) {
        $this->pdo->rollBack();
        throw $e;
    }
}


    public function getTopFollowedUsers($limit = 10)
    {
        $sql = "SELECT u.user_id, u.username, u.email, u.followers_count,
               i.full_name, i.avatar_url, i.bio, i.birth_date
        FROM users u
        LEFT JOIN user_infos i ON u.user_id = i.user_id
        ORDER BY u.followers_count DESC
        LIMIT ?";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(1, (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFollowing($userId)
    {
        $sql = "SELECT 
                u.user_id, u.username, u.email, u.followers_count,
                i.full_name, i.avatar_url, i.bio, i.birth_date
            FROM user_follows f
            JOIN users u ON f.following_id = u.user_id
            LEFT JOIN user_infos i ON u.user_id = i.user_id
            WHERE f.follower_id = ?
            ORDER BY u.username ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFollowers($userId)
    {
        $sql = "SELECT 
                u.user_id, u.username, u.email, u.followers_count,
                i.full_name, i.avatar_url, i.bio, i.birth_date
            FROM user_follows f
            JOIN users u ON f.follower_id = u.user_id
            LEFT JOIN user_infos i ON u.user_id = i.user_id
            WHERE f.following_id = ?
            ORDER BY u.username ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function countFollowers($userId)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM user_follows WHERE following_id = ?");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }

    public function countFollowing($userId)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM user_follows WHERE follower_id = ?");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }

}
