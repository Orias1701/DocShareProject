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
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }
        $userId = $_SESSION['user_id'];

        $existing = $this->reportModel->getUserReport($postId, $userId);

        if (!$existing) {
            // Tạo report mới, report_id dạng REPORT + postId + userId
            $reportId = 'REPORT' . $postId . $userId;
            $this->reportModel->create($reportId, $postId, $userId, $reason);
        } else {
            // Nếu đã report trước đó, xóa report
            $this->reportModel->delete($existing['report_id']);
        }

        // Quay lại trang post detail
        header("Location: index.php?action=post_detail&post_id=" . $postId);
        exit;
    }

    // Lấy danh sách report của 1 post
    public function listReports($postId) {
        $reports = $this->reportModel->getByPost($postId);
        return $reports;
    }

     public function listAllReports() {

        $reports = $this->reportModel->getAllReports();
        include __DIR__ . '/../views/report/list.php';
    }
}
