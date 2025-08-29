<?php
// public/index.php - single entry point
session_start();

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Hashtag.php';
require_once __DIR__ . '/../models/UserInfo.php';    // Thêm
require_once __DIR__ . '/../models/Role.php';    // Thêm



require_once __DIR__ . '/../controllers/PostController.php';
require_once __DIR__ . '/../controllers/HomeController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/CategoryController.php'; // Di chuyển lên đầu
require_once __DIR__ . '/../controllers/HashtagController.php';
require_once __DIR__ . '/../controllers/UserInfoController.php'; // Thêm
require_once __DIR__ . '/../controllers/RoleController.php'; // Thêm




// Nếu có action thì xử lý route
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    // ==== AUTH ====
    $auth = new AuthController();
    if ($action === 'login_post' && $_SERVER['REQUEST_METHOD']==='POST') { // Đổi tên action để tránh nhầm lẫn với view
        $auth->login($_POST['email'], $_POST['password']);
        exit;
    }
    if ($action === 'register_post' && $_SERVER['REQUEST_METHOD']==='POST') { // Đổi tên action để tránh nhầm lẫn với view
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

    // ==== API POSTS ====
    // Đặt khối này sau auth/login/register views để đảm bảo các view đó có thể được render trước
    $postController = new PostController();
    if ($action === 'group1') {
        $postController->group1();
        exit;
    } elseif ($action === 'group2') {
        $postController->group2();
        exit;
    } elseif ($action === 'post_detail') {
        $postController->postDetail($_GET['post_id'] ?? null);
        exit;
    }

    // ==== CATEGORY CRUD ====
    $categoryController = new CategoryController();

    switch($action) {
        case 'list_categories':
            $categoryController->listCategories();
            exit;
        case 'create_category_form':
            $categoryController->showCreateForm();
            exit;
        case 'create_category':
            $categoryController->create(); // Xử lý POST request để tạo
            exit;
        case 'edit_category_form':
            $categoryController->showEditForm(); // Hiển thị form chỉnh sửa
            exit;
        case 'update_category':
            $categoryController->update(); // Xử lý POST request để cập nhật
            exit;
        case 'delete_category':
            $categoryController->delete();
            exit;
    }

    // ==== HASHTAG CRUD ====
    $hashtagController = new HashtagController();
    switch($action) {
        case 'list_hashtags':
            $hashtagController->listHashtags();
            exit;
        case 'create_hashtag_form':
            $hashtagController->showCreateForm();
            exit;
        case 'create_hashtag':
            $hashtagController->create();
            exit;
        case 'edit_hashtag_form':
            $hashtagController->showEditForm();
            exit;
        case 'update_hashtag':
            $hashtagController->update();
            exit;
        case 'delete_hashtag':
            $hashtagController->delete();
            exit;
    }

    // ==== USER INFO CRUD ====
    $userInfoController = new UserInfoController();
    switch($action) {
        case 'list_user_infos':
            $userInfoController->listUserInfos();
            exit;
        case 'create_user_info_form':
            $userInfoController->showCreateForm();
            exit;
        case 'create_user_info':
            $userInfoController->create();
            exit;
        case 'edit_user_info_form':
            $userInfoController->showEditForm();
            exit;
        case 'update_user_info':
            $userInfoController->update();
            exit;
        case 'delete_user_info':
            $userInfoController->delete();
            exit;
    }
    // ==== ROLE CRUD ====
    $roleController = new RoleController();
    switch($action) {
        case 'list_roles':
            $roleController->listRoles();
            exit;
        case 'create_role_form':
            $roleController->showCreateForm();
            exit;
        case 'create_role':
            $roleController->create();
            exit;
        case 'edit_role_form':
            $roleController->showEditForm();
            exit;
        case 'update_role':
            $roleController->update();
            exit;
        case 'delete_role':
            $roleController->delete();
            exit;
    }



    // Nếu không có action nào khớp, có thể redirect về trang chủ hoặc hiển thị 404
    header("Location: index.php"); // hoặc include __DIR__ . '/../views/404.php';
    exit;
}


// ==== Nếu không có action (hoặc action không khớp) => trang chủ HTML ====
// Đảm bảo chỉ include header/footer/home nếu không có action nào được xử lý và thoát
include __DIR__ . '/../views/layouts/header.php';
include __DIR__ . '/../views/home.php';
include __DIR__ . '/../views/layouts/footer.php';