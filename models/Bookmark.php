<?php
require_once __DIR__ . '/../config/Database.php';

class Bookmark
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    // Thêm bookmark
    public function createBookmark($userId, $postId)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO bookmarks (user_id, post_id) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$userId, $postId]);
        return $stmt->rowCount() > 0;
    }

    // Xóa bookmark
    public function removeBookmark($userId, $postId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM bookmarks WHERE user_id=? AND post_id=?");
        $stmt->execute([$userId, $postId]);
        return $stmt->rowCount() > 0;
    }

    // Lấy danh sách post đã bookmark của user
    public function getBookmarksByUser($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.*, 1 AS is_bookmarked
            FROM posts p
            JOIN bookmarks b ON p.post_id = b.post_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy toàn bộ posts kèm cờ is_bookmarked
    public function getPostsWithBookmarkFlag($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.*, 
                   CASE WHEN b.post_id IS NOT NULL THEN 1 ELSE 0 END AS is_bookmarked
            FROM posts p
            LEFT JOIN bookmarks b 
              ON p.post_id = b.post_id AND b.user_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
