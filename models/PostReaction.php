<?php
require_once __DIR__ . '/../config/Database.php';

class PostReaction
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /** Lấy reaction hiện tại của user cho post: null | 'like' | 'dislike' */
    public function getUserReaction($postId, $userId)
    {
        $sql = "SELECT reaction_type
                FROM post_reactions
                WHERE post_id = ? AND user_id = ?
                LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$postId, $userId]);
        $val = $stmt->fetchColumn();
        return $val !== false ? $val : null;
    }

    /**
     * Tạo reaction mới, đảm bảo 1 user chỉ có 1 reaction cho 1 post:
     * - XÓA mọi reaction cũ của (post_id,user_id)
     * - CHÈN reaction mới
     */
    public function create($postId, $userId, $type)
    {
        $this->pdo->beginTransaction();
        try {
            $del = $this->pdo->prepare("DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?");
            $del->execute([$postId, $userId]);

            $ins = $this->pdo->prepare(
                "INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at)
                 VALUES (?, ?, ?, NOW())"
            );
            $ok  = $ins->execute([$postId, $userId, $type]);

            $this->pdo->commit();
            return $ok;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Chuyển reaction (like <-> dislike).
     * Nếu chưa có thì coi như create. Để chắc ăn với PK gồm cả reaction_type,
     * ta dùng delete + insert thay vì update trực tiếp.
     */
    public function update($postId, $userId, $type)
    {
        $this->pdo->beginTransaction();
        try {
            $del = $this->pdo->prepare("DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?");
            $del->execute([$postId, $userId]);

            $ins = $this->pdo->prepare(
                "INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at)
                 VALUES (?, ?, ?, NOW())"
            );
            $ok  = $ins->execute([$postId, $userId, $type]);

            $this->pdo->commit();
            return $ok;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /** Bỏ reaction */
    public function delete($postId, $userId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?");
        return $stmt->execute([$postId, $userId]);
    }

    /**
     * Đếm reaction theo loại; luôn trả đủ key 'like' và 'dislike'
     * Ví dụ: ['like'=>10,'dislike'=>2]
     */
    public function getReactionCounts($postId)
    {
        $sql = "SELECT reaction_type, COUNT(*) as cnt
                FROM post_reactions
                WHERE post_id = ?
                GROUP BY reaction_type";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$postId]);

        $out = ['like' => 0, 'dislike' => 0];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $type = $row['reaction_type'];
            if ($type === 'like' || $type === 'dislike') {
                $out[$type] = (int)$row['cnt'];
            }
        }
        return $out;
    }

    /** Alias cho controller: getCounts(...) */
    public function getCounts($postId)
    {
        return $this->getReactionCounts($postId);
    }

    public function countReactionsByPost($postId)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END) AS total_likes,
                SUM(CASE WHEN reaction_type = 'dislike' THEN 1 ELSE 0 END) AS total_dislikes
            FROM post_reactions
            WHERE post_id = ?
        ");
        $stmt->execute([$postId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return [
            "total_likes" => (int)($result['total_likes'] ?? 0),
            "total_dislikes" => (int)($result['total_dislikes'] ?? 0)
        ];
    }
}
