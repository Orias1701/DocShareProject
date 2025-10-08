<?php
// controllers/AlbumController.php
require_once __DIR__ . '/../models/Album.php';

class AlbumController
{
    private $albumModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->albumModel = new Album();
    }

    /* ===== Helpers ===== */
    private function json($data, int $code = 200)
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function error($msg, int $code = 400)
    {
        $this->json(['status' => 'error', 'message' => $msg], $code);
    }

    private function requireAuth()
    {
        if (empty($_SESSION['user_id'])) {
            $this->error('Unauthorized', 401);
        }
    }

    private function isAdmin(): bool
    {
        $role = $_SESSION['role_id'] ?? ($_SESSION['user']['role_id'] ?? null);
        return $role === 'ROLE000';
    }

    /* ===== CREATE ===== */
    public function create()
    {
        $this->requireAuth();
        $albumName   = trim($_POST['album_name'] ?? '');
        $description = $_POST['description'] ?? null;
        $urlThumbnail = null;
        $userId = $_SESSION['user_id'];

        if ($albumName === '') {
            $this->error('Thiếu tên album', 422);
        }

        // Nếu admin muốn tạo cho user khác
        if ($this->isAdmin() && !empty($_POST['owner_user_id'])) {
            $userId = $_POST['owner_user_id'];
        }

        // Upload thumbnail nếu có
        if (!empty($_FILES['thumbnail']['tmp_name'])) {
            try {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload = $cloudinary->uploadApi()->upload(
                    $_FILES['thumbnail']['tmp_name'],
                    ['folder' => 'albums']
                );
                $urlThumbnail = $upload['secure_url'] ?? null;
            } catch (Throwable $e) {
                $this->error('Upload thumbnail thất bại: ' . $e->getMessage(), 500);
            }
        }

        try {
            $ok = $this->albumModel->createAlbum($albumName, $description, $urlThumbnail, $userId);
            if (!$ok) {
                $this->error('Không thể tạo album', 500);
            }
            $this->json(['status' => 'ok', 'message' => 'Tạo album thành công']);
        } catch (Throwable $e) {
            $this->error('Lỗi khi tạo album: ' . $e->getMessage(), 500);
        }
    }

    /* ===== UPDATE ===== */
    public function update()
    {
        $this->requireAuth();

        $albumId = $_POST['album_id'] ?? null;
        $albumName = trim($_POST['album_name'] ?? '');
        $description = $_POST['description'] ?? null;
        $urlThumbnail = null;

        if (!$albumId) {
            $this->error('Thiếu album_id', 422);
        }
        if ($albumName === '') {
            $this->error('Thiếu tên album', 422);
        }

        $album = $this->albumModel->getAlbumById($albumId);
        if (!$album) {
            $this->error('Album không tồn tại', 404);
        }

        // Upload thumbnail nếu có
        if (!empty($_FILES['thumbnail']['tmp_name'])) {
            try {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload = $cloudinary->uploadApi()->upload(
                    $_FILES['thumbnail']['tmp_name'],
                    ['folder' => 'albums']
                );
                $urlThumbnail = $upload['secure_url'] ?? null;
            } catch (Throwable $e) {
                $this->error('Upload thumbnail thất bại: ' . $e->getMessage(), 500);
            }
        } else {
            $urlThumbnail = $album['url_thumbnail'] ?? null;
        }

        try {
            if ($this->isAdmin()) {
                $ok = $this->albumModel->adminUpdate($albumId, $albumName, $description, $urlThumbnail);
            } else {
                if ($album['user_id'] !== $_SESSION['user_id']) {
                    $this->error('Bạn không có quyền sửa album này', 403);
                }
                $ok = $this->albumModel->updateByOwner(
                    $albumId,
                    $_SESSION['user_id'],
                    $albumName,
                    $description,
                    $urlThumbnail
                );
            }

            if (!$ok) {
                $this->error('Không thể cập nhật album (không thay đổi hoặc không có quyền).', 403);
            }

            $updated = $this->albumModel->getAlbumById($albumId);
            $this->json(['status' => 'ok', 'message' => 'Cập nhật thành công', 'data' => $updated]);
        } catch (Throwable $e) {
            $this->error('Lỗi khi cập nhật album: ' . $e->getMessage(), 500);
        }
    }

    /* ===== DELETE ===== */
    public function delete()
    {
        $this->requireAuth();
        $albumId = $_POST['album_id'] ?? ($_GET['album_id'] ?? null);

        if (!$albumId) {
            $this->error('Thiếu album_id', 422);
        }

        try {
            $ok = $this->isAdmin()
                ? $this->albumModel->adminDeleteAlbum($albumId)
                : $this->albumModel->deleteAlbumByOwner($albumId, $_SESSION['user_id']);

            if (!$ok) {
                $this->error('Không thể xoá album (có thể không tồn tại hoặc không có quyền).', 403);
            }

            $this->json(['status' => 'ok', 'message' => 'Đã xoá album thành công']);
        } catch (Throwable $e) {
            $this->error('Lỗi khi xoá album: ' . $e->getMessage(), 500);
        }
    }

    /* ===== LẤY DANH SÁCH ===== */

    /** Lấy danh sách album của chính user đăng nhập */
    public function listUserAlbums()
    {
        $this->requireAuth();
        try {
            $albums = $this->albumModel->getAlbumsByUserId($_SESSION['user_id']);
            $this->json(['status' => 'ok', 'data' => $albums]);
        } catch (Throwable $e) {
            $this->error('Lấy danh sách album thất bại: ' . $e->getMessage(), 500);
        }
    }

    /** Lấy danh sách tất cả album (chỉ admin) */
    public function listAllAlbums()
    {
        $this->requireAuth();
        if (!$this->isAdmin()) {
            $this->error('Chỉ admin được phép xem tất cả album', 403);
        }
        try {
            $albums = $this->albumModel->getAllAlbums();
            $this->json(['status' => 'ok', 'data' => $albums]);
        } catch (Throwable $e) {
            $this->error('Không thể lấy danh sách album: ' . $e->getMessage(), 500);
        }
    }

    /** Lấy danh sách album theo user_id truyền vào (chỉ admin hoặc public API) */
    public function listAlbumsByUserId()
    {
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            $this->error('Thiếu user_id', 422);
        }

        try {
            // Nếu có session và không phải admin, chỉ cho phép xem của chính mình
            if (!$this->isAdmin() && isset($_SESSION['user_id']) && $_SESSION['user_id'] !== $userId) {
                $this->error('Bạn không có quyền xem album của user khác', 403);
            }

            $albums = $this->albumModel->getAlbumsByUserId($userId);
            $this->json(['status' => 'ok', 'data' => $albums]);
        } catch (Throwable $e) {
            $this->error('Lấy danh sách album theo user thất bại: ' . $e->getMessage(), 500);
        }
    }

    /* ===== CHI TIẾT ===== */
    public function albumDetail()
    {
        $this->requireAuth();
        $id = $_GET['album_id'] ?? null;
        if (!$id) {
            $this->error('Thiếu id', 422);
        }

        try {
            $album = $this->albumModel->getAlbumById($id);
            if (!$album) {
                $this->error('Album không tồn tại', 404);
            }

            if (!$this->isAdmin() && $album['user_id'] !== $_SESSION['user_id']) {
                $this->error('Bạn không có quyền xem album này', 403);
            }

            $this->json(['status' => 'ok', 'data' => $album]);
        } catch (Throwable $e) {
            $this->error('Lỗi lấy chi tiết album: ' . $e->getMessage(), 500);
        }
    }
}
