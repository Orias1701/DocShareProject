<?php
// controllers/PostController.php
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/Album.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Hashtag.php';
require_once __DIR__ . '/../models/PostHashtag.php';

require_once __DIR__ . '/../models/PostReaction.php';
require_once __DIR__ . '/../vendor/autoload.php';

class PostController
{
    private $postModel;
    private $hashtagModel;
    private $postHashtagModel;

    private $albumModel;
    private $categoryModel;
    private $reactionModel;

    public function __construct()
    {
        $this->postModel     = new Post();
        $this->albumModel    = new Album();
        $this->categoryModel = new Category();
        $this->reactionModel = new PostReaction();
        $this->hashtagModel  = new Hashtag();
        $this->postHashtagModel = new PostHashtag();
    }

    /** ===== Helpers ===== */
    private function respondJson($payload, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function respondError(string $msg, int $code = 400, array $extra = []): void
    {
        $this->respondJson(array_merge([
            'status'  => 'error',
            'message' => $msg,
        ], $extra), $code);
    }

    /** ===== JSON API ===== */

    /** Lấy danh sách bài viết mới nhất (đổi từ group1) */
    public function getLatestPosts()
    {
        try {
            $method = method_exists($this->postModel, 'getLatestPosts') ? 'getLatestPosts' : 'getGroup1List';
            $data = $this->postModel->{$method}();
            $this->respondJson(['status' => 'ok', 'data' => $data]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Lấy danh sách bài viết phổ biến (đổi từ group2) */
    public function getPopularPosts()
    {
        try {
            $method = method_exists($this->postModel, 'getPopularPosts') ? 'getPopularPosts' : 'getGroup2List';
            $data = $this->postModel->{$method}();
            $this->respondJson(['status' => 'ok', 'data' => $data]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Chi tiết 1 bài viết “gọn” */
    public function postDetail($postId = null)
    {
        try {
            if (!$postId && isset($_GET['post_id'])) $postId = $_GET['post_id'];
            if (!$postId) $this->respondError('post_id required', 422);

            $data = $this->postModel->getPostDetail($postId);
            if (!$data) $this->respondError('Post not found', 404);

            $this->respondJson(['status' => 'ok', 'data' => $data]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Bài viết theo category */
    public function getPostsByCategory()
    {
        $categoryId = $_GET['category_id'] ?? null;
        if (!$categoryId) $this->respondError('Category ID không hợp lệ', 422);

        try {
            $posts = $this->postModel->getPostByCategoryId($categoryId);
            $this->respondJson(['status' => 'ok', 'data' => $posts]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Bài viết theo nhiều hashtag ids (CSV) */
    public function getPostsByHashtag()
    {
        $hashtagIdsString = $_GET['hashtag_ids'] ?? '';
        $hashtagIds = array_filter(array_map('trim', explode(',', $hashtagIdsString)));
        if (empty($hashtagIds)) {
            $this->respondError('Vui lòng cung cấp ít nhất một Hashtag ID hợp lệ.', 422);
        }

        try {
            $posts = $this->postModel->getPostsByHashtagIds($hashtagIds);
            $this->respondJson(['status' => 'ok', 'data' => $posts]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Chi tiết bài viết đầy đủ (post + comments + reactions + userReaction) */
    public function showPostDetail()
    {
        $postId = $_GET['post_id'] ?? null;
        if (!$postId) $this->respondError("Thiếu post_id", 422);

        try {
            $post = $this->postModel->getPostById($postId);
            if (!$post) $this->respondError("Bài viết không tồn tại", 404);

            require_once __DIR__ . '/../models/PostComment.php';
            $comments       = (new PostComment())->getRootByPost($postId);
            $reactionCounts = $this->reactionModel->getReactionCounts($postId);

            $userReaction = null;
            if (isset($_SESSION['user_id'])) {
                $userReaction = $this->reactionModel->getUserReaction($postId, $_SESSION['user_id']);
            }

            $this->respondJson([
                'status' => 'ok',
                'data'   => [
                    'post'         => $post,
                    'comments'     => $comments,
                    'reactions'    => $reactionCounts,
                    'userReaction' => $userReaction
                ]
            ]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Danh sách tất cả bài viết */
    public function listAllPosts()
    {
        try {
            $posts = $this->postModel->getAllPosts();
            $this->respondJson(['status' => 'ok', 'data' => $posts]);
    } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Tạo bài viết */
    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            $this->respondError('Unauthorized', 401);
        }

        $title       = $_POST['title']       ?? '';
        $content     = $_POST['content']     ?? '';
        $description = $_POST['description'] ?? '';
        $summary     = $_POST['summary']     ?? '';
        $albumId     = $_POST['album_id']    ?? '';
        $categoryId  = $_POST['category_id'] ?? '';
        $bannerUrl   = null;
        $fileUrl     = null;
        $fileType    = null;

        $cloudinary = require __DIR__ . '/../config/cloudinary.php';
        $baseUrl    = 'http://' . $_SERVER['HTTP_HOST'] . '/';

        try {
            // Upload banner (optional)
            if (!empty($_FILES['banner']['tmp_name'])) {
                $uploadBanner = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], [
                    'folder' => 'post_banners'
                ]);
                $bannerUrl = $uploadBanner['secure_url'];
            }

            // Upload PDF (optional)
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $uploadedFile     = $_FILES['content_file'];
                $uploadedFileType = $uploadedFile['type'];
                $uploadedFileExt  = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
                $maxFileSize      = 10 * 1024 * 1024;

                if ($uploadedFileExt !== 'pdf') throw new Exception("Chỉ hỗ trợ PDF.");
                if ($uploadedFile['size'] > $maxFileSize) throw new Exception("File quá lớn (>10MB).");
                if ($uploadedFile['error'] !== UPLOAD_ERR_OK) throw new Exception("Lỗi upload file");

                $fileName  = uniqid() . '.' . $uploadedFileExt;
                $uploadDir = __DIR__ . '/../uploads/posts';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                $targetPath = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

                if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                    $fileUrl  = $baseUrl . 'uploads/posts/' . $fileName;
                    $fileType = $uploadedFileType;
                } else {
                    throw new Exception("Không thể lưu file upload.");
                }
            }

            // Create post
            $postId = $this->postModel->createPost(
                $title,
                $content,
                $description,
                $summary,
                $albumId,
                $categoryId,
                $bannerUrl,
                $fileUrl,
                $fileType
            );

            // Hashtags
            $createdHashtags = [];
            if (!empty($_POST['hashtags'])) {
                $hashtags = array_filter(array_map('trim', explode(',', $_POST['hashtags'])));
                foreach ($hashtags as $hashtag) {
                    $cleanHashtag = ltrim($hashtag, '#');
                    if (preg_match('/^[a-zA-Z0-9_]+$/', $cleanHashtag)) {
                        $hashtagId = $this->hashtagModel->findOrCreateHashtag($cleanHashtag);
                        $this->postHashtagModel->createHashtagToPost($postId, $hashtagId);
                        $createdHashtags[] = $cleanHashtag;
                    }
                }
            }

            $this->respondJson([
                'status'   => 'ok',
                'post_id'  => $postId,
                'hashtags' => $createdHashtags
            ], 201);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Cập nhật bài viết */
    /** Cập nhật META bài viết: title, banner_url, album/category (owner vs admin) */
    public function update()
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        return $this->respondError('Method Not Allowed', 405);
    }
    if (empty($_SESSION['user_id'])) {
        return $this->respondError('Unauthorized', 401);
    }

    // Lấy input JSON hoặc form-data
    $ct = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    $isJson = stripos($ct, 'application/json') !== false;
    $in = $isJson ? (json_decode(file_get_contents('php://input'), true) ?: []) : $_POST;

    $postId = $in['post_id'] ?? null;
    if (!$postId) return $this->respondError('Thiếu post_id', 422);

    $post = $this->postModel->getPostById($postId);
    if (!$post) return $this->respondError('Bài viết không tồn tại', 404);

    $roleId  = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
    $isAdmin = ($roleId === 'ROLE000');

    // Nếu có upload banner qua FormData → upload và gán lại banner_url
    if (!empty($_FILES['banner']['tmp_name'])) {
        try {
            $cloudinary = require __DIR__ . '/../config/cloudinary.php';
            $up = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], ['folder' => 'post_banners']);
            if (!empty($up['secure_url'])) {
                $in['banner_url'] = $up['secure_url'];
            }
        } catch (Exception $e) {
            return $this->respondError('Upload banner thất bại: ' . $e->getMessage(), 500);
        }
    }

    // Chuẩn hoá
    $title      = array_key_exists('title', $in) ? trim((string)$in['title']) : null;
    $bannerUrl  = array_key_exists('banner_url', $in) ? trim((string)$in['banner_url']) : null;
    $albumIdNew    = $in['album_id_new']    ?? ($in['album_id']    ?? null);
    $categoryIdNew = $in['category_id_new'] ?? ($in['category_id'] ?? null);
    $albumNameNew    = isset($in['album_name_new'])    ? trim((string)$in['album_name_new'])    : null;
    $categoryNameNew = isset($in['category_name_new']) ? trim((string)$in['category_name_new']) : null;

    // Validate cơ bản
    if ($title !== null && $title === '') {
        return $this->respondError('Title không được rỗng', 422);
    }
    // banner_url: chỉ check khi khác rỗng; rỗng "" nghĩa là xoá (set NULL ở model)
    if ($bannerUrl !== null && $bannerUrl !== '' && !filter_var($bannerUrl, FILTER_VALIDATE_URL)) {
        return $this->respondError('Banner URL không hợp lệ', 422);
    }
    if (!empty($albumIdNew) && !empty($albumNameNew)) {
        return $this->respondError('Chỉ chọn album khác HOẶC đổi tên album, không đồng thời.', 422);
    }
    if (!empty($categoryIdNew) && !empty($categoryNameNew)) {
        return $this->respondError('Chỉ chọn danh mục khác HOẶC đổi tên danh mục, không đồng thời.', 422);
    }

    // 🧱 Payload cơ sở (đủ trường cho cả 2 nhánh)
    $payload = [
        'post_id'           => $postId,
        'title'             => $title,          // null => giữ nguyên
        'banner_url'        => $bannerUrl,      // null => giữ nguyên, '' => clear (NULL)
        'album_id_new'      => $albumIdNew ?: null,
        'category_id_new'   => $categoryIdNew ?: null,
        'album_name_new'    => $albumNameNew ?: null,        // chỉ admin dùng
        'category_name_new' => $categoryNameNew ?: null,     // chỉ admin dùng
    ];

    try {
        if ($isAdmin) {
            // ✅ admin dùng full payload
            $this->postModel->adminUpdatePost($payload);
            return $this->respondJson(['status' => 'ok', 'message' => 'Cập nhật (admin) thành công']);
        }

        // 👤 owner: loại key đổi tên (model owner không hỗ trợ)
        $payloadOwner = $payload;
        unset($payloadOwner['album_name_new'], $payloadOwner['category_name_new']);

        // Điền fallback để giữ nguyên nếu FE không gửi (title/banner_url null)
        if (!array_key_exists('title', $payloadOwner) || $payloadOwner['title'] === null) {
            $payloadOwner['title'] = $post['title'];
        }
        if (!array_key_exists('banner_url', $payloadOwner) || $payloadOwner['banner_url'] === null) {
            $payloadOwner['banner_url'] = $post['banner_url']; // rỗng "" vẫn giữ nguyên để model xử lý clear
        }
        $payloadOwner['user_id'] = $_SESSION['user_id'];

        $this->postModel->ownerUpdatePost($payloadOwner);
        return $this->respondJson(['status' => 'ok', 'message' => 'Cập nhật thành công']);
    } catch (Exception $e) {
        return $this->respondError($e->getMessage(), 500);
    }
}





    /** Xoá bài viết */
    // controllers/PostController.php (bên trong class PostController)
    public function delete(): void
    {
        // if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'DELETE') {
        //     $this->respondError('Method Not Allowed', 405); // KHÔNG return
        // }
    
        if (empty($_SESSION['user_id'])) {
            $this->respondError('Unauthorized', 401); // KHÔNG return
        }
    
        $postId = $_GET['post_id'] ?? ($_POST['post_id'] ?? null);
        if (!$postId) {
            $raw = file_get_contents('php://input');
            if ($raw) {
                $json = json_decode($raw, true);
                if (is_array($json) && !empty($json['id'])) {
                    $postId = $json['id'];
                }
            }
        }
        if (!$postId) {
            $this->respondError("Thiếu id", 422); // KHÔNG return
        }
    
        $post = $this->postModel->getPostById($postId);
        if (!$post) {
            $this->respondError("Bài viết không tồn tại", 404); // KHÔNG return
        }
    
        $sessionRole = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
        $isAdmin     = ($sessionRole === 'ROLE000');
        $currentUid  = $_SESSION['user_id'];
    
        try {
            $deleted = $isAdmin
                ? $this->postModel->adminDeletePost($postId)
                : $this->postModel->deletePostByOwner($postId, $currentUid);
    
            if (!$deleted) {
                $this->respondError('Forbidden hoặc không có gì để xoá', 403); // KHÔNG return
            }
    
            if (!empty($post['file_url'])) {
                $path = parse_url($post['file_url'], PHP_URL_PATH);
                if ($path) {
                    $uploadsBase = realpath(__DIR__ . '/../uploads');
                    $relative    = ltrim(preg_replace('#^/uploads#i', '', $path), '/');
                    $filePath    = realpath($uploadsBase . DIRECTORY_SEPARATOR . $relative);
                    if ($filePath && strpos($filePath, $uploadsBase) === 0 && is_file($filePath)) {
                        @unlink($filePath);
                    }
                }
            }
    
            $this->respondJson([
                'status'  => 'ok',
                'message' => 'Đã xoá',
                'id'      => $postId,
                'by'      => $isAdmin ? 'admin' : 'owner'
            ]); // KHÔNG return
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500); // KHÔNG return
        }
    }
    




    // API: Lấy danh sách post theo user_id
    public function getPostsByUserId($userId = null)
    {
        try {
            $userId = $userId ?? ($_GET['user_id'] ?? ($_SESSION['user_id'] ?? null));
            if (empty($userId)) {
                return $this->respondError('user_id is required', 422);
            }

            $posts = $this->postModel->getPostsByUserId($userId);

            return $this->respondJson([
                'status' => 'success',
                'data'   => $posts
            ]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

    // API: Lấy bài viết từ những người mình đang theo dõi
    public function getPostsFromFollowedUsers($followerId = null)
    {
        try {
            $followerId = $followerId ?? ($_GET['follower_id'] ?? ($_SESSION['user_id'] ?? null));
            if (empty($followerId)) {
                return $this->respondError('Unauthorized', 401);
            }

            $posts = $this->postModel->getPostsFromFollowedUsers($followerId);

            return $this->respondJson([
                'status' => 'success',
                'data'   => $posts
            ]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

    public function getPostsByAlbum()
    {
        try {
            $albumId = $_GET['album_id'] ?? null;
            if (!$albumId) {
                return $this->respondError('album_id required', 422);
            }

            $rows = $this->postModel->getPostsByAlbumId($albumId);

            return $this->respondJson([
                'status' => 'ok',
                'data'   => $rows
            ]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

    /* =======================
     *  COUNT POSTS ENDPOINTS
     * ======================= */

    /** Đếm tổng số bài viết trong hệ thống */
    public function countAllPosts()
    {
        try {
            $count = $this->postModel->countAllPosts();
            return $this->respondJson(['status' => 'success', 'data' => ['count' => $count]]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

    /** Đếm số bài viết của một user (ưu tiên ?user_id=..., nếu không có thì dùng session) */
    public function countPostsByUser()
    {
        try {
            $userId = $_GET['user_id'] ?? ($_SESSION['user_id'] ?? null);
            if (empty($userId)) {
                return $this->respondError('user_id is required', 422);
            }
            $count = $this->postModel->countPostsByUserId($userId);
            return $this->respondJson(['status' => 'success', 'data' => ['count' => $count]]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

    /** Đếm số bài viết trong một album (?album_id=...) */
    public function countPostsByAlbum()
    {
        try {
            $albumId = $_GET['album_id'] ?? null;
            if (empty($albumId)) {
                return $this->respondError('album_id is required', 422);
            }
            $count = $this->postModel->countPostsByAlbumId($albumId);
            return $this->respondJson(['status' => 'success', 'data' => ['count' => $count]]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }
    // controllers/PostController.php (method download)
public function download()
{
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo "Bạn cần đăng nhập để tải file.";
        exit;
    }

    $postId = $_GET['post_id'] ?? null;
    if (!$postId) {
        http_response_code(422);
        echo "Thiếu post_id.";
        exit;
    }

    $post = $this->postModel->getPostById($postId);
    if (!$post) {
        http_response_code(404);
        echo "Không tìm thấy bài viết.";
        exit;
    }

    // Check quyền
    if (($post['privacy'] ?? null) === 'private'
        && ($post['author_id'] ?? null) !== ($_SESSION['user_id'] ?? null)) {
        http_response_code(403);
        echo "Bạn không có quyền tải file này.";
        exit;
    }
    $makeSafeName = function(string $title, string $ext) {
        $base = preg_replace('/[^\p{L}\p{N}\-_. ]/u', '', $title ?: 'tai_lieu');
        $base = preg_replace('/\s+/', '_', $base);
        return $base . '.' . $ext;
    };
    // === CASE 1: có file đính kèm (PDF, DOCX, ... trong uploads) ===
    if (!empty($post['file_url'])) {
        $fileUrl = $post['file_url'];
        $uploadsBase = realpath(__DIR__ . '/../uploads');

        $path = parse_url($fileUrl, PHP_URL_PATH) ?: '';
        $relative = ltrim(preg_replace('#^/uploads#i', '', $path), '/');
        $filePath = realpath($uploadsBase . DIRECTORY_SEPARATOR . $relative);

        if ($filePath && strpos($filePath, $uploadsBase) === 0 && is_file($filePath)) {
            $ext  = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'bin';
            $safe = $makeSafeName($post['title'] ?? 'tai_lieu', $ext);
            $mime = mime_content_type($filePath) ?: 'application/octet-stream';
        
            // >>> FIX QUAN TRỌNG <<<
            while (ob_get_level()) ob_end_clean();
            if (!headers_sent()) {
                header_remove("Content-Type");
            }
        
            header('Content-Type: ' . $mime);
            header('Content-Disposition: attachment; filename="' . $safe . '"');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        }
        

        http_response_code(404);
        echo "File không tồn tại.";
        exit;
    }

    // === CASE 2: không có file, chỉ có content HTML → xuất .doc ===
    $rawHtml = trim((string)($post['content'] ?? ''));
if ($rawHtml !== '') {
    while (ob_get_level()) ob_end_clean();
    if (!headers_sent()) {
        header_remove("Content-Type");
    }

    $title = htmlspecialchars($post['title'] ?? 'Tai lieu', ENT_QUOTES, 'UTF-8');
    $docHtml = <<<HTML
<!DOCTYPE html>
<html xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="UTF-8" />
<title>{$title}</title>
</head>
<body>
$rawHtml
</body>
</html>
HTML;

    $safe = $makeSafeName($post['title'] ?? 'tai_lieu', 'doc');
    header('Content-Type: application/msword; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $safe . '"');
    header('Content-Length: ' . strlen($docHtml));
    echo $docHtml;
    exit;
}


    http_response_code(404);
    echo "Bài viết không có file hay nội dung.";
    exit;
}


}
