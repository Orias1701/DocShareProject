<?php
// models/PostHashtag.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Hashtag.php';

class PostHashtag
{
    private $pdo;
    private $hashtagModel;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
        $this->hashtagModel = new Hashtag();
    }

    // Lấy tất cả hashtag của 1 bài post
    // Lấy tất cả hashtag của 1 bài post
    public function getPostsByHashtag($postId)
    {
        $stmt = $this->pdo->prepare("
            SELECT h.hashtag_id, h.hashtag_name
            FROM post_hashtags ph
            JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
            WHERE ph.post_id = :pid
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPostsByHashtagId($hashtagId)
    {
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
    public function createHashtagToPost($postId, $hashtagName)
    {
        try {
            // Start transaction
            $this->pdo->beginTransaction();

            // Validate inputs
            if (empty($hashtagName) || strlen($hashtagName) > 50) {
                throw new Exception("Tên hashtag không hợp lệ!");
            }
            if (!preg_match('/^#[a-zA-Z0-9_]+$/', $hashtagName)) {
                throw new Exception("Hashtag phải bắt đầu bằng # và chỉ chứa chữ cái, số, hoặc dấu gạch dưới!");
            }
            if (empty($postId) || strlen($postId) > 40) {
                throw new Exception("Post ID không hợp lệ!");
            }

            // Check if post_id exists
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM posts WHERE post_id = :post_id");
            $stmt->execute(['post_id' => $postId]);
            if ($stmt->fetchColumn() == 0) {
                throw new Exception("Post ID không tồn tại!");
            }

            // Check if hashtag_name exists
            $stmt = $this->pdo->prepare("SELECT hashtag_id FROM hashtags WHERE hashtag_name = :hashtag_name");
            $stmt->execute(['hashtag_name' => $hashtagName]);
            $hashtag_id = $stmt->fetchColumn();

            if ($hashtag_id === false) {
                // Generate new hashtag_id
                $stmt = $this->pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(hashtag_id, 8) AS UNSIGNED)), 0) + 1 AS next_id FROM hashtags");
                $next_id = $stmt->fetchColumn();
                $hashtag_id = 'HASHTAG' . str_pad($next_id, 11, '0', STR_PAD_LEFT);

                // Insert new hashtag
                $stmt = $this->pdo->prepare("INSERT INTO hashtags (hashtag_id, hashtag_name) VALUES (:hashtag_id, :hashtag_name)");
                $stmt->execute([
                    'hashtag_id' => $hashtag_id,
                    'hashtag_name' => $hashtagName
                ]);
            }

            // Insert into post_hashtags
            $stmt = $this->pdo->prepare("INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (:post_id, :hashtag_id) ON DUPLICATE KEY UPDATE post_id = post_id");
            $stmt->execute([
                'post_id' => $postId,
                'hashtag_id' => $hashtag_id
            ]);

            // Commit transaction
            $this->pdo->commit();
            return true;
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            error_log("Lỗi PDO: " . $e->getMessage());
            throw new Exception("Lỗi khi thêm hashtag '$hashtagName': " . $e->getMessage());
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    // Cập nhật hashtag của 1 bài post
    public function updateHashtagForPost($postId, $oldHashtagId, $newHashtagId)
    {
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
    public function deleteHashtagFromPost($postId, $hashtagId)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM post_hashtags 
            WHERE post_id = :pid AND hashtag_id = :hid
        ");
        return $stmt->execute([':pid' => $postId, ':hid' => $hashtagId]);
    }
}
