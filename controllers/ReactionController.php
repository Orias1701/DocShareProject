<?php
require_once __DIR__ . '/../models/PostReaction.php';

class ReactionController {
    private $reactionModel;

    public function __construct() {
        $this->reactionModel = new PostReaction();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /* ========= helper trả JSON ========= */
    private function json($payload, int $code = 200): void {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        http_response_code($code);
        echo json_encode($payload);
        exit; // rất quan trọng
    }

    /* ========= API: toggle like/dislike (JSON) ========= */
    public function toggleReactionApi($postId, $reactionType) {
        if (!isset($_SESSION['user_id'])) {
            return $this->json(['ok'=>false,'error'=>'unauthenticated'], 401);
        }

        // Bảng của bạn là varchar -> không ép int
        $userId = (string) $_SESSION['user_id'];
        $postId = trim((string) $postId);
        $reactionType = strtolower(trim((string) $reactionType));

        if ($postId === '' || !in_array($reactionType, ['like','dislike'], true)) {
            return $this->json(['ok'=>false,'error'=>'bad_request'], 400);
        }

        $existing = $this->reactionModel->getUserReaction($postId, $userId); // null|'like'|'dislike'
        if ($existing === null) {
            $this->reactionModel->create($postId, $userId, $reactionType);
            $status = 'created';
            $my = $reactionType;
        } elseif ($existing === $reactionType) {
            $this->reactionModel->delete($postId, $userId);
            $status = 'deleted';
            $my = null;
        } else {
            $this->reactionModel->update($postId, $userId, $reactionType);
            $status = 'updated';
            $my = $reactionType;
        }

        // Model bạn đang có getReactionCounts(...)
        $counts = $this->reactionModel->getReactionCounts($postId);
        return $this->json([
            'ok'         => true,
            'status'     => $status,
            'myReaction' => $my,
            'counts'     => [
                'like'    => (int)($counts['like'] ?? 0),
                'dislike' => (int)($counts['dislike'] ?? 0),
            ],
        ]);
    }

    /* ========= API: lấy state hiện tại (JSON) ========= */
    public function getReactionStateApi($postId) {
        if (!isset($_SESSION['user_id'])) {
            return $this->json(['ok'=>false,'error'=>'unauthenticated'], 401);
        }

        $userId = (string) $_SESSION['user_id'];
        $postId = trim((string) $postId);
        if ($postId === '') {
            return $this->json(['ok'=>false,'error'=>'bad_request'], 400);
        }

        $my     = $this->reactionModel->getUserReaction($postId, $userId); // null|'like'|'dislike'
        $counts = $this->reactionModel->getReactionCounts($postId);

        return $this->json([
            'ok'         => true,
            'myReaction' => $my ?: null,
            'counts'     => [
                'like'    => (int)($counts['like'] ?? 0),
                'dislike' => (int)($counts['dislike'] ?? 0),
            ],
        ]);
    }

    /* ========= Flow cũ: redirect (giữ nguyên nếu còn dùng) ========= */
    public function toggleReaction($postId, $reactionType) {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $userId = (string) $_SESSION['user_id'];
        $postId = trim((string) $postId);
        $reactionType = strtolower(trim((string) $reactionType));

        $validReactions = ['like', 'dislike'];
        if ($postId === '' || !in_array($reactionType, $validReactions, true)) {
            header("Location: index.php?action=post_detail&post_id=" . urlencode($postId));
            exit;
        }

        $existing = $this->reactionModel->getUserReaction($postId, $userId);
        if (!$existing) {
            $this->reactionModel->create($postId, $userId, $reactionType);
        } elseif ($existing === $reactionType) {
            $this->reactionModel->delete($postId, $userId);
        } else {
            $this->reactionModel->update($postId, $userId, $reactionType);
        }

        header("Location: index.php?action=post_detail&post_id=" . urlencode($postId));
        exit;
    }
}
