<?php
// controllers/AlbumController.php
require_once __DIR__ . '/../models/Album.php';

class AlbumController
{
    private $albumModel;

    public function __construct()
    {
        $this->albumModel = new Album();
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

    private function requireAuth(): void
    {
        if (!isset($_SESSION['user_id'])) {
            $this->respondError('Unauthorized', 401);
        }
    }

    private function requireMethod(string $method): void
    {
        $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
        if ($m !== strtoupper($method)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => strtoupper($method)]);
        }
    }

    private function readJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /** ===== JSON API ===== */

    /**
     * Tạo album (POST)
     * Body có thể là form-encoded hoặc JSON:
     * - album_name (bắt buộc)
     * - description (tuỳ chọn)
     */
    public function create()
    {
        $this->requireMethod('POST');
        $this->requireAuth();

        $albumName   = trim($_POST['album_name'] ?? '');
        $description = $_POST['description'] ?? null;
        $userId      = $_SESSION['user_id'];

        if ($albumName === '') {
            $this->respondError('Thiếu album_name', 422);
        }

        $urlThumbnail = null;

        // Upload thumbnail nếu có file
        if (!empty($_FILES['thumbnail']['tmp_name'])) {
            try {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload     = $cloudinary->uploadApi()->upload(
                    $_FILES['thumbnail']['tmp_name'],
                    ['folder' => 'albums']
                );
                $urlThumbnail = $upload['secure_url'] ?? null;
            } catch (\Throwable $e) {
                $this->respondError('Upload thumbnail thất bại', 500, ['detail' => $e->getMessage()]);
            }
        }

        try {
            $albumId = $this->albumModel->createAlbum($albumName, $description, $urlThumbnail, $userId);
            $created = $this->albumModel->getAlbumById($albumId);
            $this->respondJson([
                'status' => 'ok',
                'data'   => $created
            ], 201);
        } catch (Throwable $e) {
            $this->respondError('Tạo album thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /**
     * Cập nhật album (POST multipart/form-data)
     */
    public function update()
    {
        $this->requireAuth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->respondError('Method Not Allowed', 405, ['allowed' => 'POST']);
        }

        $albumId     = $_POST['album_id'] ?? null;
        $albumName   = isset($_POST['album_name']) ? trim($_POST['album_name']) : null;
        $description = $_POST['description'] ?? null;

        if (!$albumId) {
            $this->respondError('Thiếu album_id', 422);
        }
        if ($albumName === null || $albumName === '') {
            $this->respondError('Thiếu album_name', 422);
        }

        try {
            $album = $this->albumModel->getAlbumById($albumId);
            if (!$album) {
                $this->respondError('Album không tồn tại', 404);
            }
            if ((int)$album['user_id'] !== (int)$_SESSION['user_id']) {
                $this->respondError('Forbidden', 403);
            }

            $urlThumbnail = $album['url_thumbnail'] ?? null;

            // Nếu có file mới thì upload lại
            if (!empty($_FILES['thumbnail']['tmp_name'])) {
                try {
                    $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                    $upload     = $cloudinary->uploadApi()->upload(
                        $_FILES['thumbnail']['tmp_name'],
                        ['folder' => 'albums']
                    );
                    $urlThumbnail = $upload['secure_url'] ?? $urlThumbnail;
                } catch (\Throwable $e) {
                    $this->respondError('Upload thumbnail thất bại', 500, ['detail' => $e->getMessage()]);
                }
            }

            $this->albumModel->updateAlbum($albumId, $albumName, $description, $urlThumbnail);
            $updated = $this->albumModel->getAlbumById($albumId);

            $this->respondJson([
                'status' => 'ok',
                'data'   => $updated
            ]);
        } catch (Throwable $e) {
            $this->respondError('Cập nhật album thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }


    /**
     * Xoá album (DELETE hoặc POST)
     * Param:
     * - id (query string hoặc body JSON/form)
     */
    public function delete()
    {
        if (empty($_SESSION['user_id'])) {
            return $this->respondError('Unauthorized', 401);
        }

        $albumId = $_GET['album_id'] ?? ($_POST['album_id'] ?? null);
        if (!$albumId) {
            return $this->respondError('Thiếu album_id', 422);
        }

        $role = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
        $isAdmin = ($role === 'ROLE000');

        try {
            $deleted = $isAdmin
                ? $this->albumModel->adminDeleteAlbum($albumId)
                : $this->albumModel->deleteAlbumByOwner($albumId, $_SESSION['user_id']);

            if (!$deleted) {
                return $this->respondError('Không thể xoá album (có thể không tồn tại hoặc bạn không có quyền).', 403);
            }

            $this->respondJson(['status' => 'ok', 'message' => 'Đã xoá album', 'id' => $albumId]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }


    /**
     * Danh sách album của chính user đang đăng nhập (GET)
     */
    public function listUserAlbums()
    {
        $this->requireMethod('GET');
        $this->requireAuth();

        try {
            $userId = $_SESSION['user_id'];

            // Nếu Model có hàm getAlbumsByUserId thì dùng:
            if (method_exists($this->albumModel, 'getAlbumsByUserId')) {
                $albums = $this->albumModel->getAlbumsByUserId($userId);
            } else {
                // fallback: dùng conn như code cũ
                $stmt = $this->albumModel->conn->prepare("SELECT * FROM albums WHERE user_id = ? ORDER BY created_at DESC");
                $stmt->execute([$userId]);
                $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            $this->respondJson([
                'status' => 'ok',
                'data'   => $albums
            ]);
        } catch (Throwable $e) {
            $this->respondError('Lấy danh sách album thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /**
     * Danh sách tất cả album (GET) — nếu cần phân trang thì bổ sung limit/offset
     */
    public function listAllAlbums()
    {
        $this->requireMethod('GET');

        try {
            $albums = $this->albumModel->getAllAlbums();
            $this->respondJson([
                'status' => 'ok',
                'data'   => $albums
            ]);
        } catch (Throwable $e) {
            $this->respondError('Lấy danh sách album thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /**
     * Danh sách album theo user_id truyền vào (GET ?user_id=)
     */
    public function listAlbumsByUserId()
    {
        $this->requireMethod('GET');

        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            $this->respondError('Không có user_id!', 422);
        }

        try {
            if (method_exists($this->albumModel, 'getAlbumsByUserId')) {
                $albums = $this->albumModel->getAlbumsByUserId($userId);
            } else {
                $stmt = $this->albumModel->conn->prepare("SELECT * FROM albums WHERE user_id = ? ORDER BY created_at DESC");
                $stmt->execute([$userId]);
                $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            $this->respondJson([
                'status' => 'ok',
                'data'   => $albums
            ]);
        } catch (Throwable $e) {
            $this->respondError('Lấy danh sách album theo user thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /**
     * (Tuỳ chọn) Lấy chi tiết 1 album (GET ?id=)
     */
    public function detail()
    {
        $this->requireMethod('GET');

        $id = $_GET['id'] ?? null;
        if (!$id) $this->respondError('Thiếu id', 422);

        try {
            $album = $this->albumModel->getAlbumById($id);
            if (!$album) $this->respondError('Album không tồn tại', 404);

            $this->respondJson([
                'status' => 'ok',
                'data'   => $album
            ]);
        } catch (Throwable $e) {
            $this->respondError('Lỗi lấy chi tiết album', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** ===== Không còn dùng view-based form =====
     * showCreateForm(), showEditForm() — bỏ, hoặc nếu cần thì trả JSON metadata thay vì include view
     */
}
