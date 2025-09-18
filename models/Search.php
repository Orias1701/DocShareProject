<?php
require_once __DIR__ . '/../config/Database.php';

class Search
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    // Tìm post theo title
    public function searchPosts($keyword)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.post_id, p.title, p.summary, p.file_url, p.file_type, p.created_at,
                   a.album_id, a.album_name,
                   u.user_id AS author_id, u.username AS author_name
            FROM posts p
            INNER JOIN albums a ON p.album_id = a.album_id
            INNER JOIN users u ON a.user_id = u.user_id
            WHERE p.title LIKE ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute(['%' . $keyword . '%']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm album theo tên
    public function searchAlbums($keyword)
    {
        $stmt = $this->pdo->prepare("
            SELECT a.album_id, a.album_name, a.url_thumbnail, a.created_at,
                   u.user_id, u.username
            FROM albums a
            INNER JOIN users u ON a.user_id = u.user_id
            WHERE a.album_name LIKE ?
            ORDER BY a.created_at DESC
        ");
        $stmt->execute(['%' . $keyword . '%']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm hashtag theo tên
    public function searchHashtags($keyword)
    {
        $stmt = $this->pdo->prepare("
            SELECT h.hashtag_id, h.hashtag_name
            FROM hashtags h
            WHERE h.hashtag_name LIKE ?
            ORDER BY h.hashtag_name ASC
        ");
        $stmt->execute(['%' . $keyword . '%']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tìm category theo tên
    public function searchCategories($keyword)
    {
        $stmt = $this->pdo->prepare("
            SELECT c.category_id, c.category_name
            FROM categories c
            WHERE c.category_name LIKE ?
            ORDER BY c.category_name ASC
        ");
        $stmt->execute(['%' . $keyword . '%']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
