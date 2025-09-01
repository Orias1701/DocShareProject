<?php
// models/PostReport.php
require_once __DIR__ . '/../config/Database.php';

class PostReport {
    private $pdo;
    public function __construct() { 
        $this->pdo = Database::getConnection(); 
    }

    // Lấy tất cả report của 1 post
    public function getByPost($postId) {
        $stmt = $this->pdo->prepare("
            SELECT rp.report_id, rp.reason, rp.created_at, rp.user_id, ui.full_name
            FROM post_reports rp
            LEFT JOIN user_infos ui ON rp.user_id = ui.user_id
            WHERE rp.post_id = :pid
        ");
        $stmt->execute([':pid' => $postId]);
        return $stmt->fetchAll();
    }

    public function getAllReports() {
        $stmt = $this->pdo->query("
            SELECT rp.report_id, rp.post_id, rp.reason, rp.created_at, rp.user_id, ui.full_name, p.title as post_title
            FROM post_reports rp
            LEFT JOIN user_infos ui ON rp.user_id = ui.user_id
            LEFT JOIN posts p ON rp.post_id = p.post_id
            ORDER BY rp.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    // Kiểm tra user đã report post này chưa
    public function getUserReport($postId, $userId) {
        $stmt = $this->pdo->prepare("
            SELECT report_id, reason 
            FROM post_reports 
            WHERE post_id = ? AND user_id = ?
        ");
        $stmt->execute([$postId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Tạo report mới
    public function create($reportId, $postId, $userId, $reason) {
        $stmt = $this->pdo->prepare("
            INSERT INTO post_reports (report_id, post_id, user_id, reason) 
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$reportId, $postId, $userId, $reason]);
    }

    // Xóa report
    public function delete($reportId) {
        $stmt = $this->pdo->prepare("DELETE FROM post_reports WHERE report_id = ?");
        return $stmt->execute([$reportId]);
    }
}
