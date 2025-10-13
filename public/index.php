<?php
// /api/public/index.php — single entry point (API + optional views)

/*************************************************
 * 0) CẤU HÌNH CHUNG
 *************************************************/
$PROD_ORIGIN  = 'https://baotest.wuaze.com';
$DEV_ORIGIN   = 'http://localhost:5173'; // Vite dev
$PROD_DOMAIN  = 'baotest.wuaze.com';     // để set cookie domain & security

/*************************************************
 * 1) CORS & PRE-FLIGHT
 *************************************************/
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [$PROD_ORIGIN, $DEV_ORIGIN];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Truy cập trực tiếp (không có Origin) → cho phép origin prod
    header("Access-Control-Allow-Origin: $PROD_ORIGIN");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Expose-Headers: Content-Type, Authorization");

// Preflight (OPTIONS)
if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*************************************************
 * 2) SESSION COOKIE (CROSS-ORIGIN FRIENDLY)
 *************************************************/
$reqOriginHost = $origin ? parse_url($origin, PHP_URL_HOST) : '';
$isSameSite    = $reqOriginHost && strcasecmp($reqOriginHost, $PROD_DOMAIN) === 0;

$lifetime = 60 * 60 * 24 * 7; // 7 ngày
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path'     => '/',
    'domain'   => $PROD_DOMAIN,  // cookie cho baotest.wuaze.com
    'secure'   => true,          // bắt buộc HTTPS trên prod
    'httponly' => true,
    'samesite' => $isSameSite ? 'Lax' : 'None',
]);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/*************************************************
 * 3) LOG & TIMEZONE
 *************************************************/
ini_set('display_errors', 0);
ini_set('log_errors', 1);
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) { @mkdir($logDir, 0755, true); }
ini_set('error_log', $logDir . '/php-error.log');
date_default_timezone_set('Asia/Ho_Chi_Minh');

/*************************************************
 * 4) INCLUDE MODEL + CONTROLLER
 *************************************************/
$ROOT = dirname(__DIR__); // -> /api

require_once $ROOT . '/config/Database.php';
require_once $ROOT . '/models/Post.php';
require_once $ROOT . '/models/User.php';
require_once $ROOT . '/models/Category.php';
require_once $ROOT . '/models/Hashtag.php';
require_once $ROOT . '/models/UserInfo.php';
require_once $ROOT . '/models/Role.php';
require_once $ROOT . '/models/UserFollow.php';
require_once $ROOT . '/models/Album.php';
require_once $ROOT . '/models/PostHashtag.php';
require_once $ROOT . '/models/PostComment.php';
require_once $ROOT . '/models/PostReaction.php';
require_once $ROOT . '/models/PostReport.php';
require_once $ROOT . '/models/Bookmark.php';   // đúng HOA/thường trên Linux
require_once $ROOT . '/models/Search.php';

require_once $ROOT . '/controllers/PostController.php';
require_once $ROOT . '/controllers/HomeController.php';
require_once $ROOT . '/controllers/AuthController.php';
require_once $ROOT . '/controllers/CategoryController.php';
require_once $ROOT . '/controllers/HashtagController.php';
require_once $ROOT . '/controllers/UserInfoController.php';
require_once $ROOT . '/controllers/RoleController.php';
require_once $ROOT . '/controllers/UserFollowController.php';
require_once $ROOT . '/controllers/AlbumController.php';
require_once $ROOT . '/controllers/PostHashtagController.php';
require_once $ROOT . '/controllers/CommentController.php';
require_once $ROOT . '/controllers/ReactionController.php';
require_once $ROOT . '/controllers/ReportController.php';
require_once $ROOT . '/controllers/BookmarkController.php';
require_once $ROOT . '/controllers/SearchController.php';
require_once $ROOT . '/controllers/PdfProxyController.php'; // thêm ;

/*************************************************
 * 5) KHỞI TẠO CONTROLLER
 *************************************************/
