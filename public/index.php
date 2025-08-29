<?php 
// public/index.php - single entry point
session_start();

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../controllers/PostController.php';
require_once __DIR__ . '/../controllers/HomeController.php';
require_once __DIR__ . '/../controllers/AuthController.php';

// Nếu có action thì xử lý route
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    // ==== API POSTS ====
    if (in_array($action, ['group1','group2','post_detail'])) {
        $pc = new PostController();
        if ($action === 'group1') $pc->group1();
        elseif ($action === 'group2') $pc->group2();
        elseif ($action === 'post_detail') $pc->postDetail($_GET['post_id'] ?? null);
        exit;
    }

    // ==== AUTH ====
    $auth = new AuthController();
    if ($action === 'login' && $_SERVER['REQUEST_METHOD']==='POST') {
        $auth->login($_POST['email'], $_POST['password']);
        exit;
    }
    if ($action === 'register' && $_SERVER['REQUEST_METHOD']==='POST') {
        $auth->register($_POST['username'], $_POST['email'], $_POST['password']);
        exit;
    }
    if ($action === 'logout') {
        $auth->logout();
        exit;
    }

    // render trang login/register (GET)
    if ($action === 'login') { include __DIR__ . '/../views/login.php'; exit; }
    if ($action === 'register') { include __DIR__ . '/../views/register.php'; exit; }

    // Action không hợp lệ
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status'=>'error','message'=>'Unknown action']);
    exit;
}

// ==== Nếu không có action => trang chủ HTML ====
include __DIR__ . '/../views/layouts/header.php';
include __DIR__ . '/../views/home.php';
include __DIR__ . '/../views/layouts/footer.php';
