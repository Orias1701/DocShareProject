<?php
// public/index.php - single entry point

/*************************************************
 * 1) CORS & PRE-FLIGHT (hỗ trợ origin động + credentials)
 *************************************************/
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173', // Đảm bảo đây là domain frontend của bạn
];

// Chỉ cho phép các origin hợp lệ trong danh sách allowedOrigins
if (in_array($origin, $allowedOrigins, strict: true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback cho môi trường localhost (nếu không có trong danh sách)
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Expose-Headers: Content-Type, Authorization");

// Nếu là preflight request (OPTIONS), trả về mã trạng thái 204
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}


/*************************************************
 * 2) SESSION COOKIE CHO CROSS-ORIGIN
 *************************************************/
$lifetime = 60 * 60 * 24 * 7; // 7 ngày

// Thiết lập cookie session tương thích cross-origin (frontend khác origin)
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path'     => '/',
    'domain'   => '',        // để rỗng cho localhost
    'secure'   => true,      // nên bật; Chrome coi localhost là secure context
    'httponly' => true,
    'samesite' => 'None',    // QUAN TRỌNG khi gọi từ origin khác
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/*************************************************
 * 3) INCLUDE MODEL + CONTROLLER
 *************************************************/
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
require_once __DIR__ . '/../models/bookmark.php';
require_once __DIR__ . '/../models/Search.php';




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
require_once __DIR__ . '/../controllers/BookmarkController.php';
require_once __DIR__ . '/../controllers/SearchController.php';
require_once __DIR__ . '/../controllers/PdfProxyController.php';



/*************************************************
 * 4) KHỞI TẠO CONTROLLER
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
$bookmarkController = new BookmarkController();
$searchController = new SearchController();
$pdfProxyController = new PdfProxyController();



/*************************************************
 * 5) TIỆN ÍCH NHỎ
 *************************************************/
function wants_json(): bool
{
    // Ưu tiên Accept: application/json
    if (isset($_SERVER['HTTP_ACCEPT']) && stripos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        return true;
    }
    // Hoặc là AJAX
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        return true;
    }
    // Hoặc Content-Type là JSON
    if (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
        return true;
    }
    return false;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond_json($payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/*************************************************
 * 6) ROUTER
 *************************************************/
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {
        /*************** AUTH (VIEW) ****************/
        // case 'login':
        //     include __DIR__ . '/../views/login.php';
        //     exit;

        case 'login_post':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Đường cũ: xử lý theo AuthController (view/redirect)
                $auth->apiLogin($_POST['email'] ?? $_POST['identifier'] ?? '', $_POST['password'] ?? '');
            }
            exit;

            // case 'register':
            //     include __DIR__ . '/../views/register.php';
            //     exit;

        case 'register_post':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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


        /*************** AUTH (API JSON) ************
             * Dùng cho frontend fetch, không redirect
             ********************************************/
        case 'api_login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                respond_json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
            }
            $body = wants_json() ? read_json_body() : $_POST;
            $identifier = $body['identifier'] ?? $body['email'] ?? '';
            $password   = $body['password']   ?? '';

            if ($identifier === '' || $password === '') {
                respond_json(['status' => 'error', 'message' => 'Thiếu identifier/email hoặc password'], 400);
            }

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
                        'avatar_url' => $user['avatar_url'] ?? null,
                    ]
                ], 200);
            } else {
                respond_json(['status' => 'error', 'message' => 'Sai tên đăng nhập/email hoặc mật khẩu!'], 401);
            }
            exit;

        case 'api_register':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                respond_json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
            }
            $body = wants_json() ? read_json_body() : $_POST;

            $username   = trim($body['username']   ?? '');
            $email      = trim($body['email']      ?? '');
            $password   = (string)($body['password'] ?? '');
            $full_name  = trim($body['full_name']  ?? '');
            $birth_date = trim($body['birth_date'] ?? '');
            $avatar_url = $body['avatar_url'] ?? null;
            $bio        = $body['bio']        ?? null;

            if ($username === '' || $email === '' || $password === '' || $full_name === '' || $birth_date === '') {
                respond_json(['status' => 'error', 'message' => 'Thiếu trường bắt buộc'], 400);
            }

            $userModel = new User();
            if ($userModel->getByEmail($email)) {
                respond_json(['status' => 'error', 'message' => 'Email đã tồn tại!'], 409);
            }
            if ($userModel->getByUsername($username)) {
                respond_json(['status' => 'error', 'message' => 'Tên người dùng đã tồn tại!'], 409);
            }

            $hashed = password_hash($password, PASSWORD_BCRYPT);
            $created = $userModel->createUser(
                $username,
                $email,
                $hashed,
                "ROLE001",     // role mặc định
                $full_name,
                $avatar_url,
                $bio,
                $birth_date
            );

            if ($created) {
                respond_json(['status' => 'ok', 'message' => 'Tạo tài khoản thành công'], 201);
            } else {
                respond_json(['status' => 'error', 'message' => 'Đăng ký thất bại, vui lòng thử lại!'], 500);
            }
            exit;

            // Lấy thông tin user đang đăng nhập theo session (tiện cho FE)
        case 'api_me':
            (new AuthController())->apiMe();
            exit;


        /*************** API POSTS ***************/
        case 'latest_posts':
            $postController->getLatestPosts();
            exit;
        case 'popular_posts':
            $postController->getPopularPosts();
            exit;
        case 'post_detail_api':
            $postController->postDetail($_GET['post_id'] ?? null);
            exit;
        case 'get_posts_by_album':
            $postController->getPostsByAlbum();
            exit;
            
            
        /*************** POST DETAIL (VIEW) ***************/
        case 'post_detail':
            $postController->showPostDetail();
            exit;

        /*************** POST CRUD ***************/
        case 'list_all_posts':
            $postController->listAllPosts();
            exit;
        case 'create_post':
            $postController->create();
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
        case 'posts_by_hashtag':
            $postHashtagController->getPostsByHashtagId($_GET['hashtag_id'] ?? null);
        exit;
            
        case 'list_posts_by_user':
            $userId = $_GET['user_id'] ?? null;
            $postController->getPostsByUserId($userId);
            exit;
        case 'list_posts_by_following':
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "message" => "Unauthorized"
                ]);
                exit;
            }
            $postController->getPostsFromFollowedUsers($_SESSION['user_id']);
            exit;
        case 'count_posts_all':
                (new PostController())->countAllPosts();
                break;
            
        case 'count_posts_by_user':
                (new PostController())->countPostsByUser(); // ?user_id=... (hoặc session)
                break;
            
        case 'count_posts_by_album':
                (new PostController())->countPostsByAlbum(); // ?album_id=...
                break;
            



        /*************** ALBUM CRUD ***************/
        case 'list_user_albums':
            $albumController->listUserAlbums();
            exit;
        case 'create_album':
            $albumController->create();
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

        /*************** CATEGORY CRUD ***************/
        case 'list_categories':
            $categoryController->listCategories();
            exit;
        case 'create_category':
            $categoryController->create();
            exit;
        case 'update_category':
            $categoryController->update();
            exit;
        case 'delete_category':
            $categoryController->delete();
            exit;

        /*************** HASHTAG CRUD ***************/
        case 'list_hashtags':
            $hashtagController->listHashtags();
            exit;
        case 'create_hashtag':
            $hashtagController->create();
            exit;
        case 'update_hashtag':
            $hashtagController->update();
            exit;
        case 'delete_hashtag':
            $hashtagController->delete();
            exit;
        case 'hashtag_detail':
            $hashtagController->detail();
            exit;
        case 'my_hashtags':
            $hashtagController->getUserHashtags();
            exit;

        /*************** Search ***************/

        case 'search':
            $searchController->search();
            exit;


        /*************** USER INFO (API JSON) ***************/
        case 'list_user_infos':            // GET
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                respond_json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
            }
            $userInfoController->listUserInfos(); // controller đã respond_json
            exit;

        case 'create_user_info_form':      // GET: trả danh sách user còn trống user_info (nếu FE cần)
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                respond_json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
            }
            $userInfoController->showCreateForm();
            exit;

        case 'create_user_info':           // POST
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                respond_json(['status' => 'error', 'message' => 'Method Not Allowed'], 405);
            }
            $userInfoController->create();
            exit;

        case 'show_edit_form':
            $userInfoController->showEditForm(); // ➜ trả JSON
            exit;

        case 'update_user_info':
            $userInfoController->update();       // ➜ trả JSON
            exit;

        case 'delete_user_info':           // DELETE hoặc POST (tuỳ client)
            $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
            if (!in_array($m, ['DELETE', 'POST'], true)) {
                respond_json(['status' => 'error', 'message' => 'Method Not Allowed', 'allowed' => 'DELETE, POST'], 405);
            }
            $userInfoController->delete();
            exit;

        case 'show_user_info':
            $userInfoController->showUserInfo(); // ➜ trả JSON
            exit;

        /*************** POST HASHTAG CRUD ***************/
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
        
        /*************** ROLE CRUD ***************/
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

        /*************** COMMENT ***************/
        case 'list_comments_by_post':
            $commentController->getCommentsByPostId($_GET['post_id'] ?? '');
            exit;

        case 'count_comments_by_post':
            $commentController->countCommentsByPostId($_GET['post_id'] ?? '');
        exit;
            
        case 'create_comment':
            // POST only
            $body = wants_json() ? read_json_body() : $_POST;
            $commentController->createComment($body['post_id'] ?? '', $body['content'] ?? '', $body['parent_id'] ?? null);
            exit;

        case 'update_comment':
            // POST only
            $body = wants_json() ? read_json_body() : $_POST;
            $commentController->updateComment($body['comment_id'] ?? '', $body['content'] ?? '');
            exit;

        case 'delete_comment':
            // GET ?id=... hoặc POST id
            $id = $_GET['id'] ?? $_POST['id'] ?? '';
            $commentController->deleteComment($id, $_SESSION['user_id'] ?? null);
            exit;


        /*************** REACTION ***************/
        case 'toggle_reaction_api': {
            $postId = $_POST['post_id'] ?? $_GET['post_id'] ?? null;
            $type   = $_POST['reaction_type'] ?? $_GET['reaction_type'] ?? null;
            $reactionController->toggleReactionApi($postId, $type);
            exit; // bắt buộc để không render HTML
        }
        
        case 'get_reaction_state_api': {
            $postId = $_GET['post_id'] ?? null;
            $reactionController->getReactionStateApi($postId);
            exit; // bắt buộc
        }
        
        
        case 'toggle_reaction':
            $postId = $_GET['post_id'] ?? null;
            $reactionType = $_GET['reaction_type'] ?? null;
            if (!$postId || !$reactionType) {
                header("Location: index.php");
                exit;
            }
            $reactionController->toggleReaction($postId, $reactionType);
            exit;
        

        /*************** REPORT ***************/
        // === REPORT API ===
        case 'toggle_report':
            $postId = $_POST['post_id'] ?? null;
            $reason = $_POST['reason'] ?? '';
            if (!$postId) {
                http_response_code(400);
                echo json_encode(["ok" => false, "error" => "post_id là bắt buộc"]);
                exit;
            }
            $reportController->toggleReport($postId, $reason);
            exit;

        case 'list_reports':
            $postId = $_GET['post_id'] ?? null;
            if (!$postId) {
                http_response_code(400);
                echo json_encode(["ok" => false, "error" => "post_id là bắt buộc"]);
                exit;
            }
            $reportController->listReports($postId);
            exit;

        case 'list_all_reports':
            $reportController->listAllReports();
            exit;


        /*************** USER FOLLOW ***************/
        case 'toggle_follow':
            $ctrl = new UserFollowController();
            $ctrl->toggleFollow();
            exit;
        case 'api_top_followed':
            // $limit = $_GET['limit'] ?? 10;
            // $ufModel = new UserFollow();
            // $users = $ufModel->getTopFollowedUsers((int)$limit);
            $ufModel = new UserFollow();
            $users = $ufModel->getTopFollowedUsers(10);
            respond_json([
                'status' => 'ok',
                'data'   => $users
            ], 200);
            exit;
        case 'api_user_following':
            $ctrl = new UserFollowController();
            $ctrl->userFollowing();
            exit;

        case 'api_user_followers':
            $ctrl = new UserFollowController();
            $ctrl->userFollowers();
            exit;
        case 'count_followers':
            (new UserFollowController())->countFollowers();
            break;
            
        case 'count_following':
            (new UserFollowController())->countFollowing();
            break;
            
        /*************** BOOKMARK CRUD ***************/
        case 'create_bookmark':
            $bookmarkController->create();
            exit;
        case 'delete_bookmark':
            $bookmarkController->remove();
            exit;
        case 'list_bookmarks':
            $bookmarkController->listByUser();
            exit;

        /*************** POST DOWNLOAD ***************/
        case 'download':
            $postController->download();
            exit;
        /*************** CHECK ADMIN ***************/
        case 'api_admin':
            $auth->isAdmin();
            exit;
        /*************** PDF PROXY ***************/
        case 'pdf_proxy':
            $pdfProxyController->handle();
            exit;
        default:
            header("Location: index.php");
            exit;
    }
    
}

/*************************************************
 * 7) TRANG CHỦ (VIEW)
 *************************************************/
include __DIR__ . '/../views/layouts/header.php';
include __DIR__ . '/../views/home.php';
include __DIR__ . '/../views/layouts/footer.php';
