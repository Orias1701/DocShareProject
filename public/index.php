<?php
// public/index.php - single entry point
// nếu có ?action=group1|group2|post_detail => trả JSON (API)
// nếu không => render trang HTML

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../controllers/PostController.php';
require_once __DIR__ . '/../controllers/HomeController.php';

// route API actions
if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $pc = new PostController();

    if ($action === 'group1') {
        $pc->group1();
        exit;
    } elseif ($action === 'group2') {
        $pc->group2();
        exit;
    } elseif ($action === 'post_detail') {
        $postId = $_GET['post_id'] ?? null;
        $pc->postDetail($postId);
        exit;
    } else {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
        exit;
    }
}

// else render HTML page
include __DIR__ . '/../views/layouts/header.php';
include __DIR__ . '/../views/home.php';
include __DIR__ . '/../views/layouts/footer.php';
