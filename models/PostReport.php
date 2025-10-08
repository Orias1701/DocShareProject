<?php
// models/PostReport.php
require_once __DIR__ . '/../config/Database.php';

class PostReport
{
    private $pdo;
    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    // Lấy tất cả report của 1 post
    public function getByPost($postId)
    {
        $stmt = $this->pdo->prepare("
            SELECT rp.report_id, rp.reason, rp.created_at, rp.user_id, ui.full_name
            FROM post_reports rp
            LEFT JOIN user_infos ui ON rp.user_id = ui.user_id
            WHERE rp.post_id = :pid
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll();
    }

    public function getAllReports()
    {
        $sql = "
            SELECT 
                rp.report_id,
                rp.post_id,
                rp.reason,
                rp.created_at       AS report_created_at,
                rp.user_id          AS reporter_id,
                ui.full_name        AS reporter_name,
                ui.avatar_url       AS reporter_avatar,
    
                p.title             AS post_title,
                p.content           AS post_content,
                p.created_at        AS post_created_at,
                p.banner_url         AS post_image,
                a.album_name,
                c.category_name,
    
                u.user_id           AS author_id,
                u.username          AS author_username
            FROM post_reports rp
            LEFT JOIN user_infos ui   ON rp.user_id = ui.user_id       -- người báo cáo
            LEFT JOIN posts p         ON rp.post_id = p.post_id        -- bài viết bị báo cáo
            LEFT JOIN albums a        ON p.album_id = a.album_id
            LEFT JOIN categories c    ON p.category_id = c.category_id
            LEFT JOIN users u         ON a.user_id = u.user_id         -- tác giả bài
            ORDER BY rp.created_at DESC
        ";

        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Kiểm tra user đã report post này chưa
    public function getUserReport($postId, $userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT report_id, reason 
            FROM post_reports 
            WHERE post_id = ? AND user_id = ?
        ");
        $stmt->execute([$postId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Tạo report mới
    public function create($reportId, $postId, $userId, $reason)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO post_reports (report_id, post_id, user_id, reason) 
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$reportId, $postId, $userId, $reason]);
    }

    // Xóa report
    public function delete($reportId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM post_reports WHERE report_id = ?");
        return $stmt->execute([$reportId]);
    }

    public function countReportsByPost($postId)
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(DISTINCT user_id) AS total_reports
            FROM post_reports
            WHERE post_id = ?
        ");
        $stmt->execute([$postId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (int)$result['total_reports'] : 0;
    }

    // 🔹 Lấy danh sách chi tiết người đã report một bài viết
    public function getReportersDetailByPost($postId)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            rp.report_id,
            rp.post_id,
            rp.reason,
            rp.created_at AS report_created_at,

            u.user_id,
            u.username,

            ui.full_name,
            ui.avatar_url
        FROM post_reports rp
        JOIN users u ON rp.user_id = u.user_id
        LEFT JOIN user_infos ui ON u.user_id = ui.user_id
        WHERE rp.post_id = ?
        ORDER BY rp.created_at DESC
    ");
        $stmt->execute([$postId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
