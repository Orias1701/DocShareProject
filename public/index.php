<?php
// public/index.php - single entry point
$lifetime = 60 * 60 * 24 * 7; // Thời gian sống của session (ví dụ: 7 ngày)
session_set_cookie_params($lifetime, '/', null, false, true); // Đặt các tham số cookie

// Sau khi thiết lập session, mới bắt đầu session
session_start();

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Hashtag.php';
require_once __DIR__ . '/../models/UserInfo.php';
require_once __DIR__ . '/../models/Role.php';
require_once __DIR__ . '/../models/UserFollow.php';
require_once __DIR__ . '/../models/Album.php';
require_once __DIR__ . '/../models/PostHashtag.php';
require_once __DIR__ . '/../models/PostComment.php';
require_once __DIR__ . '/../models/PostReaction.php';
require_once __DIR__ . '/../models/PostReport.php';



require_once __DIR__ . '/../controllers/PostController.php';
require_once __DIR__ . '/../controllers/HomeController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/HashtagController.php';
require_once __DIR__ . '/../controllers/UserInfoController.php';
require_once __DIR__ . '/../controllers/RoleController.php';
require_once __DIR__ . '/../controllers/UserFollowController.php';
require_once __DIR__ . '/../controllers/AlbumController.php';
require_once __DIR__ . '/../controllers/PostHashtagController.php';
require_once __DIR__ . '/../controllers/CommentController.php';
require_once __DIR__ . '/../controllers/ReactionController.php';
require_once __DIR__ . '/../controllers/ReportController.php';



// Khởi tạo các controller
$postController = new PostController();
$auth = new AuthController();
$albumController = new AlbumController();
$categoryController = new CategoryController();
$hashtagController = new HashtagController();
$userInfoController = new UserInfoController();
$roleController = new RoleController();
$postHashtagController = new PostHashtagController();
$commentController = new CommentController(); // Khởi tạo CommentController
$reactionController = new ReactionController();   // thêm dòng này
$reportController = new ReportController();
$userFollowController = new UserFollowController();






