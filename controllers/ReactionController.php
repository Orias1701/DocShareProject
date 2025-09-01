<?php
require_once __DIR__ . '/../models/PostReaction.php';

class ReactionController {
    private $reactionModel;

    public function __construct() {
        $this->reactionModel = new PostReaction();
    }

    // Toggle reaction
    public function toggleReaction($postId, $reactionType) {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }
        $userId = $_SESSION['user_id'];

        // ✅ Kiểm tra reaction hợp lệ
        $validReactions = ['like','love','haha','wow','sad','angry'];
        if (!in_array($reactionType, $validReactions)) {
            header("Location: index.php?action=post_detail&post_id=" . $postId);
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

        header("Location: index.php?action=post_detail&post_id=" . $postId);
        exit;
    }
}
