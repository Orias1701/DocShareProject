<?php
require_once __DIR__ . '/../config/Database.php';

class Bookmark
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    // Kiểm tra user đã bookmark post chưa
    // public function isBookmarked($userId, $postId)
    // {
    //     $stmt = $this->pdo->prepare("SELECT 1 FROM bookmarks WHERE user_id=? AND post_id=?");
    //     $stmt->execute([$userId, $postId]);
    //     return (bool)$stmt->fetch();
    // }

    // Thêm bookmark
    public function createBookmark($userId, $postId)
    {
        $stmt = $this->pdo->prepare("INSERT IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)");
        return $stmt->execute([$userId, $postId]);
    }

    // Xóa bookmark
    public function removeBookmark($userId, $postId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM bookmarks WHERE user_id=? AND post_id=?");
        return $stmt->execute([$userId, $postId]);
    }


    // Lấy danh sách post đã bookmark của user
    public function getBookmarksByUser($userId)
    {
        $stmt = $this->pdo->prepare(
            "SELECT p.* 
             FROM posts p
             JOIN bookmarks b ON p.post_id = b.post_id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