// Nếu có action thì xử lý route
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {
        // ==== AUTH ====
        case 'login':
            include __DIR__ . '/../views/login.php';
            exit;
        case 'login_post':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $auth->login($_POST['email'], $_POST['password']);
            }
            exit;
        case 'register':
            include __DIR__ . '/../views/register.php';
            exit;
        case 'register_post':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $auth->register($_POST['username'], $_POST['email'], $_POST['password']);
            }
            exit;
        case 'logout':
            $auth->logout();
            exit;

            // ==== API POSTS ====
        case 'group1':
            $postController->group1();
            exit;
        case 'group2':
            $postController->group2();
            exit;
        case 'post_detail_api':
            $postController->postDetail($_GET['post_id'] ?? null);
            exit;
        case 'post_detail':
            $postId = $_GET['post_id'] ?? null;
            $postController->showPostDetail();

            exit;

            // ==== POST CRUD ====
        case 'list_all_posts':
            $postController->listAllPosts();
            exit;
        case 'create_post_form':
            $postController->showCreateForm();
            exit;
        case 'create_post':
            $postController->create();
            exit;
        case 'edit_post_form':
            $postController->showEditForm();
            exit;
        case 'update_post':
            $postController->update();
            exit;
        case 'delete_post':
            $postController->delete();
            exit;
        case 'list_posts_by_category':
            $postController->getPostsByCategory();
            exit;
            //http://localhost:3000/public/index.php?action=list_posts_by_hashtag&hashtag_ids=HASHTAG00000000001
        case 'list_posts_by_hashtag':
            $postController->getPostsByHashtag();
            exit;

            // ==== ALBUM CRUD ====
        case 'list_user_albums':
            $albumController->listUserAlbums();
            exit;
        case 'create_album_form':
            $albumController->showCreateForm();
            exit;
        case 'create_album':
            $albumController->create();
            exit;
        case 'edit_album_form':
            $albumController->showEditForm();
            exit;
        case 'update_album':
            $albumController->update();
            exit;
        case 'delete_album':
            $albumController->delete();
            exit;
        case 'list_albums':
            $albumController->listAllAlbums();
            exit;
        case 'list_albums_by_user':
            $albumController->listAlbumsByUserId();
            exit;

            // ==== CATEGORY CRUD ====
        case 'list_categories':
            $categoryController->listCategories();
            exit;
        case 'create_category_form':
            $categoryController->showCreateForm();
            exit;
        case 'create_category':
            $categoryController->create();
            exit;
        case 'edit_category_form':
            $categoryController->showEditForm();
            exit;
        case 'update_category':
            $categoryController->update();
            exit;
        case 'delete_category':
            $categoryController->delete();
            exit;

            // ==== HASHTAG CRUD ====
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

            // ==== USER INFO CRUD ====
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
        case 'user_detail':
            $userInfoController->showUserInfo();
            exit;


            // ==== POST HASHTAG CRUD ====
        case 'list_post_hashtags':
            $postHashtagController->listByPost($_GET['post_id'] ?? null);
            exit;
        case 'posts_by_hashtag':
            $postHashtagController->getPostsByHashtagId($_GET['hashtag_id'] ?? null);
            exit;
        case 'create_post_hashtag_form':
            $postId = filter_var($_GET['post_id'] ?? null, FILTER_SANITIZE_STRING);
            if (empty($postId)) {
                http_response_code(400);
                die("Lỗi: Post ID không được cung cấp!");
            }
            $postHashtagController->showCreateForm($postId);
            exit;

        case 'create_post_hashtag':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                die("Lỗi: Phương thức HTTP không được hỗ trợ!");
            }
            $postHashtagController->create();
            exit;
        case 'edit_post_hashtag_form':
            $postHashtagController->showEditForm($_GET['post_id'] ?? null, $_GET['old_hashtag_id'] ?? null);
            exit;
        case 'update_post_hashtag':
            $postHashtagController->update();
            exit;
        case 'delete_post_hashtag':
            $postHashtagController->delete();
            exit;

            // ==== ROLE CRUD ====
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
            // ==== COMMENT CRUD ====

        case 'create_comment':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $postId = $_POST['post_id'];
                $content = $_POST['content'];
                $commentController->createComment($postId, $content);
            }
            exit;

        case 'edit_comment':
            if (isset($_GET['id'])) {
                // Lấy comment để hiển thị form sửa
                $comment = (new PostComment())->getById($_GET['id']);
                include __DIR__ . '/../views/postcomment/edit_comment.php';
            }
            exit;

        case 'update_comment':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $commentId = $_POST['comment_id'];
                $content = $_POST['content'];
                $commentController->updateComment($commentId, $content);
            }
            exit;

        case 'delete_comment':
            if (isset($_GET['id'])) {
                if (!isset($_SESSION['user_id'])) {
                    header("Location: index.php?action=login");
                    exit;
                }
                $userId = $_SESSION['user_id'];
                $commentController->deleteComment($_GET['id'], $userId);
                header("Location: " . $_SERVER['HTTP_REFERER']);
                exit;
            }

            // ==== REACTION ====
        case 'toggle_reaction':
            $postId = $_GET['post_id'] ?? null;
            $reactionType = $_GET['reaction_type'] ?? null;

            if (!$postId || !$reactionType) {
                header("Location: index.php");
                exit;
            }

            $reactionController->toggleReaction($postId, $reactionType);
            exit;
            // ==== REPORT====

        case 'toggle_report':
            $postId = $_POST['post_id'] ?? null;  // đổi từ $_GET sang $_POST
            $reason = $_POST['reason'] ?? null;

            if (!$postId || !$reason) {
                http_response_code(400);
                echo "post_id và reason là bắt buộc";
                exit;
            }

            require_once __DIR__ . '/../controllers/ReportController.php';
            $reportController = new ReportController();
            $reportController->toggleReport($postId, $reason);
            header("Location: index.php?action=post_detail&post_id=" . $postId);
            exit;

        case 'list_reports':
            $reportController->listAllReports();
            exit;
            // ==== USER FOLLOW====

        case 'toggle_follow':
            $ctrl = new UserFollowController();
            $ctrl->toggleFollow();
            exit;





        default:
            // Nếu không có action nào khớp, chuyển hướng về trang chủ
            header("Location: index.php");
            exit;
    }
}

// Nếu không có action được thiết lập, hiển thị trang chủ
include __DIR__ . '/../views/layouts/header.php';
include __DIR__ . '/../views/home.php';
include __DIR__ . '/../views/layouts/footer.php';
