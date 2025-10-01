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
                $targetPath = $uploadDir . $fileName;

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
    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            $this->respondError('Unauthorized', 401);
        }

        $postId = $_POST['post_id'] ?? null;
        if (!$postId) $this->respondError("Thiếu post_id", 422);

        $post = $this->postModel->getPostById($postId);
        if (!$post) $this->respondError("Bài viết không tồn tại", 404);
        if ($post['author_id'] !== $_SESSION['user_id']) $this->respondError("Forbidden", 403);

        $title       = $_POST['title']       ?? '';
        $content     = $_POST['content']     ?? '';
        $description = $_POST['description'] ?? '';
        $summary     = $_POST['summary']     ?? '';
        $albumId     = $_POST['album_id']    ?? '';
        $categoryId  = $_POST['category_id'] ?? '';
        $bannerUrl   = $post['banner_url'];
        $fileUrl     = $post['file_url'];
        $fileType    = $post['file_type'];

        $cloudinary = require __DIR__ . '/../config/cloudinary.php';
        $baseUrl    = 'http://' . $_SERVER['HTTP_HOST'] . '/';

        try {
            // Banner mới (optional)
            if (!empty($_FILES['banner']['tmp_name'])) {
                $upload = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], ['folder' => 'post_banners']);
                $bannerUrl = $upload['secure_url'];
            }

            // File PDF mới (optional)
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $uploadedFile     = $_FILES['content_file'];
                $uploadedFileType = $uploadedFile['type'];
                $uploadedFileExt  = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
                $maxFileSize      = 10 * 1024 * 1024;

                if ($uploadedFileExt !== 'pdf') throw new Exception("Chỉ hỗ trợ PDF.");
                if ($uploadedFile['size'] > $maxFileSize) throw new Exception("File quá lớn (>10MB).");
                if ($uploadedFile['error'] !== UPLOAD_ERR_OK) throw new Exception("Lỗi upload file");

                // Xoá file cũ nếu có
                $oldPath = $post['file_url'] ? (__DIR__ . '/../' . ltrim(parse_url($post['file_url'], PHP_URL_PATH), '/')) : null;
                if ($oldPath && file_exists($oldPath)) {
                    @unlink($oldPath);
                }

                $fileName  = uniqid() . '.' . $uploadedFileExt;
                $uploadDir = __DIR__ . '/../uploads/posts/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                    $fileUrl  = $baseUrl . 'uploads/posts/' . $fileName;
                    $fileType = $uploadedFileType;
                } else {
                    throw new Exception("Không thể lưu file upload.");
                }
            }

            $this->postModel->updatePost(
                $postId,
                $title,
                $content,
                $description,
                $summary,
                $albumId,
                $categoryId,
                $bannerUrl,
                $_SESSION['user_id'],
                $fileUrl,
                $fileType
            );

            $this->respondJson(['status' => 'ok', 'message' => 'Cập nhật thành công']);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }

    /** Xoá bài viết */
    public function delete()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->respondError('Unauthorized', 401);
        }

        $postId = $_GET['id'] ?? ($_POST['id'] ?? null);
        if (!$postId) $this->respondError("Thiếu id", 422);

        $post = $this->postModel->getPostById($postId);
        if (!$post) $this->respondError("Bài viết không tồn tại", 404);
        if ($post['author_id'] !== $_SESSION['user_id']) $this->respondError("Forbidden", 403);

        try {
            // Xoá file đính kèm nếu có
            $oldPath = $post['file_url'] ? (__DIR__ . '/../' . ltrim(parse_url($post['file_url'], PHP_URL_PATH), '/')) : null;
            if ($oldPath && file_exists($oldPath)) {
                @unlink($oldPath);
            }

            $this->postModel->deletePost($postId, $_SESSION['user_id']);

            $this->respondJson(['status' => 'ok', 'message' => 'Đã xoá', 'id' => (int)$postId]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
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
    public function download()
{
    // 1) Bắt buộc đăng nhập
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo "Bạn cần đăng nhập để tải file.";
        exit;
    }

    // 2) Lấy post_id
    $postId = $_GET['post_id'] ?? null;
    if (!$postId) {
        http_response_code(422);
        echo "Thiếu post_id.";
        exit;
    }

    // 3) Lấy post
    $post = $this->postModel->getPostById($postId);
    if (!$post) {
        http_response_code(404);
        echo "Không tìm thấy bài viết.";
        exit;
    }

    // 4) Check quyền riêng tư
    if (($post['privacy'] ?? null) === 'private'
        && ($post['author_id'] ?? null) !== ($_SESSION['user_id'] ?? null)) {
        http_response_code(403);
        echo "Bạn không có quyền tải file này.";
        exit;
    }

    // Helper: tạo tên file an toàn
    $makeSafeName = function(string $title, string $ext) {
        $base = preg_replace('/[^a-zA-Z0-9-_]+/', '_', $title ?: 'tai_lieu');
        return $base . '.' . ltrim($ext, '.');
    };

    // ===== CASE 1: Có file đính kèm =====
if (!empty($post['file_url'])) {
    $fileUrl = $post['file_url'];

    // Nếu là URL tuyệt đối (http/https)
    if (preg_match('#^https?://#i', $fileUrl)) {
        $ext = pathinfo(parse_url($fileUrl, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'bin';
        $safeName = $makeSafeName($post['title'] ?? 'tai_lieu', $ext);

        if (ini_get('allow_url_fopen')) {
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="'.$safeName.'"');
            while (ob_get_level()) ob_end_clean();
            readfile($fileUrl);
            exit;
        } else {
            header("Location: ".$fileUrl);
            exit;
        }
    }

    // Nếu là file local
    $path = parse_url($fileUrl, PHP_URL_PATH); // "/uploads/posts/xxx.pdf"
    $uploadsBase = realpath(__DIR__ . '/../uploads'); 
    $relative = preg_replace('#^/uploads#i', '', $path); 
    $filePath = rtrim($uploadsBase, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . ltrim($relative, DIRECTORY_SEPARATOR);

    if (!is_file($filePath)) {
        http_response_code(404);
        echo "File không tồn tại trên server: $filePath";
        exit;
    }

    $ext = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'bin';
    $safeName = $makeSafeName($post['title'] ?? 'tai_lieu', $ext);
    $mime = mime_content_type($filePath) ?: 'application/octet-stream';

    header('Content-Type: '.$mime);
    header('Content-Disposition: attachment; filename="'.$safeName.'"');
    header('Content-Length: '.filesize($filePath));
    while (ob_get_level()) ob_end_clean();
    readfile($filePath);
    exit;
}


    // ===== CASE 2: Không có file, nhưng có content HTML =====
    $rawHtml = trim((string)($post['content'] ?? ''));
    if ($rawHtml !== '') {
        // a) Bỏ BOM, XML header nếu có
        $rawHtml = preg_replace('/^\xEF\xBB\xBF/', '', $rawHtml);
        $rawHtml = preg_replace('/^<\?xml[^>]*\?>/i', '', $rawHtml);

        // b) Chuyển URL tương đối thành tuyệt đối
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base   = $scheme.'://'.$host.'/';

        $absUrl = function($u) use ($base) {
            $u = trim($u);
            if ($u === '' || preg_match('#^(https?:)?//#i', $u)) return $u;
            if ($u[0] === '/') return $base.ltrim($u, '/');
            return $base.$u;
        };

        $rawHtml = preg_replace_callback(
            '#\b(src|href)\s*=\s*([\'"])(.*?)\2#i',
            function($m) use ($absUrl) {
                return $m[1].'='.$m[2].$absUrl($m[3]).$m[2];
            },
            $rawHtml
        );

        // c) Bọc HTML chuẩn cho Word
        $title = htmlspecialchars($post['title'] ?? 'Tai lieu', ENT_QUOTES, 'UTF-8');
        $docHtml = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>{$title}</title>
<style>
body { font-family: "Times New Roman", serif; font-size: 14pt; color: #000; }
img { max-width: 100%; height: auto; }
table { border-collapse: collapse; }
table, th, td { border: 1px solid #ccc; }
p { margin: 8pt 0; }
</style>
</head>
<body>
{$rawHtml}
</body>
</html>
HTML;

        $safeName = $makeSafeName($post['title'] ?? 'tai_lieu', 'doc');

        header('Content-Type: application/msword; charset=UTF-8');
        header('Content-Disposition: attachment; filename="'.$safeName.'"');
        while (ob_get_level()) ob_end_clean();
        echo $docHtml;
        exit;
    }

    // ===== CASE 3: Không có gì để tải =====
    http_response_code(404);
    echo "Bài viết không có file hay nội dung để tải.";
    exit;
}



}
