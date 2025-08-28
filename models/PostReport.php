<?php
// models/PostReport.php
require_once __DIR__ . '/../config/Database.php';

class PostReport {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

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
}
