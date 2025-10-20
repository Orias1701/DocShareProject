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
        $this->postModel        = new Post();
        $this->albumModel       = new Album();
        $this->categoryModel    = new Category();
        $this->reactionModel    = new PostReaction();
        $this->hashtagModel     = new Hashtag();
        $this->postHashtagModel = new PostHashtag();
    }

    /* =========================
     * Helpers (response/paths)
     * ========================= */

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

    /** https scheme trong môi trường thực tế */
    private function detectScheme(): string
    {
        if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
        ) {
            return 'https';
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
            $p = strtolower(trim($_SERVER['HTTP_X_FORWARDED_PROTO']));
            if ($p === 'https') return 'https';
        }
        return 'http';
    }

    /**
     * Base URL public của app (kể cả subfolder /DocShareProject/)
     * ví dụ: https://baotest.wuaze.com/DocShareProject/
     */
    private function getPublicBaseUrl(): string
    {
        $scheme   = $this->detectScheme();
        $host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $dir      = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/index.php'), '/'); // /DocShareProject/public => dirname => /DocShareProject
        $basePath = $dir === '/' ? '' : $dir;
        return rtrim(sprintf('%s://%s%s/', $scheme, $host, $basePath), '/') . '/';
    }

    /** Đường dẫn thư mục uploads trong public */
    private function getUploadsDirPublic(): string
    {
        return __DIR__ . '/../public/uploads/posts';
    }

    /** Map từ URL public (…/DocShareProject/uploads/…) về đường dẫn thực (public/uploads/…) */
    private function mapPublicUrlToLocalPath(string $fileUrl): ?string
    {
        $path = parse_url($fileUrl, PHP_URL_PATH) ?: '';
        // lấy base path của app, ví dụ: /DocShareProject
        $appBasePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/index.php'), '/'); // /DocShareProject
        // Chuẩn hóa: bỏ phần {appBasePath}/uploads/ khỏi đầu để còn lại phần tương đối sau /uploads
        $regex = '#^' . preg_quote($appBasePath, '#') . '/uploads#i';
        $relative = ltrim(preg_replace($regex, '', $path), '/'); // posts/abc.pdf

        $publicUploadsBase = realpath(__DIR__ . '/../public/uploads'); // .../public/uploads
        if (!$publicUploadsBase) return null;

        $candidate = realpath($publicUploadsBase . DIRECTORY_SEPARATOR . $relative);
        if ($candidate && strpos($candidate, $publicUploadsBase) === 0 && is_file($candidate)) {
            return $candidate;
        }
        return null;
    }

    /* ===============
     * JSON ENDPOINTS
     * =============== */

    /** Bài viết mới nhất */
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

    /** Bài viết phổ biến */
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

    /** Chi tiết gọn */
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

    /** Bài viết theo nhiều hashtag id (CSV) */
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

    /** Chi tiết đầy đủ (post + comments + reactions + userReaction) */
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

    /** Tạo bài viết (upload banner Cloudinary + file PDF vào public/uploads/posts) */
    public function create()
    {
        if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !isset($_SESSION['user_id'])) {
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

        // URL base public (đúng scheme + subfolder)
        $publicBaseUrl = $this->getPublicBaseUrl(); // ví dụ: https://baotest.wuaze.com/DocShareProject/

        // chuẩn bị thư mục upload trong public
        $uploadDir = $this->getUploadsDirPublic();
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        try {
            // Upload banner (Cloudinary) - tùy chọn
            if (!empty($_FILES['banner']['tmp_name'])) {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $uploadBanner = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], [
                    'folder' => 'post_banners'
                ]);
                $bannerUrl = $uploadBanner['secure_url'] ?? null;
            }

            // Upload file PDF (tùy chọn) vào public/uploads/posts
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $uploadedFile     = $_FILES['content_file'];
                $uploadedFileType = $uploadedFile['type'] ?? 'application/octet-stream';
                $uploadedFileExt  = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
                $maxFileSize      = 10 * 1024 * 1024; // 10MB

                if ($uploadedFileExt !== 'pdf')  throw new Exception("Chỉ hỗ trợ PDF.");
                if ($uploadedFile['size'] > $maxFileSize) throw new Exception("File quá lớn (>10MB).");
                if ($uploadedFile['error'] !== UPLOAD_ERR_OK) throw new Exception("Lỗi upload file");

                $fileName   = uniqid('p_', true) . '.' . $uploadedFileExt;
                $targetPath = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

                if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                    throw new Exception("Không thể lưu file upload.");
                }

                // URL public để FE truy cập
                $fileUrl  = $publicBaseUrl . 'uploads/posts/' . $fileName; // ví dụ: https://.../DocShareProject/uploads/posts/xxx.pdf
                $fileType = $uploadedFileType;
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

    /** Cập nhật meta bài viết */
    public function update()
    {
        if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            return $this->respondError('Method Not Allowed', 405);
        }
        if (empty($_SESSION['user_id'])) {
            return $this->respondError('Unauthorized', 401);
        }

        $ct    = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
        $isJson = stripos($ct, 'application/json') !== false;

        if ($isJson) {
            $raw = file_get_contents('php://input');
            $in  = json_decode($raw, true) ?: [];
        } else {
            $in = $_POST;
        }

        $postId = $in['post_id'] ?? null;
        if (!$postId) return $this->respondError('Thiếu post_id', 422);

        $post = $this->postModel->getPostById($postId);
        if (!$post) return $this->respondError('Bài viết không tồn tại', 404);

        $roleId  = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
        $isAdmin = ($roleId === 'ROLE000');
        $isOwner = (($post['author_id'] ?? null) === ($_SESSION['user_id'] ?? null));

        // Nếu nhận FormData có banner file -> upload => banner_url
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

        $title      = array_key_exists('title', $in) ? trim((string)$in['title']) : null;
        $bannerUrl  = array_key_exists('banner_url', $in) ? trim((string)$in['banner_url']) : null;

        $albumIdNew    = $in['album_id_new']    ?? ($in['album_id']    ?? null);
        $categoryIdNew = $in['category_id_new'] ?? ($in['category_id'] ?? null);

        $albumNameNew    = isset($in['album_name_new'])    ? trim((string)$in['album_name_new'])    : null;
        $categoryNameNew = isset($in['category_name_new']) ? trim((string)$in['category_name_new']) : null;

        if ($title !== null && $title === '') return $this->respondError('Title không được rỗng', 422);
        if (!empty($bannerUrl) && !filter_var($bannerUrl, FILTER_VALIDATE_URL)) {
            return $this->respondError('Banner URL không hợp lệ', 422);
        }
        if (!empty($albumIdNew) && !empty($albumNameNew)) {
            return $this->respondError('Chỉ chọn album khác HOẶC đổi tên album, không đồng thời.', 422);
        }
        if (!empty($categoryIdNew) && !empty($categoryNameNew)) {
            return $this->respondError('Chỉ chọn danh mục khác HOẶC đổi tên danh mục, không đồng thời.', 422);
        }

        try {
            if ($isAdmin && !$isOwner) {
                $payload = [
                    'post_id'           => $postId,
                    'title'             => $title,
                    'banner_url'        => $bannerUrl,
                    'album_id_new'      => $albumIdNew ?: null,
                    'category_id_new'   => $categoryIdNew ?: null,
                    'album_name_new'    => $albumNameNew ?: null,
                    'category_name_new' => $categoryNameNew ?: null,
                ];
                $this->postModel->adminUpdatePost($payload);
                return $this->respondJson(['status' => 'ok', 'message' => 'Cập nhật (admin) thành công']);
            }

            $payload = [
                'post_id'         => $postId,
                'user_id'         => $_SESSION['user_id'],
                'title'           => $title      !== null ? $title      : $post['title'],
                'banner_url'      => $bannerUrl  !== null ? $bannerUrl  : $post['banner_url'],
                'album_id_new'    => $albumIdNew ?: null,
                'category_id_new' => $categoryIdNew ?: null,
            ];
            $this->postModel->ownerUpdatePost($payload);
            return $this->respondJson(['status' => 'ok', 'message' => 'Cập nhật (owner) thành công']);

        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

    /** Xoá bài viết */
    public function delete(): void
    {
        if (empty($_SESSION['user_id'])) {
            $this->respondError('Unauthorized', 401);
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
            $this->respondError("Thiếu id", 422);
        }

        $post = $this->postModel->getPostById($postId);
        if (!$post) {
            $this->respondError("Bài viết không tồn tại", 404);
        }

        $sessionRole = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
        $isAdmin     = ($sessionRole === 'ROLE000');
        $currentUid  = $_SESSION['user_id'];

        try {
            $deleted = $isAdmin
                ? $this->postModel->adminDeletePost($postId)
                : $this->postModel->deletePostByOwner($postId, $currentUid);

            if (!$deleted) {
                $this->respondError('Forbidden hoặc không có gì để xoá', 403);
            }

            // Nếu có file -> thử xoá file trong public/uploads
            if (!empty($post['file_url'])) {
                $filePath = $this->mapPublicUrlToLocalPath($post['file_url']);
                if ($filePath && is_file($filePath)) {
                    @unlink($filePath);
                }
            }

            $this->respondJson([
                'status'  => 'ok',
                'message' => 'Đã xoá',
                'id'      => $postId,
                'by'      => $isAdmin ? 'admin' : 'owner'
            ]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Danh sách post theo user */
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

    /** Bài viết từ những người đang theo dõi */
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

    /** Bài viết theo album */
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
     *   COUNT POSTS ENDPOINTS
     * ======================= */

    public function countAllPosts()
    {
        try {
            $count = $this->postModel->countAllPosts();
            return $this->respondJson(['status' => 'success', 'data' => ['count' => $count]]);
        } catch (Exception $e) {
            return $this->respondError($e->getMessage(), 500);
        }
    }

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

    /* ==========
     * DOWNLOAD
     * ========== */

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

        // Quyền
        if (($post['privacy'] ?? null) === 'private'
            && ($post['author_id'] ?? null) !== ($_SESSION['user_id'] ?? null)) {
            http_response_code(403);
            echo "Bạn không có quyền tải file này.";
            exit;
        }

        $makeSafeName = function (string $title, string $ext) {
            $base = preg_replace('/[^\p{L}\p{N}\-_. ]/u', '', $title ?: 'tai_lieu');
            $base = preg_replace('/\s+/', '_', $base);
            return $base . '.' . $ext;
        };

        // CASE 1: có file_url (đã upload vào public/uploads/posts)
        if (!empty($post['file_url'])) {
            $filePath = $this->mapPublicUrlToLocalPath($post['file_url']);
            if ($filePath && is_file($filePath)) {
                $ext  = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'bin';
                $safe = $makeSafeName($post['title'] ?? 'tai_lieu', $ext);
                $mime = mime_content_type($filePath) ?: 'application/octet-stream';

                while (ob_get_level()) ob_end_clean();
                if (!headers_sent()) header_remove("Content-Type");

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

        // CASE 2: không có file, chỉ có content HTML → xuất .doc
        $rawHtml = trim((string)($post['content'] ?? ''));
        if ($rawHtml !== '') {
            while (ob_get_level()) ob_end_clean();
            if (!headers_sent()) header_remove("Content-Type");

            $title  = htmlspecialchars($post['title'] ?? 'Tai lieu', ENT_QUOTES, 'UTF-8');
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
