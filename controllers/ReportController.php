<?php
// controllers/ReportController.php
require_once __DIR__ . '/../models/PostReport.php';

class ReportController {
    private $reportModel;

    public function __construct() {
        $this->reportModel = new PostReport();
    }

    // Toggle report: nếu chưa report thì tạo, nếu đã report thì xóa
    public function toggleReport($postId, $reason = '') {
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode([
                "ok" => false,
                "error" => "Bạn phải đăng nhập để report."
            ]);
            exit;
        }

        $userId = $_SESSION['user_id'];
        $existing = $this->reportModel->getUserReport($postId, $userId);

        if (!$existing) {
            // Tạo report mới, report_id dạng REPORT + postId + userId
            $reportId = 'REPORT' . $postId . $userId;
            $this->reportModel->create($reportId, $postId, $userId, $reason);

            echo json_encode([
                "ok" => true,
                "action" => "created",
                "report_id" => $reportId,
                "post_id" => $postId,
                "reason" => $reason
            ]);
            exit;
        } else {
            $this->reportModel->delete($existing['report_id']);

            echo json_encode([
                "ok" => true,
                "action" => "deleted",
                "report_id" => $existing['report_id'],
                "post_id" => $postId
            ]);
            exit;
        }
    }

    // Lấy danh sách report của 1 post
    public function listReports($postId) {
        header('Content-Type: application/json; charset=utf-8');

        if (!$postId) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "post_id là bắt buộc"]);
            exit;
        }

        $reports = $this->reportModel->getByPost($postId);
        echo json_encode([
            "ok" => true,
            "data" => $reports
        ]);
        exit;
    }

    // Lấy tất cả reports
    public function listAllReports() {
        header('Content-Type: application/json; charset=utf-8');

        $reports = $this->reportModel->getAllReports();
        echo json_encode([
            "ok" => true,
            "data" => $reports
        ]);
        exit;
    }
}
