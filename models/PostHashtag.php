<?php
// models/PostHashtag.php
require_once __DIR__ . '/../config/Database.php';

class PostHashtag {
    private $pdo;
    public function __construct() { 
        $this->pdo = Database::getConnection(); 
    }

    // Lấy tất cả hashtag của 1 bài post
     // Lấy tất cả hashtag của 1 bài post
    public function getPostsByHashtag($postId) {
        $stmt = $this->pdo->prepare("
            SELECT h.hashtag_id, h.hashtag_name
            FROM post_hashtags ph
            JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
            WHERE ph.post_id = :pid
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

     public function getPostsByHashtagId($hashtagId) {
        $sql = "
            SELECT p.post_id, p.title, p.content, p.banner_url, p.created_at,
                   a.album_id, a.album_name,
                   u.user_id, u.username, u.email
            FROM post_hashtags ph
            INNER JOIN posts p ON ph.post_id = p.post_id
            INNER JOIN albums a ON p.album_id = a.album_id
            INNER JOIN users u ON a.user_id = u.user_id
            WHERE ph.hashtag_id = ?
            ORDER BY p.created_at DESC
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$hashtagId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Thêm hashtag cho 1 bài post
    public function createHashtagToPost($postId, $hashtagId) {
        $stmt = $this->pdo->prepare("
            INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (:pid, :hid)
        ");
        return $stmt->execute([':pid' => $postId, ':hid' => $hashtagId]);
    }

    // Cập nhật hashtag của 1 bài post
    public function updateHashtagForPost($postId, $oldHashtagId, $newHashtagId) {
        $stmt = $this->pdo->prepare("
            UPDATE post_hashtags 
            SET hashtag_id = :newhid
            WHERE post_id = :pid AND hashtag_id = :oldhid
        ");
        return $stmt->execute([
            ':pid' => $postId,
            ':oldhid' => $oldHashtagId,
            ':newhid' => $newHashtagId
        ]);
    }

    // Xóa hashtag khỏi bài post
    public function deleteHashtagFromPost($postId, $hashtagId) {
        $stmt = $this->pdo->prepare("
            DELETE FROM post_hashtags 
            WHERE post_id = :pid AND hashtag_id = :hid
        ");
        return $stmt->execute([':pid' => $postId, ':hid' => $hashtagId]);
    }
}