$postController        = new PostController();
$auth                  = new AuthController();
$albumController       = new AlbumController();
$categoryController    = new CategoryController();
$hashtagController     = new HashtagController();
$userInfoController    = new UserInfoController();
$roleController        = new RoleController();
$postHashtagController = new PostHashtagController();
$commentController     = new CommentController();
$reactionController    = new ReactionController();
$reportController      = new ReportController();
$userFollowController  = new UserFollowController();
$bookmarkController    = new BookmarkController();
$searchController      = new SearchController();
$pdfProxyController    = new PdfProxyController();

/*************************************************
 * 6) TIỆN ÍCH JSON
 *************************************************/
function wants_json(): bool {
    if (isset($_SERVER['HTTP_ACCEPT']) && stripos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) return true;
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') return true;
    if (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) return true;
    return false;
}
function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
function respond_json($payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/*************************************************
 * 7) ROUTER (?action=...)
 *************************************************/
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {
        /*************** DEBUG / HEALTH ***************/
        case '_echo':
            respond_json([
                'ok'     => true,
                'action' => $_GET['action'] ?? null,
                'method' => $_SERVER['REQUEST_METHOD'] ?? null,
            ], 200);
            exit;

        case '_routes':
            respond_json(['ok'=>true,'routes'=>[
                'api_login','api_register','api_me','logout',
                'latest_posts','popular_posts','list_categories','list_hashtags',
                'download','pdf_proxy','search',
            ]], 200);
            exit;

        case 'health':
        case '_health':
            respond_json(['ok'=>true,'time'=>date('c')], 200);
            exit;

        case '_last_error':
            $logFile = dirname(__DIR__) . '/logs/php-error.log';
            $tail = '';
            if (is_file($logFile)) {
                $s = @file_get_contents($logFile);
                $tail = $s ? substr($s, -4000) : '';
            }
            respond_json(['ok'=>true, 'tail'=>$tail], 200);
            exit;

        /*************** AUTH (VIEW cũ) ***************/
        case 'login_post':
            if ($method === 'POST') {
                $auth->apiLogin($_POST['email'] ?? $_POST['identifier'] ?? '', $_POST['password'] ?? '');
            }
            exit;

        case 'register_post':
            if ($method === 'POST') {
                $username   = $_POST['username']   ?? '';
                $email      = $_POST['email']      ?? '';
                $password   = $_POST['password']   ?? '';
                $full_name  = $_POST['full_name']  ?? '';
                $birth_date = $_POST['birth_date'] ?? '';
                $avatar_url = $_POST['avatar_url'] ?? null;
                $bio        = $_POST['bio']        ?? null;
                $auth->apiRegister($username, $email, $password, $full_name, $birth_date, $avatar_url, $bio);
            }
            exit;

        case 'logout':
            $auth->apiLogout();
            exit;

        /*************** AUTH (API JSON) ***************/
        case 'api_login':
            if ($method !== 'POST') respond_json(['status'=>'error','message'=>'Method Not Allowed'], 405);
            $body = wants_json() ? read_json_body() : $_POST;
            $identifier = $body['identifier'] ?? $body['email'] ?? '';
            $password   = $body['password']   ?? '';
            if ($identifier === '' || $password === '') respond_json(['status'=>'error','message'=>'Thiếu identifier/email hoặc password'], 400);

            $userModel = new User();
            $user = $userModel->getByEmailOrUsername($identifier);

            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['user']    = $user;
                respond_json([
                    'status' => 'ok',
                    'user' => [
                        'user_id'   => $user['user_id'],
                        'username'  => $user['username'],
                        'email'     => $user['email'],
                        'full_name' => $user['full_name'] ?? null,
                        'avatar_url'=> $user['avatar_url'] ?? null,
                    ]
                ], 200);
            } else {
                respond_json(['status'=>'error','message'=>'Sai tên đăng nhập/email hoặc mật khẩu!'], 401);
            }
            exit;

        case 'api_register':
            if ($method !== 'POST') respond_json(['status'=>'error','message'=>'Method Not Allowed'], 405);
            $body = wants_json() ? read_json_body() : $_POST;
            $username   = trim($body['username']   ?? '');
            $email      = trim($body['email']      ?? '');
            $password   = (string)($body['password'] ?? '');
            $full_name  = trim($body['full_name']  ?? '');
            $birth_date = trim($body['birth_date'] ?? '');
            $avatar_url = $body['avatar_url'] ?? null;
            $bio        = $body['bio']        ?? null;

            if ($username === '' || $email === '' || $password === '' || $full_name === '' || $birth_date === '') {
                respond_json(['status'=>'error','message'=>'Thiếu trường bắt buộc'], 400);
            }

            $userModel = new User();
            if ($userModel->getByEmail($email))           respond_json(['status'=>'error','message'=>'Email đã tồn tại!'], 409);
            if ($userModel->getByUsername($username))     respond_json(['status'=>'error','message'=>'Tên người dùng đã tồn tại!'], 409);

            $hashed  = password_hash($password, PASSWORD_BCRYPT);
            $created = $userModel->createUser($username, $email, $hashed, 'ROLE011', $full_name, $avatar_url, $bio, $birth_date);
            if ($created) respond_json(['status'=>'ok','message'=>'Tạo tài khoản thành công'], 201);
            respond_json(['status'=>'error','message'=>'Đăng ký thất bại, vui lòng thử lại!'], 500);
            exit;

        case 'api_me':
            (new AuthController())->apiMe();
            exit;

        case 'api_delete_user':
            if (!in_array($method, ['DELETE','POST'], true)) {
                respond_json(['status'=>'error','message'=>'Method Not Allowed','allowed'=>'DELETE, POST'], 405);
            }
            $auth->deleteAccount();
            exit;

        case 'api_update_account':
            $auth->updateAccount();
            exit;

        /*************** POSTS (API) ***************/
        case 'latest_posts':         $postController->getLatestPosts();            exit;
        case 'popular_posts':        $postController->getPopularPosts();           exit;
        case 'post_detail_api':      $postController->postDetail($_GET['post_id'] ?? null); exit;
        case 'get_posts_by_album':   $postController->getPostsByAlbum();           exit;

        /*************** POSTS (VIEW) ***************/
        case 'post_detail':          $postController->showPostDetail();            exit;

        /*************** POST CRUD ***************/
        case 'list_all_posts':       $postController->listAllPosts();              exit;
        case 'create_post':          $postController->create();                    exit;
        case 'update_post':          $postController->update();                    exit;
        case 'delete_post':          $postController->delete();                    exit;
        case 'list_posts_by_category': $postController->getPostsByCategory();      exit;
        case 'list_posts_by_user':   $postController->getPostsByUserId($_GET['user_id'] ?? null); exit;
        case 'get_album_detail':     $albumController->albumDetail();              exit;
        case 'list_posts_by_following':
            if (!isset($_SESSION['user_id'])) { http_response_code(401); echo json_encode(["status"=>"error","message"=>"Unauthorized"]); exit; }
            $postController->getPostsFromFollowedUsers($_SESSION['user_id']);      exit;
        case 'count_posts_all':      (new PostController())->countAllPosts();      exit;
        case 'count_posts_by_user':  (new PostController())->countPostsByUser();   exit;
        case 'count_posts_by_album': (new PostController())->countPostsByAlbum();  exit;

        /*************** ALBUM CRUD ***************/
        case 'list_user_albums':     $albumController->listUserAlbums();           exit;
        case 'create_album':         $albumController->create();                   exit;
        case 'update_album':         $albumController->update();                   exit;
        case 'delete_album':         $albumController->delete();                   exit;
        case 'list_albums':          $albumController->listAllAlbums();            exit;
        case 'list_albums_by_user':  $albumController->listAlbumsByUserId();       exit;

        /*************** CATEGORY CRUD ***************/
        case 'list_categories':      $categoryController->listCategories();        exit;
        case 'create_category':      $categoryController->create();                exit;
        case 'update_category':      $categoryController->update();                exit;
        case 'delete_category':      $categoryController->delete();                exit;
        case 'category_post_counts':
            $category_id = $_GET['category_id'] ?? null;
            $categoryController->listCategoryWithPostCounts($category_id);         exit;

        /*************** HASHTAG CRUD ***************/
        case 'list_hashtags':        $hashtagController->listHashtags();           exit;
        case 'create_hashtag':       $hashtagController->create();                 exit;
        case 'update_hashtag':       $hashtagController->update();                 exit;
        case 'delete_hashtag':       $hashtagController->delete();                 exit;
        case 'hashtag_detail':       $hashtagController->detail();                 exit;
        case 'my_hashtags':          $hashtagController->getUserHashtags();        exit;

        /*************** SEARCH ***************/
        case 'search':               $searchController->search();                  exit;

        /*************** USER INFO (API JSON) ***************/
        case 'list_user_infos':
            if ($method !== 'GET') respond_json(['status'=>'error','message'=>'Method Not Allowed'], 405);
            $userInfoController->listUserInfos();                                  exit;

        case 'create_user_info_form':
            if ($method !== 'GET') respond_json(['status'=>'error','message'=>'Method Not Allowed'], 405);
            $userInfoController->showCreateForm();                                 exit;

        case 'create_user_info':
            if ($method !== 'POST') respond_json(['status'=>'error','message'=>'Method Not Allowed'], 405);
            $userInfoController->create();                                         exit;

        case 'show_edit_form':       $userInfoController->showEditForm();          exit;
        case 'update_user_info':     $userInfoController->update();                exit;

        case 'delete_user_info':
            if (!in_array($method, ['DELETE','POST'], true)) {
                respond_json(['status'=>'error','message'=>'Method Not Allowed','allowed'=>'DELETE, POST'], 405);
            }
            $userInfoController->delete();                                         exit;

        case 'show_user_info':       $userInfoController->showUserInfo();          exit;

        /*************** POST ↔ HASHTAG ***************/
        case 'list_post_hashtags':   $postHashtagController->listByPost($_GET['post_id'] ?? null); exit;
        case 'posts_by_hashtag':     $postHashtagController->getPostsByHashtagId($_GET['hashtag_id'] ?? null); exit;
        case 'create_post_hashtag_form':
            $postId = filter_var($_GET['post_id'] ?? null, FILTER_SANITIZE_STRING);
            if (!$postId) { http_response_code(400); die("Lỗi: Post ID không được cung cấp!"); }
            $postHashtagController->showCreateForm($postId);                       exit;
        case 'create_post_hashtag':
            if ($method !== 'POST') { http_response_code(405); die("Lỗi: Phương thức HTTP không được hỗ trợ!"); }
            $postHashtagController->create();                                      exit;
        case 'edit_post_hashtag_form':
            $postHashtagController->showEditForm($_GET['post_id'] ?? null, $_GET['old_hashtag_id'] ?? null); exit;
        case 'update_post_hashtag':  $postHashtagController->update();             exit;
        case 'delete_post_hashtag':  $postHashtagController->delete();             exit;

        /*************** ROLE CRUD ***************/
        case 'list_roles':           $roleController->listRoles();                 exit;
        case 'create_role_form':     $roleController->showCreateForm();            exit;
        case 'create_role':          $roleController->create();                    exit;
        case 'edit_role_form':       $roleController->showEditForm();              exit;
        case 'update_role':          $roleController->update();                    exit;
        case 'delete_role':          $roleController->delete();                    exit;

        /*************** COMMENT ***************/
        case 'list_comments_by_post':  $commentController->getCommentsByPostId($_GET['post_id'] ?? ''); exit;
        case 'count_comments_by_post': $commentController->countCommentsByPostId($_GET['post_id'] ?? ''); exit;
        case 'create_comment':
            $body = wants_json() ? read_json_body() : $_POST;
            $commentController->createComment($body['post_id'] ?? '', $body['content'] ?? '', $body['parent_id'] ?? null); exit;
        case 'update_comment':
            $body = wants_json() ? read_json_body() : $_POST;
            $commentController->updateComment($body['comment_id'] ?? '', $body['content'] ?? ''); exit;
        case 'delete_comment':
            $id = $_GET['id'] ?? $_POST['id'] ?? '';
            $commentController->deleteComment($id, $_SESSION['user_id'] ?? null);  exit;

        /*************** REACTION ***************/
        case 'toggle_reaction_api':
            $postId = $_POST['post_id'] ?? $_GET['post_id'] ?? null;
            $type   = $_POST['reaction_type'] ?? $_GET['reaction_type'] ?? null;
            $reactionController->toggleReactionApi($postId, $type);                 exit;

        case 'get_reaction_state_api':
            $reactionController->getReactionStateApi($_GET['post_id'] ?? null);     exit;

        case 'toggle_reaction':
            $postId = $_GET['post_id'] ?? null;
            $reactionType = $_GET['reaction_type'] ?? null;
            if (!$postId || !$reactionType) { header("Location: index.php"); exit; }
            $reactionController->toggleReaction($postId, $reactionType);            exit;

        case 'count_reactions':
            $postId = $_GET['post_id'] ?? null;
            if (!$postId) { http_response_code(400); echo json_encode(["ok"=>false,"error"=>"post_id là bắt buộc"]); exit; }
            $reactionController->countReactions($postId);                           exit;

        /*************** REPORT ***************/
        case 'toggle_report':
            $postId = $_POST['post_id'] ?? null;
            $reason = $_POST['reason'] ?? '';
            if (!$postId) { http_response_code(400); echo json_encode(["ok"=>false,"error"=>"post_id là bắt buộc"]); exit; }
            $reportController->toggleReport($postId, $reason);                      exit;

        case 'list_reports':
            $postId = $_GET['post_id'] ?? null;
            if (!$postId) { http_response_code(400); echo json_encode(["ok"=>false,"error"=>"post_id là bắt buộc"]); exit; }
            $reportController->listReports($postId);                                exit;

        case 'list_all_reports':     $reportController->listAllReports();          exit;
        case 'count_reports':
            $postId = $_GET['post_id'] ?? null;
            if (!$postId) { http_response_code(400); echo json_encode(["ok"=>false,"error"=>"post_id là bắt buộc"]); exit; }
            $reportController->countReportsByPost($postId);                         exit;

        case 'reporters_detail':
            $postId = $_GET['post_id'] ?? null;
            if (!$postId) { http_response_code(400); echo json_encode(["ok"=>false,"error"=>"post_id là bắt buộc"]); exit; }
            $reportController->getReportersDetail($postId);                         exit;

        /*************** USER FOLLOW ***************/
        case 'toggle_follow':        (new UserFollowController())->toggleFollow();  exit;
        case 'api_top_followed':
            $ufModel = new UserFollow();
            $users   = $ufModel->getTopFollowedUsers(10);
            respond_json(['status'=>'ok','data'=>$users], 200);
            exit;
        case 'api_user_following':   (new UserFollowController())->userFollowing(); exit;
        case 'api_user_followers':   (new UserFollowController())->userFollowers(); exit;
        case 'count_followers':      (new UserFollowController())->countFollowers(); exit;
        case 'count_following':      (new UserFollowController())->countFollowing(); exit;

        /*************** BOOKMARK ***************/
        case 'create_bookmark':      $bookmarkController->create();                 exit;
        case 'delete_bookmark':      $bookmarkController->remove();                 exit;
        case 'list_bookmarks':       $bookmarkController->listByUser();             exit;

        /*************** DOWNLOAD / ADMIN / PDF ***************/
        case 'download':             $postController->download();                   exit;
        case 'api_admin':            $auth->isAdmin();                              exit;
        case 'pdf_proxy':            $pdfProxyController->handle();                 exit;

        default:
            // Nếu là API call (Accept JSON / XHR) -> trả JSON 404
            if (wants_json()) {
                respond_json(['status'=>'error', 'message'=>'Unknown action'], 404);
            }
            // Nếu muốn render VIEW khi truy cập trực tiếp, bật 3 dòng dưới đây:
            // include $ROOT . '/views/layouts/header.php';
            // include $ROOT . '/views/home.php';
            // include $ROOT . '/views/layouts/footer.php';
            // exit;
            break;
    }
}

/*************************************************
 * 8) MẶC ĐỊNH KHI GỌI API KHÔNG CÓ action
 *************************************************/
respond_json(['status' => 'error', 'message' => 'No action'], 404);
